-- ⚠️ DEPRECATED: This file is OUTDATED and does not reflect V2 structure
-- Use migrations/005_scenes_v2_composite.sql and migrations/011_finalize_v2.sql instead
-- See docs/DATABASE_SCHEMA_V2.md for current schema documentation
--
-- Intimate Discovery Database Schema (FULL) - OLD VERSION
-- Version: 2.1 (OUTDATED)
-- Run this in your Supabase SQL Editor
-- This file combines base schema + exclusions + partner chat

-- ============================================
-- PART 1: BASE TABLES
-- ============================================

-- Profiles (user base info)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'undisclosed')),
  interested_in TEXT CHECK (interested_in IN ('male', 'female', 'both')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preference profiles (JSONB for flexible structure)
CREATE TABLE IF NOT EXISTS preference_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  preferences JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scenes (images with metadata)
CREATE TABLE IF NOT EXISTS scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  participants JSONB NOT NULL,
  dimensions TEXT[] NOT NULL,
  tags TEXT[],
  intensity INTEGER DEFAULT 3 CHECK (intensity >= 1 AND intensity <= 5),
  relevant_for JSONB DEFAULT '{"gender": "any", "interested_in": "any"}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scene responses (user answers)
CREATE TABLE IF NOT EXISTS scene_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  question_asked TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('scale', 'multiple_choice', 'yes_no', 'trinary')),
  answer JSONB NOT NULL,
  profile_updates JSONB,
  category_feedback JSONB,  -- NEW: for exclusion feedback
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, scene_id)
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'monthly', 'yearly', 'lifetime')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partnerships
CREATE TABLE IF NOT EXISTS partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES profiles(id),
  invite_code TEXT UNIQUE,
  nickname TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, partner_id)
);

-- Proposals (hidden suggestions)
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id),
  dimension TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shown', 'answered')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dates
CREATE TABLE IF NOT EXISTS dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  initiator_id UUID REFERENCES profiles(id),
  scheduled_for TIMESTAMPTZ,
  mood TEXT CHECK (mood IN ('passionate', 'tender', 'playful', 'intense', 'surprise')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'completed', 'canceled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Date responses
CREATE TABLE IF NOT EXISTS date_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_id UUID REFERENCES dates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id),
  answer TEXT CHECK (answer IN ('yes', 'maybe', 'no')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date_id, user_id, scene_id)
);

-- AI messages (chat history)
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 2: NEW TABLES (Exclusions & Partner Chat)
-- ============================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- Tag to Category mapping
CREATE TABLE IF NOT EXISTS tag_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  relevance INTEGER DEFAULT 100,
  UNIQUE(tag, category_id)
);

CREATE INDEX IF NOT EXISTS idx_tag_categories_tag ON tag_categories(tag);
CREATE INDEX IF NOT EXISTS idx_tag_categories_category ON tag_categories(category_id);

-- User exclusions
CREATE TABLE IF NOT EXISTS excluded_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  excluded_tag TEXT,
  exclusion_level TEXT DEFAULT 'hard' CHECK (exclusion_level IN ('soft', 'hard', 'temporary')),
  reason TEXT,
  excluded_at TIMESTAMPTZ DEFAULT NOW(),
  reconsider_after_days INTEGER,

  UNIQUE(user_id, category_id),
  CHECK (
    (category_id IS NOT NULL AND excluded_tag IS NULL) OR
    (category_id IS NULL AND excluded_tag IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_excluded_user ON excluded_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_excluded_category ON excluded_preferences(category_id);

-- Partner chat messages
CREATE TABLE IF NOT EXISTS partner_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_chat_user ON partner_chat_messages(user_id, partner_id);

-- ============================================
-- PART 3: ROW LEVEL SECURITY
-- ============================================

-- Profiles: users can only access their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Preference profiles: users can only access their own
ALTER TABLE preference_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own preferences select" ON preference_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users own preferences insert" ON preference_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users own preferences update" ON preference_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Scenes: everyone can read
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scenes" ON scenes
  FOR SELECT USING (true);

-- Scene responses: users can only access their own
ALTER TABLE scene_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own responses select" ON scene_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users own responses insert" ON scene_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users own responses update" ON scene_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Subscriptions: users can only access their own
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own subscription" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Partnerships: members can view
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partnership members can view" ON partnerships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can create partnerships" ON partnerships
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = inviter_id);

CREATE POLICY "Partnership members can update" ON partnerships
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = partner_id);

