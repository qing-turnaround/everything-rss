import cron from "node-cron";
import path from "path";

process.env.DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data", "rss.db");

async function main() {
  const { fetchAllFeeds } = await import("../src/lib/fetcher");

  console.log("[fetcher] RSS Fetcher started. Scheduling every minute...");

  await fetchAllFeeds();

  cron.schedule("* * * * *", async () => {
    console.log(`[fetcher] Tick at ${new Date().toISOString()}`);
    try {
      await fetchAllFeeds();
    } catch (err) {
      console.error("[fetcher] Error:", err);
    }
  });
}

main().catch((err) => {
  console.error("[fetcher] Fatal error:", err);
  process.exit(1);
});
