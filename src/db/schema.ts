import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  order: integer("order").default(0),
  createdAt: integer("created_at")
    .notNull()
    .$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const feeds = sqliteTable("feeds", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  siteUrl: text("site_url"),
  feedUrl: text("feed_url").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  viewType: text("view_type", { enum: ["article", "social", "video"] }).notNull().default("article"),
  categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  rsshubRoute: text("rsshub_route"),
  fetchInterval: integer("fetch_interval"),
  lastFetchedAt: integer("last_fetched_at"),
  errorCount: integer("error_count").default(0),
  createdAt: integer("created_at")
    .notNull()
    .$defaultFn(() => Math.floor(Date.now() / 1000)),
});

export const entries = sqliteTable(
  "entries",
  {
    id: text("id").primaryKey(),
    feedId: text("feed_id")
      .notNull()
      .references(() => feeds.id, { onDelete: "cascade" }),
    guid: text("guid").notNull(),
    title: text("title"),
    url: text("url"),
    content: text("content"),
    summary: text("summary"),
    author: text("author"),
    thumbnail: text("thumbnail"),
    mediaUrl: text("media_url"),
    publishedAt: integer("published_at"),
    isRead: integer("is_read").default(0),
    createdAt: integer("created_at")
      .notNull()
      .$defaultFn(() => Math.floor(Date.now() / 1000)),
  },
  (table) => [
    uniqueIndex("entries_feed_guid_idx").on(table.feedId, table.guid),
  ]
);

export const collections = sqliteTable(
  "collections",
  {
    id: text("id").primaryKey(),
    entryId: text("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    tag: text("tag", { enum: ["star", "later"] }).notNull(),
    createdAt: integer("created_at")
      .notNull()
      .$defaultFn(() => Math.floor(Date.now() / 1000)),
  },
  (table) => [
    uniqueIndex("collections_entry_tag_idx").on(table.entryId, table.tag),
  ]
);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"),
});
