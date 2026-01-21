/**
 * Scene Loader for Discovery 2 composite scenes
 */

import * as fs from "fs";
import * as path from "path";

const COMPOSITE_DIR = path.join(__dirname, "../composite");

export interface LocalizedText {
  ru: string;
  en: string;
}

export interface FollowUpOption {
  id: string;
  label: LocalizedText;
}

export interface FollowUp {
  id: string;
  type: "multi_select" | "single_select" | "scale";
  question: LocalizedText;
  config?: {
    options?: FollowUpOption[];
    min?: number;
    max?: number;
  };
}

export interface SceneElement {
  id: string;
  label: LocalizedText;
  tag_ref: string;
  follow_ups: FollowUp[];
}

export interface Scene {
  id: string;
  slug: string;
  version: number;
  role_direction: string;
  paired_scene?: string;

  title: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  image_prompt: string;

  intensity: number;
  category: string;
  tags: string[];

  elements: SceneElement[];

  question: {
    type: string;
    text: LocalizedText;
    min_selections?: number;
  };

  ai_context: {
    tests_primary: string[];
    tests_secondary: string[];
  };
}

export interface CategoryInfo {
  description: string;
  scenes: string[];
}

export interface SceneIndex {
  version: number;
  name: string;
  description: string;
  total_scenes: number;
  categories: Record<string, CategoryInfo>;
  paired_scenes: {
    description: string;
    pairs: [string, string][];
  };
  role_directions: Record<string, string>;
}

// Cache
let indexCache: SceneIndex | null = null;
const sceneCache: Map<string, Scene> = new Map();

/**
 * Load the master index
 */
export function loadIndex(): SceneIndex {
  if (indexCache) return indexCache;

  const indexPath = path.join(COMPOSITE_DIR, "_index.json");
  const content = fs.readFileSync(indexPath, "utf-8");
  indexCache = JSON.parse(content);
  return indexCache!;
}

/**
 * Load a single scene by category/slug
 */
export function loadScene(sceneSlug: string): Scene {
  if (sceneCache.has(sceneSlug)) {
    return sceneCache.get(sceneSlug)!;
  }

  // sceneSlug format: "category/scene-name" or just "scene-name"
  let scenePath: string;

  if (sceneSlug.includes("/")) {
    scenePath = path.join(COMPOSITE_DIR, `${sceneSlug}.json`);
  } else {
    // Find category by searching
    const index = loadIndex();
    let found = false;
    for (const [category, info] of Object.entries(index.categories)) {
      if (info.scenes.includes(sceneSlug)) {
        scenePath = path.join(COMPOSITE_DIR, category, `${sceneSlug}.json`);
        found = true;
        break;
      }
    }
    if (!found) {
      throw new Error(`Scene not found: ${sceneSlug}`);
    }
  }

  const content = fs.readFileSync(scenePath!, "utf-8");
  const scene: Scene = JSON.parse(content);

  // Add paired_scene reference if exists
  const index = loadIndex();
  for (const pair of index.paired_scenes.pairs) {
    if (pair[0] === scene.slug) {
      scene.paired_scene = pair[1];
      break;
    } else if (pair[1] === scene.slug) {
      scene.paired_scene = pair[0];
      break;
    }
  }

  sceneCache.set(sceneSlug, scene);
  return scene;
}

/**
 * Load all scenes in a category
 */
export function loadCategory(categoryName: string): Scene[] {
  const index = loadIndex();
  const category = index.categories[categoryName];

  if (!category) {
    throw new Error(`Category not found: ${categoryName}`);
  }

  return category.scenes.map((slug) => loadScene(`${categoryName}/${slug}`));
}

/**
 * Load all scenes
 */
export function loadAllScenes(): Scene[] {
  const index = loadIndex();
  const scenes: Scene[] = [];

  for (const [category, info] of Object.entries(index.categories)) {
    for (const slug of info.scenes) {
      scenes.push(loadScene(`${category}/${slug}`));
    }
  }

  return scenes;
}

/**
 * Filter scenes by role direction
 */
export function filterByRole(
  scenes: Scene[],
  allowedRoles: string[]
): Scene[] {
  return scenes.filter((s) => allowedRoles.includes(s.role_direction));
}

/**
 * Filter scenes by intensity
 */
export function filterByIntensity(
  scenes: Scene[],
  maxIntensity: number
): Scene[] {
  return scenes.filter((s) => s.intensity <= maxIntensity);
}

/**
 * Get paired scene
 */
export function getPairedScene(scene: Scene): Scene | null {
  if (!scene.paired_scene) return null;

  const index = loadIndex();
  for (const [category, info] of Object.entries(index.categories)) {
    if (info.scenes.includes(scene.paired_scene)) {
      return loadScene(`${category}/${scene.paired_scene}`);
    }
  }
  return null;
}

/**
 * Search scenes by tag
 */
export function searchByTag(tag: string): Scene[] {
  const allScenes = loadAllScenes();
  return allScenes.filter(
    (s) =>
      s.tags.includes(tag) ||
      s.ai_context.tests_primary.includes(tag) ||
      s.ai_context.tests_secondary.includes(tag)
  );
}

/**
 * Get category list
 */
export function getCategories(): string[] {
  const index = loadIndex();
  return Object.keys(index.categories);
}

/**
 * Get scene count
 */
export function getSceneCount(): number {
  const index = loadIndex();
  return index.total_scenes;
}

// CLI usage
if (require.main === module) {
  console.log("Discovery 2 Scene Loader");
  console.log("========================");

  const index = loadIndex();
  console.log(`Total scenes: ${index.total_scenes}`);
  console.log(`Categories: ${Object.keys(index.categories).length}`);

  console.log("\nCategories:");
  for (const [name, info] of Object.entries(index.categories)) {
    console.log(`  ${name}: ${info.scenes.length} scenes`);
  }
}
