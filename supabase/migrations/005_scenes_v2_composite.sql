-- Migration: V2 Composite Scenes - FULL RESET
-- Drops old tables and creates fresh schema for v2
-- WARNING: This deletes ALL user data!

-- ============================================
-- PART 1: DROP EVERYTHING (in correct order for FK)
-- ============================================

-- Drop dependent tables first
DROP TABLE IF EXISTS follow_up_responses CASCADE;
DROP TABLE IF EXISTS topic_responses CASCADE;
DROP TABLE IF EXISTS date_responses CASCADE;
DROP TABLE IF EXISTS scene_responses CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS dates CASCADE;
DROP TABLE IF EXISTS ai_messages CASCADE;
DROP TABLE IF EXISTS partner_chat_messages CASCADE;
DROP TABLE IF EXISTS excluded_preferences CASCADE;
DROP TABLE IF EXISTS tag_categories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS body_map_responses CASCADE;
DROP TABLE IF EXISTS user_flow_state CASCADE;
DROP TABLE IF EXISTS user_discovery_profiles CASCADE;
DROP TABLE IF EXISTS discovery_config CASCADE;

-- Drop main tables
DROP TABLE IF EXISTS scenes CASCADE;
DROP TABLE IF EXISTS partnerships CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS preference_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_excluded_scene_ids(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_next_scene_filtered(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS initialize_user_flow_state() CASCADE;
DROP FUNCTION IF EXISTS update_flow_state_timestamp() CASCADE;

-- ============================================
-- PART 2: CREATE BASE TABLES
-- ============================================

-- Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'undisclosed')),
  interested_in TEXT CHECK (interested_in IN ('male', 'female', 'both')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preference profiles
CREATE TABLE preference_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  preferences JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
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
CREATE TABLE partnerships (
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

-- ============================================
-- PART 3: SCENES TABLE (V2 Schema)
-- ============================================

CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifiers
  slug TEXT UNIQUE NOT NULL,
  version INTEGER DEFAULT 2,

  -- Direction (expanded to support all v2 scene types)
  role_direction TEXT CHECK (role_direction IN (
    'm_to_f', 'f_to_m', 'mutual', 'solo',
    'group', 'universal',
    'm_daddy_f_little', 'f_mommy_m_little',
    'm_dom_f_pet', 'f_dom_m_pet', 'f_dom_m_sub',
    'm_keyholder_f_locked', 'f_keyholder_m_locked',
    'f_on_m', 'f_experience',
    'cuckold', 'hotwife',
    'mlm', 'wlw'
  )) DEFAULT 'mutual',

  -- Localized content
  title JSONB NOT NULL DEFAULT '{"ru": "", "en": ""}',
  subtitle JSONB DEFAULT '{"ru": "", "en": ""}',
  ai_description JSONB NOT NULL DEFAULT '{"ru": "", "en": ""}',

  -- Image
  image_url TEXT,
  image_prompt TEXT,

  -- Classification
  intensity INTEGER DEFAULT 3 CHECK (intensity >= 1 AND intensity <= 5),
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',

  -- V2 specific
  elements JSONB DEFAULT '[]',
  question JSONB,
  ai_context JSONB NOT NULL DEFAULT '{"tests_primary": [], "tests_secondary": []}',

  -- Legacy compatibility
  participants JSONB DEFAULT '{"count": 2}',
  dimensions TEXT[] DEFAULT '{}',
  relevant_for JSONB DEFAULT '{"gender": "any", "interested_in": "any"}',
  priority INTEGER DEFAULT 50,

  -- Admin/generation fields
  user_description JSONB DEFAULT '{"ru": "", "en": ""}',
  generation_prompt TEXT,
  original_prompt TEXT,
  final_prompt TEXT,
  qa_status TEXT CHECK (qa_status IN ('passed', 'failed')),
  qa_attempts INTEGER,
  qa_last_assessment JSONB,
  prompt_instructions TEXT,
  question_type TEXT,
  question_config JSONB,
  follow_up JSONB,
  schema_version INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scenes_slug ON scenes(slug);
CREATE INDEX idx_scenes_version ON scenes(version);
CREATE INDEX idx_scenes_category ON scenes(category);
CREATE INDEX idx_scenes_intensity ON scenes(intensity);
CREATE INDEX idx_scenes_tags ON scenes USING GIN (tags);
CREATE INDEX idx_scenes_elements ON scenes USING GIN (elements);
CREATE INDEX idx_scenes_ai_context ON scenes USING GIN (ai_context);

-- ============================================
-- PART 4: SCENE RESPONSES
-- ============================================

CREATE TABLE scene_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,

  -- Response data
  liked BOOLEAN,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  elements_selected TEXT[] DEFAULT '{}',
  follow_up_answers JSONB DEFAULT '{}',

  -- Legacy
  question_asked TEXT,
  question_type TEXT,
  answer JSONB,
  profile_updates JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, scene_id)
);

