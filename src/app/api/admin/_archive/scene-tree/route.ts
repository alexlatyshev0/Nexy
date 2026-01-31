import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: scenes, error } = await supabase
      .from('scenes')
      .select(`
        id,
        slug,
        title,
        category,
        is_active,
        elements,
        image_url,
        image_variants,
        paired_with,
        shared_images_with,
        role_direction,
        intensity
      `)
      .order('category')
      .order('slug');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Build a map for quick lookup
    const sceneMap = new Map(scenes?.map(s => [s.id, s]) || []);

    // Enrich with relationship data
    const enrichedScenes = scenes?.map(scene => {
      const pairedScene = scene.paired_with ? sceneMap.get(scene.paired_with) : null;
      const sharedScene = scene.shared_images_with ? sceneMap.get(scene.shared_images_with) : null;

      return {
        ...scene,
        elements: scene.elements || [],
        image_variants: scene.image_variants || [],
        paired_slug: pairedScene?.slug || null,
        shared_images_slug: sharedScene?.slug || null,
      };
    });

    return NextResponse.json({
      total: enrichedScenes?.length || 0,
      scenes: enrichedScenes,
    });
  } catch (error) {
    console.error('[SceneTree] Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
