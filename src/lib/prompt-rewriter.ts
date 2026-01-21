/**
 * Prompt Rewriter using AI
 * Rewrites generation prompts while preserving the essence
 */

import { QualityAssessment } from './qa-evaluator';

export interface RewriteResult {
  newPrompt: string;
  changes: string[];
}

// Style words that should NEVER be in the prompt (style is set separately)
const FORBIDDEN_STYLE_WORDS = [
  'photorealistic', 'photo-realistic', 'realistic', 'hyper-realistic', 'hyperrealistic',
  'photo', 'photograph', 'photography', 'photo style', 'photography style',
  'masterpiece', 'best quality', 'high quality', 'highest quality', 'top quality',
  'detailed', 'highly detailed', 'ultra detailed', 'extremely detailed',
  '4k', '8k', 'uhd', 'hd', 'high resolution', 'high-resolution',
  'sharp', 'sharp focus', 'professional', 'professional photography',
  'cinematic', 'cinematic lighting', 'movie quality',
  'artistic', 'art style', 'illustration style',
  'beautiful', 'stunning', 'amazing', 'perfect', 'gorgeous',
  'natural lighting', 'studio lighting', 'dramatic lighting',
  'realistic anatomy', 'realistic anatomy clearly visible',
  'anatomically correct', 'perfect anatomy',
];

/**
 * Remove forbidden style words from prompt
 */
function cleanStyleWords(prompt: string): string {
  let cleaned = prompt;

  // Sort by length (longest first) to avoid partial replacements
  const sortedWords = [...FORBIDDEN_STYLE_WORDS].sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    // Match word with optional comma/space around it
    const regex = new RegExp(`\\s*,?\\s*${word}\\s*,?\\s*`, 'gi');
    cleaned = cleaned.replace(regex, ', ');
  }

  // Clean up multiple commas and spaces
  return cleaned
    .replace(/,\s*,+/g, ',')
    .replace(/^\s*,\s*/, '')
    .replace(/\s*,\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Remove accumulated emphasis patterns and deduplicate phrases
 * Exported so it can be used to clean final prompt after QA passes
 */
export function cleanAccumulatedEmphasis(prompt: string): string {
  let cleaned = prompt;

  // Remove "focus on X", "clearly showing X", "X clearly visible" patterns
  // These accumulate during QA iterations
  cleaned = cleaned.replace(/,?\s*focus on [^,]+/gi, '');
  cleaned = cleaned.replace(/,?\s*clearly showing [^,]+/gi, '');
  cleaned = cleaned.replace(/,?\s*[^,]+ clearly visible/gi, '');

  // Split by comma, deduplicate, rejoin
  const parts = cleaned.split(',').map(p => p.trim().toLowerCase()).filter(p => p.length > 0);
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const part of parts) {
    // Normalize for comparison (lowercase, trim)
    if (!seen.has(part)) {
      seen.add(part);
      unique.push(part);
    }
  }

  return unique.join(', ');
}

/**
 * Deduplicate comma-separated phrases in prompt
 */
function deduplicatePhrases(prompt: string): string {
  const parts = prompt.split(',').map(p => p.trim()).filter(p => p.length > 0);
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const part of parts) {
    const normalized = part.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(part); // Keep original case
    }
  }

  return unique.join(', ');
}

/**
 * Improves prompt based on QA assessment hints
 */
export function improvePromptFromHints(
  originalPrompt: string,
  hints: QualityAssessment['regenerationHints']
): string {
  // First, clean up any accumulated emphasis from previous iterations
  let improved = cleanAccumulatedEmphasis(originalPrompt);

  // Remove problematic parts
  for (const remove of hints.remove) {
    improved = improved.replace(new RegExp(remove, 'gi'), '');
  }

  // Add new elements (only if not already present)
  if (hints.add.length > 0) {
    const currentLower = improved.toLowerCase();
    const newElements = hints.add.filter(el => !currentLower.includes(el.toLowerCase()));
    if (newElements.length > 0) {
      improved += ', ' + newElements.join(', ');
    }
  }

  // Emphasize important elements (add only once, not accumulating)
  if (hints.emphasize) {
    // Only add emphasis phrase once
    improved += `, focus on ${hints.emphasize}`;
  }

  // Deduplicate and clean up
  improved = deduplicatePhrases(improved);

  // Remove style words
  return cleanStyleWords(improved);
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

⛔ ЗАПРЕЩЁННЫЕ СЛОВА (НИКОГДА не использовать!):
photorealistic, realistic, photo, photography, masterpiece, best quality, high quality,
detailed, 4k, 8k, uhd, hd, high resolution, sharp, professional, cinematic,
artistic, beautiful, stunning, amazing, perfect, anime, cartoon, illustration style,
natural lighting, studio lighting, dramatic lighting (если не относится к сюжету)

✅ Промпт должен описывать ТОЛЬКО:
- КТО: man/woman (с явным указанием пола!)
- ЧТО ДЕЛАЕТ: действие, поза
- ГДЕ: место, обстановка
- ДЕТАЛИ СЦЕНЫ: предметы, одежда/её отсутствие

Правила:
1. СУТЬ сцены должна остаться прежней
2. Используй другие слова, синонимы, перефразирование
3. Делай промпт более конкретным и чётким
4. Добавь детали которые помогут генератору
5. Учитывай причины предыдущих неудач
6. Пиши на английском языке
7. ОБЯЗАТЕЛЬНО указывай пол участников явно (man, woman)
8. ЕСЛИ ЕСТЬ ИНСТРУКЦИИ ПОЛЬЗОВАТЕЛЯ - они имеют НАИВЫСШИЙ ПРИОРИТЕТ
9. НЕ ДОБАВЛЯЙ слова про стиль/качество - стиль задаётся ОТДЕЛЬНО в настройках!`;

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

  const apiResult = await response.json();
  const textContent = apiResult.content.find((c: { type: string }) => c.type === 'text');

  if (!textContent) {
    throw new Error('No text response from Claude');
  }

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from Claude response');
  }

  const result = JSON.parse(jsonMatch[0]) as RewriteResult;

  // Clean any style words that Claude might have added despite instructions
  result.newPrompt = cleanStyleWords(result.newPrompt);

  return result;
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

⛔ FORBIDDEN WORDS (NEVER use!):
photorealistic, realistic, photo, photography, masterpiece, best quality, high quality,
detailed, 4k, 8k, uhd, hd, high resolution, sharp, professional, cinematic,
artistic, beautiful, stunning, amazing, perfect, natural lighting, studio lighting

✅ Prompt should describe ONLY:
- WHO: man/woman (explicit gender!)
- WHAT: action, pose
- WHERE: location, setting
- SCENE DETAILS: objects, clothing/nudity

Rules:
1. Apply the instructions precisely
2. Keep the rest of the prompt as-is unless the instructions say otherwise
3. Output must be in English
4. Always preserve explicit gender mentions (man, woman)
5. DO NOT add style/quality words - style is set SEPARATELY in settings!`;

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

  const apiResult = await response.json();
  const textContent = apiResult.content.find((c: { type: string }) => c.type === 'text');

  if (!textContent) {
    throw new Error('No text response from Claude');
  }

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from Claude response');
  }

  const result = JSON.parse(jsonMatch[0]) as RewriteResult;

  // Clean any style words that Claude might have added despite instructions
  result.newPrompt = cleanStyleWords(result.newPrompt);

  return result;
}
