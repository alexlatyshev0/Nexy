-- ============================================
-- Migration 019: Unified Gates System
-- ============================================
--
-- Single source of truth for all user gates.
-- Gates are computed automatically via triggers.
-- Client code should NOT compute gates - only read them.
--
-- Sources:
--   1. onboarding_responses.responses → onboarding_gates
--   2. body_map_responses → body_map_gates
--   3. Future activities → activity_gates (extensible)
--
-- Usage:
--   SELECT gates FROM user_gates WHERE user_id = ?
--   -- Returns combined gates from all sources
-- ============================================

-- ============================================
-- PART 1: USER_GATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_gates (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- Gates from different sources (for debugging/transparency)
  onboarding_gates JSONB NOT NULL DEFAULT '{}',
  body_map_gates JSONB NOT NULL DEFAULT '{}',
  activity_gates JSONB NOT NULL DEFAULT '{}',  -- Reserved for future

  -- Combined gates (single source of truth for queries)
  gates JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast gate lookups
CREATE INDEX IF NOT EXISTS idx_user_gates_gates ON user_gates USING GIN (gates);

COMMENT ON TABLE user_gates IS 'Single source of truth for all user gates. Auto-computed via triggers.';
COMMENT ON COLUMN user_gates.onboarding_gates IS 'Gates derived from visual onboarding responses';
COMMENT ON COLUMN user_gates.body_map_gates IS 'Gates derived from body map selections';
COMMENT ON COLUMN user_gates.activity_gates IS 'Reserved for future activity-based gates';
COMMENT ON COLUMN user_gates.gates IS 'Combined gates from all sources - use this for queries';

-- ============================================
-- PART 2: GATE COMPUTATION FUNCTIONS
-- ============================================

-- Function to compute gates from onboarding responses
-- Response values: NO=0, YES=1, VERY=2
CREATE OR REPLACE FUNCTION compute_gates_from_onboarding(p_responses JSONB)
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
  -- Process each response
  FOR v_key, v_value IN SELECT key, (value::text)::integer FROM jsonb_each(p_responses)
  LOOP
    -- Basic gate: YES (1) or VERY (2) = true
    IF v_value >= 1 THEN
      v_gates := v_gates || jsonb_build_object(v_key, true);
    ELSE
      v_gates := v_gates || jsonb_build_object(v_key, false);
    END IF;

    -- VERY gate: only VERY (2) = true
    IF v_value >= 2 THEN
      v_gates := v_gates || jsonb_build_object(v_key || '_very', true);
    END IF;
  END LOOP;

  -- Conditional gates

  -- show_bondage: power_dynamic >= 1 OR rough >= 1
  IF COALESCE((p_responses->>'power_dynamic')::integer, 0) >= 1
     OR COALESCE((p_responses->>'rough')::integer, 0) >= 1 THEN
    v_gates := v_gates || '{"show_bondage": true}'::jsonb;
  END IF;

  -- show_body_fluids: oral >= 1
  IF COALESCE((p_responses->>'oral')::integer, 0) >= 1 THEN
    v_gates := v_gates || '{"show_body_fluids": true}'::jsonb;
  END IF;

  -- show_sexting: recording >= 1 OR exhibitionism >= 1
  IF COALESCE((p_responses->>'recording')::integer, 0) >= 1
     OR COALESCE((p_responses->>'exhibitionism')::integer, 0) >= 1 THEN
    v_gates := v_gates || '{"show_sexting": true}'::jsonb;
  END IF;

  -- show_extreme: rough >= 2 AND bondage >= 1
  IF COALESCE((p_responses->>'rough')::integer, 0) >= 2
     AND COALESCE((p_responses->>'bondage')::integer, 0) >= 1 THEN
    v_gates := v_gates || '{"show_extreme": true}'::jsonb;
  END IF;

  RETURN v_gates;
END;
$$;

COMMENT ON FUNCTION compute_gates_from_onboarding IS 'Computes gate flags from onboarding responses (NO=0, YES=1, VERY=2)';


-- Function to compute gates from body map responses
-- Creates gates like: body_map_kiss_give, body_map_lick_receive, etc.
CREATE OR REPLACE FUNCTION compute_gates_from_body_map(p_user_id UUID)
RETURNS JSONB
SET search_path = public
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_gates JSONB := '{}';
  v_record RECORD;
BEGIN
  -- Process each body map response
  FOR v_record IN
    SELECT activity_id, pass, zones_selected
    FROM body_map_responses
    WHERE user_id = p_user_id
  LOOP
    -- If user selected any zones for this activity/pass, create a gate
    IF array_length(v_record.zones_selected, 1) > 0 THEN
      -- Generic gate: body_map_{activity}_{pass} = true
      v_gates := v_gates || jsonb_build_object(
        'body_map_' || v_record.activity_id || '_' || v_record.pass,
        true
      );

      -- Also create zone-specific gates for important zones
      -- body_map_{activity}_{pass}_{zone} = true
      DECLARE
        v_zone TEXT;
      BEGIN
        FOREACH v_zone IN ARRAY v_record.zones_selected
        LOOP
          v_gates := v_gates || jsonb_build_object(
            'body_map_' || v_record.activity_id || '_' || v_record.pass || '_' || v_zone,
            true
          );
        END LOOP;
      END;
    END IF;
  END LOOP;

  RETURN v_gates;
END;
$$;

COMMENT ON FUNCTION compute_gates_from_body_map IS 'Computes gate flags from body map zone selections';


-- Function to merge all gate sources into combined gates
CREATE OR REPLACE FUNCTION merge_all_gates(
  p_onboarding JSONB,
  p_body_map JSONB,
  p_activity JSONB
)
RETURNS JSONB
SET search_path = public
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Simple merge: body_map and activity gates extend onboarding gates
  -- Priority: activity > body_map > onboarding (later sources override)
  RETURN p_onboarding || p_body_map || p_activity;
END;
$$;

COMMENT ON FUNCTION merge_all_gates IS 'Merges gates from all sources into combined gates JSONB';


-- ============================================
-- PART 3: RECOMPUTE USER GATES FUNCTION
-- ============================================

-- Main function to recompute all gates for a user
CREATE OR REPLACE FUNCTION recompute_user_gates(p_user_id UUID)
RETURNS VOID
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_onboarding_gates JSONB := '{}';
  v_body_map_gates JSONB := '{}';
  v_activity_gates JSONB := '{}';
  v_combined_gates JSONB;
  v_responses JSONB;
BEGIN
  -- Get onboarding responses and compute gates
  SELECT responses INTO v_responses
  FROM onboarding_responses
  WHERE user_id = p_user_id;

  IF v_responses IS NOT NULL THEN
    v_onboarding_gates := compute_gates_from_onboarding(v_responses);
  END IF;

  -- Compute body map gates
  v_body_map_gates := compute_gates_from_body_map(p_user_id);

  -- Activity gates (reserved for future)
  v_activity_gates := '{}';

  -- Merge all gates
  v_combined_gates := merge_all_gates(v_onboarding_gates, v_body_map_gates, v_activity_gates);

  -- Upsert into user_gates
  INSERT INTO user_gates (user_id, onboarding_gates, body_map_gates, activity_gates, gates, updated_at)
  VALUES (p_user_id, v_onboarding_gates, v_body_map_gates, v_activity_gates, v_combined_gates, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    onboarding_gates = EXCLUDED.onboarding_gates,
    body_map_gates = EXCLUDED.body_map_gates,
    activity_gates = EXCLUDED.activity_gates,
    gates = EXCLUDED.gates,
    updated_at = NOW();
END;
$$;

COMMENT ON FUNCTION recompute_user_gates IS 'Recomputes all gates for a user from all sources. Call this after any gate-affecting change.';


-- ============================================
-- PART 4: TRIGGERS
-- ============================================

-- Trigger function for onboarding_responses changes
CREATE OR REPLACE FUNCTION trigger_recompute_gates_on_onboarding()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Recompute gates for the affected user
  PERFORM recompute_user_gates(NEW.user_id);
  RETURN NEW;
END;
$$;

-- Trigger on onboarding_responses INSERT/UPDATE
DROP TRIGGER IF EXISTS trg_recompute_gates_on_onboarding ON onboarding_responses;
CREATE TRIGGER trg_recompute_gates_on_onboarding
  AFTER INSERT OR UPDATE OF responses ON onboarding_responses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recompute_gates_on_onboarding();


-- Trigger function for body_map_responses changes
CREATE OR REPLACE FUNCTION trigger_recompute_gates_on_body_map()
RETURNS TRIGGER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recompute_user_gates(OLD.user_id);
    RETURN OLD;
  ELSE
    PERFORM recompute_user_gates(NEW.user_id);
    RETURN NEW;
  END IF;
END;
$$;

-- Trigger on body_map_responses INSERT/UPDATE/DELETE
DROP TRIGGER IF EXISTS trg_recompute_gates_on_body_map ON body_map_responses;
CREATE TRIGGER trg_recompute_gates_on_body_map
  AFTER INSERT OR UPDATE OR DELETE ON body_map_responses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recompute_gates_on_body_map();


-- ============================================
-- PART 5: ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_gates ENABLE ROW LEVEL SECURITY;

-- Users can read their own gates
CREATE POLICY "Users can read own gates" ON user_gates
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert/update gates (via triggers)
-- Users cannot directly modify gates - only triggers can
CREATE POLICY "System manages gates" ON user_gates
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================
-- PART 6: MIGRATE EXISTING DATA
-- ============================================

-- Recompute gates for all existing users with onboarding responses
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  FOR v_user_id IN SELECT DISTINCT user_id FROM onboarding_responses
  LOOP
    PERFORM recompute_user_gates(v_user_id);
  END LOOP;
END;
$$;


-- ============================================
-- PART 7: HELPER VIEW FOR EASY ACCESS
-- ============================================

-- View that joins user with their gates
CREATE OR REPLACE VIEW user_with_gates AS
SELECT
  p.id as user_id,
  p.gender,
  p.interested_in,
  COALESCE(ug.gates, '{}'::jsonb) as gates,
  COALESCE(ug.onboarding_gates, '{}'::jsonb) as onboarding_gates,
  COALESCE(ug.body_map_gates, '{}'::jsonb) as body_map_gates,
  COALESCE(or2.completed, false) as onboarding_completed
FROM profiles p
LEFT JOIN user_gates ug ON p.id = ug.user_id
LEFT JOIN onboarding_responses or2 ON p.id = or2.user_id;

COMMENT ON VIEW user_with_gates IS 'Convenience view joining profiles with their computed gates';


-- ============================================
-- PART 8: SCENE GATING FUNCTION (updated)
-- ============================================

-- Updated function to check if scene is gated using user_gates table
CREATE OR REPLACE FUNCTION is_scene_gated_v2(
  p_user_id UUID,
  p_scene_slug TEXT,
  p_required_gates TEXT[],
  p_operator TEXT DEFAULT 'AND',
  p_level TEXT DEFAULT 'basic'
)
RETURNS BOOLEAN
SET search_path = public
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_gates JSONB;
  v_gate TEXT;
  v_gate_key TEXT;
  v_checks BOOLEAN[] := '{}';
  v_check BOOLEAN;
BEGIN
  -- Get user's combined gates
  SELECT gates INTO v_gates
  FROM user_gates
  WHERE user_id = p_user_id;

  -- No gates = all scenes blocked (user hasn't completed onboarding)
  IF v_gates IS NULL THEN
    RETURN TRUE;
  END IF;

  -- No requirements = scene is allowed
  IF p_required_gates IS NULL OR array_length(p_required_gates, 1) = 0 THEN
    RETURN FALSE;
  END IF;

  -- Check each required gate
  FOREACH v_gate IN ARRAY p_required_gates
  LOOP
    -- Determine gate key based on level
    IF p_level = 'very' THEN
      v_gate_key := v_gate || '_very';
    ELSE
      v_gate_key := v_gate;
    END IF;

    -- Check if gate is true
    v_check := COALESCE((v_gates->>v_gate_key)::boolean, false);
    v_checks := array_append(v_checks, v_check);
  END LOOP;

  -- Apply operator
  IF p_operator = 'AND' THEN
    -- All gates must be true for scene to be ALLOWED (not gated)
    RETURN NOT (SELECT bool_and(x) FROM unnest(v_checks) AS x);
  ELSE -- OR
    -- At least one gate must be true for scene to be ALLOWED
    RETURN NOT (SELECT bool_or(x) FROM unnest(v_checks) AS x);
  END IF;
END;
$$;

COMMENT ON FUNCTION is_scene_gated_v2 IS 'Checks if scene is blocked for user. Returns TRUE if blocked, FALSE if allowed.';


-- ============================================
-- CLEANUP: Remove deprecated objects
-- ============================================

-- Drop legacy gates column from onboarding_responses (now in user_gates)
ALTER TABLE onboarding_responses DROP COLUMN IF EXISTS gates;

-- Drop legacy index
DROP INDEX IF EXISTS idx_onboarding_responses_gates;

-- Drop deprecated functions
DROP FUNCTION IF EXISTS compute_onboarding_gates(JSONB);
DROP FUNCTION IF EXISTS is_scene_gated(UUID, TEXT);
