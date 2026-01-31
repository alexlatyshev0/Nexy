-- Drop deprecated gates_scenes column
-- This field was redundant - SCENE_GATES in code handles visibility

ALTER TABLE scenes DROP COLUMN IF EXISTS gates_scenes;

COMMENT ON TABLE scenes IS 'Scene definitions. Gates controlled by SCENE_GATES in code, not by gates_scenes field.';
