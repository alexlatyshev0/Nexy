-- 029: Expand discovery_config config_type constraint
-- Add onboarding_categories and activities to allowed types

-- Drop the old constraint and create new one
ALTER TABLE discovery_config
DROP CONSTRAINT IF EXISTS discovery_config_config_type_check;

ALTER TABLE discovery_config
ADD CONSTRAINT discovery_config_config_type_check
CHECK (config_type IN (
  'flow_rules',
  'profile_analysis',
  'body_map',
  'tag_taxonomy',
  'onboarding_categories',
  'activities'
));
