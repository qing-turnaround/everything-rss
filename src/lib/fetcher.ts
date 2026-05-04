import { getDb } from "@/db";
import { feeds, entries, settings } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { parseFeed } from "./parser";
import { getRssHubInstance, buildRssHubUrl } from "./rsshub";
import { v4 as uuid } from "uuid";

async function getDefaultInterval(): Promise<number> {
  const db = getDb();
  const row = db.select().from(settings).where(eq(settings.key, "fetch_interval_default")).get();
  return row?.value ? parseInt(row.value, 10) || 300 : 300;
}

function shouldFetch(feed: { lastFetchedAt: number | null; fetchInterval: number | null; errorCount: number | null }, defaultInterval: number, now: number): boolean {
  if (!feed.lastFetchedAt) return true;
  const interval = feed.fetchInterval || defaultInterval;
  const errorCount = feed.errorCount || 0;
  const backoff = interval * Math.pow(2, Math.min(errorCount, 6));
  return now - feed.lastFetchedAt >= backoff;
}

async function fetchSingleFeed(feed: typeof feeds.$inferSelect, rsshubInstance: string): Promise<{ newEntries: number; error?: string }> {
  const db = getDb();
  const url = feed.rsshubRoute ? buildRssHubUrl(rsshubInstance, feed.rsshubRoute) : feed.feedUrl;

  try {
    const parsed = await parseFeed(url);
    let newEntries = 0;

    for (const entry of parsed.entries) {
      if (!entry.guid) continue;
      try {
        db.insert(entries)
          .values({
            id: uuid(),
            feedId: feed.id,
            guid: entry.guid,
            title: entry.title,
            url: entry.url,
            content: entry.content,
            summary: entry.summary,
            author: entry.author,
            thumbnail: entry.thumbnail,
            mediaUrl: entry.mediaUrl,
            publishedAt: entry.publishedAt,
          })
          .onConflictDoNothing()
          .run();
        newEntries++;
      } catch {
        // duplicate entry, skip
      }
    }

    db.update(feeds)
      .set({
        lastFetchedAt: Math.floor(Date.now() / 1000),
        errorCount: 0,
      })
      .where(eq(feeds.id, feed.id))
      .run();

    return { newEntries };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    db.update(feeds)
      .set({
        errorCount: sql`COALESCE(${feeds.errorCount}, 0) + 1`,
        lastFetchedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(feeds.id, feed.id))
      .run();

    return { newEntries: 0, error: errorMsg };
  }
}

export async function fetchAllFeeds(): Promise<void> {
  const pLimit = (await import("p-limit")).default;
  const limit = pLimit(5);
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const defaultInterval = await getDefaultInterval();
  const rsshubInstance = await getRssHubInstance();

  const allFeeds = db.select().from(feeds).all();
  const dueFeeds = allFeeds.filter((f) => shouldFetch(f, defaultInterval, now));

  if (dueFeeds.length === 0) return;

  console.log(`[fetcher] ${dueFeeds.length}/${allFeeds.length} feeds due for fetching`);

  const tasks = dueFeeds.map((feed) =>
    limit(async () => {
      const result = await fetchSingleFeed(feed, rsshubInstance);
      if (result.error) {
        console.log(`[fetcher] ✗ ${feed.title}: ${result.error}`);
      } else {
        console.log(`[fetcher] ✓ ${feed.title}: ${result.newEntries} new entries`);
      }
    })
  );

  await Promise.all(tasks);
}
