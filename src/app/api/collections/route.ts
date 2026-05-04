import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { collections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function GET(request: NextRequest) {
  const db = getDb();
  const tag = request.nextUrl.searchParams.get("tag");

  let result;
  if (tag) {
    result = db.select().from(collections).where(eq(collections.tag, tag as "star" | "later")).all();
  } else {
    result = db.select().from(collections).all();
  }

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();

  const newCollection = {
    id: uuid(),
    entryId: body.entryId,
    tag: body.tag,
  };

  db.insert(collections).values(newCollection).onConflictDoNothing().run();

  return NextResponse.json(newCollection, { status: 201 });
}
