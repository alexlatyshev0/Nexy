-- Migration: 033_unified_architecture.sql
-- Description: Unified scene/response architecture - single source of truth
-- Date: 2026-01-31
--
-- This migration combines:
-- - 031_scene_gates.sql (sets_gate column)
-- - 033_unified_responses.sql (migrate onboarding_responses)
-- - 034_cleanup_legacy.sql (drop redundant columns)
--
-- Result:
-- - All responses in scene_responses table
-- - Gates computed from scenes with sets_gate
-- - No more onboarding_responses table
-- - Clean scenes table without legacy columns

-- ============================================
-- PART 1: ADD NEW COLUMNS TO SCENES
-- ============================================

-- sets_gate: which gate this scene opens when YES/VERY
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS sets_gate TEXT;
COMMENT ON COLUMN scenes.sets_gate IS 'Gate name to set when user responds YES/VERY on this scene';
CREATE INDEX IF NOT EXISTS idx_scenes_sets_gate ON scenes(sets_gate) WHERE sets_gate IS NOT NULL;

-- paired_scene: slug of paired scene (same situation, different perspective)
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS paired_scene TEXT;
COMMENT ON COLUMN scenes.paired_scene IS 'Slug of paired scene (same image, different perspective)';

-- ============================================
-- PART 2: DROP REDUNDANT TABLES
-- ============================================

-- onboarding_categories: replaced by scenes with is_onboarding=true
DROP TABLE IF EXISTS onboarding_categories CASCADE;

-- composite_scene_responses: merged into scene_responses (migration 021)
DROP TABLE IF EXISTS composite_scene_responses CASCADE;

-- ============================================
-- PART 3: DROP REDUNDANT COLUMNS FROM SCENES
-- ============================================

-- onboarding_conditional/onboarding_condition: replaced by gates system
ALTER TABLE scenes DROP COLUMN IF EXISTS onboarding_conditional;
ALTER TABLE scenes DROP COLUMN IF EXISTS onboarding_condition;

-- onboarding_category: duplicates category field
ALTER TABLE scenes DROP COLUMN IF EXISTS onboarding_category;

-- onboarding_direction: duplicates role_direction field
ALTER TABLE scenes DROP COLUMN IF EXISTS onboarding_direction;

-- onboarding_paired_with: replaced by paired_scene (TEXT slug)
ALTER TABLE scenes DROP COLUMN IF EXISTS onboarding_paired_with;

-- NOTE: paired_with (UUID) is kept for now - admin code uses it
-- Will be populated from paired_scene during seeding
-- TODO: Migrate admin code to use paired_scene, then drop paired_with

-- ============================================
-- PART 4: MIGRATE onboarding_responses TO scene_responses
-- ============================================

-- Migrate JSONB responses to scene_responses rows
DO $$
DECLARE
  v_record RECORD;
  v_key TEXT;
  v_value INTEGER;
  v_scene_id UUID;
BEGIN
  -- Check if onboarding_responses exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'onboarding_responses') THEN
    -- For each user with onboarding responses
    FOR v_record IN
      SELECT user_id, responses
      FROM onboarding_responses
      WHERE responses IS NOT NULL AND responses != '{}'::jsonb
    LOOP
      -- For each key-value in responses JSONB
      FOR v_key, v_value IN SELECT * FROM jsonb_each_text(v_record.responses)
      LOOP
        -- Find scene by slug or sets_gate
        SELECT id INTO v_scene_id
        FROM scenes
        WHERE slug = v_key OR sets_gate = v_key
        LIMIT 1;

        -- Insert into scene_responses
        INSERT INTO scene_responses (user_id, scene_id, scene_slug, answer, question_type)
        VALUES (
          v_record.user_id,
          v_scene_id,
          v_key,
          jsonb_build_object('value', v_value::integer),
          'swipe'
        )
        ON CONFLICT (user_id, scene_id) DO UPDATE SET
          answer = jsonb_build_object('value', v_value::integer),
          updated_at = NOW();
      END LOOP;
    END LOOP;
  END IF;
END $$;

-- ============================================
-- PART 5: CREATE NEW GATE COMPUTATION TRIGGER
-- ============================================

