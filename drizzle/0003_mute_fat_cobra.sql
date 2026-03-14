CREATE TABLE "challenge_mistakes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"challenge_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "placement_test_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"language_tested" text NOT NULL,
	"final_level" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_vocabulary" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"word" text NOT NULL,
	"translation" text NOT NULL,
	"context_sentence" text NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"strength" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "challenge_options" ADD COLUMN "audio_lang" text;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "context" text;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "explanation" text;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "question_audio_lang" text;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "context_audio_lang" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "language" text DEFAULT 'English' NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD COLUMN "language" text DEFAULT 'English' NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD COLUMN "cefr_level" text DEFAULT 'B1' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "active_language" text DEFAULT 'English' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "cefr_levels" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "last_heart_change" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "challenge_mistakes" ADD CONSTRAINT "challenge_mistakes_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;