import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { feeds, entries } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();

  db.update(feeds).set(body).where(eq(feeds.id, id)).run();

  const updated = db.select().from(feeds).where(eq(feeds.id, id)).get();
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  db.delete(entries).where(eq(entries.feedId, id)).run();
  db.delete(feeds).where(eq(feeds.id, id)).run();

  return NextResponse.json({ ok: true });
}
