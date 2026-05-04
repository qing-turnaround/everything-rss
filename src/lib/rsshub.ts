import { getDb } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

const DEFAULT_INSTANCE = "https://rsshub.app";

export async function getRssHubInstance(): Promise<string> {
  const db = getDb();
  const row = db.select().from(settings).where(eq(settings.key, "rsshub_instance")).get();
  if (row?.value) {
    try {
      const parsed = JSON.parse(row.value);
      return typeof parsed === "string" ? parsed.replace(/\/+$/, "") : DEFAULT_INSTANCE;
    } catch {
      return DEFAULT_INSTANCE;
    }
  }
  return DEFAULT_INSTANCE;
}

export function buildRssHubUrl(instance: string, route: string): string {
  const cleanRoute = route.startsWith("/") ? route : `/${route}`;
  return `${instance}${cleanRoute}`;
}
