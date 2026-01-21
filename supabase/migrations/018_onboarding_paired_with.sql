-- Migration: 018_onboarding_paired_with.sql
-- Description: Add paired_with field for give/receive scene pairs and image_variants
-- Date: 2025-01-19

-- Add paired_with field to link give/receive scenes
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS onboarding_paired_with TEXT;

-- Add image_variants for storing multiple generated images before choosing final
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS image_variants JSONB DEFAULT '[]';

-- Index for quick lookup of paired scenes
CREATE INDEX IF NOT EXISTS idx_scenes_onboarding_paired_with
  ON scenes(onboarding_paired_with)
  WHERE onboarding_paired_with IS NOT NULL;

COMMENT ON COLUMN scenes.onboarding_paired_with IS 'Slug of paired scene (e.g., bondage-give paired with bondage-receive)';
COMMENT ON COLUMN scenes.image_variants IS 'Array of saved image variants [{url, prompt, created_at, qa_status, qa_score}]';
