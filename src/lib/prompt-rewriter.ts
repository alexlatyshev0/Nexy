/**
 * Prompt Rewriter using AI
 * Rewrites generation prompts while preserving the essence
 */

import { QualityAssessment } from './qa-evaluator';

export interface RewriteResult {
  newPrompt: string;
  changes: string[];
}

/**
 * Improves prompt based on QA assessment hints
 */
export function improvePromptFromHints(
  originalPrompt: string,
  hints: QualityAssessment['regenerationHints']
): string {
  let improved = originalPrompt;

  // Remove problematic parts
  for (const remove of hints.remove) {
    improved = improved.replace(new RegExp(remove, 'gi'), '');
  }

  // Add new elements
  if (hints.add.length > 0) {
    improved += ', ' + hints.add.join(', ');
  }

  // Emphasize important elements
  if (hints.emphasize) {
    improved += `, focus on ${hints.emphasize}, clearly showing ${hints.emphasize}, ${hints.emphasize} clearly visible`;
  }

  // Clean up
  return improved
    .replace(/,\s*,/g, ',')
    .replace(/,\s*$/, '')
    .replace(/^\s*,/, '')
    .trim();
}

export interface ParticipantsInfo {
  count: number;
  genders: string[];
}

/**
 * Rewrites prompt completely using AI while preserving essence
 */
export async function rewritePromptWithAI(
  originalPrompt: string,
  essence: string,
  failReasons: string[],
  participants?: ParticipantsInfo,
  userInstructions?: string
): Promise<RewriteResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  // Build participants description
  const genderMap: Record<string, string> = {
    'M': 'man',
    'F': 'woman',
    'male': 'man',
    'female': 'woman',
    'any': 'person',
  };

  let participantsDesc = '';
  if (participants && participants.count > 0) {
    const genderWords = participants.genders.map(g => genderMap[g] || g);
    if (participants.count === 1) {
      participantsDesc = `1 ${genderWords[0]}`;
    } else if (participants.count === 2) {
      participantsDesc = `${genderWords[0]} and ${genderWords[1]}`;
    } else {
      participantsDesc = `${participants.count} people: ${genderWords.join(', ')}`;
    }
  }

  const systemPrompt = `Ты эксперт по написанию промптов для генерации изображений.
Твоя задача - переписать промпт для генерации изображения, СОХРАНИВ СУТЬ, но изменив формулировку.

Правила:
1. СУТЬ сцены должна остаться прежней
2. Используй другие слова, синонимы, перефразирование
3. Делай промпт более конкретным и чётким
4. Добавь детали, которые помогут генератору лучше понять задачу
5. Учитывай причины предыдущих неудач
6. Пиши на английском языке
7. Не добавляй стилистические префиксы (masterpiece, best quality и т.д.) - они добавляются автоматически
8. ОБЯЗАТЕЛЬНО указывай пол участников явно (man, woman) - никогда не используй "couple", "pair", "person" без указания пола
9. ЕСЛИ ЕСТЬ ИНСТРУКЦИИ ПОЛЬЗОВАТЕЛЯ - они имеют НАИВЫСШИЙ ПРИОРИТЕТ и должны быть выполнены в первую очередь`;

  // Build user instructions section
  const instructionsSection = userInstructions
    ? `\n⚠️ ИНСТРУКЦИИ ПОЛЬЗОВАТЕЛЯ (НАИВЫСШИЙ ПРИОРИТЕТ!):\n${userInstructions}\n`
    : '';

  const userPrompt = `Перепиши этот промпт для генерации изображения:

ОРИГИНАЛЬНЫЙ ПРОМПТ:
${originalPrompt}

СУТЬ СЦЕНЫ (должна быть сохранена):
${essence}

УЧАСТНИКИ (ОБЯЗАТЕЛЬНО указать в промпте):
${participantsDesc || 'Не указано - определи по контексту и укажи явно'}
${instructionsSection}
ПРИЧИНЫ НЕУДАЧ ПРЕДЫДУЩИХ ПОПЫТОК:
${failReasons.join('\n') || 'Нет данных'}

Ответь в JSON формате:
{
  "newPrompt": "новый промпт на английском С ЯВНЫМ УКАЗАНИЕМ ПОЛА УЧАСТНИКОВ",
  "changes": ["что изменил 1", "что изменил 2"]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt,
      }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const textContent = result.content.find((c: { type: string }) => c.type === 'text');

  if (!textContent) {
    throw new Error('No text response from Claude');
  }

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from Claude response');
  }

  return JSON.parse(jsonMatch[0]) as RewriteResult;
}

/**
 * Apply user instructions to modify an existing prompt
 * Used when user saves prompt_instructions - applies them immediately
 */
export async function applyInstructionsToPrompt(
  currentPrompt: string,
  instructions: string
): Promise<RewriteResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  const systemPrompt = `You are an expert at modifying image generation prompts.
Your task is to apply the user's instructions to modify the existing prompt.

Rules:
1. Apply the instructions precisely
2. Keep the rest of the prompt as-is unless the instructions say otherwise
3. Output must be in English
4. Do not add style prefixes (masterpiece, best quality, etc.) - they are added automatically
5. Always preserve explicit gender mentions (man, woman) - never replace with ambiguous terms`;

  const userPrompt = `Apply these instructions to modify the prompt:

CURRENT PROMPT:
${currentPrompt}

INSTRUCTIONS TO APPLY:
${instructions}

Respond in JSON format:
{
  "newPrompt": "the modified prompt in English",
  "changes": ["change 1", "change 2"]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt,
      }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const textContent = result.content.find((c: { type: string }) => c.type === 'text');

  if (!textContent) {
    throw new Error('No text response from Claude');
  }

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from Claude response');
  }

  return JSON.parse(jsonMatch[0]) as RewriteResult;
}