CREATE INDEX idx_scene_responses_user ON scene_responses(user_id);
CREATE INDEX idx_scene_responses_scene ON scene_responses(scene_id);

-- ============================================
-- PART 5: BODY MAP RESPONSES
-- ============================================

CREATE TABLE body_map_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL,
  pass TEXT NOT NULL CHECK (pass IN ('give', 'receive')),
  zones_selected TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, activity_id, pass)
);

CREATE INDEX idx_body_map_user ON body_map_responses(user_id);
CREATE INDEX idx_body_map_activity ON body_map_responses(activity_id);

-- ============================================
-- PART 6: USER FLOW STATE
-- ============================================

CREATE TABLE user_flow_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,

  -- Computed scores
  tag_scores JSONB DEFAULT '{}',
  preferred_intensity DECIMAL(3,2) DEFAULT 2.0,
  give_receive_balance DECIMAL(3,2) DEFAULT 0.0,

  -- Progress
  calibration_complete BOOLEAN DEFAULT FALSE,
  seen_scenes TEXT[] DEFAULT '{}',
  seen_categories TEXT[] DEFAULT '{}',

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_flow_state_user ON user_flow_state(user_id);
CREATE INDEX idx_user_flow_state_tags ON user_flow_state USING GIN (tag_scores);

-- ============================================
-- PART 7: USER DISCOVERY PROFILES
-- ============================================

CREATE TABLE user_discovery_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,

  -- Archetypes
  primary_archetype TEXT,
  secondary_archetypes TEXT[] DEFAULT '{}',

  -- Tags
  top_tags JSONB DEFAULT '[]',
  bottom_tags JSONB DEFAULT '[]',
  exploration_zones JSONB DEFAULT '[]',

  -- Dynamics
  give_receive_balance DECIMAL(3,2) DEFAULT 0.0,
  preferred_intensity DECIMAL(3,2) DEFAULT 2.0,

  -- Insights
  matched_insights JSONB DEFAULT '[]',

  -- Progress
  completion_percentage INTEGER DEFAULT 0,

  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user ON user_discovery_profiles(user_id);
CREATE INDEX idx_user_profiles_archetype ON user_discovery_profiles(primary_archetype);

-- ============================================
-- PART 8: DISCOVERY CONFIG
-- ============================================

CREATE TABLE discovery_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_type TEXT NOT NULL CHECK (config_type IN ('flow_rules', 'profile_analysis', 'body_map', 'tag_taxonomy')),
  version INTEGER NOT NULL DEFAULT 2,
  data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(config_type, version)
);

CREATE INDEX idx_discovery_config_type ON discovery_config(config_type);
CREATE INDEX idx_discovery_config_active ON discovery_config(is_active);

-- ============================================
-- PART 9: CATEGORIES & EXCLUSIONS
-- ============================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

CREATE TABLE tag_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  relevance INTEGER DEFAULT 100,
  UNIQUE(tag, category_id)
);

