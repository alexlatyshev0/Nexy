-- Migration: V3 Scene Structure with Psychological Profiling
-- Adds support for predefined question angles, profile signals, follow-up questions

-- ============================================
-- CLEANUP: DELETE OLD DATA
-- ============================================

-- Delete all follow-up responses first (references scene_responses)
DROP TABLE IF EXISTS follow_up_responses;

-- Delete all scene responses (they reference old scenes)
DELETE FROM scene_responses;

-- Delete all date responses (they reference old scenes)
DELETE FROM date_responses;

-- Delete all proposals (they reference old scenes)
DELETE FROM proposals WHERE scene_id IS NOT NULL;

-- Delete all existing scenes
DELETE FROM scenes;

-- Note: Images in Supabase Storage ('scenes' bucket) should be deleted manually:
-- 1. Go to Supabase Dashboard > Storage > scenes
-- 2. Select all files and delete them
-- Or use: supabase.storage.from('scenes').remove([...all file names...])

-- ============================================
-- SCENES TABLE UPDATES
-- ============================================

-- Add new columns to scenes table
ALTER TABLE scenes
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS generation_prompt TEXT,
ADD COLUMN IF NOT EXISTS user_description JSONB DEFAULT '{"en": "", "ru": ""}',
ADD COLUMN IF NOT EXISTS ai_context JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'interest_scale',
ADD COLUMN IF NOT EXISTS follow_up JSONB;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_scenes_priority ON scenes(priority);
CREATE INDEX IF NOT EXISTS idx_scenes_slug ON scenes(slug);
CREATE INDEX IF NOT EXISTS idx_scenes_ai_context ON scenes USING GIN (ai_context);

-- ============================================
-- PSYCHOLOGICAL PROFILES TABLE
-- ============================================

-- Stores aggregated psychological profile data per user
CREATE TABLE IF NOT EXISTS psychological_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  -- Test scores: normalized 0-1 scores for each psychological test
  -- e.g., {"kink_exploration": 0.7, "power_dynamics": 0.4, "gender_role_flexibility": 0.6}
  test_scores JSONB DEFAULT '{}',
  -- Profile signals: count/weight of each signal detected
  -- e.g., {"curious_about_dominance": 3, "prefers_receiving": 5, "open_to_role_reversal": 2}
  profile_signals JSONB DEFAULT '{}',
  -- Detected correlations between preferences
  -- e.g., ["power_exchange", "role_flexibility", "intensity_seeking"]
  correlations_detected JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_psych_profiles_user ON psychological_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_psych_profiles_signals ON psychological_profiles USING GIN (profile_signals);

-- RLS for psychological profiles
ALTER TABLE psychological_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own psych profile select" ON psychological_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users own psych profile insert" ON psychological_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users own psych profile update" ON psychological_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- FOLLOW-UP RESPONSES TABLE
-- ============================================

-- Stores responses to follow-up questions (after initial scene response)
CREATE TABLE IF NOT EXISTS follow_up_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  parent_response_id UUID REFERENCES scene_responses(id) ON DELETE CASCADE,
  -- The option ID selected from follow_up.options
  option_id TEXT NOT NULL,
  -- The profile signal associated with this option
  profile_signal TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- One follow-up per scene per user
  UNIQUE(user_id, scene_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_follow_up_user ON follow_up_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_scene ON follow_up_responses(scene_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_parent ON follow_up_responses(parent_response_id);

-- RLS for follow-up responses
ALTER TABLE follow_up_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own follow-up select" ON follow_up_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users own follow-up insert" ON follow_up_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- UPDATE TRIGGERS
-- ============================================

-- Trigger to update psychological_profiles updated_at
CREATE TRIGGER update_psych_profiles_updated_at
  BEFORE UPDATE ON psychological_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to create psychological profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_v3()
RETURNS TRIGGER AS $$
BEGIN
  -- Create psychological profile if it doesn't exist
  INSERT INTO public.psychological_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user psychological profile
DROP TRIGGER IF EXISTS on_profile_created_psych ON profiles;
CREATE TRIGGER on_profile_created_psych
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_v3();

-- Create psychological profiles for existing users
INSERT INTO psychological_profiles (user_id)
SELECT id FROM profiles
WHERE id NOT IN (SELECT user_id FROM psychological_profiles WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;
