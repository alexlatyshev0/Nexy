-- Migration: Exclusions & Partner Chat
-- Version: 2.1
-- Description: Category exclusions mechanism + Partner AI chat

-- ============================================
-- 1. NEW TABLES
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

ALTER TABLE excluded_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own exclusions" ON excluded_preferences
  FOR ALL USING (auth.uid() = user_id);

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

ALTER TABLE partner_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their chats" ON partner_chat_messages
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 2. ALTER EXISTING TABLES
-- ============================================

-- Add category_feedback to scene_responses
ALTER TABLE scene_responses
ADD COLUMN IF NOT EXISTS category_feedback JSONB;

-- ============================================
-- 3. FUNCTIONS
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

-- ============================================
-- 4. INITIAL DATA: Categories
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
-- 5. INITIAL DATA: Tag Categories
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

-- Tags that belong to multiple categories (collar, leash, tail_plug, etc.)
-- collar and leash -> pet_play (already in bondage)
INSERT INTO tag_categories (tag, category_id)
SELECT tag, (SELECT id FROM categories WHERE slug = 'pet_play')
FROM unnest(ARRAY['collar', 'leash', 'tail_plug']) AS tag
ON CONFLICT (tag, category_id) DO NOTHING;

-- blindfold -> sensory (already in bondage)
INSERT INTO tag_categories (tag, category_id)
VALUES ('blindfold', (SELECT id FROM categories WHERE slug = 'sensory'))
ON CONFLICT (tag, category_id) DO NOTHING;

-- rimming -> anal (already in oral)
INSERT INTO tag_categories (tag, category_id)
VALUES ('rimming', (SELECT id FROM categories WHERE slug = 'anal'))
ON CONFLICT (tag, category_id) DO NOTHING;

-- bukkake -> cum_play (already in group)
INSERT INTO tag_categories (tag, category_id)
VALUES ('bukkake', (SELECT id FROM categories WHERE slug = 'cum_play'))
ON CONFLICT (tag, category_id) DO NOTHING;

-- intruder -> cnc (already in roleplay)
INSERT INTO tag_categories (tag, category_id)
VALUES ('intruder', (SELECT id FROM categories WHERE slug = 'cnc'))
ON CONFLICT (tag, category_id) DO NOTHING;

-- cage -> chastity (already in pet_play)
INSERT INTO tag_categories (tag, category_id)
VALUES ('cage', (SELECT id FROM categories WHERE slug = 'chastity'))
ON CONFLICT (tag, category_id) DO NOTHING;

-- denial -> chastity (already in dynamics)
INSERT INTO tag_categories (tag, category_id)
VALUES ('denial', (SELECT id FROM categories WHERE slug = 'chastity'))
ON CONFLICT (tag, category_id) DO NOTHING;
