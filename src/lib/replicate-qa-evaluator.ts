/**
 * Replicate-based QA Evaluator using LLaVA
 * Alternative to Claude Vision for NSFW content evaluation
 */

import Replicate from 'replicate';
import { QualityAssessment, SceneQAContext, KeyElementCheck } from './qa-evaluator';

// LLaVA 13B - good balance of quality and speed
const LLAVA_MODEL = 'yorickvp/llava-13b:80537f9eead1a5bfa72d5ac6ea6414379be41d4d4f6679fd776e9535d1eb58bb';

let replicateClient: Replicate | null = null;

function getClient(): Replicate {
  if (!replicateClient) {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not set');
    }
    replicateClient = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }
  return replicateClient;
}

/**
 * Build evaluation prompt for LLaVA
 * LLaVA works better with simpler, direct prompts
 */
function buildEvaluationPrompt(context: SceneQAContext): string {
  const keyElementsText = context.key_elements.map(el => {
    let line = `- ${el.element}`;
    if (el.critical) line += ' (CRITICAL - must be present)';
    if (el.in_action) line += ' (must be actively shown/in use)';
    return line;
  }).join('\n');

  return `Analyze this image and answer these questions:

SCENE REQUIREMENTS:
- Essence: ${context.essence}
- Expected participants: ${context.participants.count} people (${context.participants.genders.join(', ')})
- Mood: ${context.mood}

KEY ELEMENTS TO CHECK:
${keyElementsText}

Please evaluate:
1. Does the image capture the essence described? (score 1-10)
2. Are all key elements present and correctly shown?
3. Is the number of people correct?
4. Are the genders correct?
5. Any anatomical issues? (wrong number of fingers, deformed body parts, etc.)
6. Does the mood match?

Respond in this exact JSON format:
{
  "essenceScore": <1-10>,
  "essenceComment": "<why this score>",
  "elementsPresent": [<list of elements that ARE present>],
  "elementsMissing": [<list of elements that are MISSING>],
  "participantCount": <number seen>,
  "gendersCorrect": <true/false>,
  "anatomyIssues": [<list any issues or empty array>],
  "moodMatch": <true/false>,
  "overallPass": <true/false>,
  "failReason": "<reason if overallPass is false, otherwise null>",
  "suggestions": [<suggestions to improve the prompt>]
}`;
}

/**
 * Parse LLaVA response into QualityAssessment
 */
