import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateChatResponse } from '@/lib/ai';
import type { UserContext } from '@/lib/types';

const FREE_MESSAGES_PER_DAY = 5;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .single();

    const isPremium = subscription?.plan && subscription.plan !== 'free';

    // Check rate limit for free users
    if (!isPremium) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('ai_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('role', 'user')
        .gte('created_at', today.toISOString());

      if ((count || 0) >= FREE_MESSAGES_PER_DAY) {
        return NextResponse.json(
          {
            error: 'rate_limited',
            message: `Вы использовали ${FREE_MESSAGES_PER_DAY} бесплатных сообщений сегодня. Получите Premium для безлимитного общения.`,
          },
          { status: 429 }
        );
      }
    }

    // Get user context
    const { data: profile } = await supabase
      .from('profiles')
      .select('gender, interested_in')
      .eq('id', user.id)
      .single();

    const { data: prefProfile } = await supabase
      .from('preference_profiles')
      .select('preferences')
      .eq('user_id', user.id)
      .single();

    // Get recent messages for context
    const { data: recentMessages } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const userContext: UserContext = {
      gender: profile?.gender || 'undisclosed',
      interestedIn: profile?.interested_in || 'both',
      knownPreferences: prefProfile?.preferences || {},
      recentResponses: [],
    };

    // Save user message
    await supabase.from('ai_messages').insert({
      user_id: user.id,
      role: 'user',
      content: message,
    });

    // Build conversation history
    const history = (recentMessages || [])
      .reverse()
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    history.push({ role: 'user', content: message });

    // Generate response
    const response = await generateChatResponse(history, userContext);

    // Save assistant message
    await supabase.from('ai_messages').insert({
      user_id: user.id,
      role: 'assistant',
      content: response,
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
