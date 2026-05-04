import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { entries } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  db.update(entries).set({ isRead: 1 }).where(eq(entries.id, id)).run();

  return NextResponse.json({ ok: true });
}