-- Proposals: only recipient can see
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Proposal recipient can view" ON proposals
  FOR SELECT USING (auth.uid() = to_user_id);

CREATE POLICY "Users can create proposals" ON proposals
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Recipient can update proposal" ON proposals
  FOR UPDATE USING (auth.uid() = to_user_id);

-- Dates: partnership participants can access
ALTER TABLE dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Date participants can view" ON dates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_id
      AND (p.user_id = auth.uid() OR p.partner_id = auth.uid())
    )
  );

CREATE POLICY "Users can create dates" ON dates
  FOR INSERT WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Date participants can update" ON dates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM partnerships p
      WHERE p.id = partnership_id
      AND (p.user_id = auth.uid() OR p.partner_id = auth.uid())
    )
  );

-- Date responses: participants can access
ALTER TABLE date_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Date response participants can view" ON date_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM dates d
      JOIN partnerships p ON d.partnership_id = p.id
      WHERE d.id = date_id
      AND (p.user_id = auth.uid() OR p.partner_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert own date responses" ON date_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI messages: users can only access their own
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own messages" ON ai_messages
  FOR ALL USING (auth.uid() = user_id);

-- NEW: Excluded preferences RLS
ALTER TABLE excluded_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own exclusions" ON excluded_preferences
  FOR ALL USING (auth.uid() = user_id);

-- NEW: Partner chat messages RLS
ALTER TABLE partner_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their chats" ON partner_chat_messages
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PART 4: INDEXES
-- ============================================

-- JSONB indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_preferences_gin ON preference_profiles USING GIN (preferences);
CREATE INDEX IF NOT EXISTS idx_scenes_dimensions ON scenes USING GIN (dimensions);
CREATE INDEX IF NOT EXISTS idx_scenes_tags ON scenes USING GIN (tags);

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_scene_responses_user ON scene_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_scene_responses_scene ON scene_responses(scene_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_user ON partnerships(user_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_partner ON partnerships(partner_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_invite ON partnerships(invite_code);
CREATE INDEX IF NOT EXISTS idx_proposals_to_user ON proposals(to_user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_from_user ON proposals(from_user_id);
CREATE INDEX IF NOT EXISTS idx_dates_partnership ON dates(partnership_id);
CREATE INDEX IF NOT EXISTS idx_date_responses_date ON date_responses(date_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_user ON ai_messages(user_id);

-- ============================================
-- PART 5: FUNCTIONS
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);

  INSERT INTO public.preference_profiles (user_id)
  VALUES (NEW.id);

  INSERT INTO public.subscriptions (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_preference_profiles_updated_at ON preference_profiles;
CREATE TRIGGER update_preference_profiles_updated_at
  BEFORE UPDATE ON preference_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- NEW: Get excluded scene IDs for user
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

-- NEW: Get next scene with filtering
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

-- ============================================
-- PART 6: SEED DATA - Categories
-- ============================================

INSERT INTO categories (slug, name, name_en) VALUES
('roleplay', 'Ролевые игры', 'Roleplay'),
('bondage', 'Связывание', 'Bondage'),
('impact', 'Удары', 'Impact Play'),
('oral', 'Оральный секс', 'Oral Sex'),
('anal', 'Анальный секс', 'Anal'),
('sensory', 'Сенсорные игры', 'Sensory Play'),
('dominance', 'Доминирование', 'Dominance'),
('exhibitionism', 'Эксгибиционизм', 'Exhibitionism'),
('toys', 'Игрушки', 'Toys'),
('group', 'Групповой секс', 'Group Sex'),
('fetish', 'Фетиши', 'Fetishes'),
('cum_play', 'Игры со спермой', 'Cum Play'),
('clothing', 'Одежда и бельё', 'Clothing'),
('locations', 'Необычные места', 'Locations'),
('dynamics', 'Динамики отношений', 'Dynamics'),
('pet_play', 'Пет плей', 'Pet Play'),
('watersports', 'Золотой дождь', 'Watersports'),
('cnc', 'CNC', 'Consensual Non-Consent'),
('chastity', 'Целомудрие', 'Chastity')
ON CONFLICT (slug) DO NOTHING;

-- Subcategories for roleplay
INSERT INTO categories (slug, name, name_en, parent_id) VALUES
('uniforms', 'Униформы', 'Uniforms', (SELECT id FROM categories WHERE slug = 'roleplay')),
('professional', 'Профессии', 'Professions', (SELECT id FROM categories WHERE slug = 'roleplay')),
('fantasy', 'Фантазийные', 'Fantasy', (SELECT id FROM categories WHERE slug = 'roleplay'))
ON CONFLICT (slug) DO NOTHING;

-- Subcategories for bondage
INSERT INTO categories (slug, name, name_en, parent_id) VALUES
('restraints', 'Фиксация', 'Restraints', (SELECT id FROM categories WHERE slug = 'bondage')),
('sensory_dep', 'Сенсорная депривация', 'Sensory Deprivation', (SELECT id FROM categories WHERE slug = 'bondage')),
('gags', 'Кляпы', 'Gags', (SELECT id FROM categories WHERE slug = 'bondage'))
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- PART 7: SEED DATA - Tag Categories
-- ============================================

-- Roleplay tags
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'roleplay')
FROM unnest(ARRAY[
  'firefighter', 'nurse', 'doctor', 'teacher', 'boss', 'secretary',
  'maid', 'butler', 'cop', 'prisoner', 'military', 'pilot', 'stewardess',
  'cheerleader', 'schoolgirl', 'vampire', 'stranger', 'massage',
  'hitchhiker', 'sugar_daddy', 'sugar_mommy', 'king', 'queen', 'servant',
  'yoga', 'delivery', 'photographer', 'trainer', 'intruder'
]) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

-- Bondage tags
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'bondage')
FROM unnest(ARRAY[
  'blindfold', 'handcuffs', 'rope', 'shibari', 'collar', 'leash',
  'gag', 'ball_gag', 'ring_gag', 'tape_gag', 'spider_gag', 'dildo_gag',
  'hood', 'headphones', 'spread_eagle', 'hogtie', 'suspension',
  'mummification', 'tied', 'restrained', 'cuffs'
]) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

-- Impact tags
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'impact')
FROM unnest(ARRAY[
  'spanking', 'paddle', 'crop', 'flogger', 'whip', 'caning',
  'slapping', 'face_slap', 'ass_slap', 'impact'
]) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

-- Oral tags
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'oral')
FROM unnest(ARRAY[
  'blowjob', 'deepthroat', 'facefuck', 'cunnilingus', 'facesitting',
  'rimming', '69', 'oral', 'licking', 'sucking', 'throat'
]) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

-- Anal tags
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'anal')
FROM unnest(ARRAY[
  'anal', 'butt_plug', 'tail_plug', 'anal_hook', 'pegging',
  'prostate', 'anal_beads', 'plug'
]) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

-- Toys tags
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'toys')
FROM unnest(ARRAY[
  'vibrator', 'dildo', 'strap_on', 'nipple_clamps', 'magic_wand',
  'remote_vibrator', 'fucking_machine', 'sybian', 'pump', 'toy'
]) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

