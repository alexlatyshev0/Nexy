import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

const openai = new OpenAI();

interface CategoryInfo {
  slug: string;
  name: string;
}

interface ExclusionRecord {
  category: CategoryInfo | null;
  excluded_tag: string | null;
  exclusion_level: string;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { partnerId, message } = await req.json();

  // Check active partnership
  const { data: partnership } = await supabase
    .from('partnerships')
    .select('*')
    .or(`and(user_id.eq.${user.id},partner_id.eq.${partnerId}),and(user_id.eq.${partnerId},partner_id.eq.${user.id})`)
    .eq('status', 'active')
    .single();

  if (!partnership) {
    return NextResponse.json({ error: 'No active partnership' }, { status: 403 });
  }

  // Get partner profile
  const { data: partnerProfile } = await supabase
    .from('profiles')
    .select('gender')
    .eq('id', partnerId)
    .single();

  // Get partner preferences
  const { data: partnerPrefs } = await supabase
    .from('preference_profiles')
    .select('preferences')
    .eq('user_id', partnerId)
    .single();

  // Get partner exclusions
  const { data: partnerExclusions } = await supabase
    .from('excluded_preferences')
    .select('category:categories(slug, name), excluded_tag, exclusion_level')
    .eq('user_id', partnerId);

  // Get chat history (last 20 messages)
  const { data: chatHistory } = await supabase
    .from('partner_chat_messages')
    .select('role, content')
    .eq('user_id', user.id)
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: true })
    .limit(20);

  // Format preferences for AI
  const prefsContext = formatPreferencesForAI(partnerPrefs?.preferences || {});
  const exclusionsContext = formatExclusionsForAI((partnerExclusions || []) as ExclusionRecord[]);

  const genderText = partnerProfile?.gender === 'female' ? 'female' :
                     partnerProfile?.gender === 'male' ? 'male' : 'person';

  const systemPrompt = `You are an AI avatar of the user's partner. Your task is to answer questions about intimate preferences as the real partner would.

PARTNER PROFILE:
- Gender: ${genderText}

PREFERENCES (based on responses):
${prefsContext}

DISLIKES:
${exclusionsContext}

RULES:
1. Answer in first person, as if you are the partner
2. Be playful and flirty, but honest
3. If something is liked - hint with enthusiasm
4. If something is disliked - gently decline, explain why
5. If no data - say "not sure, let's discuss this together"
6. DO NOT reveal specific numbers or percentages
7. Speak naturally, as in chat with partner
8. Use emojis moderately
9. Maintain intrigue, don't reveal everything at once
10. Respond in the same language as the user's message`;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...(chatHistory || []).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    })),
    { role: 'user', content: message }
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 300,
    temperature: 0.8
  });

  const assistantMessage = completion.choices[0].message.content || '';

  // Save both messages
  await supabase.from('partner_chat_messages').insert([
    { user_id: user.id, partner_id: partnerId, role: 'user', content: message },
    { user_id: user.id, partner_id: partnerId, role: 'assistant', content: assistantMessage }
  ]);

  return NextResponse.json({ message: assistantMessage });
}

function formatPreferencesForAI(prefs: Record<string, unknown>): string {
  const lines: string[] = [];

  const traverse = (obj: Record<string, unknown>, path = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        traverse(value as Record<string, unknown>, currentPath);
      } else if (typeof value === 'number') {
        const level = value >= 80 ? 'really likes' :
                      value >= 60 ? 'likes' :
                      value >= 40 ? 'neutral' :
                      value >= 20 ? 'probably not' : 'dislikes';
        lines.push(`- ${currentPath}: ${level}`);
      }
    }
  };

  traverse(prefs);
  return lines.join('\n') || 'Limited preference data available';
}

function formatExclusionsForAI(exclusions: ExclusionRecord[]): string {
  if (!exclusions.length) return 'No explicit exclusions';

  return exclusions.map(e => {
    const name = e.category?.name || e.excluded_tag;
    const level = e.exclusion_level === 'hard' ? 'absolutely not' : 'not really';
    return `- ${name}: ${level}`;
  }).join('\n');
}
