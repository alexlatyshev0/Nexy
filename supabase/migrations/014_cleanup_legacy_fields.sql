-- Migration: 014_cleanup_legacy_fields.sql
-- Purpose: Remove legacy V1 fields from scenes table
-- Date: 2025-01-18
-- BREAKING: No backwards compatibility

-- ============================================
-- REMOVE LEGACY FIELDS FROM SCENES TABLE
-- ============================================

-- Drop legacy V1 columns that are no longer used in V2:
--
-- participants   -> replaced by role_direction
-- dimensions     -> replaced by tags
-- relevant_for   -> replaced by role_direction
-- question_type  -> replaced by question.type (JSONB)
-- question_config -> replaced by question (JSONB)
-- schema_version -> redundant with version

ALTER TABLE scenes
  DROP COLUMN IF EXISTS participants,
  DROP COLUMN IF EXISTS dimensions,
  DROP COLUMN IF EXISTS relevant_for,
  DROP COLUMN IF EXISTS question_type,
  DROP COLUMN IF EXISTS question_config,
  DROP COLUMN IF EXISTS schema_version;

-- ============================================
-- ADD COMMENTS FOR CLARITY
-- ============================================

-- Document the purpose of similar-looking fields
COMMENT ON COLUMN scenes.image_prompt IS 'Default image generation prompt from JSON files. Used as reference for resetting.';
COMMENT ON COLUMN scenes.generation_prompt IS 'Current working prompt for image generation. Editable in admin panel.';
COMMENT ON COLUMN scenes.prompt_instructions IS 'Instructions for AI to modify generation_prompt automatically.';
COMMENT ON COLUMN scenes.ai_description IS 'Technical description for AI matching (JSONB, localized). Machine-readable.';
COMMENT ON COLUMN scenes.user_description IS 'Human-readable description shown to users (JSONB, localized).';
COMMENT ON COLUMN scenes.qa_status IS 'QA validation status: passed/failed. Set by automated QA evaluator.';
COMMENT ON COLUMN scenes.qa_attempts IS 'Number of QA validation attempts for this scene.';
COMMENT ON COLUMN scenes.qa_last_assessment IS 'Last QA assessment details (JSONB). Contains scores and feedback.';
COMMENT ON COLUMN scenes.accepted IS 'Manual image approval: true=approved, false=rejected, null=pending review.';
COMMENT ON COLUMN scenes.follow_up IS 'Legacy follow-up questions (JSONB). Still editable in admin for backwards compat.';

-- ============================================
-- VERIFY FINAL SCHEMA
-- ============================================

-- The scenes table should now have these columns:
--
-- IDENTIFIERS:
--   id             UUID PRIMARY KEY
--   slug           TEXT UNIQUE NOT NULL
--   version        INTEGER DEFAULT 2
--
-- DIRECTION:
--   role_direction TEXT (m_to_f, f_to_m, mutual, solo, etc.)
--
-- CONTENT (localized JSONB):
--   title          JSONB NOT NULL
--   subtitle       JSONB
--   ai_description JSONB NOT NULL (for AI)
--   user_description JSONB (for users)
--
-- IMAGE:
--   image_url         TEXT
--   image_prompt      TEXT (default from JSON)
--   generation_prompt TEXT (editable copy)
--
-- CLASSIFICATION:
--   intensity      INTEGER 1-5
--   category       TEXT NOT NULL
--   tags           TEXT[]
--   priority       INTEGER
--
-- V2 STRUCTURE:
--   elements       JSONB (scene elements with follow-ups)
--   question       JSONB (question config)
--   ai_context     JSONB (tests_primary, tests_secondary, gates)
--
-- ADMIN WORKFLOW:
--   prompt_instructions  TEXT (AI modification instructions)
--   qa_status            TEXT (passed/failed)
--   qa_attempts          INTEGER
--   qa_last_assessment   JSONB
--   accepted             BOOLEAN (manual approval)
--   follow_up            JSONB (legacy, still editable)
--
-- TIMESTAMPS:
--   created_at     TIMESTAMPTZ
