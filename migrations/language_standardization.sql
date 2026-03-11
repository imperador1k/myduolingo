-- Language Standardization Migration
-- Adds a 'language' column to courses table

-- 1. Add the language column
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "language" text NOT NULL DEFAULT 'English';

-- 2. Auto-populate based on existing language_code values
UPDATE "courses" SET "language" = 'English'    WHERE "language_code" = 'en';
UPDATE "courses" SET "language" = 'Spanish'    WHERE "language_code" = 'es';
UPDATE "courses" SET "language" = 'French'     WHERE "language_code" = 'fr';
UPDATE "courses" SET "language" = 'Portuguese' WHERE "language_code" = 'pt';
UPDATE "courses" SET "language" = 'German'     WHERE "language_code" = 'de';
UPDATE "courses" SET "language" = 'Italian'    WHERE "language_code" = 'it';
UPDATE "courses" SET "language" = 'Japanese'   WHERE "language_code" = 'ja';
UPDATE "courses" SET "language" = 'Korean'     WHERE "language_code" = 'ko';
UPDATE "courses" SET "language" = 'Mandarin'   WHERE "language_code" = 'zh';
UPDATE "courses" SET "language" = 'Russian'    WHERE "language_code" = 'ru';
UPDATE "courses" SET "language" = 'Arabic'     WHERE "language_code" = 'ar';
UPDATE "courses" SET "language" = 'Dutch'      WHERE "language_code" = 'nl';
