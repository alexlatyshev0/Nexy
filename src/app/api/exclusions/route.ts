import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  // body: { categorySlug?: string, tag?: string, level: 'soft'|'hard', reason?: string }

  let categoryId = null;
  if (body.categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', body.categorySlug)
      .single();
    categoryId = cat?.id;
  }

  const { error } = await supabase
    .from('excluded_preferences')
    .upsert({
      user_id: user.id,
      category_id: categoryId,
      excluded_tag: body.tag || null,
      exclusion_level: body.level || 'hard',
      reason: body.reason
    }, {
      onConflict: 'user_id,category_id'
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data } = await supabase
    .from('excluded_preferences')
    .select(`
      *,
      category:categories(slug, name)
    `)
    .eq('user_id', user.id);

  return NextResponse.json(data || []);
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  await supabase
    .from('excluded_preferences')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
