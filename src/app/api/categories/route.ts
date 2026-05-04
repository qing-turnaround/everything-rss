import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { categories } from "@/db/schema";
import { v4 as uuid } from "uuid";
import { asc } from "drizzle-orm";

export async function GET() {
  const db = getDb();
  const result = db.select().from(categories).orderBy(asc(categories.order)).all();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();

  const newCategory = {
    id: uuid(),
    name: body.name,
    order: body.order ?? 0,
  };

  db.insert(categories).values(newCategory).run();

  return NextResponse.json(newCategory, { status: 201 });
}
