import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { collections } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  db.delete(collections).where(eq(collections.id, id)).run();

  return NextResponse.json({ ok: true });
}
