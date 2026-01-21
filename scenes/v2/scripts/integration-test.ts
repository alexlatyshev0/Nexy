/**
 * Integration Test - Full Discovery Flow
 *
 * Tests the complete flow from body map through profile generation
 *
 * Run: npx ts-node scripts/integration-test.ts
 */

import * as fs from 'fs';
import * as path from 'path';

import flowEngine, { createFlowState, FlowState, BodyMapResponse, UserResponse } from './flow-engine';
import profileGenerator from './profile-generator';
import coupleMatcher from './couple-matcher';
import { testJourneys, runJourneyTest, runAllJourneyTests, JourneyTestResult } from './test-journeys';
import { validateScene } from './schema';
import { checkFile } from './localization';

const SCENES_DIR = path.join(__dirname, '..', 'composite');

interface Scene {
  id: string;
  slug: string;
  version: number;
  title: { ru: string; en: string };
  intensity: number;
  category: string;
  tags: string[];
  ai_context: {
    tests_primary: string[];
    tests_secondary: string[];
  };
}

/**
 * Load all scenes from disk
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
 * Test 1: Flow Engine Initialization
 */
function testFlowInit(): boolean {
  console.log('\n[Test 1] Flow Engine Initialization');

  try {
    const state = createFlowState();

    if (!state.tagScores || !state.seenScenes || !state.seenCategories) {
      console.log('  ✗ Missing state properties');
      return false;
    }

    console.log('  ✓ State initialized correctly');
    return true;
  } catch (e) {
    console.log(`  ✗ Error: ${e}`);
    return false;
  }
}

/**
 * Test 2: Body Map Processing
 */
function testBodyMapProcessing(): boolean {
  console.log('\n[Test 2] Body Map Processing');

  try {
    let state = createFlowState();

    const responses: BodyMapResponse[] = [
      { activityId: 'spanking', pass: 'give', zonesSelected: ['buttocks', 'thighs'] },
      { activityId: 'spanking', pass: 'receive', zonesSelected: [] },
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'neck'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'neck'] },
    ];

    state = flowEngine.processBodyMapResponses(state, responses);

    // Check that tags were boosted
    const spankingScore = state.tagScores['spanking'] || 0;
    const dominantScore = state.tagScores['dominant'] || 0;

    if (spankingScore <= 0) {
      console.log('  ✗ Spanking tag not boosted');
      return false;
    }

    if (dominantScore <= 0) {
      console.log('  ✗ Dominant tag not boosted (give only)');
      return false;
    }

    // Check give/receive balance
    if (state.giveReceiveBalance <= 0) {
      console.log('  ✗ Give/receive balance not calculated');
      return false;
    }

    console.log(`  ✓ Tags boosted (spanking: ${spankingScore}, dominant: ${dominantScore})`);
    console.log(`  ✓ Give/receive balance: ${state.giveReceiveBalance.toFixed(2)}`);
    return true;
  } catch (e) {
    console.log(`  ✗ Error: ${e}`);
    return false;
  }
}

/**
 * Test 3: Scene Scoring
 */
function testSceneScoring(scenes: Scene[]): boolean {
  console.log('\n[Test 3] Scene Scoring');

  try {
    let state = createFlowState();

    // Simulate some interest
    state.tagScores['spanking'] = 5;
    state.tagScores['bondage'] = 3;
    state.tagScores['romantic'] = 2;

    // Find spanking and romantic scenes
    const spankingScene = scenes.find(s => s.id.includes('spanking'));
    const romanticScene = scenes.find(s => s.id.includes('romantic'));

    if (!spankingScene || !romanticScene) {
      console.log('  ✗ Could not find test scenes');
      return false;
    }

    const spankingScored = flowEngine.scoreScene(spankingScene, state);
    const romanticScored = flowEngine.scoreScene(romanticScene, state);

    if (spankingScored.score <= romanticScored.score) {
      console.log(`  ✗ Spanking (${spankingScored.score}) should score higher than romantic (${romanticScored.score})`);
      return false;
    }

    console.log(`  ✓ Spanking scene: ${spankingScored.score.toFixed(2)}`);
    console.log(`  ✓ Romantic scene: ${romanticScored.score.toFixed(2)}`);
    return true;
  } catch (e) {
    console.log(`  ✗ Error: ${e}`);
    return false;
  }
}

/**
 * Test 4: Scene Ordering
 */
function testSceneOrdering(scenes: Scene[]): boolean {
  console.log('\n[Test 4] Scene Ordering');

  try {
    let state = createFlowState();

    // Simulate strong interest in bondage
    state.tagScores['bondage'] = 10;
    state.tagScores['restraints'] = 8;

    const ordered = flowEngine.getOrderedScenes(scenes, state);

    if (ordered.length === 0) {
      console.log('  ✗ No scenes returned');
      return false;
    }

    // Check that scores are in descending order
    for (let i = 1; i < Math.min(10, ordered.length); i++) {
      if (ordered[i].score > ordered[i - 1].score) {
        console.log('  ✗ Scenes not in descending score order');
        return false;
      }
    }

    console.log(`  ✓ ${ordered.length} scenes ordered`);
    console.log(`  ✓ Top 3: ${ordered.slice(0, 3).map(s => s.id).join(', ')}`);
    return true;
  } catch (e) {
    console.log(`  ✗ Error: ${e}`);
    return false;
  }
}

