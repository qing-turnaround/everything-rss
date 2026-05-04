# RSS Reader - 设计文档

个人使用的 RSS 阅读器，类似 Follow/Folo 的三栏布局，支持传统 RSS 和 RSSHub 社交媒体源。

## 架构

Next.js 前端 + 独立 RSS 抓取进程，共享 SQLite 数据库。

```
Browser → Next.js App (Web + API) → SQLite (WAL 模式) ← RSS Fetcher (独立进程)
```

- **Next.js App**：App Router，负责页面渲染和 API（CRUD、标记已读、收藏等）
- **RSS Fetcher**：独立 Node.js 进程，node-cron 调度，systemd 管理，负责定时抓取和解析 RSS
- **SQLite**：WAL 模式，支持一写多读并发，Drizzle ORM 访问

两个进程通过 systemd 分别管理，独立启停。

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript |
| UI | TailwindCSS 4 + Radix UI |
| 状态管理 | Zustand（轻量，适合客户端面板状态） |
| 数据库 | SQLite (WAL) + Drizzle ORM |
| RSS 解析 | rss-parser（支持 RSS 2.0 / Atom / JSON Feed） |
| 定时任务 | node-cron |
| 进程管理 | systemd |
| 包管理 | pnpm |

## 数据库设计

### categories 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | UUID |
| name | TEXT NOT NULL | 分类名 |
| order | INTEGER | 排序权重 |
| created_at | INTEGER | Unix 时间戳 |

### feeds 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | UUID |
| title | TEXT NOT NULL | 源标题 |
| site_url | TEXT | 网站地址 |
| feed_url | TEXT NOT NULL | RSS 地址 |
| description | TEXT | 描述 |
| icon_url | TEXT | 图标 |
| view_type | TEXT NOT NULL | article / social / video |
| category_id | TEXT FK | 所属分类 |
| rsshub_route | TEXT | RSSHub 路由（nullable） |
| fetch_interval | INTEGER | 抓取间隔（秒），null 则用全局默认 |
| last_fetched_at | INTEGER | 上次抓取时间 |
| error_count | INTEGER DEFAULT 0 | 连续失败次数，用于指数退避 |
| created_at | INTEGER | 创建时间 |

### entries 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | UUID |
| feed_id | TEXT FK NOT NULL | 所属源 |
| guid | TEXT NOT NULL | RSS 条目唯一标识 |
| title | TEXT | 标题 |
| url | TEXT | 原文链接 |
| content | TEXT | 正文 HTML |
| summary | TEXT | 摘要 |
| author | TEXT | 作者 |
| thumbnail | TEXT | 封面图 |
| media_url | TEXT | 视频/音频地址 |
| published_at | INTEGER | 发布时间 |
| is_read | INTEGER DEFAULT 0 | 0 未读 / 1 已读 |
| created_at | INTEGER | 入库时间 |

唯一约束：`(feed_id, guid)`

### collections 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | UUID |
| entry_id | TEXT FK NOT NULL | 关联条目 |
| tag | TEXT NOT NULL | star / later |
| created_at | INTEGER | 创建时间 |

唯一约束：`(entry_id, tag)`

### settings 表

| 字段 | 类型 | 说明 |
|------|------|------|
| key | TEXT PK | 配置键 |
| value | TEXT | JSON 值 |

预置 key：`rsshub_instance`（默认 `https://rsshub.app`）、`fetch_interval_default`（默认 300 秒）、`theme`。

## 前端布局

三栏布局，参考 Follow/Folo：

