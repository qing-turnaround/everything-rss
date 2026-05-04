import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { entries, feeds } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function PUT(request: NextRequest) {
  const db = getDb();
  const body = await request.json();

  if (body.feedId) {
    db.update(entries).set({ isRead: 1 }).where(eq(entries.feedId, body.feedId)).run();
  } else if (body.viewType) {
    const feedRows = db.select({ id: feeds.id }).from(feeds).where(eq(feeds.viewType, body.viewType as "article" | "social" | "video")).all();
    const feedIds = feedRows.map((r) => r.id);
    if (feedIds.length > 0) {
      db.update(entries).set({ isRead: 1 }).where(inArray(entries.feedId, feedIds)).run();
    }
  } else {
    db.update(entries).set({ isRead: 1 }).run();
  }

  return NextResponse.json({ ok: true });
}
