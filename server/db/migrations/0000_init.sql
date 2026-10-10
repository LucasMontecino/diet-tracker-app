CREATE TABLE `foods` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`serving_label` text NOT NULL,
	`kcal` real NOT NULL,
	`protein_g` real NOT NULL,
	`is_alcohol` integer DEFAULT false NOT NULL,
	`alcohol_ml` real,
	`is_favorite` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`meal_type` text NOT NULL,
	`food_id` integer,
	`name` text NOT NULL,
	`quantity` real NOT NULL,
	`kcal` real NOT NULL,
	`protein_g` real NOT NULL,
	`alcohol_ml` real,
	`note` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`type` text NOT NULL,
	`duration_min` integer NOT NULL,
	`steps` integer,
	`distance_km` real,
	`device_kcal` real,
	`note` text
);
--> statement-breakpoint
CREATE TABLE `weigh_ins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`kg` real NOT NULL,
	`note` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `weigh_ins_date_unique` ON `weigh_ins` (`date`);
--> statement-breakpoint
CREATE TABLE `days` (
	`date` text PRIMARY KEY NOT NULL,
	`is_free_meal` integer DEFAULT false NOT NULL,
	`expenditure_override_kcal` real,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
