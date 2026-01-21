/**
 * Image QA Evaluator using Claude Vision
 * Evaluates generated images against scene requirements
 */

export interface KeyElement {
  element: string;
  critical: boolean;
  in_action: boolean;
}

export interface SceneQAContext {
  essence: string;
  key_elements: KeyElement[];
  mood: string;
  participants: {
    count: number;
    genders: string[];
  };
}

export interface KeyElementCheck {
  element: string;
  present: boolean;
  inAction: boolean | null;
  critical: boolean;
  comment?: string;
}

export interface QualityAssessment {
  essenceCaptured: boolean;
  essenceScore: number;
  essenceComment: string;
  keyElementsCheck: KeyElementCheck[];
  participantsCorrect: boolean;
  participantsComment?: string;
  technicalQuality: {
    score: number;
    fatalFlaws: string[];
    minorIssues: string[];
  };
  moodMatch: boolean;
  APPROVED: boolean;
  failReason?: string;
  regenerationHints: {
    emphasize: string;
    add: string[];
    remove: string[];
  };
}

const QA_SYSTEM_PROMPT = `Ты эксперт по оценке эротических изображений.

ГЛАВНЫЙ ПРИНЦИП: Изображение должно соответствовать сути сцены и иметь правильную анатомию!

## Что значит "В ДЕЛЕ":
- Игрушка: касается тела в интимной зоне, используется
- Мастурбация: рука МЕЖДУ НОГ, касается гениталий
- Оральный секс: рот У гениталий партнёра
- Проникновение: явное вхождение
- Связывание: верёвки/наручники НА теле
- Доминирование: чёткая иерархия поз (один выше/властнее)
- Поклонение ногам: губы касаются ступней/пальцев ног
- Поцелуи/лизание: явный контакт губ/языка с телом

## СТИЛЬ - ЛЮБОЙ ДОПУСТИМ:
- Допускается ЛЮБОЙ стиль: реалистичный, комиксы, иллюстрации, скетчи
- Стиль НЕ является критерием оценки
- Главное - правильная АНАТОМИЯ в любом стиле!
- Части тела должны быть нормальных пропорций (язык, руки, ноги, грудь)

## ⚠️ ОСОБОЕ ВНИМАНИЕ - ПАЛЬЦЫ И ЯЗЫК:
AI-генераторы часто ошибаются с пальцами и языком. Проверь ОЧЕНЬ ВНИМАТЕЛЬНО:
- ПАЛЬЦЫ: ровно 5 пальцев на каждой руке, нормальной длины и толщины, правильные суставы
  - FAIL: 4 или 6+ пальцев, сросшиеся пальцы, слишком длинные/короткие, странные изгибы
- ЯЗЫК: нормального размера и формы, естественный цвет
  - FAIL: огромный/раздутый язык, нереалистично длинный, странная форма, неестественный цвет
- ПАЛЬЦЫ НОГ: если видны - должно быть 5 на каждой ноге, нормальные пропорции

## Что ВАЖНО проверить:
- Правильная анатомия (пропорции тела, суставы)
- ПАЛЬЦЫ РУК - считай их! Должно быть ровно 5 на каждой видимой руке
- ПАЛЬЦЫ НОГ - если видны, должно быть 5 на каждой ноге
- ЯЗЫК - если виден, должен быть нормального размера и формы
- Участники делают то, что описано
- Нет лишних элементов (короны, троны, оружие) если не указано
- Простая/нейтральная обстановка (спальня, диван) если не указано иное

## Что НЕ важно:
- Стиль изображения (реализм, комикс, скетч - всё ОК)
- Точный угол камеры
- Цвет волос/глаз если не указан

## КРИТИЧНЫЕ проблемы (= автоматический FAIL):
- НЕПРАВИЛЬНОЕ КОЛИЧЕСТВО ПАЛЬЦЕВ (не 5 на руке) - это КРИТИЧНАЯ ошибка!
- ДЕФОРМИРОВАННЫЕ ПАЛЬЦЫ (сросшиеся, странные изгибы, неестественная длина)
- ОГРОМНЫЙ/ДЕФОРМИРОВАННЫЙ ЯЗЫК
- Непропорциональная анатомия (огромные/мелкие части тела)
- Ключевой элемент с [КРИТИЧНО] отсутствует
- Элемент с [ДОЛЖНО БЫТЬ В ДЕЛЕ] не показан в действии
- Неправильное количество людей
- Неправильный пол участников
- Грубые деформации (искажённые лица, неестественные позы)
- Лишние элементы меняющие суть (корона, трон, формальная одежда если не указано)
- Слишком формальная обстановка (дворец, тронный зал) для обычной интимной сцены`;

