-- ⚠️ DEPRECATED: This file is OUTDATED and does not reflect V2 structure
-- Use migrations/005_scenes_v2_composite.sql and migrations/011_finalize_v2.sql instead
-- See docs/DATABASE_SCHEMA_V2.md for current schema documentation
--
-- Intimate Discovery Database Schema (OLD V1/V4 - DO NOT USE)
-- Run this in your Supabase SQL Editor

-- ============================================
-- TABLES
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
-- ROW LEVEL SECURITY
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

-- ============================================
-- INDEXES
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
-- FUNCTIONS
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
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preference_profiles_updated_at
  BEFORE UPDATE ON preference_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
