-- Migration: 034_drop_paired_with.sql
-- Description: Remove paired_with UUID column, use paired_scene slug instead
-- Date: 2026-01-31
--
-- This migration completes the unification of paired scene fields:
-- - paired_scene (TEXT slug) is now the single source of truth
-- - paired_with (UUID) is removed as it's no longer needed
-- - All code has been migrated to use paired_scene

-- ============================================
-- PART 1: VERIFY MIGRATION READINESS
-- ============================================

-- This should return 0 if all code has been migrated
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Check if any scenes have paired_with but not paired_scene
  SELECT COUNT(*) INTO v_count
  FROM scenes
  WHERE paired_with IS NOT NULL AND paired_scene IS NULL;

  IF v_count > 0 THEN
    RAISE WARNING 'Found % scenes with paired_with but no paired_scene. These will lose pairing!', v_count;
  END IF;
END $$;

-- ============================================
-- PART 2: DROP PAIRED_WITH COLUMN
-- ============================================

-- Drop index first
DROP INDEX IF EXISTS idx_scenes_paired_with;

-- Drop the column
ALTER TABLE scenes DROP COLUMN IF EXISTS paired_with;

-- ============================================
-- PART 3: VERIFICATION
-- ============================================

-- Verify paired_scene column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scenes' AND column_name = 'paired_scene'
  ) THEN
    RAISE EXCEPTION 'paired_scene column not found! Migration 033 may not have run.';
  END IF;

  RAISE NOTICE 'Migration successful: paired_with removed, paired_scene is the single source of truth';
END $$;

-- ============================================
-- PART 4: COMMENTS
-- ============================================

COMMENT ON COLUMN scenes.paired_scene IS
  'Slug of paired scene (same image_prompt, different perspective). Replaces paired_with UUID.';
