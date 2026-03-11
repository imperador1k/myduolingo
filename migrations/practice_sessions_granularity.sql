-- Data Granularity: Add language and CEFR level tracking to practice sessions
-- This enables per-language, per-level analytics on practice activity.

ALTER TABLE "practice_sessions" ADD COLUMN IF NOT EXISTS "language" text NOT NULL DEFAULT 'English';
ALTER TABLE "practice_sessions" ADD COLUMN IF NOT EXISTS "cefr_level" text NOT NULL DEFAULT 'B1';
