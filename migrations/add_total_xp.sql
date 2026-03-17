-- Migration: Add total XP earned for permanent achievements
-- Run this SQL in your Supabase SQL Editor

-- Add total XP earned (never decreases, used for achievements)
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS total_xp_earned INTEGER NOT NULL DEFAULT 0;

-- Sync existing points to total_xp_earned
UPDATE user_progress SET total_xp_earned = points WHERE total_xp_earned = 0 AND points > 0;

-- Verify the changes
SELECT user_name, points, total_xp_earned FROM user_progress;
