/**
 * Seed V2 Data - Load composite scenes and config into Supabase
 *
 * Run: npx tsx supabase/seed-v2-data.ts
 *
 * Requires:
 * - SUPABASE_URL env variable
 * - SUPABASE_SERVICE_ROLE_KEY env variable (not anon key!)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Set these environment variables before running');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

const SCENES_DIR = path.join(__dirname, '..', 'scenes', 'v2-ACTIVE-92-scenes', 'composite');
const CONFIG_DIR = path.join(__dirname, '..', 'scenes', 'v2-ACTIVE-92-scenes');

interface Scene {
  id: string;
  slug: string;
  version: number;
  role_direction?: string;
  title: { ru: string; en: string };
  subtitle?: { ru: string; en: string };
  description: { ru: string; en: string };
  image_prompt?: string;
  intensity: number;
  category: string;
  tags: string[];
  elements?: any[];
  question?: any;
  ai_context: {
    tests_primary: string[];
    tests_secondary: string[];
  };
}

/**
 * Load all scenes from composite directory
 */
function loadAllScenes(): Scene[] {
  const scenes: Scene[] = [];

  function loadDir(dir: string): void {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        loadDir(fullPath);
      } else if (entry.name.endsWith('.json') && !entry.name.startsWith('_')) {
        try {
          const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          scenes.push(content);
        } catch (e) {
          console.error(`Error loading ${fullPath}: ${e}`);
        }
      }
    }
  }

  loadDir(SCENES_DIR);
  return scenes;
}

/**
 * Load JSON config file
 */
function loadConfig(filename: string): any {
  const filepath = path.join(CONFIG_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`Config file not found: ${filepath}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

/**
 * Seed scenes into database
 */
async function seedScenes(scenes: Scene[]): Promise<void> {
  console.log(`\nSeeding ${scenes.length} scenes...`);

  // Delete existing v2 scenes
  const { error: deleteError } = await supabase
    .from('scenes')
    .delete()
    .gte('version', 2);

  if (deleteError) {
    console.error('Error deleting old scenes:', deleteError);
  }

  // Insert scenes in batches
  const batchSize = 20;
  let inserted = 0;

  for (let i = 0; i < scenes.length; i += batchSize) {
    const batch = scenes.slice(i, i + batchSize).map(scene => ({
      // Use slug as stable ID (or generate UUID)
      slug: scene.slug,
      version: scene.version || 2,
      role_direction: scene.role_direction || 'mutual',
      description: scene.description,
      subtitle: scene.subtitle || { ru: '', en: '' },
      image_url: '', // Will be set when images are uploaded
      image_prompt: scene.image_prompt || '',
      participants: { count: 2 }, // Default
      dimensions: scene.ai_context.tests_primary,
      tags: scene.tags,
      intensity: scene.intensity,
      relevant_for: { gender: 'any', interested_in: 'any' },
      elements: scene.elements || [],
      question: scene.question || null,
      ai_context: scene.ai_context,
      // Extra fields stored in JSONB
      priority: 50,
      user_description: scene.description,
      category: scene.category,
      title: scene.title,
    }));

    const { error } = await supabase.from('scenes').insert(batch);

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
    } else {
      inserted += batch.length;
      console.log(`  Inserted ${inserted}/${scenes.length}`);
    }
  }

  console.log(`✓ Seeded ${inserted} scenes`);
}

/**
 * Seed discovery configuration
 */
async function seedConfig(configType: string, data: any): Promise<void> {
  if (!data) return;

  console.log(`\nSeeding ${configType}...`);

  // Upsert config
  const { error } = await supabase
    .from('discovery_config')
    .upsert({
      config_type: configType,
      version: data.version || 2,
      data: data,
      is_active: true,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'config_type,version'
    });

  if (error) {
    console.error(`Error seeding ${configType}:`, error);
  } else {
    console.log(`✓ Seeded ${configType}`);
  }
}

/**
 * Main seed function
 */
async function main(): Promise<void> {
  console.log('='.repeat(50));
  console.log(' Seeding V2 Discovery Data');
  console.log('='.repeat(50));

  // 1. Load and seed scenes
  const scenes = loadAllScenes();
  console.log(`Loaded ${scenes.length} scenes from ${SCENES_DIR}`);

  if (scenes.length === 0) {
    console.error('No scenes found! Check SCENES_DIR path.');
    process.exit(1);
  }

  await seedScenes(scenes);

  // 2. Load and seed configs
  const flowRules = loadConfig('flow-rules.json');
  await seedConfig('flow_rules', flowRules);

  const profileAnalysis = loadConfig('profile-analysis.json');
  await seedConfig('profile_analysis', profileAnalysis);

  // 3. Load body map if exists
  const bodyMapDir = path.join(CONFIG_DIR, 'body-map');
  if (fs.existsSync(bodyMapDir)) {
    const bodyMapFiles = fs.readdirSync(bodyMapDir).filter(f => f.endsWith('.json'));
    const bodyMapData: any = { activities: {} };

    for (const file of bodyMapFiles) {
      const content = JSON.parse(fs.readFileSync(path.join(bodyMapDir, file), 'utf-8'));
      const activityId = path.basename(file, '.json');
      bodyMapData.activities[activityId] = content;
    }

    await seedConfig('body_map', bodyMapData);
  }

  // 4. Summary
  console.log('\n' + '='.repeat(50));
  console.log(' SEED COMPLETE');
  console.log('='.repeat(50));

  // Verify counts
  const { count: sceneCount } = await supabase
    .from('scenes')
    .select('*', { count: 'exact', head: true });

  const { count: configCount } = await supabase
    .from('discovery_config')
    .select('*', { count: 'exact', head: true });

  console.log(`\nDatabase state:`);
  console.log(`  Scenes: ${sceneCount}`);
  console.log(`  Configs: ${configCount}`);
}

main().catch(console.error);
