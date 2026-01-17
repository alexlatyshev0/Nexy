-- Migration: V4 Scene Structure with question_config
-- Replaces question_type + question_angles with unified question_config object
-- Adds topic_responses table for centralized preference tracking

-- ============================================
-- SCENES TABLE UPDATES
-- ============================================

-- Add question_config column (replaces question_type + question_angles)
ALTER TABLE scenes
ADD COLUMN IF NOT EXISTS question_config JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS schema_version INTEGER DEFAULT 3;

-- Create index for question_config queries
CREATE INDEX IF NOT EXISTS idx_scenes_question_config ON scenes USING GIN (question_config);
CREATE INDEX IF NOT EXISTS idx_scenes_schema_version ON scenes(schema_version);

-- ============================================
-- TOPIC RESPONSES TABLE
-- ============================================

-- Stores user responses to centralized preference topics
-- When a scene has topic_ref, we check this table first
-- If topic already answered, we use cached response instead of re-asking
CREATE TABLE IF NOT EXISTS topic_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Reference to topic in preference-topics.json
  topic_ref TEXT NOT NULL,

  -- Main interest response (scale 0-100, or yes/maybe/no mapped to 100/50/0)
  interest_level INTEGER CHECK (interest_level >= 0 AND interest_level <= 100),

  -- Detailed responses from topic drilldown questions
  -- e.g., {"types": ["praising", "commanding"], "intensity": 70, "role": "both"}
  drilldown_responses JSONB DEFAULT '{}',

  -- Experience tracking
  -- e.g., {"tried": true, "frequency": "sometimes", "want_to_try": true}
  experience JSONB DEFAULT NULL,

  -- Which scene first triggered this topic question
  first_scene_id UUID REFERENCES scenes(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One response per topic per user
  UNIQUE(user_id, topic_ref)
);

-- Indexes for topic_responses
CREATE INDEX IF NOT EXISTS idx_topic_responses_user ON topic_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_responses_topic ON topic_responses(topic_ref);
CREATE INDEX IF NOT EXISTS idx_topic_responses_user_topic ON topic_responses(user_id, topic_ref);

-- RLS for topic_responses
ALTER TABLE topic_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own topic responses select" ON topic_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users own topic responses insert" ON topic_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users own topic responses update" ON topic_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_topic_responses_updated_at
  BEFORE UPDATE ON topic_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- EXPERIENCE RESPONSES TABLE
-- ============================================

-- Separate table for tracking experience (tried/not tried) responses
-- Used when scene has show_experience: true
CREATE TABLE IF NOT EXISTS experience_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,

  -- Has user tried this activity?
  has_tried BOOLEAN NOT NULL,

  -- If tried, how was it?
  -- 'loved' | 'liked' | 'neutral' | 'disliked' | null
  experience_rating TEXT CHECK (experience_rating IN ('loved', 'liked', 'neutral', 'disliked') OR experience_rating IS NULL),

  -- If not tried, want to try?
  want_to_try BOOLEAN DEFAULT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One experience response per scene per user
  UNIQUE(user_id, scene_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_experience_responses_user ON experience_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_experience_responses_scene ON experience_responses(scene_id);

-- RLS
ALTER TABLE experience_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own experience responses select" ON experience_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users own experience responses insert" ON experience_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get topic response for a user
CREATE OR REPLACE FUNCTION get_topic_response(
  p_user_id UUID,
  p_topic_ref TEXT
) RETURNS TABLE (
  interest_level INTEGER,
  drilldown_responses JSONB,
  experience JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tr.interest_level,
    tr.drilldown_responses,
    tr.experience
  FROM topic_responses tr
  WHERE tr.user_id = p_user_id AND tr.topic_ref = p_topic_ref;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if topic already answered
CREATE OR REPLACE FUNCTION is_topic_answered(
  p_user_id UUID,
  p_topic_ref TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM topic_responses
    WHERE user_id = p_user_id AND topic_ref = p_topic_ref
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get scenes that should be skipped (topic already answered)
CREATE OR REPLACE FUNCTION get_answered_topic_scene_ids(
  p_user_id UUID
) RETURNS UUID[] AS $$
DECLARE
  answered_topics TEXT[];
  scene_ids UUID[];
BEGIN
  -- Get all topics user has answered
  SELECT ARRAY_AGG(topic_ref) INTO answered_topics
  FROM topic_responses
  WHERE user_id = p_user_id;

  IF answered_topics IS NULL THEN
    RETURN ARRAY[]::UUID[];
  END IF;

  -- Get scene IDs that have these topics and type = 'topic_drilldown'
  SELECT ARRAY_AGG(s.id) INTO scene_ids
  FROM scenes s
  WHERE s.question_config->>'topic_ref' = ANY(answered_topics)
    AND s.question_config->>'type' = 'topic_drilldown';

  RETURN COALESCE(scene_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MIGRATION NOTES
-- ============================================

-- V4 question_config structure:
-- {
--   "type": "scale" | "yes_maybe_no" | "topic_drilldown" | "what_appeals",
--   "topic_ref": "bondage",  -- optional, links to preference-topics.json
--   "question": {
--     "en": "Does this appeal?",
--     "ru": "Привлекает ли это?"
--   },
--   "show_experience": true,  -- optional, ask about prior experience
--   "context_options": [...]  -- optional, for what_appeals type
-- }

-- V4 changes from V3:
-- 1. question_config replaces question_type + ai_context.question_angles
-- 2. participants simplified from objects to strings
-- 3. topic_ref enables centralized preference tracking
-- 4. show_experience enables experience tracking
-- 5. context_options enables scene-specific multi-choice