CREATE INDEX idx_tag_categories_tag ON tag_categories(tag);

CREATE TABLE excluded_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  excluded_tag TEXT,
  exclusion_level TEXT DEFAULT 'hard' CHECK (exclusion_level IN ('soft', 'hard', 'temporary')),
  reason TEXT,
  excluded_at TIMESTAMPTZ DEFAULT NOW(),
  reconsider_after_days INTEGER,

  UNIQUE(user_id, category_id)
);

CREATE INDEX idx_excluded_user ON excluded_preferences(user_id);

-- ============================================
-- PART 10: DATES & PROPOSALS
-- ============================================

CREATE TABLE dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  initiator_id UUID REFERENCES profiles(id),
  scheduled_for TIMESTAMPTZ,
  mood TEXT CHECK (mood IN ('passionate', 'tender', 'playful', 'intense', 'surprise')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'completed', 'canceled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE date_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_id UUID REFERENCES dates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id),
  answer TEXT CHECK (answer IN ('yes', 'maybe', 'no')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date_id, user_id, scene_id)
);

CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id),
  dimension TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shown', 'answered')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 11: CHAT & MESSAGES
-- ============================================

CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE partner_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partner_chat_user ON partner_chat_messages(user_id, partner_id);

-- ============================================
-- PART 12: ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE preference_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_map_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flow_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_discovery_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE excluded_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Preference profiles
CREATE POLICY "Users own preferences" ON preference_profiles FOR ALL USING (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users own subscription" ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- Partnerships
CREATE POLICY "Partnership members can view" ON partnerships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = partner_id);
CREATE POLICY "Users can create partnerships" ON partnerships FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = inviter_id);
CREATE POLICY "Partnership members can update" ON partnerships FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = partner_id);

-- Scenes - public read
CREATE POLICY "Anyone can view scenes" ON scenes FOR SELECT USING (true);

-- Scene responses
CREATE POLICY "Users own scene responses" ON scene_responses FOR ALL USING (auth.uid() = user_id);

-- Body map responses
CREATE POLICY "Users own body map responses" ON body_map_responses FOR ALL USING (auth.uid() = user_id);

-- Flow state
CREATE POLICY "Users own flow state" ON user_flow_state FOR ALL USING (auth.uid() = user_id);

-- Discovery profiles
CREATE POLICY "Users own discovery profiles" ON user_discovery_profiles FOR ALL USING (auth.uid() = user_id);

-- Excluded preferences
CREATE POLICY "Users own exclusions" ON excluded_preferences FOR ALL USING (auth.uid() = user_id);

-- Dates
CREATE POLICY "Date participants can view" ON dates FOR SELECT USING (
  EXISTS (SELECT 1 FROM partnerships p WHERE p.id = partnership_id AND (p.user_id = auth.uid() OR p.partner_id = auth.uid()))
);
CREATE POLICY "Users can create dates" ON dates FOR INSERT WITH CHECK (auth.uid() = initiator_id);

-- Date responses
CREATE POLICY "Users own date responses" ON date_responses FOR ALL USING (auth.uid() = user_id);

-- Proposals
CREATE POLICY "Proposal recipient can view" ON proposals FOR SELECT USING (auth.uid() = to_user_id);
CREATE POLICY "Users can create proposals" ON proposals FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Messages
CREATE POLICY "Users own ai messages" ON ai_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own partner chats" ON partner_chat_messages FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PART 13: FUNCTIONS & TRIGGERS
-- ============================================

-- Handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  INSERT INTO preference_profiles (user_id) VALUES (NEW.id);
  INSERT INTO subscriptions (user_id) VALUES (NEW.id);
  INSERT INTO user_flow_state (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preference_profiles_updated_at BEFORE UPDATE ON preference_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_flow_state_updated_at BEFORE UPDATE ON user_flow_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discovery_profiles_updated_at BEFORE UPDATE ON user_discovery_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! Now run: npx tsx supabase/seed-v2-data.ts
-- ============================================
