import { apiUrl } from "@/api";
import { useAppStore } from "@/store/app";
import { useEntries, Entry } from "@/hooks/use-entries";
import { useFeeds } from "@/hooks/use-feeds";
import { useKeyboard } from "@/hooks/use-keyboard";
import { ArticleView } from "@/components/content/article-view";
import { VideoView } from "@/components/content/video-view";
import { useState, useEffect, useCallback, useMemo } from "react";
import { BookOpen } from "lucide-react";

interface ContentPanelProps {
  entries: Entry[];
}

export function ContentPanel({ entries }: ContentPanelProps) {
  const { selectedEntryId, setSelectedEntryId, activeView } = useAppStore();
  const { feeds } = useFeeds();
  const [collections, setCollections] = useState<{ id: string; entryId: string; tag: string }[]>([]);

  const selectedEntry = useMemo(
    () => entries.find((e) => e.id === selectedEntryId),
    [entries, selectedEntryId]
  );

  const feedTitle = useMemo(() => {
    if (!selectedEntry) return undefined;
    return feeds.find((f) => f.id === selectedEntry.feedId)?.title;
  }, [selectedEntry, feeds]);

  useEffect(() => {
    fetch(apiUrl("/api/collections"))
      .then((r) => r.json())
      .then(setCollections)
      .catch(() => {});
  }, [selectedEntryId]);

  const isStarred = selectedEntry
    ? collections.some((c) => c.entryId === selectedEntry.id && c.tag === "star")
    : false;
  const isReadLater = selectedEntry
    ? collections.some((c) => c.entryId === selectedEntry.id && c.tag === "later")
    : false;

  const toggleCollection = useCallback(async (tag: "star" | "later") => {
    if (!selectedEntry) return;
    const existing = collections.find((c) => c.entryId === selectedEntry.id && c.tag === tag);
    if (existing) {
      await fetch(apiUrl(`/api/collections/${existing.id}`), { method: "DELETE" });
      setCollections((prev) => prev.filter((c) => c.id !== existing.id));
    } else {
      const res = await fetch(apiUrl("/api/collections"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: selectedEntry.id, tag }),
      });
      const data = await res.json();
      setCollections((prev) => [...prev, data]);
    }
  }, [selectedEntry, collections]);

  const currentIndex = entries.findIndex((e) => e.id === selectedEntryId);

  useKeyboard({
    onNext: () => {
      if (currentIndex < entries.length - 1) {
        setSelectedEntryId(entries[currentIndex + 1].id);
      }
    },
    onPrev: () => {
      if (currentIndex > 0) {
        setSelectedEntryId(entries[currentIndex - 1].id);
      }
    },
    onStar: () => toggleCollection("star"),
    onMarkRead: () => {
      if (selectedEntry) fetch(apiUrl(`/api/entries/${selectedEntry.id}/read`), { method: "PUT" });
    },
    onOpenOriginal: () => {
      if (selectedEntry?.url) window.open(selectedEntry.url, "_blank");
    },
  });

  if (!selectedEntry) {
    return (
      <div className="h-full flex items-center justify-center text-muted">
        <div className="text-center">
          <BookOpen size={36} strokeWidth={1.2} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">选择一篇文章开始阅读</p>
          <div className="flex items-center justify-center gap-3 mt-4 text-xs">
            <kbd className="px-1.5 py-0.5 rounded bg-hover-bg border border-border font-mono text-[11px]">J</kbd>
            <span>/ </span>
            <kbd className="px-1.5 py-0.5 rounded bg-hover-bg border border-border font-mono text-[11px]">K</kbd>
            <span className="text-muted/60">切换</span>
            <kbd className="px-1.5 py-0.5 rounded bg-hover-bg border border-border font-mono text-[11px]">S</kbd>
            <span className="text-muted/60">收藏</span>
            <kbd className="px-1.5 py-0.5 rounded bg-hover-bg border border-border font-mono text-[11px]">V</kbd>
            <span className="text-muted/60">原文</span>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === "video") {
    return (
      <div className="h-full overflow-y-auto animate-fade-in">
        <VideoView
          entry={selectedEntry}
          feedTitle={feedTitle}
          onStar={() => toggleCollection("star")}
          onReadLater={() => toggleCollection("later")}
          isStarred={isStarred}
          isReadLater={isReadLater}
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto animate-fade-in" key={selectedEntryId}>
      <ArticleView
        entry={selectedEntry}
        feedTitle={feedTitle}
        onStar={() => toggleCollection("star")}
        onReadLater={() => toggleCollection("later")}
        isStarred={isStarred}
        isReadLater={isReadLater}
      />
    </div>
  );
}
