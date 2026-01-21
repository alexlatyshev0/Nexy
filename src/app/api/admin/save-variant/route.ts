import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for admin operations (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ImageVariant {
  url: string;
  prompt: string;
  created_at: string;
  qa_status?: 'passed' | 'failed' | null;
  qa_score?: number;
}

export async function POST(req: Request) {
  try {
    // Read body once at the beginning
    const body = await req.json();
    const { sceneId, action, variantUrl, imageUrl, prompt } = body;

    if (!sceneId) {
      return NextResponse.json({ error: 'Missing sceneId' }, { status: 400 });
    }

    // Get current scene
    const { data: scene, error: selectError } = await supabase
      .from('scenes')
      .select('image_url, generation_prompt, image_variants, qa_status, qa_last_assessment')
      .eq('id', sceneId)
      .single();

    if (selectError || !scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    // Action: save - Save specified image to variants
    if (action === 'save') {
      // Use imageUrl from request if provided, otherwise fall back to DB
      const urlToSave = imageUrl || scene.image_url;
      const promptToSave = prompt || scene.generation_prompt || '';

      if (!urlToSave) {
        return NextResponse.json({ error: 'No image to save' }, { status: 400 });
      }

      const currentVariants: ImageVariant[] = scene.image_variants || [];

      // Check if this exact URL is already saved
      if (currentVariants.some(v => v.url === urlToSave)) {
        return NextResponse.json({
          success: true,
          message: 'Image already saved as variant',
          variants: currentVariants
        });
      }

      // Create new variant from specified image
      const newVariant: ImageVariant = {
        url: urlToSave,
        prompt: promptToSave,
        created_at: new Date().toISOString(),
        qa_status: scene.qa_status || null,
        qa_score: (scene.qa_last_assessment as { essenceScore?: number })?.essenceScore,
      };

      const updatedVariants = [...currentVariants, newVariant];

      // Update scene with new variants array
      const { error: updateError } = await supabase
        .from('scenes')
        .update({ image_variants: updatedVariants })
        .eq('id', sceneId);

      if (updateError) {
        console.error('[SaveVariant] Update error:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Image saved as variant',
        variants: updatedVariants,
      });
    }

    // Action: select - Select a variant as the main image
    if (action === 'select') {
      if (!variantUrl) {
        return NextResponse.json({ error: 'Missing variantUrl' }, { status: 400 });
      }

      const currentVariants: ImageVariant[] = scene.image_variants || [];
      const selectedVariant = currentVariants.find(v => v.url === variantUrl);

      if (!selectedVariant) {
        return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
      }

      // Set selected variant as main image
      const { error: updateError } = await supabase
        .from('scenes')
        .update({
          image_url: selectedVariant.url,
          // Optionally restore the prompt that was used for this image
          // generation_prompt: selectedVariant.prompt,
        })
        .eq('id', sceneId);

      if (updateError) {
        console.error('[SaveVariant] Update error:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Variant selected as main image',
        selectedUrl: selectedVariant.url,
      });
    }

    // Action: delete - Remove a variant
    if (action === 'delete') {
      if (!variantUrl) {
        return NextResponse.json({ error: 'Missing variantUrl' }, { status: 400 });
      }

      const currentVariants: ImageVariant[] = scene.image_variants || [];
      const updatedVariants = currentVariants.filter(v => v.url !== variantUrl);

      const { error: updateError } = await supabase
        .from('scenes')
        .update({ image_variants: updatedVariants })
        .eq('id', sceneId);

      if (updateError) {
        console.error('[SaveVariant] Update error:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Variant deleted',
        variants: updatedVariants,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[SaveVariant] Exception:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