-- Group tags
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'group')
FROM unnest(ARRAY[
  'threesome', 'MFM', 'FMF', 'MMF', 'FFM', 'gangbang', 'orgy',
  'swingers', 'cuckold', 'cuckquean', 'hotwife', 'bukkake',
  'group', 'multiple', 'dp', 'dvp', 'spit_roast', 'daisy_chain'
]) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

-- Pet Play tags
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'pet_play')
FROM unnest(ARRAY[
  'pet_play', 'puppy', 'kitten', 'pony', 'ears', 'crawling', 'bowl', 'cage'
]) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

-- Watersports tags
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'watersports')
FROM unnest(ARRAY[
  'golden_shower', 'watersports', 'pee', 'desperation', 'wetting'
]) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

-- Fetish tags
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'fetish')
FROM unnest(ARRAY[
  'feet', 'foot_worship', 'footjob', 'latex', 'leather',
  'stockings', 'lingerie', 'armpit', 'lactation', 'pregnant',
  'size_difference', 'amazon'
]) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

-- Cum Play tags
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'cum_play')
FROM unnest(ARRAY[
  'facial', 'creampie', 'cum_swallow', 'snowballing',
  'squirt', 'cum', 'cumshot', 'creampie_eating', 'cum_kiss'
]) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

-- Locations tags
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'locations')
FROM unnest(ARRAY[
  'public', 'car', 'office', 'shower', 'pool', 'beach', 'elevator',
  'balcony', 'stairwell', 'rooftop', 'sauna', 'hot_tub', 'tent',
  'hotel', 'laundry', 'waterfall', 'wine_cellar', 'airplane', 'train'
]) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

