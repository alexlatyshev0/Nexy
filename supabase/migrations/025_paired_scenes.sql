-- Add paired_with field to link give/receive scene pairs
-- Both scenes point to each other (bidirectional link)

ALTER TABLE scenes ADD COLUMN IF NOT EXISTS paired_with UUID REFERENCES scenes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_scenes_paired_with ON scenes(paired_with);

COMMENT ON COLUMN scenes.paired_with IS 'Links give/receive scene pairs. Both scenes reference each other.';
