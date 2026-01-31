const { Client } = require('pg');

// Supabase direct connection (pooler)
// Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
// Try service role key as password, or use DATABASE_URL, or use explicit password
const password = process.env.SUPABASE_DB_PASSWORD || process.env.SUPABASE_SERVICE_ROLE_KEY;
const connectionString = process.env.DATABASE_URL ||
  `postgresql://postgres:${password}@db.nshgmbtvyucuwbwxhawn.supabase.co:5432/postgres`;

async function main() {
  if (!password) {
    console.log('Need SUPABASE_DB_PASSWORD or SUPABASE_SERVICE_ROLE_KEY env var');
    process.exit(1);
  }
  console.log('Using password from env...');

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to database');

    await client.query('ALTER TABLE discovery_config DROP CONSTRAINT IF EXISTS discovery_config_config_type_check');
    console.log('Dropped old constraint');

    await client.query(`
      ALTER TABLE discovery_config
      ADD CONSTRAINT discovery_config_config_type_check
      CHECK (config_type IN ('flow_rules', 'profile_analysis', 'body_map', 'tag_taxonomy', 'onboarding_categories', 'activities'))
    `);
    console.log('Added new constraint');

    console.log('Done!');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.end();
  }
}

main();