-- Sensory tags
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'sensory')
FROM unnest(ARRAY[
  'ice', 'wax', 'feather', 'wartenberg', 'electrostim',
  'temperature', 'sensation', 'tickling'
]) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

-- Dynamics tags
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'dynamics')
FROM unnest(ARRAY[
  'dominance', 'submission', 'femdom', 'maledom', 'service',
  'worship', 'humiliation', 'degradation', 'praise', 'daddy',
  'mommy', 'free_use', 'edging', 'orgasm_control', 'denial',
  'overstimulation', 'forced_orgasm'
]) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

-- CNC tags
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'cnc')
FROM unnest(ARRAY[
  'CNC', 'rape_play', 'struggle', 'primal', 'chase',
  'consensual_non_consent', 'rough'
]) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

-- Chastity tags
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'chastity')
FROM unnest(ARRAY[
  'chastity', 'locked', 'keyholder', 'chastity_belt'
]) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

-- Tags that belong to multiple categories
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'pet_play')
FROM unnest(ARRAY['collar', 'leash', 'tail_plug']) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

INSERT INTO tag_categories (tag, category_id)
VALUES ('blindfold', (SELECT id FROM categories WHERE slug = 'sensory'))
ON CONFLICT (tag, category_id) DO NOTHING;

INSERT INTO tag_categories (tag, category_id)
VALUES ('rimming', (SELECT id FROM categories WHERE slug = 'anal'))
ON CONFLICT (tag, category_id) DO NOTHING;

INSERT INTO tag_categories (tag, category_id)
VALUES ('bukkake', (SELECT id FROM categories WHERE slug = 'cum_play'))
ON CONFLICT (tag, category_id) DO NOTHING;

INSERT INTO tag_categories (tag, category_id)
VALUES ('intruder', (SELECT id FROM categories WHERE slug = 'cnc'))
ON CONFLICT (tag, category_id) DO NOTHING;

INSERT INTO tag_categories (tag, category_id)
VALUES ('cage', (SELECT id FROM categories WHERE slug = 'chastity'))
ON CONFLICT (tag, category_id) DO NOTHING;

INSERT INTO tag_categories (tag, category_id)
VALUES ('denial', (SELECT id FROM categories WHERE slug = 'chastity'))
ON CONFLICT (tag, category_id) DO NOTHING;
