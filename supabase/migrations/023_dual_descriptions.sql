-- Migration: 023_dual_descriptions.sql
-- Description: Add alternative user descriptions for scenes with same image but different perspectives
-- Date: 2025-01-21
--
-- Why:
-- Some scenes use the same image but need different descriptions for M vs F users.
-- Example: "M watching girl perform oral" vs "F performing oral" - same image, different descriptions.
-- This allows one generation_prompt but two user-facing descriptions.

-- ============================================
-- PART 1: ADD ALTERNATIVE DESCRIPTION COLUMNS
-- ============================================

-- Alternative user description (for opposite gender perspective)
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS user_description_alt JSONB;

-- Which gender sees the alt description (the other sees user_description)
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS alt_for_gender TEXT;

-- Add check constraint
ALTER TABLE scenes ADD CONSTRAINT chk_alt_for_gender
  CHECK (alt_for_gender IS NULL OR alt_for_gender IN ('male', 'female'));

COMMENT ON COLUMN scenes.user_description_alt IS 'Alternative user description for opposite gender perspective. Same format as user_description: {"ru": "...", "en": "..."}';
COMMENT ON COLUMN scenes.alt_for_gender IS 'Which gender sees user_description_alt. NULL means no alternative. "male" = M sees alt, F sees default. "female" = F sees alt, M sees default.';

-- ============================================
-- PART 2: HELPER FUNCTION TO GET DESCRIPTION
-- ============================================

-- Function to get the correct description based on user gender
CREATE OR REPLACE FUNCTION get_scene_description_for_gender(
  p_user_description JSONB,
  p_user_description_alt JSONB,
  p_alt_for_gender TEXT,
  p_user_gender TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  -- If no alt description or no alt_for_gender, return default
  IF p_user_description_alt IS NULL OR p_alt_for_gender IS NULL THEN
    RETURN p_user_description;
  END IF;

  -- Return alt if user gender matches alt_for_gender
  IF p_user_gender = p_alt_for_gender THEN
    RETURN p_user_description_alt;
  END IF;

  -- Otherwise return default
  RETURN p_user_description;
END;
$$;

COMMENT ON FUNCTION get_scene_description_for_gender IS 'Returns the appropriate user_description based on user gender. Use in queries to personalize scene descriptions.';

-- ============================================
-- PART 3: EXAMPLE USAGE (for documentation)
-- ============================================

-- Example query to get personalized description:
--
-- SELECT
--   s.id,
--   s.slug,
--   get_scene_description_for_gender(
--     s.user_description,
--     s.user_description_alt,
--     s.alt_for_gender,
--     p.gender
--   ) as description
-- FROM scenes s
-- CROSS JOIN (SELECT gender FROM profiles WHERE id = auth.uid()) p
-- WHERE s.is_active = true;
