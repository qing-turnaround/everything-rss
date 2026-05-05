"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFeeds, Feed } from "@/hooks/use-feeds";
import { ArrowLeft, Plus, Pencil, Trash2, X } from "lucide-react";

export default function FeedsManagePage() {
  const router = useRouter();
  const { feeds, categories, refetch } = useFeeds();
  const [showForm, setShowForm] = useState(false);
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    feedUrl: "",
    siteUrl: "",
    viewType: "article" as "article" | "social" | "video",
    categoryId: "",
    rsshubRoute: "",
  });
  const [newCategoryName, setNewCategoryName] = useState("");

  const resetForm = () => {
    setFormData({ title: "", feedUrl: "", siteUrl: "", viewType: "article", categoryId: "", rsshubRoute: "" });
    setEditingFeed(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      categoryId: formData.categoryId || null,
      rsshubRoute: formData.rsshubRoute || null,
      siteUrl: formData.siteUrl || null,
    };

    if (editingFeed) {
      await fetch(`/api/feeds/${editingFeed.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    refetch();
  };

  const handleEdit = (feed: Feed) => {
    setFormData({
      title: feed.title,
      feedUrl: feed.feedUrl,
      siteUrl: feed.siteUrl || "",
      viewType: feed.viewType,
      categoryId: feed.categoryId || "",
      rsshubRoute: feed.rsshubRoute || "",
    });
    setEditingFeed(feed);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确认删除此订阅源？")) return;
    await fetch(`/api/feeds/${id}`, { method: "DELETE" });
    refetch();
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName.trim() }),
    });
    setNewCategoryName("");
    refetch();
  };

  const viewTypeLabel = (type: string) =>
    type === "article" ? "文章" : type === "social" ? "社交" : "视频";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/settings")}
            className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-hover-bg transition-colors"
            aria-label="返回"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold">订阅源管理</h1>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-md text-sm hover:bg-accent-hover active:opacity-90 transition-colors"
          >
            <Plus size={14} />
            添加订阅源
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="新分类名..."
              className="px-3 py-2 border border-border rounded-md bg-background text-sm transition-colors focus:border-accent"
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            />
            <button
              onClick={handleAddCategory}
              className="px-3 py-2 border border-border rounded-md text-sm hover:bg-hover-bg active:bg-selected-bg transition-colors"
            >
              添加分类
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-5 border border-border rounded-lg space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{editingFeed ? "编辑订阅源" : "添加订阅源"}</h3>
              <button type="button" onClick={resetForm} className="p-1 rounded hover:bg-hover-bg text-muted" aria-label="关闭">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="feed-title" className="block text-xs font-medium text-muted mb-1">标题 *</label>
                <input
                  id="feed-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm transition-colors focus:border-accent"
                />
              </div>
              <div>
                <label htmlFor="feed-url" className="block text-xs font-medium text-muted mb-1">RSS URL *</label>
                <input
                  id="feed-url"
                  type="url"
                  value={formData.feedUrl}
                  onChange={(e) => setFormData((p) => ({ ...p, feedUrl: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm transition-colors focus:border-accent"
                />
              </div>
              <div>
                <label htmlFor="site-url" className="block text-xs font-medium text-muted mb-1">网站 URL</label>
                <input
                  id="site-url"
                  type="url"
                  value={formData.siteUrl}
                  onChange={(e) => setFormData((p) => ({ ...p, siteUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm transition-colors focus:border-accent"
                />
              </div>
              <div>
                <label htmlFor="rsshub-route" className="block text-xs font-medium text-muted mb-1">RSSHub 路由</label>
                <input
                  id="rsshub-route"
                  type="text"
                  placeholder="/twitter/user/xxx"
                  value={formData.rsshubRoute}
                  onChange={(e) => setFormData((p) => ({ ...p, rsshubRoute: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm transition-colors focus:border-accent"
                />
              </div>
              <div>
                <label htmlFor="view-type" className="block text-xs font-medium text-muted mb-1">类型</label>
                <select
                  id="view-type"
                  value={formData.viewType}
                  onChange={(e) => setFormData((p) => ({ ...p, viewType: e.target.value as "article" | "social" | "video" }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm transition-colors focus:border-accent"
                >
                  <option value="article">文章</option>
                  <option value="social">社交媒体</option>
                  <option value="video">视频</option>
                </select>
              </div>
              <div>
                <label htmlFor="category" className="block text-xs font-medium text-muted mb-1">分类</label>
                <select
                  id="category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm transition-colors focus:border-accent"
                >
                  <option value="">无分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-md text-sm hover:bg-accent-hover active:opacity-90 transition-colors">
                {editingFeed ? "保存修改" : "添加"}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 border border-border rounded-md text-sm hover:bg-hover-bg transition-colors">
                取消
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {feeds.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted">暂无订阅源</p>
              <p className="text-xs text-muted/60 mt-1">点击上方按钮添加第一个订阅源</p>
            </div>
          ) : (
            feeds.map((feed) => (
              <div key={feed.id} className="flex items-center justify-between px-4 py-3 border border-border rounded-lg hover:bg-hover-bg/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{feed.title}</span>
                    <span className="text-[11px] px-1.5 py-0.5 bg-hover-bg rounded text-muted flex-shrink-0">
                      {viewTypeLabel(feed.viewType)}
                    </span>
                    {feed.errorCount > 0 && (
                      <span className="text-[11px] px-1.5 py-0.5 bg-danger-soft text-danger rounded flex-shrink-0">
                        错误 x{feed.errorCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted truncate mt-0.5">{feed.feedUrl}</p>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => handleEdit(feed)}
                    className="p-1.5 rounded-md text-muted hover:text-accent hover:bg-hover-bg transition-colors"
                    aria-label={`编辑 ${feed.title}`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(feed.id)}
                    className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-danger-soft transition-colors"
                    aria-label={`删除 ${feed.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
