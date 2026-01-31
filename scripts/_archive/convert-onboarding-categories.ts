/**
 * Convert categories.json to unified scene format
 *
 * Each category becomes 2 scenes (for hetero only):
 * - one for male (for_gender: 'male')
 * - one for female (for_gender: 'female')
 *
 * If category has `universal` user_description, creates 1 scene with for_gender: null
 *
 * Run: npx tsx scripts/convert-onboarding-categories.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

function uuidv4(): string {
  return crypto.randomUUID();
}

const CATEGORIES_PATH = path.join(__dirname, '..', 'scenes', 'v2', 'onboarding', 'categories.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'scenes', 'v2', 'onboarding', 'converted');

interface Category {
  id: string;
  order: number;
  conditional: boolean;
  show_if?: string;
  paired_with?: string;
  title: { ru: string; en: string };
  subtitle: { ru: string; en: string };
  ai_description: { ru: string; en: string };
  user_description: {
    hetero_m?: { ru: string; en: string };
    hetero_f?: { ru: string; en: string };
    gay?: { ru: string; en: string };
    lesbian?: { ru: string; en: string };
    universal?: { ru: string; en: string };
  };
  image_prompts: {
    hetero_m?: string;
    hetero_f?: string;
    gay?: string;
    lesbian?: string;
    universal?: string;
  };
  gates_scenes: string[];
}

interface ConvertedScene {
  id: string;
  slug: string;
  version: 2;
  is_active: boolean;
  is_onboarding: boolean;
  onboarding_order: number;
  for_gender: 'male' | 'female' | null;
  paired_with: string | null;
  conditional: boolean;
  show_if: string | null;
  title: { ru: string; en: string };
  subtitle: { ru: string; en: string };
  ai_description: { ru: string; en: string };
  user_description: { ru: string; en: string };
  image_prompt: string;
  intensity: number;
  category: string;
  tags: string[];
  gates_scenes: string[];
  ai_context: {
    tests_primary: string[];
    tests_secondary: string[];
  };
}

function loadCategories(): Category[] {
  const content = fs.readFileSync(CATEGORIES_PATH, 'utf-8');
  const data = JSON.parse(content);
  return data.categories;
}

function generateSlug(categoryId: string, gender: 'male' | 'female' | null): string {
  if (gender === null) {
    return `onboarding-${categoryId}`;
  }
  return `onboarding-${categoryId}-${gender === 'male' ? 'm' : 'f'}`;
}

function convertCategory(category: Category): ConvertedScene[] {
  const scenes: ConvertedScene[] = [];

  // Check if it has universal description (gender-neutral)
  if (category.user_description.universal) {
    const slug = generateSlug(category.id, null);
    scenes.push({
      id: uuidv4(),
      slug,
      version: 2,
      is_active: true,
      is_onboarding: true,
      onboarding_order: category.order,
      for_gender: null,
      paired_with: null,
      conditional: category.conditional,
      show_if: category.show_if || null,
      title: category.title,
      subtitle: category.subtitle,
      ai_description: category.ai_description,
      user_description: category.user_description.universal,
      image_prompt: category.image_prompts.universal || '',
      intensity: 2, // default for onboarding
      category: 'onboarding',
      tags: ['onboarding', category.id],
      gates_scenes: category.gates_scenes || [],
      ai_context: {
        tests_primary: [category.id],
        tests_secondary: [],
      },
    });
    return scenes;
  }

  // Create male version
  if (category.user_description.hetero_m) {
    const maleSlug = generateSlug(category.id, 'male');
    const femalePairedSlug = generateSlug(category.id, 'female');

    // Determine paired scene slug
    let pairedWithSlug: string | null = null;
    if (category.paired_with) {
      // Link to female version of the paired category
      pairedWithSlug = generateSlug(category.paired_with, 'female');
    }

    scenes.push({
      id: uuidv4(),
      slug: maleSlug,
      version: 2,
      is_active: true,
      is_onboarding: true,
      onboarding_order: category.order,
      for_gender: 'male',
      paired_with: pairedWithSlug,
      conditional: category.conditional,
      show_if: category.show_if || null,
      title: category.title,
      subtitle: category.subtitle,
      ai_description: category.ai_description,
      user_description: category.user_description.hetero_m,
      image_prompt: category.image_prompts.hetero_m || '',
      intensity: 2,
      category: 'onboarding',
      tags: ['onboarding', category.id],
      gates_scenes: category.gates_scenes || [],
      ai_context: {
        tests_primary: [category.id],
        tests_secondary: [],
      },
    });
  }

  // Create female version
  if (category.user_description.hetero_f) {
    const femaleSlug = generateSlug(category.id, 'female');

    // Determine paired scene slug
    let pairedWithSlug: string | null = null;
    if (category.paired_with) {
      // Link to male version of the paired category
      pairedWithSlug = generateSlug(category.paired_with, 'male');
    }

    scenes.push({
      id: uuidv4(),
      slug: femaleSlug,
      version: 2,
      is_active: true,
      is_onboarding: true,
      onboarding_order: category.order + 0.1, // Slight offset for female version
      for_gender: 'female',
      paired_with: pairedWithSlug,
      conditional: category.conditional,
      show_if: category.show_if || null,
      title: category.title,
      subtitle: category.subtitle,
      ai_description: category.ai_description,
      user_description: category.user_description.hetero_f,
      image_prompt: category.image_prompts.hetero_f || '',
      intensity: 2,
      category: 'onboarding',
      tags: ['onboarding', category.id],
      gates_scenes: category.gates_scenes || [],
      ai_context: {
        tests_primary: [category.id],
        tests_secondary: [],
      },
    });
  }

  return scenes;
}

async function main() {
  console.log('Converting onboarding categories to unified scene format...\n');

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const categories = loadCategories();
  console.log(`Loaded ${categories.length} categories\n`);

  const allScenes: ConvertedScene[] = [];

  for (const category of categories) {
    const scenes = convertCategory(category);
    allScenes.push(...scenes);

    // Write individual files
    for (const scene of scenes) {
      const filename = `${scene.slug}.json`;
      const filepath = path.join(OUTPUT_DIR, filename);
      fs.writeFileSync(filepath, JSON.stringify(scene, null, 2));
      console.log(`Created: ${filename}`);
    }
  }

  // Write combined file
  const combinedPath = path.join(OUTPUT_DIR, '_all-onboarding-scenes.json');
  fs.writeFileSync(combinedPath, JSON.stringify({
    version: 1,
    total_scenes: allScenes.length,
    scenes: allScenes,
  }, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log(`Total scenes created: ${allScenes.length}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Combined file: ${combinedPath}`);

  // Summary
  const maleCount = allScenes.filter(s => s.for_gender === 'male').length;
  const femaleCount = allScenes.filter(s => s.for_gender === 'female').length;
  const universalCount = allScenes.filter(s => s.for_gender === null).length;

  console.log(`\nBreakdown:`);
  console.log(`  Male scenes: ${maleCount}`);
  console.log(`  Female scenes: ${femaleCount}`);
  console.log(`  Universal scenes: ${universalCount}`);
}

main().catch(console.error);
