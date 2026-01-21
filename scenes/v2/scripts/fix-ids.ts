/**
 * Fix Scene IDs - Convert hyphens to underscores
 *
 * Run: npx ts-node scripts/fix-ids.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const SCENES_DIR = path.join(__dirname, '..', 'composite');

interface Scene {
  id: string;
  slug: string;
  [key: string]: any;
}

function findJsonFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findJsonFiles(fullPath));
    } else if (entry.name.endsWith('.json') && !entry.name.startsWith('_')) {
      files.push(fullPath);
    }
  }

  return files;
}

function fixIds(): void {
  console.log('Fixing scene IDs: converting hyphens to underscores\n');

  const files = findJsonFiles(SCENES_DIR);
  let updated = 0;
  let unchanged = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const scene: Scene = JSON.parse(content);

      const oldId = scene.id;
      const newId = oldId.replace(/-/g, '_');

      if (oldId !== newId) {
        scene.id = newId;

        // Write back with proper formatting
        fs.writeFileSync(file, JSON.stringify(scene, null, 2) + '\n', 'utf-8');

        console.log(`✓ ${path.basename(file)}: "${oldId}" → "${newId}"`);
        updated++;
      } else {
        unchanged++;
      }
    } catch (e) {
      console.log(`✗ ${path.basename(file)}: ${(e as Error).message}`);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Updated: ${updated}`);
  console.log(`Unchanged: ${unchanged}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total: ${files.length}`);
}

fixIds();
