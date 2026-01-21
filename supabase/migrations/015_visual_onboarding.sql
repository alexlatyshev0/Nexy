-- Migration: 015_visual_onboarding.sql
-- Description: Visual onboarding with swipe cards
-- Date: 2025-01-19

-- ============================================
-- ONBOARDING CATEGORIES (справочник категорий)
-- ============================================

CREATE TABLE IF NOT EXISTS onboarding_categories (
  id TEXT PRIMARY KEY,  -- 'oral', 'anal', 'rough', etc.
  order_index INTEGER NOT NULL,
  conditional BOOLEAN DEFAULT FALSE,
  condition_rule TEXT,  -- e.g. "power_dynamic >= 1 || rough >= 1"

  -- Localized content
  title JSONB NOT NULL DEFAULT '{"ru": "", "en": ""}',
  subtitle JSONB DEFAULT '{"ru": "", "en": ""}',
  ai_description JSONB NOT NULL DEFAULT '{"ru": "", "en": ""}',
  user_description JSONB DEFAULT '{"ru": "", "en": ""}',

  -- Images by orientation
  image_prompts JSONB DEFAULT '{}',
  -- Example: { "hetero_m": "...", "hetero_f": "...", "gay": "...", "lesbian": "..." }

  -- Which scenes this category gates
  gates_scenes TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_onboarding_categories_order ON onboarding_categories(order_index);

-- RLS
ALTER TABLE onboarding_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read onboarding_categories"
  ON onboarding_categories FOR SELECT
  USING (true);

-- ============================================
-- ONBOARDING RESPONSES (ответы пользователей)
-- ============================================

CREATE TABLE IF NOT EXISTS onboarding_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Category responses: NO = 0, YES = 1, VERY = 2
  responses JSONB NOT NULL DEFAULT '{}',
  -- Example: { "oral": 1, "anal": 0, "rough": 2, "romantic": 1 }

  -- Computed gates (derived from responses)
  gates JSONB NOT NULL DEFAULT '{}',
  -- Example: { "oral": true, "anal": false, "rough_very": true }

  -- Progress
  completed BOOLEAN DEFAULT FALSE,
  current_index INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_responses_user ON onboarding_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_responses_gates ON onboarding_responses USING GIN (gates);

-- RLS
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding responses"
  ON onboarding_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding responses"
  ON onboarding_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding responses"
  ON onboarding_responses FOR UPDATE
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_onboarding_responses_updated_at
  BEFORE UPDATE ON onboarding_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Compute gates from responses
-- ============================================

CREATE OR REPLACE FUNCTION compute_onboarding_gates(p_responses JSONB)
RETURNS JSONB AS $$
DECLARE
  v_gates JSONB := '{}';
  v_key TEXT;
  v_value INTEGER;
BEGIN
  FOR v_key, v_value IN SELECT * FROM jsonb_each_text(p_responses)
  LOOP
    -- Basic gate: YES (1) or VERY (2) = true
    IF v_value::integer >= 1 THEN
      v_gates := v_gates || jsonb_build_object(v_key, true);
    ELSE
      v_gates := v_gates || jsonb_build_object(v_key, false);
    END IF;

    -- VERY gate: only VERY (2) = true
    IF v_value::integer >= 2 THEN
      v_gates := v_gates || jsonb_build_object(v_key || '_very', true);
    END IF;
  END LOOP;

  -- Conditional gates
  -- bondage: показывать если power ≠ vanilla ИЛИ rough = YES
  IF (p_responses->>'power_dynamic')::integer >= 1 OR (p_responses->>'rough')::integer >= 1 THEN
    v_gates := v_gates || '{"show_bondage": true}'::jsonb;
  END IF;

  -- body_fluids: показывать если oral = YES
  IF (p_responses->>'oral')::integer >= 1 THEN
    v_gates := v_gates || '{"show_body_fluids": true}'::jsonb;
  END IF;

  -- sexting: показывать если recording = YES ИЛИ exhibitionism = YES
  IF (p_responses->>'recording')::integer >= 1 OR (p_responses->>'exhibitionism')::integer >= 1 THEN
    v_gates := v_gates || '{"show_sexting": true}'::jsonb;
  END IF;

  -- extreme: показывать если rough = VERY И bondage = YES
  IF (p_responses->>'rough')::integer >= 2 AND (p_responses->>'bondage')::integer >= 1 THEN
    v_gates := v_gates || '{"show_extreme": true}'::jsonb;
  END IF;

  RETURN v_gates;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- FUNCTION: Check if scene is gated for user
-- ============================================

CREATE OR REPLACE FUNCTION is_scene_gated(
  p_user_id UUID,
  p_scene_slug TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_gates JSONB;
  v_scene_gates TEXT[];
  v_gate TEXT;
BEGIN
  -- Get user's gates
  SELECT gates INTO v_gates
  FROM onboarding_responses
  WHERE user_id = p_user_id;

  IF v_gates IS NULL THEN
    RETURN FALSE; -- No onboarding = show everything
  END IF;

  -- Get scene's required gates from scenes.ai_context.gates
  SELECT (ai_context->>'gates')::TEXT[] INTO v_scene_gates
  FROM scenes
  WHERE slug = p_scene_slug;

  IF v_scene_gates IS NULL THEN
    RETURN FALSE; -- No gates required
  END IF;

  -- Check if ALL required gates are true
  FOREACH v_gate IN ARRAY v_scene_gates
  LOOP
    IF NOT COALESCE((v_gates->>v_gate)::boolean, false) THEN
      RETURN TRUE; -- Scene is gated (blocked)
    END IF;
  END LOOP;

  RETURN FALSE; -- Scene is not gated (allowed)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- UPDATE profiles: add onboarding_completed tracking
-- ============================================

-- Add column if not exists (profiles already has onboarding_completed from base schema)
-- Just ensure it's there
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'visual_onboarding_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN visual_onboarding_completed BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE onboarding_responses IS 'Visual onboarding swipe responses (20 categories)';
COMMENT ON COLUMN onboarding_responses.responses IS 'Category responses: NO=0, YES=1, VERY=2';
COMMENT ON COLUMN onboarding_responses.gates IS 'Computed gates derived from responses';
COMMENT ON FUNCTION compute_onboarding_gates IS 'Computes gate flags from onboarding responses';
COMMENT ON FUNCTION is_scene_gated IS 'Checks if a scene is blocked for user based on their gates';
