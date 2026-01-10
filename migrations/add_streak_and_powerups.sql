-- Migration: Add Streak System and Power-ups to user_progress table
-- Run this SQL in your Supabase SQL Editor

-- Add streak columns
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS streak INTEGER NOT NULL DEFAULT 0;

ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0;

ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS last_streak_date DATE;

-- Add power-ups columns
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS xp_boost_lessons INTEGER NOT NULL DEFAULT 0;

ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS heart_shields INTEGER NOT NULL DEFAULT 0;

ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS streak_freezes INTEGER NOT NULL DEFAULT 0;

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_progress' 
ORDER BY ordinal_position;
