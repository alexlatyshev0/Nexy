-- Migration: 020_onboarding_category_column.sql
-- Description: Add explicit onboarding_category column to scenes table
-- Date: 2025-01-21
--
-- Why: Previously category was extracted from slug using fragile parsing.
-- This caused bugs with multi-word categories (body-fluids → body_fluids).
-- Now category is stored explicitly for reliability and extensibility.

-- ============================================
-- PART 1: ADD COLUMNS
-- ============================================

-- Main category column (matches OnboardingResponses keys)
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS onboarding_category TEXT;

-- Optional direction for give/receive distinction
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS onboarding_direction TEXT;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_scenes_onboarding_category
ON scenes(onboarding_category)
WHERE onboarding_category IS NOT NULL;

-- ============================================
-- PART 2: POPULATE FROM EXISTING SLUGS
-- ============================================

-- Single-word categories (direct mapping)
UPDATE scenes SET onboarding_category = 'oral', onboarding_direction = 'give'
WHERE slug LIKE 'onboarding-oral-give-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'oral', onboarding_direction = 'receive'
WHERE slug LIKE 'onboarding-oral-receive-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'anal', onboarding_direction = 'give'
WHERE slug LIKE 'onboarding-anal-give-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'anal', onboarding_direction = 'receive'
WHERE slug LIKE 'onboarding-anal-receive-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'rough', onboarding_direction = 'give'
WHERE slug LIKE 'onboarding-rough-give-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'rough', onboarding_direction = 'receive'
WHERE slug LIKE 'onboarding-rough-receive-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'bondage', onboarding_direction = 'give'
WHERE slug LIKE 'onboarding-bondage-give-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'bondage', onboarding_direction = 'receive'
WHERE slug LIKE 'onboarding-bondage-receive-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'foot', onboarding_direction = 'give'
WHERE slug LIKE 'onboarding-foot-give-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'foot', onboarding_direction = 'receive'
WHERE slug LIKE 'onboarding-foot-receive-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'praise', onboarding_direction = 'give'
WHERE slug LIKE 'onboarding-praise-give-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'praise', onboarding_direction = 'receive'
WHERE slug LIKE 'onboarding-praise-receive-%' AND onboarding_category IS NULL;

-- Multi-word categories (slug uses hyphens, TypeScript uses underscores)
UPDATE scenes SET onboarding_category = 'body_fluids', onboarding_direction = 'give'
WHERE slug LIKE 'onboarding-body-fluids-give-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'body_fluids', onboarding_direction = 'receive'
WHERE slug LIKE 'onboarding-body-fluids-receive-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'dirty_talk', onboarding_direction = 'give'
WHERE slug LIKE 'onboarding-dirty-talk-give-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'dirty_talk', onboarding_direction = 'receive'
WHERE slug LIKE 'onboarding-dirty-talk-receive-%' AND onboarding_category IS NULL;

-- Power dynamics (dom/sub → power_dynamic)
UPDATE scenes SET onboarding_category = 'power_dynamic', onboarding_direction = 'give'
WHERE slug LIKE 'onboarding-power-dom-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'power_dynamic', onboarding_direction = 'receive'
WHERE slug LIKE 'onboarding-power-sub-%' AND onboarding_category IS NULL;

-- Categories without give/receive
UPDATE scenes SET onboarding_category = 'group'
WHERE slug LIKE 'onboarding-group-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'toys'
WHERE slug LIKE 'onboarding-toys-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'roleplay'
WHERE slug LIKE 'onboarding-roleplay-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'quickie'
WHERE slug LIKE 'onboarding-quickie-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'romantic'
WHERE slug LIKE 'onboarding-romantic-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'public'
WHERE slug LIKE 'onboarding-public-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'exhibitionism'
WHERE slug LIKE 'onboarding-exhibitionism-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'recording'
WHERE slug LIKE 'onboarding-recording-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'lingerie'
WHERE slug LIKE 'onboarding-lingerie-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'extreme'
WHERE slug LIKE 'onboarding-extreme-%' AND onboarding_category IS NULL;

UPDATE scenes SET onboarding_category = 'sexting'
WHERE slug LIKE 'onboarding-sexting%' AND onboarding_category IS NULL;

-- ============================================
-- PART 3: COMMENTS
-- ============================================

COMMENT ON COLUMN scenes.onboarding_category IS 'Category ID matching OnboardingResponses keys (oral, body_fluids, power_dynamic, etc.)';
COMMENT ON COLUMN scenes.onboarding_direction IS 'Direction for asymmetric categories: give, receive, or NULL for symmetric';

-- ============================================
-- PART 4: VALIDATION QUERY (for manual check)
-- ============================================

-- Run this to verify all onboarding scenes have category set:
-- SELECT slug, onboarding_category, onboarding_direction
-- FROM scenes
-- WHERE category = 'onboarding'
-- ORDER BY onboarding_category, onboarding_direction, slug;