/**
 * Test 5: Profile Generation
 */
function testProfileGeneration(): boolean {
  console.log('\n[Test 5] Profile Generation');

  try {
    let state = createFlowState();

    // Simulate a dominant profile
    state.tagScores = {
      dominant: 10,
      control: 8,
      discipline: 7,
      spanking: 9,
      bondage: 6,
      romantic: 2,
      submission: 0,
    };
    state.giveReceiveBalance = 0.8;
    state.preferredIntensity = 3.5;

    const profile = profileGenerator.generateProfile(state, 50, 6);

    if (!profile.primaryArchetype) {
      console.log('  ✗ No primary archetype assigned');
      return false;
    }

    if (profile.primaryArchetype.id !== 'dominant') {
      console.log(`  ✗ Expected dominant, got ${profile.primaryArchetype.id}`);
      return false;
    }

    console.log(`  ✓ Primary archetype: ${profile.primaryArchetype.id}`);
    console.log(`  ✓ Preferred intensity: ${profile.preferredIntensity.toFixed(1)}`);
    console.log(`  ✓ Top tags: ${profile.topTags.slice(0, 5).map(t => t.tag).join(', ')}`);
    return true;
  } catch (e) {
    console.log(`  ✗ Error: ${e}`);
    return false;
  }
}

/**
 * Test 6: Couple Compatibility
 */
function testCoupleCompatibility(): boolean {
  console.log('\n[Test 6] Couple Compatibility');

  try {
    // Create a dom profile
    const domState = createFlowState();
    domState.tagScores = { dominant: 10, control: 8, spanking: 7 };
    domState.giveReceiveBalance = 0.9;
    domState.preferredIntensity = 3.5;

    // Create a sub profile
    const subState = createFlowState();
    subState.tagScores = { submissive: 10, obedience: 8, spanking: 7 };
    subState.giveReceiveBalance = 0.1;
    subState.preferredIntensity = 3.5;

    const domProfile = profileGenerator.generateProfile(domState, 50, 6);
    const subProfile = profileGenerator.generateProfile(subState, 50, 6);

    const compatibility = coupleMatcher.analyzeCompatibility(domProfile, subProfile);

    if (compatibility.overallScore < 50) {
      console.log(`  ✗ Dom/sub should have high compatibility, got ${compatibility.overallScore}%`);
      return false;
    }

    console.log(`  ✓ Overall compatibility: ${compatibility.overallScore}%`);
    const roleScore = compatibility.dimensions.find(d => d.id === 'role_compatibility')?.score;
    console.log(`  ✓ Role compatibility: ${roleScore}%`);
    console.log(`  ✓ Shared interests: ${compatibility.sharedFavorites.slice(0, 3).map(s => s.tag).join(', ')}`);
    return true;
  } catch (e) {
    console.log(`  ✗ Error: ${e}`);
    return false;
  }
}

/**
 * Test 7: Test Journeys
 */
function testJourneysRun(scenes: Scene[]): boolean {
  console.log('\n[Test 7] Test Journeys');

  try {
    // Run a subset of journeys
    const journeysToTest = testJourneys.slice(0, 5);

    for (const journey of journeysToTest) {
      const result = runJourneyTest(journey, scenes);
      const status = result.passed ? '✓' : '✗';
      console.log(`  ${status} ${journey.id}: ${result.actualArchetype} (expected: ${result.expectedArchetype})`);
    }

    const fullResults = runAllJourneyTests(scenes);
    console.log(`\n  Full journey results: ${fullResults.passed}/${fullResults.passed + fullResults.failed} passed`);

    return fullResults.passed > 0;
  } catch (e) {
    console.log(`  ✗ Error: ${e}`);
    return false;
  }
}

/**
 * Main integration test runner
 */
function runIntegrationTests(): void {
  console.log('\n' + '='.repeat(60));
  console.log(' Discovery 2.0 - Integration Tests');
  console.log('='.repeat(60));

  // Load scenes
  console.log('\nLoading scenes...');
  const scenes = loadAllScenes();
  console.log(`Loaded ${scenes.length} scenes`);

  // Run tests
  const results: { name: string; passed: boolean }[] = [];

  results.push({ name: 'Flow Init', passed: testFlowInit() });
  results.push({ name: 'Body Map Processing', passed: testBodyMapProcessing() });
  results.push({ name: 'Scene Scoring', passed: testSceneScoring(scenes) });
  results.push({ name: 'Scene Ordering', passed: testSceneOrdering(scenes) });
  results.push({ name: 'Profile Generation', passed: testProfileGeneration() });
  results.push({ name: 'Couple Compatibility', passed: testCoupleCompatibility() });
  results.push({ name: 'Test Journeys', passed: testJourneysRun(scenes) });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(' RESULTS');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(r => {
    const status = r.passed ? '✓' : '✗';
    console.log(`  ${status} ${r.name}`);
  });

  console.log(`\n  Total: ${passed}/${total} tests passed`);
  console.log(`  Status: ${passed === total ? '✓ ALL PASSED' : '✗ SOME FAILED'}\n`);
}

// Run if executed directly
runIntegrationTests();

export { runIntegrationTests, loadAllScenes };
