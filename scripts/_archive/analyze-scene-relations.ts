import * as fs from 'fs';
import * as path from 'path';

const scenesDir = path.join(__dirname, '../scenes/v2');

interface SceneData {
  slug: string;
  file: string;
  is_active: boolean;
  is_onboarding: boolean;
  for_gender: string | null;
  gates_yes?: string[];
  gates_no?: string[];
  gates_scenes?: string[];
  clarification_for?: string[];
  scene_type?: string;
}

const scenes: SceneData[] = [];

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.json')) {
      try {
        const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        if (content.slug) {
          scenes.push({
            slug: content.slug,
            file: fullPath.replace(scenesDir, '').replace(/\\/g, '/'),
            is_active: content.is_active !== false,
            is_onboarding: content.is_onboarding === true,
            for_gender: content.for_gender || null,
            gates_yes: content.ai_context?.gates?.yes || [],
            gates_no: content.ai_context?.gates?.no || [],
            gates_scenes: content.gates_scenes || [],
            clarification_for: content.clarification_for || [],
            scene_type: content.scene_type || null,
          });
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }
}

walkDir(scenesDir);

// Build maps
const setsGates: Map<string, { slug: string; gates: string[] }[]> = new Map();
const requiresGates: Map<string, string[]> = new Map();
const triggersClarifications: Map<string, string[]> = new Map();
const isClarificationOf: Map<string, string[]> = new Map();

for (const scene of scenes) {
  if (!scene.is_active) continue;

  // Scenes that SET gates (gates.yes)
  if (scene.gates_yes && scene.gates_yes.length > 0) {
    for (const gate of scene.gates_yes) {
      if (!setsGates.has(gate)) setsGates.set(gate, []);
      setsGates.get(gate)!.push({ slug: scene.slug, gates: scene.gates_yes });
    }
  }

  // Scenes that REQUIRE gates (gates_scenes)
  if (scene.gates_scenes && scene.gates_scenes.length > 0) {
    requiresGates.set(scene.slug, scene.gates_scenes);
  }

  // Scenes that ARE clarifications
  if (scene.clarification_for && scene.clarification_for.length > 0) {
    isClarificationOf.set(scene.slug, scene.clarification_for);

    // Track what triggers them
    for (const parent of scene.clarification_for) {
      if (!triggersClarifications.has(parent)) triggersClarifications.set(parent, []);
      triggersClarifications.get(parent)!.push(scene.slug);
    }
  }
}

// Generate output
let output = `# Карта связей сцен

Автоматически сгенерировано: ${new Date().toISOString()}

## 1. СЦЕНЫ, КОТОРЫЕ ОТКРЫВАЮТ ГЕЙТЫ (при ответе YES)

Эти сцены устанавливают gates в user_gates при положительном ответе.

`;

const sortedGates = Array.from(setsGates.keys()).sort();
for (const gate of sortedGates) {
  const setters = setsGates.get(gate)!;
  output += `### Gate: \`${gate}\`\n`;
  for (const s of setters) {
    output += `- \`${s.slug}\`\n`;
  }
  output += '\n';
}

output += `
## 2. СЦЕНЫ, КОТОРЫЕ ТРЕБУЮТ ГЕЙТЫ (gates_scenes)

Эти сцены показываются только если соответствующий gate открыт.

`;

const sortedRequires = Array.from(requiresGates.keys()).sort();
for (const slug of sortedRequires) {
  const gates = requiresGates.get(slug)!;
  output += `- \`${slug}\` ← требует: ${gates.map(g => `\`${g}\``).join(', ')}\n`;
}

output += `

## 3. СЦЕНЫ, КОТОРЫЕ ОТКРЫВАЮТ CLARIFICATIONS

При YES на эту сцену показываются clarification сцены.

`;

const sortedTriggers = Array.from(triggersClarifications.keys()).sort();
for (const parent of sortedTriggers) {
  const children = triggersClarifications.get(parent)!;
  output += `### \`${parent}\` → открывает ${children.length} clarification(s):\n`;
  for (const child of children.sort()) {
    output += `  - \`${child}\`\n`;
  }
  output += '\n';
}

output += `
## 4. CLARIFICATION СЦЕНЫ (clarification_for)

Эти сцены показываются после YES на родительскую сцену.

`;

const sortedClarifications = Array.from(isClarificationOf.keys()).sort();
for (const slug of sortedClarifications) {
  const parents = isClarificationOf.get(slug)!;
  output += `- \`${slug}\` ← уточняет: ${parents.map(p => `\`${p}\``).join(', ')}\n`;
}

output += `

## Статистика

- Всего активных сцен: ${scenes.filter(s => s.is_active).length}
- Сцен с gates.yes: ${setsGates.size} уникальных гейтов
- Сцен с gates_scenes: ${requiresGates.size}
- Родительских сцен (trigger clarifications): ${triggersClarifications.size}
- Clarification сцен: ${isClarificationOf.size}
`;

fs.writeFileSync(path.join(__dirname, '../docs/scene-relations.md'), output);
console.log('Written to docs/scene-relations.md');
console.log(`Total scenes: ${scenes.length}`);
console.log(`Active: ${scenes.filter(s => s.is_active).length}`);
