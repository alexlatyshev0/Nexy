-- Migration: Finalize V2 Database Schema
-- Combines all post-005 migrations into one final migration
-- Run this AFTER 005_scenes_v2_composite.sql
-- Date: 2025-01-XX

-- ============================================
-- PART 1: SCENES TABLE UPDATES
-- ============================================

-- Fix role_direction constraint to allow all values used in v2 scenes
ALTER TABLE scenes DROP CONSTRAINT IF EXISTS scenes_role_direction_check;
ALTER TABLE scenes ADD CONSTRAINT scenes_role_direction_check CHECK (
  role_direction IN (
    'm_to_f', 'f_to_m', 'mutual', 'solo',
    'group', 'universal',
    'm_daddy_f_little', 'f_mommy_m_little',
    'm_dom_f_pet', 'f_dom_m_pet', 'f_dom_m_sub',
    'm_keyholder_f_locked', 'f_keyholder_m_locked',
    'f_on_m', 'f_experience',
    'cuckold', 'hotwife',
    'mlm', 'wlw'
  )
);

-- Remove unused prompt tracking columns
-- The original_prompt and final_prompt columns were used for tracking prompt changes
-- but are no longer needed as we now only use image_prompt (default) and generation_prompt (working copy)
ALTER TABLE scenes DROP COLUMN IF EXISTS original_prompt;
ALTER TABLE scenes DROP COLUMN IF EXISTS final_prompt;

-- Add accepted field for manual image approval
-- This is separate from QA - allows manual acceptance of generated images
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS accepted BOOLEAN DEFAULT NULL;

-- Index for filtering by acceptance status
CREATE INDEX IF NOT EXISTS idx_scenes_accepted ON scenes(accepted);

COMMENT ON COLUMN scenes.accepted IS 'Manual acceptance status: true = accepted, false = rejected, NULL = not reviewed';

-- ============================================
-- PART 2: V2 COMPOSITE SCENE TABLES
-- ============================================

-- Composite Scene Responses
CREATE TABLE IF NOT EXISTS composite_scene_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scene_id TEXT NOT NULL,  -- References scenes.slug

  -- Selected elements
  selected_elements TEXT[] NOT NULL DEFAULT '{}',  -- ["handcuffs", "wax_play"]

  -- Follow-up responses (nested JSON)
  element_responses JSONB NOT NULL DEFAULT '{}',
  -- Example:
  -- {
  --   "handcuffs": {
  --     "cuff_type": ["metal", "leather"],
  --     "cuff_role": "both"
  --   },
  --   "wax_play": {
  --     "wax_body_map": ["chest", "back", "thighs"],
  --     "wax_temperature": 65
  --   }
  -- }

  skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, scene_id)
);

CREATE INDEX idx_composite_scene_responses_user ON composite_scene_responses(user_id);
CREATE INDEX idx_composite_scene_responses_scene ON composite_scene_responses(scene_id);
CREATE INDEX idx_composite_scene_responses_elements ON composite_scene_responses USING GIN (selected_elements);
CREATE INDEX idx_composite_scene_responses_element_responses ON composite_scene_responses USING GIN (element_responses);

-- Tag Preferences (Aggregated)
CREATE TABLE IF NOT EXISTS tag_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tag_ref TEXT NOT NULL,              -- Reference to taxonomy tag

  interest_level INTEGER,             -- 0-100 aggregated from scenes
  role_preference TEXT CHECK (role_preference IN ('give', 'receive', 'both')),
  intensity_preference INTEGER CHECK (intensity_preference >= 0 AND intensity_preference <= 100),
  specific_preferences JSONB DEFAULT '{}',         -- Tag-specific details
  experience_level TEXT CHECK (experience_level IN ('tried', 'want_to_try', 'not_interested', 'curious')),

  source_scenes TEXT[] DEFAULT '{}',               -- Which scenes contributed (scene slugs)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, tag_ref)
);

CREATE INDEX idx_tag_preferences_user ON tag_preferences(user_id);
CREATE INDEX idx_tag_preferences_tag ON tag_preferences(tag_ref);
CREATE INDEX idx_tag_preferences_source_scenes ON tag_preferences USING GIN (source_scenes);
CREATE INDEX idx_tag_preferences_specific_preferences ON tag_preferences USING GIN (specific_preferences);

-- ============================================
-- PART 3: PSYCHOLOGICAL PROFILES TABLE
-- ============================================

