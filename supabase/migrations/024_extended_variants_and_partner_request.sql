-- Migration: 024_extended_variants_and_partner_request.sql
-- Description: Extend image variants for gallery and add partner request response type
-- Date: 2025-01-21
--
-- Why:
-- 1. Need to support multiple images per scene with gallery navigation
-- 2. New swipe down direction means "I would do it if partner asks"

-- ============================================
-- PART 1: EXTEND IMAGE VARIANTS
-- ============================================

-- Add selected_variant_index to track which variant is currently shown
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS selected_variant_index INTEGER DEFAULT 0;

COMMENT ON COLUMN scenes.selected_variant_index IS 'Index of currently selected variant in image_variants array. 0 = use image_url, 1+ = use image_variants[index-1]';

-- Note: image_variants structure is already JSONB array with format:
-- [
--   {
--     "url": "https://...",
--     "prompt": "...",
--     "created_at": "2025-01-21T...",
--     "qa_status": "passed" | "failed" | null,
--     "qa_score": 0.85,
--     "is_placeholder": false  // NEW: for empty slots awaiting generation
--   }
-- ]

-- ============================================
-- PART 2: PARTNER REQUEST RESPONSE VALUE
-- ============================================

-- Update comment on onboarding_responses to document new value
COMMENT ON COLUMN onboarding_responses.responses IS 'Category responses JSONB: NO=0, YES=1, VERY=2, PARTNER_REQUEST=3 (would do if partner asks)';

-- Update compute_gates_from_onboarding to handle value 3
CREATE OR REPLACE FUNCTION compute_gates_from_onboarding(p_responses JSONB)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_gates JSONB := '{}';
  v_key TEXT;
  v_value INTEGER;
BEGIN
  FOR v_key, v_value IN SELECT key, (value::text)::integer FROM jsonb_each(p_responses)
  LOOP
    -- Basic gate: YES (1), VERY (2), or PARTNER_REQUEST (3) = true
    -- Only NO (0) = false
    IF v_value >= 1 THEN
      v_gates := v_gates || jsonb_build_object(v_key, true);
    ELSE
      v_gates := v_gates || jsonb_build_object(v_key, false);
    END IF;

    -- VERY gate: only VERY (2) = true
    IF v_value = 2 THEN
      v_gates := v_gates || jsonb_build_object(v_key || '_very', true);
    END IF;

    -- PARTNER_REQUEST gate: value = 3
    -- This means user doesn't actively want it but would do it for partner
    IF v_value = 3 THEN
      v_gates := v_gates || jsonb_build_object(v_key || '_partner', true);
    END IF;
  END LOOP;

  -- Conditional show gates (unchanged from original logic)

  -- Show bondage if: power_dynamic != vanilla OR rough >= 1
  IF (p_responses->>'power_dynamic')::int >= 1 OR (p_responses->>'rough')::int >= 1 THEN
    v_gates := v_gates || '{"show_bondage": true}'::jsonb;
  END IF;

  -- Show body_fluids if: oral >= 1
  IF (p_responses->>'oral')::int >= 1 THEN
    v_gates := v_gates || '{"show_body_fluids": true}'::jsonb;
  END IF;

  -- Show sexting if: recording >= 1 OR exhibitionism >= 1
  IF (p_responses->>'recording')::int >= 1 OR (p_responses->>'exhibitionism')::int >= 1 THEN
    v_gates := v_gates || '{"show_sexting": true}'::jsonb;
  END IF;

  -- Show extreme if: rough >= 2 AND bondage >= 1 (or show_bondage)
  IF (p_responses->>'rough')::int >= 2 AND
     ((p_responses->>'bondage')::int >= 1 OR (v_gates->>'show_bondage')::boolean = true) THEN
    v_gates := v_gates || '{"show_extreme": true}'::jsonb;
  END IF;

  RETURN v_gates;
END;
$$;

-- ============================================
-- PART 3: FUNCTION TO GET ALL SCENE IMAGES
-- ============================================

-- Helper function to get all images for a scene (for gallery display)
CREATE OR REPLACE FUNCTION get_scene_images(p_scene_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_scene RECORD;
  v_images JSONB := '[]'::jsonb;
BEGIN
  SELECT image_url, image_variants INTO v_scene
  FROM scenes WHERE id = p_scene_id;

  -- Add main image_url as first image if exists
  IF v_scene.image_url IS NOT NULL THEN
    v_images := v_images || jsonb_build_array(
      jsonb_build_object(
        'url', v_scene.image_url,
        'is_main', true
      )
    );
  END IF;

  -- Add all variants
  IF v_scene.image_variants IS NOT NULL AND jsonb_array_length(v_scene.image_variants) > 0 THEN
    v_images := v_images || v_scene.image_variants;
  END IF;

  RETURN v_images;
END;
$$;

COMMENT ON FUNCTION get_scene_images IS 'Returns all images for a scene: main image_url + all image_variants as JSONB array';
