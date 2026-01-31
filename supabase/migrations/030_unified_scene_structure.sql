-- Migration: 030_unified_scene_structure.sql
-- Description: Unify onboarding and regular scenes with is_onboarding flag and for_gender field
-- Date: 2025-01-30

-- ============================================
-- PART 1: ADD NEW FIELDS TO SCENES
-- ============================================

-- is_onboarding: true = показывается в онбординге
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS is_onboarding BOOLEAN DEFAULT FALSE;

-- for_gender: кто видит сцену (male/female/null = все)
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS for_gender TEXT;

-- Index for onboarding scenes
CREATE INDEX IF NOT EXISTS idx_scenes_is_onboarding ON scenes(is_onboarding) WHERE is_onboarding = TRUE;

-- Index for gender filtering
CREATE INDEX IF NOT EXISTS idx_scenes_for_gender ON scenes(for_gender) WHERE for_gender IS NOT NULL;

-- ============================================
-- PART 2: MIGRATE EXISTING ONBOARDING SCENES
-- ============================================

-- Set is_onboarding = true for scenes with category = 'onboarding'
UPDATE scenes
SET is_onboarding = TRUE
WHERE category = 'onboarding';

-- Set for_gender based on slug pattern (onboarding-*-hetero-m/f)
UPDATE scenes
SET for_gender = 'male'
WHERE category = 'onboarding'
AND slug LIKE '%-hetero-m';

UPDATE scenes
SET for_gender = 'female'
WHERE category = 'onboarding'
AND slug LIKE '%-hetero-f';

-- ============================================
-- PART 3: COMMENTS
-- ============================================

COMMENT ON COLUMN scenes.is_onboarding IS 'True = scene is shown during onboarding flow';
COMMENT ON COLUMN scenes.for_gender IS 'Who sees this scene: male, female, or null (everyone)';