```
┌─────────────────────────────────────────────────────┐
│  顶栏: 搜索 / 全部已读 / 设置入口                      │
├────────┬──────────────────┬─────────────────────────┤
│ 订阅栏  │    文章列表       │      内容阅读区           │
│ ~220px │    ~350px        │      自适应剩余宽度        │
│        │                  │                         │
│ [文章]  │  ● 标题一        │  文章标题                 │
│ [社交]  │    来源 · 3分钟前 │  来源 · 2025-05-04       │
│ [视频]  │                  │                         │
│ ────── │  ○ 标题二        │  正文内容渲染              │
│ 分类A   │    来源 · 1小时前 │  支持图片/代码块/引用       │
│  ├ 源1  │                  │                         │
│  └ 源2  │  ○ 标题三        │                         │
│ 分类B   │    来源 · 昨天    │                         │
│  └ 源3  │                  │  ────────────────────   │
│ ────── │                  │  收藏 / 稍后读 / 原文     │
│ 收藏    │                  │  已读标记                 │
│ 稍后读  │                  │                         │
└────────┴──────────────────┴─────────────────────────┘
```

### 三种视图的列表区差异

| 视图 | 列表区展示 |
|------|----------|
| 文章 (article) | 标题 + 摘要 + 来源 + 时间，紧凑列表 |
| 社交媒体 (social) | 宽列表，直接展示完整内容，类似 Twitter timeline |
| 视频 (video) | 网格布局，封面缩略图 + 标题，点击后在阅读区用 iframe 嵌入播放（YouTube/Bilibili 等）或 HTML5 video 直链播放 |

### 页面路由

```
/                    → 首页，默认展示文章视图全部未读
/view/article        → 文章视图
/view/social         → 社交媒体视图
/view/video          → 视频视图
/feed/[feedId]       → 单个源的文章列表
/collection/star     → 收藏列表
/collection/later    → 稍后读列表
/settings            → 设置页
/settings/feeds      → 订阅源管理
/settings/import     → OPML 导入
```

### 交互

- 列间分隔线可拖拽调整宽度，宽度存 localStorage
- 点击左侧订阅栏的源或分类，中间列表区过滤对应内容
- 点击列表项，右侧展示内容，同时标记已读
- 键盘快捷键：`j/k` 上下切换条目，`s` 收藏，`m` 标记已读，`v` 打开原文

## RSS Fetcher 设计

独立 Node.js 进程，负责定时抓取所有订阅源。

### 抓取流程

```
1. node-cron 每分钟触发一次调度
2. 查询所有 feeds，筛选出到达抓取时间的源：
   now - last_fetched_at >= fetch_interval（或全局默认）
3. 对筛选出的源并行抓取（concurrency limit = 5，避免资源耗尽）
4. 对每个源：
   a. 如果有 rsshub_route，拼接 RSSHub 实例地址
   b. 否则直接请求 feed_url
   c. 用 rss-parser 解析响应
   d. 对每个条目，用 (feed_id, guid) 去重，仅插入新条目
   e. 更新 feeds.last_fetched_at
5. 抓取失败处理：
   a. error_count += 1
   b. 下次抓取时间 = fetch_interval * 2^min(error_count, 6)
   c. 指数退避上限：64 倍间隔（约 5 小时，按默认 5 分钟间隔计算）
   d. 成功时 error_count 重置为 0
```

### 并发控制

使用 p-limit 限制并发请求数为 5，避免同时请求过多源导致网络或 CPU 阻塞。

### RSSHub 集成

- 从 settings 表读取 `rsshub_instance` 配置
- 对于有 `rsshub_route` 的源，抓取 URL = `${rsshub_instance}${rsshub_route}`
- 添加源时，用户可选择手动填 RSS URL 或选择 RSSHub 路由

## API 设计

Next.js API Routes，RESTful 风格：

### Feeds
- `GET /api/feeds` — 获取所有订阅源（支持 category_id 过滤）
- `POST /api/feeds` — 添加订阅源
- `PUT /api/feeds/[id]` — 修改订阅源
- `DELETE /api/feeds/[id]` — 删除订阅源（级联删除其 entries）

### Entries
- `GET /api/entries` — 获取条目列表（支持 feed_id、view_type、is_read 过滤，cursor 分页，每页 20 条）
- `PUT /api/entries/[id]/read` — 标记已读
- `PUT /api/entries/read-all` — 全部已读（支持 feed_id 或 view_type 范围）

