import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const db = getDb();
  const rows = db.select().from(settings).all();
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    try {
      result[row.key] = JSON.parse(row.value || "null");
    } catch {
      result[row.key] = row.value;
    }
  }
  return NextResponse.json(result);
}

export async function PUT(request: NextRequest) {
  const db = getDb();
  const body = await request.json();

  for (const [key, value] of Object.entries(body)) {
    db.insert(settings)
      .values({ key, value: JSON.stringify(value) })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: JSON.stringify(value) },
      })
      .run();
  }

  return NextResponse.json({ ok: true });
}
