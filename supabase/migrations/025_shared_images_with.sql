-- Add shared_images_with field for cross-category image sharing
-- Different from paired_with which is for give/receive pairs within same topic

ALTER TABLE scenes ADD COLUMN IF NOT EXISTS shared_images_with UUID REFERENCES scenes(id);

COMMENT ON COLUMN scenes.shared_images_with IS 'Links to scene from different category that shares the same images (e.g., onboarding/foot with worship-service/foot-worship)';

CREATE INDEX IF NOT EXISTS idx_scenes_shared_images_with ON scenes(shared_images_with);
