"use client";

import { useAppStore, ViewType } from "@/store/app";
import { useFeeds, Feed, Category } from "@/hooks/use-feeds";
import { useRouter } from "next/navigation";

const VIEW_TABS: { type: ViewType; label: string; icon: string }[] = [
  { type: "article", label: "文章", icon: "📄" },
  { type: "social", label: "社交", icon: "💬" },
  { type: "video", label: "视频", icon: "🎬" },
];

export function Sidebar() {
  const { activeView, setActiveView, selectedFeedId, setSelectedFeedId } = useAppStore();
  const { feeds, categories, loading } = useFeeds();
  const router = useRouter();

  const viewFeeds = feeds.filter((f) => f.viewType === activeView);
  const categorized = categories
    .map((cat) => ({
      ...cat,
      feeds: viewFeeds.filter((f) => f.categoryId === cat.id),
    }))
    .filter((cat) => cat.feeds.length > 0);
  const uncategorized = viewFeeds.filter((f) => !f.categoryId);

  return (
    <div className="h-full flex flex-col bg-sidebar-bg border-r border-border">
      <div className="flex border-b border-border">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveView(tab.type)}
            className={`flex-1 py-2.5 px-1 text-xs font-medium transition-colors ${
              activeView === tab.type
                ? "text-accent border-b-2 border-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="px-3 py-2 text-sm text-muted">Loading...</div>
        ) : (
          <>
            {uncategorized.map((feed) => (
              <FeedItem
                key={feed.id}
                feed={feed}
                selected={selectedFeedId === feed.id}
                onClick={() => setSelectedFeedId(selectedFeedId === feed.id ? null : feed.id)}
              />
            ))}

            {categorized.map((cat) => (
              <div key={cat.id} className="mt-2">
                <div className="px-3 py-1 text-xs font-semibold text-muted uppercase tracking-wide">
                  {cat.name}
                </div>
                {cat.feeds.map((feed) => (
                  <FeedItem
                    key={feed.id}
                    feed={feed}
                    selected={selectedFeedId === feed.id}
                    onClick={() => setSelectedFeedId(selectedFeedId === feed.id ? null : feed.id)}
                  />
                ))}
              </div>
            ))}

            {viewFeeds.length === 0 && (
              <div className="px-3 py-4 text-sm text-muted text-center">
                暂无订阅源
              </div>
            )}
          </>
        )}
      </div>

      <div className="border-t border-border">
        <button
          onClick={() => router.push("/collection/star")}
          className="w-full px-3 py-2 text-sm text-left hover:bg-hover-bg transition-colors flex items-center gap-2"
        >
          <span>⭐</span> 收藏
        </button>
        <button
          onClick={() => router.push("/collection/later")}
          className="w-full px-3 py-2 text-sm text-left hover:bg-hover-bg transition-colors flex items-center gap-2"
        >
          <span>🕐</span> 稍后读
        </button>
        <button
          onClick={() => router.push("/settings")}
          className="w-full px-3 py-2 text-sm text-left hover:bg-hover-bg transition-colors flex items-center gap-2"
        >
          <span>⚙️</span> 设置
        </button>
      </div>
    </div>
  );
}

function FeedItem({ feed, selected, onClick }: { feed: Feed; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-1.5 text-sm text-left transition-colors flex items-center gap-2 ${
        selected ? "bg-selected-bg text-accent" : "hover:bg-hover-bg"
      }`}
    >
      {feed.iconUrl ? (
        <img src={feed.iconUrl} alt="" className="w-4 h-4 rounded" />
      ) : (
        <span className="w-4 h-4 rounded bg-accent/20 flex items-center justify-center text-[10px]">
          {feed.title[0]}
        </span>
      )}
      <span className="truncate">{feed.title}</span>
    </button>
  );
}
