import OpenAI from 'openai';
import type { Scene, UserContext, GeneratedQuestion } from './types';
import { flattenObject } from './utils/object';

// Re-export for backwards compatibility
export { flattenObject };

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateQuestion(
  scene: Scene,
  user: UserContext
): Promise<GeneratedQuestion> {
  const prompt = `
Ты генерируешь вопросы для исследования сексуальных предпочтений.

СЦЕНА:
${scene.ai_description?.ru || scene.ai_description?.en || ''}

Участники:
${JSON.stringify(scene.participants)}

Измерения: ${scene.dimensions.join(', ')}

ПОЛЬЗОВАТЕЛЬ:
- Пол: ${user.gender}
- Интересует: ${user.interestedIn}
- Уже известно: ${JSON.stringify(user.knownPreferences)}

ЗАДАЧА:
Сгенерируй вопрос который поможет понять отношение к этой сцене.

ПРАВИЛА:
1. Учитывай пол пользователя:
   - Если ${user.gender === 'male' ? 'мужчина' : 'женщина'} смотрит на сцену с ${user.gender === 'male' ? 'мужчиной' : 'женщиной'} в определённой роли → предложи идентификацию с этой ролью

2. Типы вопросов:
   - 'scale': для измерения интенсивности желания (0-100)
   - 'multiple_choice': когда важно понять ЧТО именно привлекает (до 6 опций)
   - 'trinary': быстрый ответ да/может/нет (для свиданий)

3. Формулировка:
   - Прямо, без эвфемизмов
   - От второго лица ("тебе", "ты бы хотел")
   - Конкретно про сцену

ФОРМАТ ОТВЕТА (JSON):
{
  "question": "текст вопроса",
  "answerType": "scale" | "multiple_choice" | "trinary",
  "scaleLabels": { "min": "...", "max": "..." },
  "options": [{ "id": "...", "text": "...", "dimension": "..." }],
  "targetDimensions": ["dimension.subdimension", ...]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates questions for an intimate discovery app. Always respond with valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    return JSON.parse(content) as GeneratedQuestion;
  } catch (error) {
    console.error('AI question generation error:', error);
    // Fallback question
    return {
      question: `Насколько тебе интересна эта сцена?`,
      answerType: 'scale',
      scaleLabels: { min: 'Не привлекает', max: 'Очень хочу' },
      targetDimensions: scene.dimensions,
    };
  }
}

export function extractHighInterest(
  preferences: Record<string, unknown>,
  threshold = 60
): string[] {
  const flat = flattenObject(preferences);
  const dimensions: string[] = [];

  for (const [key, value] of Object.entries(flat)) {
    if (typeof value === 'number' && value >= threshold) {
      // Extract the base dimension (e.g., 'bondage' from 'bondage.receiving.value')
      const baseDim = key.split('.')[0];
      if (!dimensions.includes(baseDim)) {
        dimensions.push(baseDim);
      }
    }
    if (
      value &&
      typeof value === 'object' &&
      'value' in (value as Record<string, unknown>) &&
      typeof (value as Record<string, unknown>).value === 'number' &&
      ((value as Record<string, unknown>).value as number) >= threshold
    ) {
      const baseDim = key.split('.')[0];
      if (!dimensions.includes(baseDim)) {
        dimensions.push(baseDim);
      }
    }
  }

  return dimensions;
}

export async function generateChatResponse(
  messages: { role: 'user' | 'assistant'; content: string }[],
  userContext: UserContext
): Promise<string> {
  const systemPrompt = `
Ты дружелюбный AI-ассистент в приложении Intimate Discovery.
Ты помогаешь пользователям исследовать свои сексуальные предпочтения.

О пользователе:
- Пол: ${userContext.gender}
- Интересует: ${userContext.interestedIn}
- Известные предпочтения: ${JSON.stringify(userContext.knownPreferences)}

Правила:
1. Будь открытым и не осуждай
2. Говори прямо, без лишних эвфемизмов
3. Помогай понять себя лучше
4. Не давай медицинских советов
5. Отвечай на русском языке
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || 'Извини, не могу ответить сейчас.';
  } catch (error) {
    console.error('AI chat error:', error);
    return 'Произошла ошибка. Попробуй ещё раз.';
  }
}
