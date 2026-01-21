-- Fix: Ensure get_excluded_scene_ids function exists
-- This function is required for scene filtering

-- Drop and recreate to ensure it's available
DROP FUNCTION IF EXISTS get_excluded_scene_ids(UUID) CASCADE;

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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_excluded_scene_ids(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_excluded_scene_ids(UUID) TO anon;
