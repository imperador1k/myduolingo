-- Arch: Course-Centric to Language-Centric Refactor
-- Adds active_language to user_progress to track the user's global language ecosystem.

-- 1. Add column with a default
ALTER TABLE "user_progress" ADD COLUMN IF NOT EXISTS "active_language" text NOT NULL DEFAULT 'English';

-- 2. Backfill existing users: join their active course and grab the language strings
UPDATE "user_progress" up
SET "active_language" = COALESCE(
    (SELECT c.language FROM courses c WHERE c.id = up.active_course_id), 
    'English'
);
