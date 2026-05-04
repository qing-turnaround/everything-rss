import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();

  db.update(categories).set(body).where(eq(categories.id, id)).run();

  const updated = db.select().from(categories).where(eq(categories.id, id)).get();
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  db.delete(categories).where(eq(categories.id, id)).run();

  return NextResponse.json({ ok: true });
}
