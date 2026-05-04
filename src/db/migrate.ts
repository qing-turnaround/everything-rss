import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data", "rss.db");

const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite);

migrate(db, { migrationsFolder: path.join(__dirname, "migrations") });

sqlite.exec(`
  INSERT OR IGNORE INTO settings (key, value) VALUES ('rsshub_instance', '"https://rsshub.app"');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('fetch_interval_default', '300');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('theme', '"system"');
`);

console.log("Migration complete.");
sqlite.close();
