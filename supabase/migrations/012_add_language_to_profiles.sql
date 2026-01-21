-- Migration: Add language field to profiles table
-- Date: 2025-01-XX

-- Add language column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language TEXT CHECK (language IN ('en', 'ru')) DEFAULT 'en';

-- Update existing profiles to have default language 'en'
UPDATE profiles 
SET language = 'en' 
WHERE language IS NULL;
