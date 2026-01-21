/**
 * List all scene IDs from composite directory
 */

import * as fs from 'fs';
import * as path from 'path';

const SCENES_DIR = path.join(__dirname, '..', 'composite');

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

const files = findJsonFiles(SCENES_DIR);
const ids: string[] = [];

for (const file of files) {
  try {
    const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
    ids.push(content.id);
  } catch (e) {
    console.error(`Error reading ${file}`);
  }
}

ids.sort();
console.log('All scene IDs:');
console.log(ids.join('\n'));
console.log(`\nTotal: ${ids.length} scenes`);
