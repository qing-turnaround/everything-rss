import { useState, useEffect, useCallback } from "react";
import { apiUrl } from "@/api";

export interface Feed {
  id: string;
  title: string;
  siteUrl: string | null;
  feedUrl: string;
  description: string | null;
  iconUrl: string | null;
  viewType: "article" | "social" | "video";
  categoryId: string | null;
  rsshubRoute: string | null;
  fetchInterval: number | null;
  lastFetchedAt: number | null;
  errorCount: number;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  createdAt: number;
}

export function useFeeds() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [feedsRes, catsRes] = await Promise.all([
        fetch(apiUrl("/api/feeds")),
        fetch(apiUrl("/api/categories")),
      ]);
      const feedsData = await feedsRes.json();
      const catsData = await catsRes.json();
      setFeeds(feedsData);
      setCategories(catsData);
    } catch (err) {
      console.error("Failed to fetch feeds:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { feeds, categories, loading, refetch: fetchData };
}
