import Replicate from 'replicate';

interface GenerateImageParams {
  prompt: string;
  negativePrompt?: string;
  modelId: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  // Img2img parameters
  sourceImage?: string; // URL or base64 of source image
  strength?: number; // 0-1, how much to deviate from source (default 0.7)
}

// Replicate models mapping
export const REPLICATE_MODELS: Record<string, { name: string; version: string; category?: string }> = {
  // === PONY MODELS (best for yaoi/bara, anime style) ===
  'pony-xl': {
    name: 'Prefect Pony XL v5 (best yaoi/bara)',
    version: 'aisha-ai-official/prefect-pony-xl-v5:7c724e0565055883c00dec19086e06023115737ad49cf3525f1058743769e5bf',
    category: 'pony',
  },
  'pony-realism': {
    name: 'Pony Realism (realistic pony)',
    version: 'charlesmccarthy/pony-sdxl:b070dedae81324788c3c933a5d9e1270093dc74636214b9815dae044b4b3a58a',
    category: 'pony',
  },

  // === ILLUSTRIOUS MODELS (anime/illustration style) ===
  'wai-illustrious-v12': {
    name: 'WAI NSFW Illustrious v12 (newest)',
    version: 'aisha-ai-official/wai-nsfw-illustrious-v12:0fc0fa9885b284901a6f9c0b4d67701fd7647d157b88371427d63f8089ce140e',
    category: 'illustrious',
  },
  'wai-illustrious': {
    name: 'WAI NSFW Illustrious v11',
    version: 'aisha-ai-official/wai-nsfw-illustrious-v11:c1d5b02687df6081c7953c74bcc527858702e8c153c9382012ccc3906752d3ec',
    category: 'illustrious',
  },
  'noobai-xl': {
    name: 'NoobAI XL (Illustrious)',
    version: 'delta-lock/noobai-xl:d09db5fc24b8b6573b095c2bd845b58242dce8f996b034fa865130bf1075858f',
    category: 'illustrious',
  },

  // === ANIME MODELS ===
  'animagine-xl': {
    name: 'Animagine XL 3.1 (best anime)',
    version: 'cjwbw/animagine-xl-3.1:6afe2e6b27dad2db86df2d0ef3bb5f174d42cb64009eb84fa8bc0d5a5ab515ea',
    category: 'anime',
  },
  'sdxl-niji': {
    name: 'SDXL Niji SE (anime)',
    version: 'lucataco/sdxl-niji-se:a3652ec3d6e7e1a3c80c43a51f6dd0f67e6cb6d13ede15c78c53d8b234e7e86d',
    category: 'anime',
  },

  // === REALISTIC MODELS ===
  'dreamshaper-xl': {
    name: 'DreamShaper XL Turbo (versatile)',
    version: 'lucataco/dreamshaper-xl-turbo:0a1710e0187b01a255302738ca0158ff02a22f4638679533e111082f9dd1b615',
    category: 'realistic',
  },
  'realistic-vision': {
    name: 'Realistic Vision v5.1',
    version: 'lucataco/realistic-vision-v5.1:2c8e954decbf70b7607a4414e5785ef9e4de4b8c51d50fb8b8b349160e0ef6bb',
    category: 'realistic',
  },
  'juggernaut': {
    name: 'Juggernaut XL v9',
    version: 'lucataco/juggernaut-xl-v9:bea09cf018e513cef0841719559ea86d2299e05448633ac8fe270b5d5cd6777e',
    category: 'realistic',
  },

  // === FAST MODELS ===
  'z-image-turbo': {
    name: 'Z Image Turbo (super fast)',
    version: 'prunaai/z-image-turbo',
    category: 'fast',
  },
  'sdxl-lightning': {
    name: 'SDXL Lightning 4-step',
    version: 'bytedance/sdxl-lightning-4step:5f24084160c9089501c1b3545d9be3c27883ae2239b6f412990e82d4a6210f8f',
    category: 'fast',
  },

  // === FLUX MODELS (high quality) ===
  'flux-schnell': {
    name: 'FLUX Schnell (fast)',
    version: 'black-forest-labs/flux-schnell',
    category: 'flux',
  },
  'flux-dev': {
    name: 'FLUX Dev',
    version: 'black-forest-labs/flux-dev',
    category: 'flux',
  },
  'flux-pro': {
    name: 'FLUX Pro (best quality)',
    version: 'black-forest-labs/flux-1.1-pro',
    category: 'flux',
  },

  // === BASE SDXL ===
  'sdxl': {
    name: 'SDXL Base',
    version: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
    category: 'sdxl',
  },
};

// Truncate prompt to fit CLIP token limit (77 tokens)
// CLIP tokenizer is unpredictable - some words take 2-3 tokens
// Using 150 chars max to stay well under 77 tokens
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

