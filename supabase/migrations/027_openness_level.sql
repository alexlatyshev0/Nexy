-- Add openness level to profiles
-- Values: 'conservative', 'moderate', 'adventurous'

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS openness_level TEXT
CHECK (openness_level IN ('conservative', 'moderate', 'adventurous'));

COMMENT ON COLUMN profiles.openness_level IS 'User openness to experimentation: conservative (vanilla), moderate (open to trying), adventurous (loves experiments)';
