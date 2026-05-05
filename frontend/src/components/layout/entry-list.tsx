import { apiUrl } from "@/api";
import { useAppStore } from "@/store/app";
import { useEntries, Entry } from "@/hooks/use-entries";
import { useFeeds } from "@/hooks/use-feeds";
import { ArticleItem } from "@/components/entries/article-item";
import { SocialItem } from "@/components/entries/social-item";
import { VideoItem } from "@/components/entries/video-item";
import { CheckCheck, Inbox } from "lucide-react";

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
    await fetch(apiUrl("/api/entries/read-all"), {
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
            className="text-xs text-muted hover:text-accent active:text-accent-hover transition-colors flex items-center gap-1"
            aria-label="全部标为已读"
          >
            <CheckCheck size={13} />
            全部已读
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingSkeleton view={displayView} />
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <Inbox size={32} strokeWidth={1.2} className="mb-3 opacity-40" />
            <p className="text-sm">暂无内容</p>
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
            className="w-full py-3 text-sm text-accent hover:text-accent-hover active:opacity-70 transition-colors"
          >
            加载更多
          </button>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton({ view }: { view: string | null | undefined }) {
  if (view === "video") {
    return (
      <div className="grid grid-cols-2 gap-2 p-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden">
            <div className="skeleton aspect-video" />
            <div className="p-2 space-y-1.5">
              <div className="skeleton h-3.5 w-full" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="px-4 py-3 border-b border-border flex items-start gap-2">
          <div className="skeleton w-2 h-2 rounded-full mt-2 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-3 w-4/5" />
            <div className="flex gap-2">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-3 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
