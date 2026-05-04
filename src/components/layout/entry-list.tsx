"use client";

import { useAppStore } from "@/store/app";
import { useEntries, Entry } from "@/hooks/use-entries";
import { useFeeds } from "@/hooks/use-feeds";
import { ArticleItem } from "@/components/entries/article-item";
import { SocialItem } from "@/components/entries/social-item";
import { VideoItem } from "@/components/entries/video-item";

interface EntryListProps {
  feedId?: string | null;
  viewType?: string | null;
  tag?: string | null;
  title?: string;
}

export function EntryList({ feedId, viewType, tag, title }: EntryListProps) {
  const { selectedEntryId, setSelectedEntryId, activeView } = useAppStore();
  const { entries, loading, loadMore, hasMore, markAsRead } = useEntries({
    feedId,
    viewType,
    tag,
  });
  const { feeds } = useFeeds();

  const feedMap = new Map(feeds.map((f) => [f.id, f]));
  const displayView = viewType || activeView;

  const handleEntryClick = (entry: Entry) => {
    setSelectedEntryId(entry.id);
    if (!entry.isRead) markAsRead(entry.id);
  };

  const handleMarkAllRead = async () => {
    const body: Record<string, string> = {};
    if (feedId) body.feedId = feedId;
    else if (viewType) body.viewType = viewType;
    await fetch("/api/entries/read-all", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    window.location.reload();
  };

  return (
    <div className="h-full flex flex-col border-r border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold truncate">
          {title || (tag === "star" ? "收藏" : tag === "later" ? "稍后读" : "全部")}
        </h2>
        {!tag && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-muted hover:text-accent transition-colors"
          >
            全部已读
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted">
            加载中...
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted">
            暂无内容
          </div>
        ) : displayView === "video" ? (
          <div className="grid grid-cols-2 gap-2 p-2">
            {entries.map((entry) => (
              <VideoItem
                key={entry.id}
                entry={entry}
                selected={selectedEntryId === entry.id}
                feedTitle={feedMap.get(entry.feedId)?.title}
                onClick={() => handleEntryClick(entry)}
              />
            ))}
          </div>
        ) : (
          <div>
            {entries.map((entry) =>
              displayView === "social" ? (
                <SocialItem
                  key={entry.id}
                  entry={entry}
                  selected={selectedEntryId === entry.id}
                  feedTitle={feedMap.get(entry.feedId)?.title}
                  onClick={() => handleEntryClick(entry)}
                />
              ) : (
                <ArticleItem
                  key={entry.id}
                  entry={entry}
                  selected={selectedEntryId === entry.id}
                  feedTitle={feedMap.get(entry.feedId)?.title}
                  onClick={() => handleEntryClick(entry)}
                />
              )
            )}
          </div>
        )}

        {hasMore && (
          <button
            onClick={loadMore}
            className="w-full py-3 text-sm text-accent hover:text-accent-hover transition-colors"
          >
            加载更多
          </button>
        )}
      </div>
    </div>
  );
}
