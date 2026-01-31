/**
 * Deactivate baseline scenes (redundant with onboarding)
 *
 * Run with: npx tsx scripts/deactivate-baseline.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const BASELINE_DIR = path.join(__dirname, '../scenes/v2/composite/baseline');

let deactivated = 0;

const files = fs.readdirSync(BASELINE_DIR).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(BASELINE_DIR, file);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const scene = JSON.parse(content);

    if (scene.is_active !== false) {
      scene.is_active = false;
      fs.writeFileSync(filePath, JSON.stringify(scene, null, 2) + '\n', 'utf-8');
      deactivated++;
      console.log(`✗ Deactivated: ${scene.slug}`);
    }
  } catch (e) {
    console.error(`Error processing ${file}:`, e);
  }
}

console.log(`\n========================================`);
console.log(`Deactivated: ${deactivated} baseline scenes`);
console.log(`========================================`);
