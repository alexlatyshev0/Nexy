-- Migration: Scene Types V3 Architecture
-- Adds support for new scene type system without nested follow-ups

-- ============================================================================
-- NEW COLUMNS FOR SCENES TABLE
-- ============================================================================

-- Scene type classification
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS scene_type TEXT;

-- For clarification scenes - which main_question(s) this clarifies
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS clarification_for TEXT[] DEFAULT '{}';

-- Context where scene should be shown
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS context TEXT DEFAULT 'discovery';

-- For body_map_activity type
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS body_map_activity_config JSONB;

-- For paired_text type (two related questions)
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS paired_questions JSONB;

-- For image_selection type
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS image_options JSONB;

-- For multi_choice_text type
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS text_options JSONB;
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS allow_other BOOLEAN DEFAULT FALSE;
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS other_placeholder JSONB;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for finding clarifications by main_question
CREATE INDEX IF NOT EXISTS idx_scenes_clarification_for
  ON scenes USING GIN (clarification_for);

-- Index for filtering by scene_type
CREATE INDEX IF NOT EXISTS idx_scenes_scene_type
  ON scenes (scene_type);

-- Index for filtering by context
CREATE INDEX IF NOT EXISTS idx_scenes_context
  ON scenes (context);

-- ============================================================================
-- CLARIFICATION TRACKING TABLE (for deduplication)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_clarification_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  clarification_slug TEXT NOT NULL,
  triggered_by_main TEXT NOT NULL,
  shown_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, clarification_slug)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_user_clarification_tracking_user
  ON user_clarification_tracking(user_id);

CREATE INDEX IF NOT EXISTS idx_user_clarification_tracking_main
  ON user_clarification_tracking(triggered_by_main);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE user_clarification_tracking ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tracking data
CREATE POLICY "Users own clarification tracking" ON user_clarification_tracking
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN scenes.scene_type IS
  'Type of scene: main_question, clarification, multi_choice_text, image_selection, body_map_activity, paired_text, scale_text';

COMMENT ON COLUMN scenes.clarification_for IS
  'Array of main_question slugs this clarification scene relates to. Used for deduplication.';

COMMENT ON COLUMN scenes.context IS
  'Where scene should be shown: onboarding, discovery, or both';

COMMENT ON TABLE user_clarification_tracking IS
  'Tracks which clarification scenes have been shown to prevent duplicates across multiple main_questions';
