CREATE TABLE `boards` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_boards_owner` ON `boards` (`owner`);--> statement-breakpoint
CREATE TABLE `cards` (
	`id` text PRIMARY KEY NOT NULL,
	`board_id` text NOT NULL,
	`owner` text NOT NULL,
	`kind` text NOT NULL,
	`image_key` text,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`reference` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`x` integer DEFAULT 40 NOT NULL,
	`y` integer DEFAULT 40 NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_cards_owner` ON `cards` (`owner`);--> statement-breakpoint
CREATE INDEX `idx_cards_board` ON `cards` (`board_id`);