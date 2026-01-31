-- Migration: 031_image_analysis.sql
-- Description: Table to store AI analysis of storage images (keywords, activity, etc.)
-- Date: 2025-01-30

-- Table to store AI analysis of storage images
CREATE TABLE IF NOT EXISTS image_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT UNIQUE NOT NULL,
  file_url TEXT NOT NULL,
  analysis JSONB NOT NULL DEFAULT '{}',
  -- analysis structure: {
  --   participants: { count: number, genders: string[] },
  --   activity: string,
  --   keywords: string[],
  --   mood: string,
  --   setting: string,
  --   elements: string[]
  -- }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by filename
CREATE INDEX IF NOT EXISTS idx_image_analysis_file_name ON image_analysis(file_name);

-- GIN index for searching keywords in JSONB
CREATE INDEX IF NOT EXISTS idx_image_analysis_keywords ON image_analysis USING GIN((analysis->'keywords'));

-- Comment
COMMENT ON TABLE image_analysis IS 'Stores AI-generated analysis of storage images for tagging and matching';
