-- Migration: 021_merge_scene_responses.sql
-- Description: Merge composite_scene_responses into scene_responses
-- Date: 2025-01-21
--
-- Why: Two tables storing scene responses is redundant.
-- - scene_responses: uses UUID, has legacy fields
-- - composite_scene_responses: uses slug, has V2 fields
-- This migration unifies them into scene_responses.

-- ============================================
-- PART 1: ADD MISSING COLUMNS TO scene_responses
-- ============================================

-- Add V2 columns from composite_scene_responses
ALTER TABLE scene_responses ADD COLUMN IF NOT EXISTS element_responses JSONB DEFAULT '{}';
ALTER TABLE scene_responses ADD COLUMN IF NOT EXISTS skipped BOOLEAN DEFAULT false;
ALTER TABLE scene_responses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add scene_slug for V2 compatibility (scene-progression uses slug)
ALTER TABLE scene_responses ADD COLUMN IF NOT EXISTS scene_slug TEXT;

-- Index for slug lookups (used by scene-progression.ts)
CREATE INDEX IF NOT EXISTS idx_scene_responses_slug
ON scene_responses(scene_slug)
WHERE scene_slug IS NOT NULL;

-- Index for element_responses GIN search
CREATE INDEX IF NOT EXISTS idx_scene_responses_element_responses
ON scene_responses USING GIN (element_responses);

COMMENT ON COLUMN scene_responses.element_responses IS 'V2 follow-up responses by element: {"handcuffs": {"cuff_type": ["metal"]}}';
COMMENT ON COLUMN scene_responses.skipped IS 'True if user skipped this scene';
COMMENT ON COLUMN scene_responses.scene_slug IS 'Scene slug for V2 lookups (denormalized from scenes.slug)';

-- ============================================
-- PART 2: MIGRATE DATA FROM composite_scene_responses
-- ============================================

-- Update existing scene_responses with data from composite_scene_responses
-- Match by user_id and scene slug → UUID
UPDATE scene_responses sr
SET
  element_responses = COALESCE(csr.element_responses, '{}'),
  skipped = COALESCE(csr.skipped, false),
  updated_at = COALESCE(csr.updated_at, sr.created_at),
  scene_slug = s.slug
FROM composite_scene_responses csr
JOIN scenes s ON s.slug = csr.scene_id
WHERE sr.user_id = csr.user_id
  AND sr.scene_id = s.id;

-- Insert composite_scene_responses that don't exist in scene_responses
INSERT INTO scene_responses (
  user_id,
  scene_id,
  scene_slug,
  elements_selected,
  element_responses,
  skipped,
  created_at,
  updated_at
)
SELECT
  csr.user_id,
  s.id as scene_id,
  s.slug as scene_slug,
  csr.selected_elements as elements_selected,
  csr.element_responses,
  csr.skipped,
  csr.created_at,
  csr.updated_at
FROM composite_scene_responses csr
JOIN scenes s ON s.slug = csr.scene_id
WHERE NOT EXISTS (
  SELECT 1 FROM scene_responses sr
  WHERE sr.user_id = csr.user_id AND sr.scene_id = s.id
);

-- Backfill scene_slug for existing records
UPDATE scene_responses sr
SET scene_slug = s.slug
FROM scenes s
WHERE sr.scene_id = s.id AND sr.scene_slug IS NULL;

-- ============================================
-- PART 3: DROP composite_scene_responses
-- ============================================

DROP TABLE IF EXISTS composite_scene_responses;

-- ============================================
-- PART 4: VALIDATION QUERY (for manual check)
-- ============================================

-- Run this to verify migration:
-- SELECT
--   COUNT(*) as total_responses,
--   COUNT(scene_slug) as with_slug,
--   COUNT(element_responses) FILTER (WHERE element_responses != '{}') as with_element_responses
-- FROM scene_responses;