-- Stores aggregated psychological profile data per user
-- Used by profile-signals.ts
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

CREATE INDEX IF NOT EXISTS idx_psych_profiles_user ON psychological_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_psych_profiles_signals ON psychological_profiles USING GIN (profile_signals);

-- ============================================
-- PART 4: ROW LEVEL SECURITY
-- ============================================

ALTER TABLE composite_scene_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychological_profiles ENABLE ROW LEVEL SECURITY;

-- Composite scene responses policies
CREATE POLICY "Users own composite scene responses" ON composite_scene_responses
  FOR ALL USING (auth.uid() = user_id);

-- Tag preferences policies
CREATE POLICY "Users own tag preferences" ON tag_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Psychological profiles policies
CREATE POLICY "Users own psych profile select" ON psychological_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users own psych profile insert" ON psychological_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users own psych profile update" ON psychological_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- PART 5: TRIGGERS
-- ============================================

-- Update timestamps for composite_scene_responses
CREATE TRIGGER update_composite_scene_responses_updated_at 
  BEFORE UPDATE ON composite_scene_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update timestamps for tag_preferences
CREATE TRIGGER update_tag_preferences_updated_at 
  BEFORE UPDATE ON tag_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update timestamps for psychological_profiles
CREATE TRIGGER update_psych_profiles_updated_at
  BEFORE UPDATE ON psychological_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 6: FUNCTIONS
-- ============================================

-- Get excluded scene IDs for user
CREATE OR REPLACE FUNCTION get_excluded_scene_ids(p_user_id UUID)
RETURNS UUID[] AS $$
DECLARE
  excluded_tags TEXT[];
  result UUID[];
BEGIN
  -- Collect all tags from excluded categories
  SELECT ARRAY_AGG(DISTINCT tc.tag)
  INTO excluded_tags
  FROM excluded_preferences ep
  JOIN tag_categories tc ON tc.category_id = ep.category_id
  WHERE ep.user_id = p_user_id
    AND ep.exclusion_level = 'hard'
    AND ep.category_id IS NOT NULL;

  -- Add explicitly excluded tags
  SELECT ARRAY_AGG(ep.excluded_tag) || COALESCE(excluded_tags, ARRAY[]::TEXT[])
  INTO excluded_tags
  FROM excluded_preferences ep
  WHERE ep.user_id = p_user_id
    AND ep.excluded_tag IS NOT NULL
    AND ep.exclusion_level = 'hard';

  -- Find scenes with these tags
  SELECT ARRAY_AGG(DISTINCT s.id)
  INTO result
  FROM scenes s
  WHERE s.tags && excluded_tags;

  RETURN COALESCE(result, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get next scene with filtering
CREATE OR REPLACE FUNCTION get_next_scene_filtered(
  p_user_id UUID,
  p_intensity_max INTEGER DEFAULT 5
)
RETURNS UUID AS $$
DECLARE
  excluded_ids UUID[];
  seen_ids UUID[];
  result_id UUID;
BEGIN
  excluded_ids := get_excluded_scene_ids(p_user_id);

  SELECT ARRAY_AGG(scene_id) INTO seen_ids
  FROM scene_responses WHERE user_id = p_user_id;

  SELECT id INTO result_id
  FROM scenes
  WHERE id != ALL(COALESCE(excluded_ids, ARRAY[]::UUID[]))
    AND id != ALL(COALESCE(seen_ids, ARRAY[]::UUID[]))
    AND intensity <= p_intensity_max
  ORDER BY RANDOM()
  LIMIT 1;

  RETURN result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate scene slug
CREATE OR REPLACE FUNCTION validate_scene_slug(scene_slug TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM scenes WHERE slug = scene_slug);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to create psychological profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_psych()
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
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_psych();

-- ============================================
-- PART 7: INITIAL DATA
-- ============================================

-- Create psychological profiles for existing users
INSERT INTO psychological_profiles (user_id)
SELECT id FROM profiles
WHERE id NOT IN (SELECT user_id FROM psychological_profiles WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- DONE!
-- ============================================
-- V2 database schema is now complete with:
-- - Updated scenes table constraints and fields
-- - V2 composite scene tables (composite_scene_responses, tag_preferences)
-- - Psychological profiles table
-- - Exclusion functions
-- - All necessary indexes, RLS policies, and triggers