### Collections
- `GET /api/collections` — 获取收藏/稍后读列表（支持 tag 过滤）
- `POST /api/collections` — 添加收藏
- `DELETE /api/collections/[id]` — 取消收藏

### Categories
- `GET /api/categories` — 获取所有分类
- `POST /api/categories` — 创建分类
- `PUT /api/categories/[id]` — 修改分类
- `DELETE /api/categories/[id]` — 删除分类

### Settings
- `GET /api/settings` — 获取所有设置
- `PUT /api/settings` — 更新设置

### Import
- `POST /api/import/opml` — 导入 OPML 文件

## 项目结构

```
everything/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx            # 首页重定向到 /view/article
│   │   ├── view/
│   │   │   └── [type]/
│   │   │       └── page.tsx    # 文章/社交/视频视图
│   │   ├── feed/
│   │   │   └── [feedId]/
│   │   │       └── page.tsx    # 单源文章列表
│   │   ├── collection/
│   │   │   └── [tag]/
│   │   │       └── page.tsx    # 收藏/稍后读
│   │   ├── settings/
│   │   │   ├── page.tsx        # 设置主页
│   │   │   ├── feeds/
│   │   │   │   └── page.tsx    # 订阅源管理
│   │   │   └── import/
│   │   │       └── page.tsx    # OPML 导入
│   │   └── api/                # API Routes
│   │       ├── feeds/
│   │       ├── entries/
│   │       ├── collections/
│   │       ├── categories/
│   │       ├── settings/
│   │       └── import/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx         # 左侧订阅栏
│   │   │   ├── entry-list.tsx      # 中间文章列表
│   │   │   ├── content-panel.tsx   # 右侧内容区
│   │   │   └── resizable-panel.tsx # 可拖拽分栏
│   │   ├── entries/
│   │   │   ├── article-item.tsx    # 文章列表项
│   │   │   ├── social-item.tsx     # 社交媒体列表项
│   │   │   └── video-item.tsx      # 视频网格项
│   │   ├── content/
│   │   │   ├── article-view.tsx    # 文章阅读视图
│   │   │   ├── social-view.tsx     # 社交内容视图
│   │   │   └── video-view.tsx      # 视频播放视图
│   │   └── settings/
│   │       ├── feed-form.tsx       # 添加/编辑源表单
│   │       └── opml-import.tsx     # OPML 导入组件
│   ├── db/
│   │   ├── index.ts            # Drizzle 初始化 + SQLite 连接
│   │   ├── schema.ts           # 表定义
│   │   └── migrations/         # Drizzle 迁移文件
│   ├── lib/
│   │   ├── fetcher.ts          # RSS 抓取核心逻辑
│   │   ├── parser.ts           # RSS/Atom/JSON Feed 解析
│   │   ├── rsshub.ts           # RSSHub URL 拼接
│   │   └── opml.ts             # OPML 解析
│   └── hooks/
│       ├── use-entries.ts      # 条目数据 hook
│       ├── use-feeds.ts        # 订阅源数据 hook
│       └── use-keyboard.ts     # 快捷键 hook
├── fetcher/
│   └── index.ts                # 独立抓取进程入口
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## 关键依赖

```json
{
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "drizzle-orm": "^0.45",
    "better-sqlite3": "^11",
    "rss-parser": "^3",
    "p-limit": "^6",
    "node-cron": "^3",
    "zustand": "^5",
    "@radix-ui/react-context-menu": "^2",
    "@radix-ui/react-dialog": "^1",
    "@radix-ui/react-scroll-area": "^1",
    "sanitize-html": "^2",
    "date-fns": "^4"
  },
  "devDependencies": {
    "drizzle-kit": "^0.30",
    "typescript": "^5",
    "tailwindcss": "^4",
    "@types/better-sqlite3": "^7",
    "@types/node-cron": "^3"
  }
}
```
