ALTER TYPE "public"."type" ADD VALUE 'INSERT';--> statement-breakpoint
ALTER TYPE "public"."type" ADD VALUE 'MATCH';--> statement-breakpoint
ALTER TYPE "public"."type" ADD VALUE 'DICTATION';--> statement-breakpoint
CREATE TABLE "user_daily_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"xp_gained" integer DEFAULT 0 NOT NULL,
	"lessons_completed" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
ALTER TABLE "user_vocabulary" ALTER COLUMN "language" SET DEFAULT 'English';--> statement-breakpoint
ALTER TABLE "user_vocabulary" ADD COLUMN "explanation" text DEFAULT '' NOT NULL;