CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`order` integer DEFAULT 0,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_id` text NOT NULL,
	`tag` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `entries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `collections_entry_tag_idx` ON `collections` (`entry_id`,`tag`);--> statement-breakpoint
CREATE TABLE `entries` (
	`id` text PRIMARY KEY NOT NULL,
	`feed_id` text NOT NULL,
	`guid` text NOT NULL,
	`title` text,
	`url` text,
	`content` text,
	`summary` text,
	`author` text,
	`thumbnail` text,
	`media_url` text,
	`published_at` integer,
	`is_read` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`feed_id`) REFERENCES `feeds`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `entries_feed_guid_idx` ON `entries` (`feed_id`,`guid`);--> statement-breakpoint
CREATE TABLE `feeds` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`site_url` text,
	`feed_url` text NOT NULL,
	`description` text,
	`icon_url` text,
	`view_type` text DEFAULT 'article' NOT NULL,
	`category_id` text,
	`rsshub_route` text,
	`fetch_interval` integer,
	`last_fetched_at` integer,
	`error_count` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
