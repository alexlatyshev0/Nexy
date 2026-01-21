/**
 * Validate All Scenes & Check Localization
 *
 * Run: npx ts-node scripts/validate-all.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { validateScene, validateBodyMapActivity, ValidationResult } from './schema';
import { checkFile, mergeReports, printReport, LocalizationReport } from './localization';

const SCENES_DIR = path.join(__dirname, '..', 'composite');
const BODYMAP_DIR = path.join(__dirname, '..', 'body-map');

interface FileResult {
  file: string;
  schemaValid: boolean;
  schemaErrors: string[];
  localizationIssues: number;
}

/**
 * Recursively find all JSON files in directory
 */
function findJsonFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return files;
  }

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

/**
 * Validate a single file
 */
function validateFile(filePath: string, isBodyMap: boolean = false): FileResult {
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);

  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Schema validation
    const schemaResult: ValidationResult = isBodyMap
      ? validateBodyMapActivity(content)
      : validateScene(content);

    // Localization check
    const locReport = checkFile(content, relativePath);

    return {
      file: relativePath,
      schemaValid: schemaResult.valid,
      schemaErrors: schemaResult.errors.map(e => `${e.path}: ${e.message}`),
      localizationIssues: locReport.issues.length,
    };
  } catch (err) {
    return {
      file: relativePath,
      schemaValid: false,
      schemaErrors: [`Parse error: ${(err as Error).message}`],
      localizationIssues: 0,
    };
  }
}

/**
 * Main validation runner
 */
function runValidation(): void {
  console.log('\n' + '='.repeat(60));
  console.log(' Discovery 2.0 - Full Validation');
  console.log('='.repeat(60) + '\n');

  // Find all files
  const sceneFiles = findJsonFiles(SCENES_DIR);
  const bodyMapFiles = findJsonFiles(BODYMAP_DIR);

  console.log(`Found ${sceneFiles.length} scene files`);
  console.log(`Found ${bodyMapFiles.length} body map files\n`);

  // Validate scenes
  console.log('--- SCENE VALIDATION ---\n');

  const sceneResults: FileResult[] = [];
  let validScenes = 0;
  let invalidScenes = 0;

  for (const file of sceneFiles) {
    const result = validateFile(file, false);
    sceneResults.push(result);

    if (result.schemaValid) {
      validScenes++;
    } else {
      invalidScenes++;
      console.log(`✗ ${result.file}`);
      result.schemaErrors.slice(0, 3).forEach(e => console.log(`    ${e}`));
      if (result.schemaErrors.length > 3) {
        console.log(`    ... and ${result.schemaErrors.length - 3} more errors`);
      }
    }
  }

  console.log(`\nScenes: ${validScenes} valid, ${invalidScenes} invalid\n`);

  // Validate body maps
  console.log('--- BODY MAP VALIDATION ---\n');

  const bodyMapResults: FileResult[] = [];
  let validBodyMaps = 0;
  let invalidBodyMaps = 0;

  for (const file of bodyMapFiles) {
    const result = validateFile(file, true);
    bodyMapResults.push(result);

    if (result.schemaValid) {
      validBodyMaps++;
    } else {
      invalidBodyMaps++;
      console.log(`✗ ${result.file}`);
      result.schemaErrors.slice(0, 3).forEach(e => console.log(`    ${e}`));
    }
  }

  console.log(`\nBody maps: ${validBodyMaps} valid, ${invalidBodyMaps} invalid\n`);

  // Localization summary
  console.log('--- LOCALIZATION SUMMARY ---\n');

  const allResults = [...sceneResults, ...bodyMapResults];
  const filesWithIssues = allResults.filter(r => r.localizationIssues > 0);
  const totalIssues = allResults.reduce((sum, r) => sum + r.localizationIssues, 0);

  if (filesWithIssues.length > 0) {
    console.log(`Files with localization issues: ${filesWithIssues.length}`);
    console.log(`Total issues: ${totalIssues}`);
    console.log('\nTop files with issues:');

    filesWithIssues
      .sort((a, b) => b.localizationIssues - a.localizationIssues)
      .slice(0, 10)
      .forEach(r => {
        console.log(`  ${r.localizationIssues} issues: ${r.file}`);
      });
  } else {
    console.log('No localization issues found!');
  }

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log(' SUMMARY');
  console.log('='.repeat(60));
  console.log(`\n  Scenes:     ${validScenes}/${sceneFiles.length} valid`);
  console.log(`  Body maps:  ${validBodyMaps}/${bodyMapFiles.length} valid`);
  console.log(`  L10n issues: ${totalIssues}`);

  const allValid = invalidScenes === 0 && invalidBodyMaps === 0;
  console.log(`\n  Status: ${allValid ? '✓ ALL VALID' : '✗ ISSUES FOUND'}\n`);
}

// Run if executed directly
runValidation();

export { runValidation, findJsonFiles, validateFile };