function parseResponse(
  response: string,
  context: SceneQAContext
): QualityAssessment {
  // Try to extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error('[Replicate-QA] Could not parse JSON from response:', response);
    // Return failed assessment
    return {
      essenceCaptured: false,
      essenceScore: 0,
      essenceComment: 'Failed to parse LLaVA response',
      keyElementsCheck: context.key_elements.map(el => ({
        element: el.element,
        present: false,
        inAction: null,
        critical: el.critical,
        comment: 'Could not evaluate',
      })),
      participantsCorrect: false,
      participantsComment: 'Could not evaluate',
      technicalQuality: {
        score: 0,
        fatalFlaws: ['Failed to parse evaluation response'],
        minorIssues: [],
      },
      moodMatch: false,
      APPROVED: false,
      failReason: 'Failed to parse LLaVA response',
      regenerationHints: {
        emphasize: '',
        add: [],
        remove: [],
      },
    };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    // Build key elements check
    const keyElementsCheck: KeyElementCheck[] = context.key_elements.map(el => {
      const isPresent = parsed.elementsPresent?.some(
        (p: string) => p.toLowerCase().includes(el.element.toLowerCase())
      ) || false;
      const isMissing = parsed.elementsMissing?.some(
        (m: string) => m.toLowerCase().includes(el.element.toLowerCase())
      ) || false;

      return {
        element: el.element,
        present: isPresent && !isMissing,
        inAction: el.in_action ? isPresent : null,
        critical: el.critical,
      };
    });

    // Check if critical elements are missing
    const criticalMissing = keyElementsCheck.filter(
      el => el.critical && !el.present
    );

    // Check participants
    const participantsCorrect =
      parsed.participantCount === context.participants.count &&
      parsed.gendersCorrect !== false;

    // Build anatomy issues
    const anatomyIssues = parsed.anatomyIssues || [];
    const hasFatalAnatomyIssues = anatomyIssues.some((issue: string) =>
      issue.toLowerCase().includes('finger') ||
      issue.toLowerCase().includes('hand') ||
      issue.toLowerCase().includes('deform') ||
      issue.toLowerCase().includes('extra') ||
      issue.toLowerCase().includes('missing')
    );

    // Determine if approved
    const essenceScore = parsed.essenceScore || 0;
    const approved =
      parsed.overallPass === true &&
      essenceScore >= 6 &&
      criticalMissing.length === 0 &&
      participantsCorrect &&
      !hasFatalAnatomyIssues;

    // Build regeneration hints from suggestions
    const suggestions = parsed.suggestions || [];
    const emphasize = suggestions.length > 0 ? suggestions[0] : '';
    const add = suggestions.slice(1, 3);

    return {
      essenceCaptured: essenceScore >= 6,
      essenceScore,
      essenceComment: parsed.essenceComment || '',
      keyElementsCheck,
      participantsCorrect,
      participantsComment: !participantsCorrect
        ? `Expected ${context.participants.count} (${context.participants.genders.join(', ')}), saw ${parsed.participantCount || 'unknown'}`
        : undefined,
      technicalQuality: {
        score: hasFatalAnatomyIssues ? 3 : 7,
        fatalFlaws: anatomyIssues.filter((i: string) =>
          i.toLowerCase().includes('finger') ||
          i.toLowerCase().includes('deform')
        ),
        minorIssues: anatomyIssues.filter((i: string) =>
          !i.toLowerCase().includes('finger') &&
          !i.toLowerCase().includes('deform')
        ),
      },
      moodMatch: parsed.moodMatch !== false,
      APPROVED: approved,
      failReason: approved ? undefined : (parsed.failReason || 'Did not meet quality requirements'),
      regenerationHints: {
        emphasize,
        add,
        remove: parsed.elementsMissing?.slice(0, 2) || [],
      },
    };
  } catch (parseError) {
    console.error('[Replicate-QA] JSON parse error:', parseError);
    return {
      essenceCaptured: false,
      essenceScore: 0,
      essenceComment: `Parse error: ${(parseError as Error).message}`,
      keyElementsCheck: [],
      participantsCorrect: false,
      technicalQuality: {
        score: 0,
        fatalFlaws: ['Failed to parse response'],
        minorIssues: [],
      },
      moodMatch: false,
      APPROVED: false,
      failReason: `Parse error: ${(parseError as Error).message}`,
      regenerationHints: {
        emphasize: '',
        add: [],
        remove: [],
      },
    };
  }
}

/**
 * Evaluate image using Replicate LLaVA
 */
export async function evaluateImageWithReplicate(
  imageUrl: string,
  context: SceneQAContext
): Promise<QualityAssessment> {
  const client = getClient();

  console.log('[Replicate-QA] Evaluating image:', imageUrl.substring(0, 80) + '...');
  console.log('[Replicate-QA] Context essence:', context.essence);

  const prompt = buildEvaluationPrompt(context);

  try {
    const output = await client.run(LLAVA_MODEL as `${string}/${string}:${string}`, {
      input: {
        image: imageUrl,
        prompt: prompt,
        max_tokens: 1024,
        temperature: 0.2, // Low temperature for consistent structured output
      },
    });

    // LLaVA returns text output
    let responseText = '';

    if (typeof output === 'string') {
      responseText = output;
    } else if (Array.isArray(output)) {
      responseText = output.join('');
    } else if (output && typeof output === 'object' && Symbol.asyncIterator in output) {
      // Handle async iterator
      for await (const chunk of output as AsyncIterable<string>) {
        responseText += chunk;
      }
    } else {
      responseText = String(output);
    }

    console.log('[Replicate-QA] Raw response:', responseText.substring(0, 500) + '...');

    const assessment = parseResponse(responseText, context);

    console.log('[Replicate-QA] Assessment:', {
      essenceScore: assessment.essenceScore,
      APPROVED: assessment.APPROVED,
      failReason: assessment.failReason,
    });

    return assessment;
  } catch (error) {
    console.error('[Replicate-QA] Error:', error);
    throw new Error(`Replicate QA evaluation failed: ${(error as Error).message}`);
  }
}

/**
 * Check if should approve based on assessment
 * Same logic as Claude evaluator
 */
export function shouldApproveReplicate(
  assessment: QualityAssessment,
  context: SceneQAContext
): boolean {
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
