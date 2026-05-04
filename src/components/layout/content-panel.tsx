"use client";

import { useAppStore } from "@/store/app";
import { useEntries, Entry } from "@/hooks/use-entries";
import { useFeeds } from "@/hooks/use-feeds";
import { useKeyboard } from "@/hooks/use-keyboard";
import { ArticleView } from "@/components/content/article-view";
import { VideoView } from "@/components/content/video-view";
import { useState, useEffect, useCallback, useMemo } from "react";

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
    fetch("/api/collections")
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
      await fetch(`/api/collections/${existing.id}`, { method: "DELETE" });
      setCollections((prev) => prev.filter((c) => c.id !== existing.id));
    } else {
      const res = await fetch("/api/collections", {
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
      if (selectedEntry) fetch(`/api/entries/${selectedEntry.id}/read`, { method: "PUT" });
    },
    onOpenOriginal: () => {
      if (selectedEntry?.url) window.open(selectedEntry.url, "_blank");
    },
  });

  if (!selectedEntry) {
    return (
      <div className="h-full flex items-center justify-center text-muted text-sm">
        <div className="text-center">
          <p className="text-2xl mb-2">📖</p>
          <p>选择一篇文章开始阅读</p>
          <p className="text-xs mt-2">快捷键: j/k 切换, s 收藏, m 已读, v 原文</p>
        </div>
      </div>
    );
  }

  if (activeView === "video") {
    return (
      <div className="h-full overflow-y-auto">
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
    <div className="h-full overflow-y-auto">
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
