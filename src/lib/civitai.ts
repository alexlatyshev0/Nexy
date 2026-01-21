import { Civitai, Scheduler } from 'civitai';

interface GenerateImageParams {
  prompt: string;
  negativePrompt?: string;
  modelId?: number;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
}

const DEFAULT_NEGATIVE = "ugly, deformed, noisy, blurry, low quality, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, username, watermark, signature, text, child, underage, minor";

// Truncate prompt to fit CLIP token limit (77 tokens)
// CLIP tokenizer is unpredictable - using 150 chars max to be safe
function truncatePrompt(prompt: string, maxChars: number = 150): string {
  if (prompt.length <= maxChars) return prompt;

  // Try to cut at last comma before limit
  const truncated = prompt.substring(0, maxChars);
  const lastComma = truncated.lastIndexOf(',');

  if (lastComma > maxChars * 0.6) {
    return truncated.substring(0, lastComma).trim();
  }

  // Otherwise cut at last space
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxChars * 0.6) {
    return truncated.substring(0, lastSpace).trim();
  }

  return truncated.trim();
}

// Model ID to AIR URN mapping
// Format: urn:air:{ecosystem}:checkpoint:civitai:{modelId}@{versionId}
const MODEL_VERSIONS: Record<number, string> = {
  // SD 1.5 Models
  4201: 'urn:air:sd1:checkpoint:civitai:4201@130072', // Realistic Vision v5.1

  // SDXL Models - Realistic
  139562: 'urn:air:sdxl:checkpoint:civitai:139562@798204', // RealVisXL V5.0 Lightning
  312530: 'urn:air:sdxl:checkpoint:civitai:312530@2391289', // CyberRealistic XL v8.0
  277058: 'urn:air:sdxl:checkpoint:civitai:277058@2514955', // epiCRealism XL
  299933: 'urn:air:sdxl:checkpoint:civitai:299933@709468', // Halcyon SDXL v1.9
  133005: 'urn:air:sdxl:checkpoint:civitai:133005@357609', // Juggernaut XL
  101055: 'urn:air:sdxl:checkpoint:civitai:101055@351306', // DreamShaper XL
  257749: 'urn:air:sdxl:checkpoint:civitai:257749@290640', // Pony Diffusion XL
  128713: 'urn:air:sdxl:checkpoint:civitai:128713@128713', // SDXL Base 1.0

  // Illustrious Models (anime style) - use sdxl ecosystem as base
  2173364: 'urn:air:sdxl:checkpoint:civitai:2173364@2447441', // CoMix v1.0 (Illustrious)
};

function getModelUrn(modelId: number): string {
  return MODEL_VERSIONS[modelId] || MODEL_VERSIONS[4201];
}

let civitaiClient: Civitai | null = null;

function getClient(): Civitai {
  if (!civitaiClient) {
    if (!process.env.CIVITAI_API_KEY) {
      throw new Error('CIVITAI_API_KEY is not set');
    }
    civitaiClient = new Civitai({ auth: process.env.CIVITAI_API_KEY });
  }
  return civitaiClient;
}

