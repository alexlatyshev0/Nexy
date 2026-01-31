import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/scene-elements?sceneId=xxx
 * Fetch a scene with full elements structure
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sceneId = searchParams.get('sceneId');

  if (!sceneId) {
    return NextResponse.json({ error: 'sceneId is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('scenes')
    .select('id, slug, title, subtitle, category, intensity, elements, question, ai_context, tags, role_direction, is_active')
    .eq('id', sceneId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * PUT /api/admin/scene-elements
 * Update elements and question for a scene
 * Body: { sceneId, elements, question? }
 */
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { sceneId, elements, question } = body;

  if (!sceneId) {
    return NextResponse.json({ error: 'sceneId is required' }, { status: 400 });
  }

  if (!elements) {
    return NextResponse.json({ error: 'elements is required' }, { status: 400 });
  }

  // Validate elements structure (basic)
  if (!Array.isArray(elements)) {
    return NextResponse.json({ error: 'elements must be an array' }, { status: 400 });
  }

  for (const el of elements) {
    if (!el.id || !el.label || !el.tag_ref) {
      return NextResponse.json(
        { error: 'Each element must have id, label, and tag_ref' },
        { status: 400 }
      );
    }
  }

  // Build update object
  const updateData: Record<string, unknown> = { elements };
  if (question !== undefined) {
    updateData.question = question;
  }

  const { data, error } = await supabase
    .from('scenes')
    .update(updateData)
    .eq('id', sceneId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, scene: data });
}