-- New function: compute gates from scene_responses
CREATE OR REPLACE FUNCTION compute_gates_from_scene_responses()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_gates JSONB := '{}';
  v_record RECORD;
  v_gate_name TEXT;
  v_value INTEGER;
BEGIN
  -- Get all responses for this user where scene has sets_gate and value >= 1
  FOR v_record IN
    SELECT
      s.sets_gate as gate_name,
      (sr.answer->>'value')::integer as response_value
    FROM scene_responses sr
    JOIN scenes s ON s.id = sr.scene_id OR s.slug = sr.scene_slug
    WHERE sr.user_id = NEW.user_id
      AND s.sets_gate IS NOT NULL
      AND (sr.answer->>'value')::integer >= 1
  LOOP
    v_gate_name := v_record.gate_name;
    v_value := v_record.response_value;

    IF v_gate_name IS NOT NULL THEN
      -- Basic gate (YES or VERY)
      v_gates := v_gates || jsonb_build_object(v_gate_name, true);

      -- VERY gate (only if value = 2)
      IF v_value >= 2 THEN
        v_gates := v_gates || jsonb_build_object(v_gate_name || '_very', true);
      END IF;
    END IF;
  END LOOP;

  -- Conditional gates (derived from combinations)
  IF v_gates ? 'power_dynamic' OR v_gates ? 'rough' THEN
    v_gates := v_gates || '{"show_bondage": true}'::jsonb;
  END IF;

  IF v_gates ? 'oral' THEN
    v_gates := v_gates || '{"show_body_fluids": true}'::jsonb;
  END IF;

  IF v_gates ? 'recording' OR v_gates ? 'exhibitionism' THEN
    v_gates := v_gates || '{"show_sexting": true}'::jsonb;
  END IF;

  IF (v_gates ? 'rough_very') AND (v_gates ? 'bondage') THEN
    v_gates := v_gates || '{"show_extreme": true}'::jsonb;
  END IF;

  -- Update user_gates (merge with existing body_map and activity gates)
  INSERT INTO user_gates (user_id, onboarding_gates, gates)
  VALUES (NEW.user_id, v_gates, v_gates)
  ON CONFLICT (user_id) DO UPDATE SET
    onboarding_gates = v_gates,
    gates = COALESCE(user_gates.body_map_gates, '{}'::jsonb)
         || COALESCE(user_gates.activity_gates, '{}'::jsonb)
         || v_gates,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION compute_gates_from_scene_responses IS
  'Computes user gates from scene_responses where scene has sets_gate';

-- ============================================
-- PART 6: DROP OLD TRIGGERS AND CREATE NEW
-- ============================================

-- Drop all old triggers
DROP TRIGGER IF EXISTS trg_compute_onboarding_gates ON onboarding_responses;
DROP TRIGGER IF EXISTS trg_compute_onboarding_gates ON scene_responses;
DROP TRIGGER IF EXISTS trg_update_gates_on_scene_response ON scene_responses;
DROP TRIGGER IF EXISTS trg_compute_gates_from_responses ON scene_responses;

-- Create single unified trigger
CREATE TRIGGER trg_compute_gates_from_responses
  AFTER INSERT OR UPDATE OF answer ON scene_responses
  FOR EACH ROW
  EXECUTE FUNCTION compute_gates_from_scene_responses();

-- ============================================
-- PART 7: DROP onboarding_responses TABLE
-- ============================================

DROP TABLE IF EXISTS onboarding_responses CASCADE;

-- ============================================
-- PART 8: DROP OLD FUNCTIONS
-- ============================================

DROP FUNCTION IF EXISTS compute_onboarding_gates(JSONB);
DROP FUNCTION IF EXISTS compute_gates_from_onboarding_rows();
DROP FUNCTION IF EXISTS update_gates_from_scene_response();

-- ============================================
-- PART 9: VERIFICATION (run manually)
-- ============================================

-- Check scenes columns:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'scenes' ORDER BY ordinal_position;

-- Check remaining tables:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check scenes with gates:
-- SELECT slug, sets_gate FROM scenes WHERE sets_gate IS NOT NULL ORDER BY sets_gate;
