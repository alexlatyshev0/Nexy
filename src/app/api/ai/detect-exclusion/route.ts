import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

const openai = new OpenAI();

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sceneId, feedback } = await req.json();

  // Get scene tags
  const { data: scene } = await supabase
    .from('scenes')
    .select('tags')
    .eq('id', sceneId)
    .single();

  if (!scene?.tags?.length) {
    return NextResponse.json({ category: null, confidence: 0 });
  }

  // Get categories for these tags
  const { data: tagCats } = await supabase
    .from('tag_categories')
    .select('tag, category:categories(slug, name)')
    .in('tag', scene.tags);

  const categories = [...new Set(
    tagCats?.map(tc => {
      const cat = tc.category as { slug: string; name: string } | { slug: string; name: string }[] | null;
      if (Array.isArray(cat)) return cat[0]?.slug;
      return cat?.slug;
    }).filter(Boolean)
  )];

  if (!categories.length) {
    return NextResponse.json({ category: null, confidence: 0 });
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Determine which category the user wants to exclude based on their feedback.
Scene categories: ${categories.join(', ')}
Scene tags: ${scene.tags.join(', ')}

Respond with JSON: {"category": "slug or null", "confidence": 0-100, "level": "soft|hard"}

Rules:
- If user says something like "not my thing" or "don't like this" - it's probably "hard" exclusion
- If user says "maybe later" or "not now" - it's "soft"
- Match feedback to the most likely category
- If unclear, set category to null`
      },
      { role: 'user', content: feedback }
    ],
    response_format: { type: 'json_object' }
  });

  try {
    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ category: null, confidence: 0, level: 'soft' });
  }
}
