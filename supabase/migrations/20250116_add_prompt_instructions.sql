-- Add prompt_instructions field for user notes on how to modify prompts
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS prompt_instructions TEXT;

COMMENT ON COLUMN scenes.prompt_instructions IS 'User instructions for AI on how to modify/improve the prompt';
