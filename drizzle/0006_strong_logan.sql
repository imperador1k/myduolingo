CREATE TABLE "admin_auth_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"lockout_until" timestamp,
	CONSTRAINT "admin_auth_attempts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user_vocabulary" DROP COLUMN "distractors";