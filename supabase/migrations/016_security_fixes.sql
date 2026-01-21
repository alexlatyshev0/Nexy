-- Migration: 016_security_fixes.sql
-- Description: Security fixes from Supabase Security Advisor
-- Date: 2025-01-19

-- ============================================
-- FIX ERRORS: Enable RLS on public tables
-- ============================================

-- discovery_config (read-only справочник)
ALTER TABLE IF EXISTS discovery_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read discovery_config" ON discovery_config;
CREATE POLICY "Public read discovery_config"
  ON discovery_config FOR SELECT
  USING (true);

-- categories (read-only справочник)
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories"
  ON categories FOR SELECT
  USING (true);

-- tag_categories (read-only справочник)
ALTER TABLE IF EXISTS tag_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read tag_categories" ON tag_categories;
CREATE POLICY "Public read tag_categories"
  ON tag_categories FOR SELECT
  USING (true);

-- ============================================
-- FIX WARNINGS: Set search_path on functions
-- ============================================

-- handle_new_user_v3
CREATE OR REPLACE FUNCTION handle_new_user_v3()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- validate_scene_slug (need to drop first due to parameter name change)
DROP FUNCTION IF EXISTS validate_scene_slug(TEXT);
CREATE FUNCTION validate_scene_slug(p_slug TEXT)
RETURNS BOOLEAN
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN p_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$';
END;
$$;

-- update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- get_excluded_scene_ids
CREATE OR REPLACE FUNCTION get_excluded_scene_ids(p_user_id UUID)
RETURNS UUID[]
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_excluded UUID[];
BEGIN
  SELECT ARRAY_AGG(scene_id)
  INTO v_excluded
  FROM scene_exclusions
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_excluded, ARRAY[]::UUID[]);
END;
$$;

-- compute_onboarding_gates (update with search_path)
CREATE OR REPLACE FUNCTION compute_onboarding_gates(p_responses JSONB)
RETURNS JSONB
SET search_path = public
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_gates JSONB := '{}';
  v_key TEXT;
  v_value INTEGER;
BEGIN
  FOR v_key, v_value IN SELECT * FROM jsonb_each_text(p_responses)
  LOOP
    IF v_value::integer >= 1 THEN
      v_gates := v_gates || jsonb_build_object(v_key, true);
    ELSE
      v_gates := v_gates || jsonb_build_object(v_key, false);
    END IF;

    IF v_value::integer >= 2 THEN
      v_gates := v_gates || jsonb_build_object(v_key || '_very', true);
    END IF;
  END LOOP;

  IF (p_responses->>'power_dynamic')::integer >= 1 OR (p_responses->>'rough')::integer >= 1 THEN
    v_gates := v_gates || '{"show_bondage": true}'::jsonb;
  END IF;

  IF (p_responses->>'oral')::integer >= 1 THEN
    v_gates := v_gates || '{"show_body_fluids": true}'::jsonb;
  END IF;

  IF (p_responses->>'recording')::integer >= 1 OR (p_responses->>'exhibitionism')::integer >= 1 THEN
    v_gates := v_gates || '{"show_sexting": true}'::jsonb;
  END IF;

  IF (p_responses->>'rough')::integer >= 2 AND (p_responses->>'bondage')::integer >= 1 THEN
    v_gates := v_gates || '{"show_extreme": true}'::jsonb;
  END IF;

  RETURN v_gates;
END;
$$;

-- is_scene_gated (update with search_path)
CREATE OR REPLACE FUNCTION is_scene_gated(
  p_user_id UUID,
  p_scene_slug TEXT
)
RETURNS BOOLEAN
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_gates JSONB;
  v_scene_gates TEXT[];
  v_gate TEXT;
BEGIN
  SELECT gates INTO v_gates
  FROM onboarding_responses
  WHERE user_id = p_user_id;

  IF v_gates IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT (ai_context->>'gates')::TEXT[] INTO v_scene_gates
  FROM scenes
  WHERE slug = p_scene_slug;

  IF v_scene_gates IS NULL THEN
    RETURN FALSE;
  END IF;

  FOREACH v_gate IN ARRAY v_scene_gates
  LOOP
    IF NOT COALESCE((v_gates->>v_gate)::boolean, false) THEN
      RETURN TRUE;
    END IF;
  END LOOP;

  RETURN FALSE;
END;
$$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION handle_new_user_v3 IS 'Creates profile for new auth user (search_path secured)';
COMMENT ON FUNCTION validate_scene_slug IS 'Validates scene slug format (search_path secured)';
COMMENT ON FUNCTION update_updated_at_column IS 'Auto-updates updated_at timestamp (search_path secured)';
COMMENT ON FUNCTION get_excluded_scene_ids IS 'Gets excluded scene IDs for user (search_path secured)';
COMMENT ON FUNCTION compute_onboarding_gates IS 'Computes gate flags from onboarding responses (search_path secured)';
COMMENT ON FUNCTION is_scene_gated IS 'Checks if scene is blocked for user (search_path secured)';