export async function evaluateImage(
  imageUrl: string,
  context: SceneQAContext
): Promise<QualityAssessment> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  const keyElementsText = context.key_elements.map(el => {
    let line = `- ${el.element}`;
    if (el.critical) line += ' [КРИТИЧНО]';
    if (el.in_action) line += ' [ДОЛЖНО БЫТЬ В ДЕЛЕ]';
    return line;
  }).join('\n');

  const userPrompt = `ОЦЕНИ ЭТО ИЗОБРАЖЕНИЕ:

## СУТЬ СЦЕНЫ (что должно быть передано):
${context.essence}

## КЛЮЧЕВЫЕ ЭЛЕМЕНТЫ:
${keyElementsText}

## НАСТРОЕНИЕ: ${context.mood}

## УЧАСТНИКИ: ${context.participants.count} человек (${context.participants.genders.join(', ')})

---

Ответь СТРОГО в JSON:
{
  "essenceCaptured": true/false,
  "essenceScore": 1-10,
  "essenceComment": "почему да/нет",

  "keyElementsCheck": [
    {
      "element": "название",
      "present": true/false,
      "inAction": true/false/null,
      "critical": true/false,
      "comment": "пояснение если нужно"
    }
  ],

  "participantsCorrect": true/false,
  "participantsComment": "если что-то не так",

  "technicalQuality": {
    "score": 1-10,
    "fatalFlaws": [],
    "minorIssues": []
  },

  "moodMatch": true/false,

  "APPROVED": true/false,
  "failReason": "причина если APPROVED=false",

  "regenerationHints": {
    "emphasize": "what to emphasize (ENGLISH ONLY!)",
    "add": ["additions in ENGLISH"],
    "remove": ["removals in ENGLISH"]
  }
}

⚠️ CRITICAL: The "regenerationHints" section MUST be in ENGLISH because it's added directly to the image generation prompt!`;

  // Download image and convert to base64
  console.log('[QA-Eval] Downloading image from:', imageUrl.substring(0, 80) + '...');

  let imageResponse: Response;
  try {
    imageResponse = await fetch(imageUrl);
  } catch (fetchError) {
    console.error('[QA-Eval] Failed to fetch image:', fetchError);
    throw new Error(`Failed to fetch image: ${(fetchError as Error).message}`);
  }

  if (!imageResponse.ok) {
    console.error('[QA-Eval] Image fetch failed:', imageResponse.status, imageResponse.statusText);
    throw new Error(`Image fetch failed: ${imageResponse.status} ${imageResponse.statusText}`);
  }

  const imageBuffer = await imageResponse.arrayBuffer();
  const base64Image = Buffer.from(imageBuffer).toString('base64');
  const mediaType = imageResponse.headers.get('content-type') || 'image/webp';

  console.log('[QA-Eval] Image downloaded, size:', imageBuffer.byteLength, 'bytes, type:', mediaType);
  console.log('[QA-Eval] Sending image to Claude Vision...');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: QA_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: userPrompt,
          },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[QA-Eval] API error:', response.status, errorText);
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('[QA-Eval] Response received, stop_reason:', result.stop_reason);

  // Check for content refusal
  if (result.stop_reason === 'end_turn' && result.content) {
    const textContent = result.content.find((c: { type: string }) => c.type === 'text');
    if (textContent?.text?.toLowerCase().includes('cannot') ||
        textContent?.text?.toLowerCase().includes('unable to') ||
        textContent?.text?.toLowerCase().includes('i apologize')) {
      console.error('[QA-Eval] Claude refused to analyze image:', textContent.text.substring(0, 200));
      throw new Error(`Claude refused to analyze: ${textContent.text.substring(0, 150)}`);
    }
  }

  const textContent = result.content?.find((c: { type: string }) => c.type === 'text');

  if (!textContent) {
    console.error('[QA-Eval] No text content in response:', JSON.stringify(result, null, 2));
    throw new Error('No text response from Claude Vision');
  }

  console.log('[QA-Eval] Raw response text:', textContent.text.substring(0, 200) + '...');

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('[QA-Eval] Could not parse JSON from:', textContent.text);
    throw new Error('Could not parse JSON from Claude Vision response');
  }

  const assessment = JSON.parse(jsonMatch[0]) as QualityAssessment;
  console.log('[QA-Eval] Assessment:', {
    essenceScore: assessment.essenceScore,
    APPROVED: assessment.APPROVED,
    failReason: assessment.failReason,
  });

  return assessment;
}

export function shouldApprove(assessment: QualityAssessment, context: SceneQAContext): boolean {
  // 1. Critical elements must be present
  for (const check of assessment.keyElementsCheck) {
    if (check.critical && !check.present) {
      return false;
    }
  }

  // 2. "In action" elements must be in action
  for (let i = 0; i < context.key_elements.length; i++) {
    const sceneEl = context.key_elements[i];
    const checkEl = assessment.keyElementsCheck[i];

    if (sceneEl?.in_action && checkEl?.present && !checkEl?.inAction) {
      return false;
    }
  }

  // 3. Participants must be correct
  if (!assessment.participantsCorrect) {
    return false;
  }

  // 4. No fatal technical flaws
  if (assessment.technicalQuality.fatalFlaws.length > 0) {
    return false;
  }

  // 5. Essence must be captured
  if (!assessment.essenceCaptured || assessment.essenceScore < 6) {
    return false;
  }

  return true;
}
