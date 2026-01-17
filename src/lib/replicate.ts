import Replicate from 'replicate';

interface GenerateImageParams {
  prompt: string;
  negativePrompt?: string;
  modelId: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
}

// Replicate models mapping
export const REPLICATE_MODELS: Record<string, { name: string; version: string }> = {
  'z-image-turbo': {
    name: 'Z Image Turbo (super fast)',
    version: 'prunaai/z-image-turbo',
  },
  'flux-schnell': {
    name: 'FLUX Schnell (fast)',
    version: 'black-forest-labs/flux-schnell',
  },
  'flux-dev': {
    name: 'FLUX Dev',
    version: 'black-forest-labs/flux-dev',
  },
  'flux-pro': {
    name: 'FLUX Pro',
    version: 'black-forest-labs/flux-1.1-pro',
  },
  'sdxl-lightning': {
    name: 'SDXL Lightning (fast)',
    version: 'bytedance/sdxl-lightning-4step:5f24084160c9089501c1b3545d9be3c27883ae2239b6f412990e82d4a6210f8f',
  },
  'sdxl': {
    name: 'SDXL',
    version: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
  },
  'realistic-vision': {
    name: 'Realistic Vision v5.1',
    version: 'lucataco/realistic-vision-v5.1:2c8e954decbf70b7607a4414e5785ef9e4de4b8c51d50fb8b8b349160e0ef6bb',
  },
  'juggernaut': {
    name: 'Juggernaut XL',
    version: 'lucataco/juggernaut-xl-v9:bea09cf018e513cef0841719559ea86d2299e05448633ac8fe270b5d5cd6777e',
  },
};

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

  console.log(`[Replicate] Starting generation with model: ${modelConfig.name}`);
  console.log(`[Replicate] Prompt: ${params.prompt.substring(0, 100)}...`);
  if (params.negativePrompt) {
    console.log(`[Replicate] Negative: ${params.negativePrompt}`);
  }

  try {
    let input: Record<string, unknown>;

    if (params.modelId === 'z-image-turbo') {
      // Z Image Turbo: 8 steps, guidance 0
      // Best at 1024x1024, but can use other sizes
      input = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || '',
        width: params.width || 1024,
        height: params.height || 1024,
        num_inference_steps: 8,
        guidance_scale: 0,
      };
    } else if (params.modelId.startsWith('flux')) {
      // FLUX models use aspect_ratio instead of width/height
      // Note: Some FLUX models don't support negative_prompt, but we send it anyway
      input = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || undefined,
        aspect_ratio: params.aspectRatio || '3:2',
        output_format: 'webp',
        output_quality: 90,
      };
    } else if (params.modelId === 'sdxl-lightning') {
      // SDXL Lightning: 4 steps
      input = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || '',
        width: params.width || 1024,
        height: params.height || 768,
        num_outputs: 1,
        scheduler: 'K_EULER',
        num_inference_steps: 4,
        guidance_scale: 0,
      };
    } else {
      // Standard SDXL models
      input = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || '',
        width: params.width || 1024,
        height: params.height || 768,
        num_outputs: 1,
        scheduler: 'K_EULER',
        num_inference_steps: 25,
        guidance_scale: 7,
      };
    }

    console.log(`[Replicate] Running model: ${modelConfig.version}`);

    let output = await client.run(modelConfig.version as `${string}/${string}:${string}`, {
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
