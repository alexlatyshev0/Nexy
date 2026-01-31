-- Migration: 022_is_active_and_wishlist.sql
-- Description: Add is_active flag for scenes and orientation wishlist table
-- Date: 2025-01-21
--
-- Why:
-- 1. Need to deactivate homo scenes (mlm/wlw) while content is being prepared
-- 2. Collect interest data from users who want homo/bi content

-- ============================================
-- PART 1: ADD is_active FLAG TO SCENES
-- ============================================

-- Add is_active column with default true
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Deactivate homo scenes (mlm = men loving men, wlw = women loving women)
UPDATE scenes SET is_active = false WHERE role_direction IN ('mlm', 'wlw');

-- Index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_scenes_is_active ON scenes(is_active);

-- Composite index for common query pattern (active V2 scenes)
CREATE INDEX IF NOT EXISTS idx_scenes_active_v2
ON scenes(is_active, version)
WHERE is_active = true AND version = 2;

COMMENT ON COLUMN scenes.is_active IS 'Whether scene is active and should be shown to users. False for mlm/wlw scenes until content is ready.';

-- ============================================
-- PART 2: ORIENTATION WISHLIST TABLE
-- ============================================

-- Table to collect interest in orientations not yet available
CREATE TABLE IF NOT EXISTS orientation_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  requested_orientation TEXT NOT NULL CHECK (requested_orientation IN ('gay_male', 'gay_female', 'bisexual')),
  email TEXT, -- For non-logged users (optional, future use)
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One entry per user per orientation
  UNIQUE(user_id, requested_orientation)
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_wishlist_orientation ON orientation_wishlist(requested_orientation);
CREATE INDEX IF NOT EXISTS idx_wishlist_created ON orientation_wishlist(created_at);

-- Enable RLS
ALTER TABLE orientation_wishlist ENABLE ROW LEVEL SECURITY;

-- Users can insert their own wishlist entries
DROP POLICY IF EXISTS "Users can insert own wishlist" ON orientation_wishlist;
CREATE POLICY "Users can insert own wishlist" ON orientation_wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can read their own wishlist entries
DROP POLICY IF EXISTS "Users can read own wishlist" ON orientation_wishlist;
CREATE POLICY "Users can read own wishlist" ON orientation_wishlist
  FOR SELECT USING (auth.uid() = user_id);

-- Note: Admin access is controlled at the application level via service role key
-- No separate RLS policy needed for admin - they use service role which bypasses RLS

COMMENT ON TABLE orientation_wishlist IS 'Collects user interest in orientations not yet available (homo/bi)';
COMMENT ON COLUMN orientation_wishlist.requested_orientation IS 'gay_male = M interested in M, gay_female = F interested in F, bisexual = interested in both';

-- ============================================
-- PART 3: HELPER FUNCTION FOR WISHLIST COUNT
-- ============================================

-- Function to get wishlist counts (for admin dashboard)
CREATE OR REPLACE FUNCTION get_orientation_wishlist_stats()
RETURNS TABLE (
  orientation TEXT,
  count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    requested_orientation as orientation,
    COUNT(*) as count
  FROM orientation_wishlist
  GROUP BY requested_orientation
  ORDER BY count DESC;
$$;

-- Grant execute to authenticated users (will be admin-only in app)
GRANT EXECUTE ON FUNCTION get_orientation_wishlist_stats() TO authenticated;
