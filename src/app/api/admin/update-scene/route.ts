import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for admin operations (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { sceneId, field, value } = await req.json();

    if (!sceneId || !field) {
      return NextResponse.json(
        { error: 'Missing sceneId or field' },
        { status: 400 }
      );
    }

    // Only allow specific fields to be updated
    const allowedFields = ['user_description', 'priority', 'prompt_instructions', 'generation_prompt', 'accepted'];
    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { error: `Field ${field} not allowed` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('scenes')
      .update({ [field]: value })
      .eq('id', sceneId)
      .select();

    if (error) {
      console.error('[UpdateScene] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('[UpdateScene] Exception:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
