import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { feeds, categories } from "@/db/schema";
import { parseOpml, OpmlOutline } from "@/lib/opml";
import { v4 as uuid } from "uuid";

export async function POST(request: NextRequest) {
  const db = getDb();
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const xml = await file.text();
  const outlines = parseOpml(xml);

  let imported = 0;
  let skipped = 0;

  function processOutlines(items: OpmlOutline[], categoryId: string | null) {
    for (const item of items) {
      if (item.xmlUrl) {
        try {
          db.insert(feeds)
            .values({
              id: uuid(),
              title: item.title || item.xmlUrl,
              feedUrl: item.xmlUrl,
              siteUrl: item.htmlUrl || null,
              viewType: "article",
              categoryId,
            })
            .run();
          imported++;
        } catch {
          skipped++;
        }
      } else if (item.children.length > 0) {
        const catId = uuid();
        try {
          db.insert(categories).values({ id: catId, name: item.title }).run();
        } catch {
          // category exists
        }
        processOutlines(item.children, catId);
      }
    }
  }

  processOutlines(outlines, null);

  return NextResponse.json({ imported, skipped });
}
