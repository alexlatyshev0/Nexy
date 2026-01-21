-- Migration: 017_onboarding_as_scenes.sql
-- Description: Move onboarding categories to regular scenes table
-- Date: 2025-01-19

-- ============================================
-- PART 1: DROP ONBOARDING_CATEGORIES TABLE
-- ============================================

-- No longer needed - onboarding will use scenes table
DROP TABLE IF EXISTS onboarding_categories CASCADE;

-- ============================================
-- PART 2: ADD ONBOARDING FIELDS TO SCENES
-- ============================================

-- Add onboarding-specific fields
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS onboarding_order INTEGER;
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS onboarding_conditional BOOLEAN DEFAULT FALSE;
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS onboarding_condition TEXT;
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS gates_scenes TEXT[] DEFAULT '{}';

-- Index for onboarding scenes
CREATE INDEX IF NOT EXISTS idx_scenes_onboarding_order ON scenes(onboarding_order) WHERE onboarding_order IS NOT NULL;

-- ============================================
-- PART 3: UPDATE is_scene_gated FUNCTION
-- ============================================

-- Update function to work with scenes table
CREATE OR REPLACE FUNCTION is_scene_gated(
  p_user_id UUID,
  p_scene_slug TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_gates JSONB;
  v_scene_category TEXT;
  v_required_gate TEXT;
BEGIN
  -- Get user's gates
  SELECT gates INTO v_gates
  FROM onboarding_responses
  WHERE user_id = p_user_id;

  IF v_gates IS NULL THEN
    RETURN FALSE; -- No onboarding = show everything
  END IF;

  -- Get scene's category
  SELECT category INTO v_scene_category
  FROM scenes
  WHERE slug = p_scene_slug;

  IF v_scene_category IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Extract base category for gate check (e.g., 'oral-blowjob' -> 'oral')
  v_required_gate := split_part(v_scene_category, '-', 1);

  -- Check if gate is open
  IF NOT COALESCE((v_gates->>v_required_gate)::boolean, false) THEN
    RETURN TRUE; -- Scene is gated (blocked)
  END IF;

  RETURN FALSE; -- Scene is not gated (allowed)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN scenes.onboarding_order IS 'Order for onboarding flow (null = not onboarding scene)';
COMMENT ON COLUMN scenes.onboarding_conditional IS 'If true, show only when condition is met';
COMMENT ON COLUMN scenes.onboarding_condition IS 'Condition rule like "power_dynamic >= 1 OR rough >= 1"';
COMMENT ON COLUMN scenes.gates_scenes IS 'Scene slugs that this onboarding scene gates';
