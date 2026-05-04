"use client";

import { useState, useEffect, useCallback } from "react";

export interface Entry {
  id: string;
  feedId: string;
  guid: string;
  title: string | null;
  url: string | null;
  content: string | null;
  summary: string | null;
  author: string | null;
  thumbnail: string | null;
  mediaUrl: string | null;
  publishedAt: number | null;
  isRead: number;
  createdAt: number;
}

interface UseEntriesParams {
  feedId?: string | null;
  viewType?: string | null;
  isRead?: number | null;
  tag?: string | null;
}

export function useEntries(params: UseEntriesParams = {}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | null>(null);

  const fetchEntries = useCallback(async (cursor?: number | null) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.feedId) searchParams.set("feed_id", params.feedId);
      if (params.viewType) searchParams.set("view_type", params.viewType);
      if (params.isRead !== null && params.isRead !== undefined) searchParams.set("is_read", String(params.isRead));
      if (params.tag) searchParams.set("tag", params.tag);
      if (cursor) searchParams.set("cursor", String(cursor));

      const res = await fetch(`/api/entries?${searchParams}`);
      const data = await res.json();

      if (cursor) {
        setEntries((prev) => [...prev, ...data.entries]);
      } else {
        setEntries(data.entries);
      }
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error("Failed to fetch entries:", err);
    } finally {
      setLoading(false);
    }
  }, [params.feedId, params.viewType, params.isRead, params.tag]);

  useEffect(() => {
    setLoading(true);
    setEntries([]);
    fetchEntries();
  }, [fetchEntries]);

  const loadMore = useCallback(() => {
    if (nextCursor) fetchEntries(nextCursor);
  }, [nextCursor, fetchEntries]);

  const markAsRead = useCallback(async (entryId: string) => {
    await fetch(`/api/entries/${entryId}/read`, { method: "PUT" });
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, isRead: 1 } : e))
    );
  }, []);

  return { entries, loading, loadMore, hasMore: !!nextCursor, markAsRead, refetch: () => fetchEntries() };
}
