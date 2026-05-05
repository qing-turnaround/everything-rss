"use client";

import { useAppStore, ViewType } from "@/store/app";
import { useFeeds, Feed, Category } from "@/hooks/use-feeds";
import { useRouter } from "next/navigation";
import {
  FileText,
  MessageCircle,
  Play,
  Star,
  Clock,
  Settings,
} from "lucide-react";

const VIEW_TABS: { type: ViewType; label: string; icon: React.ReactNode }[] = [
  { type: "article", label: "文章", icon: <FileText size={15} /> },
  { type: "social", label: "社交", icon: <MessageCircle size={15} /> },
  { type: "video", label: "视频", icon: <Play size={15} /> },
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
      <div className="flex border-b border-border" role="tablist" aria-label="内容类型">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveView(tab.type)}
            role="tab"
            aria-selected={activeView === tab.type}
            className={`flex-1 py-2.5 px-1 text-xs font-medium transition-all duration-150 flex items-center justify-center gap-1.5 ${
              activeView === tab.type
                ? "text-accent border-b-2 border-accent"
                : "text-muted hover:text-foreground border-b-2 border-transparent"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="px-3 py-2 space-y-2">
            {[75, 60, 85, 68, 90, 72].map((w, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <div className="skeleton w-4 h-4 rounded flex-shrink-0" />
                <div className="skeleton h-3.5 flex-1" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
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
              <div key={cat.id} className="mt-3">
                <div className="px-3 py-1 text-[11px] font-semibold text-muted uppercase tracking-wider">
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
              <div className="px-3 py-8 text-sm text-muted text-center">
                <div className="mb-2 opacity-40">
                  <FileText size={24} className="mx-auto" />
                </div>
                暂无订阅源
              </div>
            )}
          </>
        )}
      </div>

      <div className="border-t border-border py-1">
        <button
          onClick={() => router.push("/collection/star")}
          className="w-full px-3 py-2 text-sm text-left hover:bg-hover-bg active:bg-selected-bg transition-colors flex items-center gap-2.5"
          aria-label="收藏"
        >
          <Star size={15} className="text-muted" /> 收藏
        </button>
        <button
          onClick={() => router.push("/collection/later")}
          className="w-full px-3 py-2 text-sm text-left hover:bg-hover-bg active:bg-selected-bg transition-colors flex items-center gap-2.5"
          aria-label="稍后读"
        >
          <Clock size={15} className="text-muted" /> 稍后读
        </button>
        <button
          onClick={() => router.push("/settings")}
          className="w-full px-3 py-2 text-sm text-left hover:bg-hover-bg active:bg-selected-bg transition-colors flex items-center gap-2.5"
          aria-label="设置"
        >
          <Settings size={15} className="text-muted" /> 设置
        </button>
      </div>
    </div>
  );
}

function FeedItem({ feed, selected, onClick }: { feed: Feed; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 py-2 text-sm text-left transition-colors duration-100 flex items-center gap-2.5 ${
        selected ? "bg-selected-bg text-accent" : "hover:bg-hover-bg active:bg-selected-bg"
      }`}
    >
      {feed.iconUrl ? (
        <img src={feed.iconUrl} alt="" className="w-4 h-4 rounded flex-shrink-0" />
      ) : (
        <span className="w-4 h-4 rounded bg-accent/15 flex items-center justify-center text-[10px] font-medium text-accent flex-shrink-0">
          {feed.title[0]}
        </span>
      )}
      <span className="truncate">{feed.title}</span>
    </button>
  );
}
