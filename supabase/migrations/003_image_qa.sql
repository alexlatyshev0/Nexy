-- Migration: Image Generation QA System
-- Adds fields for QA validation of generated images

-- Add QA-related columns to scenes table
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS original_prompt TEXT;
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS final_prompt TEXT;
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS qa_status TEXT CHECK (qa_status IN ('passed', 'failed', NULL));
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS qa_attempts INTEGER DEFAULT 0;
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS qa_last_assessment JSONB;

-- Add index for filtering by QA status
CREATE INDEX IF NOT EXISTS idx_scenes_qa_status ON scenes(qa_status);

-- Comment for documentation
COMMENT ON COLUMN scenes.original_prompt IS 'Original generation prompt before any AI modifications';
COMMENT ON COLUMN scenes.final_prompt IS 'Final prompt used for the accepted/last image';
COMMENT ON COLUMN scenes.qa_status IS 'QA validation status: passed, failed, or NULL (not checked)';
COMMENT ON COLUMN scenes.qa_attempts IS 'Total number of generation attempts with QA';
COMMENT ON COLUMN scenes.qa_last_assessment IS 'Last QA assessment result from Claude Vision';
