CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`starts` text NOT NULL,
	`ends` text NOT NULL,
	`venue` text NOT NULL,
	`organizer` text NOT NULL,
	`description` text NOT NULL,
	`capacity` integer NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`audience` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notices` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`created` text NOT NULL,
	`event_id` text,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_registration_event_email` ON `registrations` (`event_id`,`email`);--> statement-breakpoint
CREATE INDEX `idx_registration_event_status` ON `registrations` (`event_id`,`status`);