/**
 * Remove gates_scenes from all onboarding JSON files
 * This field is redundant - SCENE_GATES in code handles visibility
 *
 * Run with: npx tsx scripts/remove-gates-scenes.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const ONBOARDING_DIR = path.join(__dirname, '../scenes/v2/onboarding/converted');

let filesUpdated = 0;
let fieldsRemoved = 0;

function processFile(filePath: string): void {
  if (!filePath.endsWith('.json')) return;

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const scene = JSON.parse(content);

    if (scene.gates_scenes) {
      delete scene.gates_scenes;
      fieldsRemoved++;

      fs.writeFileSync(filePath, JSON.stringify(scene, null, 2) + '\n', 'utf-8');
      filesUpdated++;
      console.log(`✓ Removed gates_scenes from: ${path.basename(filePath)}`);
    }
  } catch (e) {
    console.error(`Error processing ${filePath}:`, e);
  }
}

function processDirectory(dir: string): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && !entry.name.startsWith('_')) {
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.json') && !entry.name.startsWith('_')) {
      processFile(fullPath);
    }
  }
}

console.log('Removing gates_scenes from onboarding files...\n');
processDirectory(ONBOARDING_DIR);

console.log(`\n========================================`);
console.log(`Files updated: ${filesUpdated}`);
console.log(`Fields removed: ${fieldsRemoved}`);
console.log(`========================================`);