export async function generateWithReplicate(
  params: GenerateImageParams
): Promise<string> {
  const client = getClient();
  const modelConfig = REPLICATE_MODELS[params.modelId];

  if (!modelConfig) {
    throw new Error(`Unknown Replicate model: ${params.modelId}`);
  }

  const isImg2Img = !!params.sourceImage;
  const strength = params.strength ?? 0.7;

  // Truncate prompt to avoid CLIP token limit (77 tokens)
  const truncatedPrompt = truncatePrompt(params.prompt);
  const truncatedNegative = params.negativePrompt ? truncatePrompt(params.negativePrompt) : '';

  console.log(`[Replicate] Starting generation with model: ${modelConfig.name}`);
  console.log(`[Replicate] Mode: ${isImg2Img ? `img2img (strength: ${strength})` : 'txt2img'}`);
  console.log(`[Replicate] Prompt (${truncatedPrompt.length} chars): ${truncatedPrompt.substring(0, 100)}...`);
  if (truncatedPrompt.length < params.prompt.length) {
    console.log(`[Replicate] Prompt truncated from ${params.prompt.length} to ${truncatedPrompt.length} chars`);
  }
  if (params.negativePrompt) {
    console.log(`[Replicate] Negative: ${params.negativePrompt}`);
  }

  try {
    let input: Record<string, unknown>;

    if (params.modelId === 'z-image-turbo') {
      // Z Image Turbo: 8 steps, guidance 0 - NO img2img support
      if (isImg2Img) {
        throw new Error('Z Image Turbo does not support img2img');
      }
      input = {
        prompt: truncatedPrompt,
        negative_prompt: truncatedNegative,
        width: params.width || 1024,
        height: params.height || 1024,
        num_inference_steps: 8,
        guidance_scale: 0,
      };
    } else if (params.modelId.startsWith('flux')) {
      // FLUX models use aspect_ratio and prompt_strength for img2img (no token limit)
      input = {
        prompt: params.prompt, // FLUX uses T5, no 77 token limit
        negative_prompt: params.negativePrompt || undefined,
        aspect_ratio: params.aspectRatio || '3:2',
        output_format: 'webp',
        output_quality: 90,
      };
      if (isImg2Img) {
        input.image = params.sourceImage;
        input.prompt_strength = strength; // FLUX uses prompt_strength instead of strength
      }
    } else if (params.modelId === 'sdxl-lightning') {
      // SDXL Lightning: 4 steps - supports img2img
      input = {
        prompt: truncatedPrompt,
        negative_prompt: truncatedNegative,
        width: params.width || 1024,
        height: params.height || 768,
        num_outputs: 1,
        scheduler: 'K_EULER',
        num_inference_steps: 4,
        guidance_scale: 0,
      };
      if (isImg2Img) {
        input.image = params.sourceImage;
        input.strength = strength;
      }
    } else if (params.modelId === 'pony-xl' || params.modelId === 'pony-realism') {
      // Pony models - great for yaoi/bara with booru tags
      input = {
        prompt: truncatedPrompt,
        negative_prompt: truncatedNegative,
        width: params.width || 1024,
        height: params.height || 1024,
        num_outputs: 1,
        scheduler: 'Euler a',
        num_inference_steps: 25,
        guidance_scale: isImg2Img ? 4 : 7,
      };
      if (isImg2Img) {
        input.image = params.sourceImage;
        input.strength = strength;
      }
    } else if (params.modelId === 'noobai-xl') {
      // NoobAI XL (Illustrious) - lower guidance for img2img
      input = {
        prompt: truncatedPrompt,
        negative_prompt: truncatedNegative,
        width: params.width || 1024,
        height: params.height || 768,
        num_outputs: 1,
        scheduler: 'Euler a',
        num_inference_steps: 25,
        guidance_scale: isImg2Img ? 4 : 7, // Lower guidance for img2img
      };
      if (isImg2Img) {
        input.image = params.sourceImage;
        input.strength = strength;
      }
    } else if (params.modelId === 'wai-illustrious' || params.modelId === 'wai-illustrious-v12') {
      // WAI Illustrious - lower guidance for img2img to preserve source better
      input = {
        prompt: truncatedPrompt,
        negative_prompt: truncatedNegative,
        width: params.width || 1024,
        height: params.height || 768,
        num_outputs: 1,
        scheduler: 'DPM++ 2M Karras',
        num_inference_steps: 28,
        guidance_scale: isImg2Img ? 4 : 7, // Lower guidance for img2img
      };
      if (isImg2Img) {
        input.image = params.sourceImage;
        input.strength = strength;
      }
    } else if (params.modelId === 'realistic-vision') {
      // Realistic Vision v5.1 - lower guidance for img2img
      input = {
        prompt: truncatedPrompt,
        negative_prompt: truncatedNegative,
        width: params.width || 1024,
        height: params.height || 768,
        num_outputs: 1,
        scheduler: 'EulerA',
        num_inference_steps: 25,
        guidance_scale: isImg2Img ? 4 : 7,
      };
      if (isImg2Img) {
        input.image = params.sourceImage;
        input.strength = strength;
      }
    } else if (params.modelId === 'juggernaut' || params.modelId === 'dreamshaper-xl') {
      // Juggernaut XL / DreamShaper XL - lower guidance for img2img
      input = {
        prompt: truncatedPrompt,
        negative_prompt: truncatedNegative,
        width: params.width || 1024,
        height: params.height || 768,
        num_outputs: 1,
        scheduler: 'K_EULER',
        num_inference_steps: params.modelId === 'dreamshaper-xl' ? 6 : 30, // DreamShaper Turbo uses fewer steps
        guidance_scale: isImg2Img ? 4 : 7,
      };
      if (isImg2Img) {
        input.image = params.sourceImage;
        input.strength = strength;
      }
    } else if (params.modelId === 'animagine-xl' || params.modelId === 'sdxl-niji') {
      // Anime models (Animagine, Niji)
      input = {
        prompt: truncatedPrompt,
        negative_prompt: truncatedNegative,
        width: params.width || 1024,
        height: params.height || 768,
        num_outputs: 1,
        scheduler: 'Euler a',
        num_inference_steps: 25,
        guidance_scale: isImg2Img ? 5 : 7,
      };
      if (isImg2Img) {
        input.image = params.sourceImage;
        input.strength = strength;
      }
    } else {
      // Standard SDXL models - lower guidance for img2img
      input = {
        prompt: truncatedPrompt,
        negative_prompt: truncatedNegative,
        width: params.width || 1024,
        height: params.height || 768,
        num_outputs: 1,
        scheduler: 'K_EULER',
        num_inference_steps: 25,
        guidance_scale: isImg2Img ? 4 : 7,
      };
      if (isImg2Img) {
        input.image = params.sourceImage;
        input.strength = strength;
      }
    }

    console.log(`[Replicate] Running model: ${modelConfig.version}`);

    let output: unknown = await client.run(modelConfig.version as `${string}/${string}:${string}`, {
      input,
    });

    console.log(`[Replicate] Raw output:`, output);
    console.log(`[Replicate] Output type:`, typeof output);

    // Handle ReadableStream - model returns binary image data directly
    if (output && typeof output === 'object' && 'getReader' in output) {
      console.log(`[Replicate] Output is ReadableStream, collecting binary data...`);
      const reader = (output as ReadableStream<Uint8Array>).getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }

      console.log(`[Replicate] Collected ${chunks.length} binary chunks`);

      // Combine chunks into single buffer
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      console.log(`[Replicate] Combined image size: ${combined.length} bytes`);

      // Convert to base64 data URL
      const base64 = Buffer.from(combined).toString('base64');
      // Detect image type from magic bytes
      let mimeType = 'image/jpeg';
      if (combined[0] === 0x89 && combined[1] === 0x50) {
        mimeType = 'image/png';
      } else if (combined[0] === 0x52 && combined[1] === 0x49) {
        mimeType = 'image/webp';
      }

      const dataUrl = `data:${mimeType};base64,${base64}`;
      console.log(`[Replicate] Created data URL (${mimeType}), length: ${dataUrl.length}`);
      return dataUrl;
    }

    // Handle async iterator
    if (output && typeof output === 'object' && Symbol.asyncIterator in output) {
      console.log(`[Replicate] Output is async iterator, collecting...`);
      const results: unknown[] = [];
      for await (const item of output as AsyncIterable<unknown>) {
        results.push(item);
      }
      console.log(`[Replicate] Collected ${results.length} results:`, results);
      output = results.length === 1 ? results[0] : results;
    }

    // Helper to extract URL from various output formats
    const extractUrl = (item: unknown): string | null => {
      if (typeof item === 'string') {
        return item;
      }
      if (item && typeof item === 'object') {
        // FileOutput objects have url() method
        if ('url' in item && typeof (item as { url: () => string }).url === 'function') {
          return (item as { url: () => string }).url();
        }
        // Some outputs have url as property
        if ('url' in item && typeof (item as { url: string }).url === 'string') {
          return (item as { url: string }).url;
        }
        // Try toString() which works for FileOutput
        const str = String(item);
        if (str.startsWith('http')) {
          return str;
        }
      }
      return null;
    };

    let imageUrl: string | null = null;

    if (Array.isArray(output) && output.length > 0) {
      imageUrl = extractUrl(output[0]);
    } else {
      imageUrl = extractUrl(output);
    }

    if (!imageUrl) {
      throw new Error('No image URL in Replicate response');
    }

    console.log(`[Replicate] Success! Image URL: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error('[Replicate] Error:', error);
    throw error;
  }
}
