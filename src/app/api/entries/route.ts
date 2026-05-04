import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { entries, feeds, collections } from "@/db/schema";
import { eq, and, lt, desc, sql, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const db = getDb();
  const params = request.nextUrl.searchParams;
  const feedId = params.get("feed_id");
  const viewType = params.get("view_type");
  const isRead = params.get("is_read");
  const cursor = params.get("cursor");
  const limit = parseInt(params.get("limit") || "20", 10);
  const tag = params.get("tag");

  if (tag) {
    const collectionRows = db
      .select({ entryId: collections.entryId })
      .from(collections)
      .where(eq(collections.tag, tag as "star" | "later"))
      .all();

    if (collectionRows.length === 0) {
      return NextResponse.json({ entries: [], nextCursor: null });
    }

    const entryIds = collectionRows.map((r) => r.entryId);
    const conditions = [inArray(entries.id, entryIds)];
    if (cursor) conditions.push(lt(entries.publishedAt, parseInt(cursor, 10)));

    const result = db
      .select()
      .from(entries)
      .where(and(...conditions))
      .orderBy(desc(entries.publishedAt))
      .limit(limit + 1)
      .all();

    const hasMore = result.length > limit;
    const items = hasMore ? result.slice(0, limit) : result;
    const nextCursor = hasMore ? items[items.length - 1].publishedAt : null;

    return NextResponse.json({ entries: items, nextCursor });
  }

  const conditions = [];

  if (feedId) {
    conditions.push(eq(entries.feedId, feedId));
  }

  if (viewType) {
    const feedRows = db
      .select({ id: feeds.id })
      .from(feeds)
      .where(eq(feeds.viewType, viewType as "article" | "social" | "video"))
      .all();
    const feedIds = feedRows.map((r) => r.id);
    if (feedIds.length > 0) {
      conditions.push(inArray(entries.feedId, feedIds));
    } else {
      return NextResponse.json({ entries: [], nextCursor: null });
    }
  }

  if (isRead !== null && isRead !== undefined) {
    conditions.push(eq(entries.isRead, parseInt(isRead, 10)));
  }

  if (cursor) {
    conditions.push(lt(entries.publishedAt, parseInt(cursor, 10)));
  }

  const result = db
    .select()
    .from(entries)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(entries.publishedAt))
    .limit(limit + 1)
    .all();

  const hasMore = result.length > limit;
  const items = hasMore ? result.slice(0, limit) : result;
  const nextCursor = hasMore ? items[items.length - 1].publishedAt : null;

  return NextResponse.json({ entries: items, nextCursor });
}