export async function generateWithRetry(
  params: GenerateImageParams,
  maxRetries: number = 3
): Promise<string> {
  const client = getClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[Civitai] Attempt ${attempt + 1}/${maxRetries}`);
      console.log(`[Civitai] Model URN: ${getModelUrn(params.modelId || 4201)}`);

      // Truncate prompts to fit CLIP token limit
      const truncatedPrompt = truncatePrompt(params.prompt);
      const truncatedNegative = truncatePrompt(params.negativePrompt || DEFAULT_NEGATIVE);

      if (truncatedPrompt.length < params.prompt.length) {
        console.log(`[Civitai] Prompt truncated from ${params.prompt.length} to ${truncatedPrompt.length} chars`);
      }

      const input = {
        model: getModelUrn(params.modelId || 4201),
        params: {
          prompt: truncatedPrompt,
          negativePrompt: truncatedNegative,
          scheduler: Scheduler.EULER_A,
          steps: params.steps || 25,
          cfgScale: params.cfgScale || 7,
          width: params.width || 768,
          height: params.height || 512,
          clipSkip: 2,
        },
      };

      console.log(`[Civitai] Sending request...`);
      const response = await client.image.fromText(input);
      console.log(`[Civitai] Got response, token: ${response.token}`);

      // Poll for job completion
      console.log(`[Civitai] Waiting for completion...`);

      const maxWaitTime = 5 * 60 * 1000; // 5 minutes
      const pollInterval = 3000; // 3 seconds
      const startTime = Date.now();

      while (Date.now() - startTime < maxWaitTime) {
        const result = await client.jobs.getByToken(response.token);
        const job = result.jobs?.[0];

        // Result can be an array or object
        const resultData = Array.isArray(job?.result) ? job.result[0] : job?.result;

        console.log(`[Civitai] Poll result - available: ${resultData?.available}, scheduled: ${job?.scheduled}, blobKey: ${resultData?.blobKey ? 'yes' : 'no'}`);

        // Check if job has a result with blobUrl
        if (resultData?.blobUrl) {
          console.log(`[Civitai] Success! Image URL: ${resultData.blobUrl}`);
          return resultData.blobUrl;
        }

        // Check if result is available
        if (resultData?.available === true) {
          // Try alternative paths for getting URL
          if (resultData.images?.[0]?.url) {
            return resultData.images[0].url;
          }
          if (resultData.url) {
            return resultData.url;
          }
          // Construct URL from blobKey if available
          if (resultData.blobKey) {
            const blobUrl = `https://blobs.civitai.com/${resultData.blobKey}`;
            console.log(`[Civitai] Constructed blob URL: ${blobUrl}`);
            return blobUrl;
          }
          console.log(`[Civitai] Job available but no URL found, full result:`, JSON.stringify(resultData, null, 2));
        }

        // Check for errors in lastEvent
        const eventType = job?.lastEvent?.type as string;
        if (eventType === 'Failed' || eventType === 'Error' || eventType === 'REJECTED') {
          throw new Error(`Job failed: ${eventType}`);
        }

        // If job completed (scheduled=false) but blob not yet available
        if (job?.scheduled === false && resultData?.available === false && resultData?.blobKey) {
          // For some models (like Z Image Turbo), available never becomes true
          // Try constructing blob URL directly after a few attempts
          const elapsedTime = Date.now() - startTime;
          if (elapsedTime > 15000) { // After 15 seconds, just try the blobKey
            const blobUrl = `https://blobs.civitai.com/${resultData.blobKey}`;
            console.log(`[Civitai] Blob not available after ${elapsedTime/1000}s, trying direct URL: ${blobUrl}`);
            return blobUrl;
          }
          console.log(`[Civitai] Job completed, waiting for blob to become available...`);
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          continue;
        }

        // If job is still processing, wait and retry
        if (job?.scheduled !== false || !job?.result) {
          console.log(`[Civitai] Job still processing, waiting ${pollInterval/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          continue;
        }

        // Job completed but no URL found and no blobKey
        console.log(`[Civitai] Unexpected response structure:`, JSON.stringify(result, null, 2));
        throw new Error(`No image URL in completed job`);
      }

      throw new Error(`Job timed out after ${maxWaitTime/1000}s`);
    } catch (error) {
      // Extract detailed error info
      const err = error as Error & { response?: { data?: unknown; status?: number } };
      const errorDetails = {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        stack: err.stack?.split('\n').slice(0, 3).join('\n'),
      };
      console.error(`[Civitai] Attempt ${attempt + 1} failed:`, JSON.stringify(errorDetails, null, 2));

      // Create error with full details
      lastError = new Error(`Civitai API error: ${err.message}${err.response?.data ? ` - ${JSON.stringify(err.response.data)}` : ''}`);

      if (attempt < maxRetries - 1) {
        console.log(`[Civitai] Waiting 5s before retry...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  throw lastError || new Error('Generation failed after all retries');
}
