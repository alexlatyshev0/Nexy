-- Admin settings storage (key-value with JSONB)
-- Used for storing generation settings, model styles, etc.

CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only service_role can access (no RLS policies = service_role only)
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Add comment
COMMENT ON TABLE admin_settings IS 'Key-value storage for admin settings (generation styles, etc.)';
