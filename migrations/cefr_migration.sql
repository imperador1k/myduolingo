-- Add new columns for CEFR support
ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "context" text;
ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "explanation" text;
