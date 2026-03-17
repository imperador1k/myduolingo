CREATE TABLE IF NOT EXISTS "practice_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"prompt" text NOT NULL,
	"prompt_data" text,
	"user_input" text,
	"audio_url" text,
	"feedback" text,
	"score" integer,
	"created_at" timestamp DEFAULT now()
);
