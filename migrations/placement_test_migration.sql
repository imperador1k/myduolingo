-- CEFR Language-Specific Levels Migration
-- Converts global current_cefr_level (text) to per-language cefr_levels (jsonb)

-- 1. Add the new jsonb column
ALTER TABLE "user_progress" ADD COLUMN IF NOT EXISTS "cefr_levels" jsonb NOT NULL DEFAULT '{}';

-- 2. Migrate existing data (if any user had a level set, assign it to their active course language)
-- This is a best-effort migration; manual review may be needed for edge cases
UPDATE "user_progress" up
SET "cefr_levels" = jsonb_build_object(
    COALESCE((SELECT c.title FROM courses c WHERE c.id = up.active_course_id), 'English'),
    up.current_cefr_level
)
WHERE up.current_cefr_level IS NOT NULL AND up.current_cefr_level != '';

-- 3. Drop the old column
ALTER TABLE "user_progress" DROP COLUMN IF EXISTS "current_cefr_level";

-- 4. Create placement_test_history if it doesn't exist
CREATE TABLE IF NOT EXISTS "placement_test_history" (
    "id" serial PRIMARY KEY,
    "user_id" text NOT NULL,
    "language_tested" text NOT NULL,
    "final_level" text NOT NULL,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "placement_test_history_user_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "user_progress"("user_id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_placement_test_user_id" ON "placement_test_history" ("user_id");
