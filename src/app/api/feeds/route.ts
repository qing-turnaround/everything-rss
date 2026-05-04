import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { feeds } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export async function GET(request: NextRequest) {
  const db = getDb();
  const categoryId = request.nextUrl.searchParams.get("category_id");

  let result;
  if (categoryId) {
    result = db.select().from(feeds).where(eq(feeds.categoryId, categoryId)).all();
  } else {
    result = db.select().from(feeds).all();
  }

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();

  const newFeed = {
    id: uuid(),
    title: body.title,
    siteUrl: body.siteUrl || null,
    feedUrl: body.feedUrl,
    description: body.description || null,
    iconUrl: body.iconUrl || null,
    viewType: body.viewType || "article",
    categoryId: body.categoryId || null,
    rsshubRoute: body.rsshubRoute || null,
    fetchInterval: body.fetchInterval || null,
  };

  db.insert(feeds).values(newFeed).run();

  return NextResponse.json(newFeed, { status: 201 });
}
