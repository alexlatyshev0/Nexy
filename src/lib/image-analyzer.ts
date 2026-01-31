/**
 * Image Analyzer using Replicate LLaVA
 * Analyzes erotic/intimate images and extracts structured data for scene matching
 */

import Replicate from 'replicate';

// LLaVA 13B - good balance of quality and speed, NSFW-safe
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

export interface ImageAnalysis {
  participants: { count: number; genders: string[] };
  activity: string;
  keywords: string[];
  mood: string;
  setting: string;
  elements: string[];
}

const ANALYSIS_PROMPT = `Analyze this erotic/intimate image and describe what you see. Focus on:
1. Number of people and their genders (male/female)
2. What activity is happening (kissing, oral sex, bondage, massage, touching, etc.)
3. Body positions and how people are interacting
4. Setting/environment (bedroom, outdoor, bathroom, etc.)
5. Overall mood (romantic, dominant, playful, passionate, gentle, rough, etc.)
6. Notable elements (toys, restraints, lingerie, specific clothing, etc.)

Respond ONLY with a JSON object in this exact format:
{
  "participants": { "count": 2, "genders": ["male", "female"] },
  "activity": "brief description of main activity",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "mood": "one or two words describing the mood",
  "setting": "where this takes place",
  "elements": ["notable element 1", "notable element 2"]
}

Keywords should be specific action/activity words like: kissing, oral, blowjob, cunnilingus, bondage, spanking, massage, foreplay, penetration, anal, fingering, masturbation, domination, submission, roleplay, etc.`;

/**
 * Analyze an image and extract structured data for scene matching
 */
export async function analyzeImage(imageUrl: string): Promise<ImageAnalysis> {
  const client = getClient();

  console.log('[Image-Analyzer] Analyzing image:', imageUrl.substring(0, 80) + '...');

  try {
    const output = await client.run(LLAVA_MODEL as `${string}/${string}:${string}`, {
      input: {
        image: imageUrl,
        prompt: ANALYSIS_PROMPT,
        max_tokens: 1024,
        temperature: 0.3, // Low temperature for consistent structured output
      },
    });

    // Handle different output types from Replicate
    let responseText = '';

    if (typeof output === 'string') {
      responseText = output;
    } else if (Array.isArray(output)) {
      responseText = output.join('');
    } else if (output && typeof output === 'object' && Symbol.asyncIterator in output) {
      for await (const chunk of output as AsyncIterable<string>) {
        responseText += chunk;
      }
    } else {
      responseText = String(output);
    }

    console.log('[Image-Analyzer] Raw response:', responseText.substring(0, 300) + '...');

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Image-Analyzer] Could not find JSON in response:', responseText);
      throw new Error('Could not parse LLaVA response - no JSON found');
    }

    let analysis: ImageAnalysis;
    try {
      analysis = JSON.parse(jsonMatch[0]) as ImageAnalysis;
    } catch (parseError) {
      // Try to fix common JSON issues
      console.warn('[Image-Analyzer] JSON parse failed, attempting to fix...', (parseError as Error).message);
      let fixedJson = jsonMatch[0]
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Fix unquoted keys
        .replace(/:\s*'([^']*)'/g, ': "$1"'); // Replace single quotes with double quotes

      try {
        analysis = JSON.parse(fixedJson) as ImageAnalysis;
        console.log('[Image-Analyzer] Successfully fixed and parsed JSON');
      } catch (secondError) {
        console.error('[Image-Analyzer] Could not fix JSON:', fixedJson.substring(0, 200));
        throw new Error(`Could not parse LLaVA response: ${(parseError as Error).message}`);
      }
    }

    // Validate and normalize the response
    const normalized: ImageAnalysis = {
      participants: {
        count: analysis.participants?.count || 1,
        genders: Array.isArray(analysis.participants?.genders) ? analysis.participants.genders : [],
      },
      activity: analysis.activity || 'unknown activity',
      keywords: Array.isArray(analysis.keywords) ? analysis.keywords : [],
      mood: analysis.mood || 'unknown',
      setting: analysis.setting || 'unknown',
      elements: Array.isArray(analysis.elements) ? analysis.elements : [],
    };

    console.log('[Image-Analyzer] Analysis result:', {
      participants: normalized.participants,
      activity: normalized.activity,
      keywords: normalized.keywords,
      mood: normalized.mood,
    });

    return normalized;
  } catch (error) {
    console.error('[Image-Analyzer] Error:', error);
    throw new Error(`Image analysis failed: ${(error as Error).message}`);
  }
}
