import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { addFollowUpSignal } from '@/lib/profile-signals';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sceneId, parentResponseId, optionId, profileSignal } = await request.json();

    if (!sceneId || !optionId) {
      return NextResponse.json(
        { error: 'Scene ID and option ID are required' },
        { status: 400 }
      );
    }

    // Check if follow-up already exists for this scene
    const { data: existing } = await supabase
      .from('follow_up_responses')
      .select('id')
      .eq('user_id', user.id)
      .eq('scene_id', sceneId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Follow-up already answered for this scene' },
        { status: 409 }
      );
    }

    // Save follow-up response
    const { error: insertError } = await supabase.from('follow_up_responses').insert({
      user_id: user.id,
      scene_id: sceneId,
      parent_response_id: parentResponseId || null,
      option_id: optionId,
      profile_signal: profileSignal || null,
    });

    if (insertError) {
      console.error('Failed to save follow-up response:', insertError);
      return NextResponse.json(
        { error: 'Failed to save response' },
        { status: 500 }
      );
    }

    // Update psychological profile with the signal
    if (profileSignal) {
      try {
        await addFollowUpSignal(supabase, user.id, profileSignal);
      } catch (err) {
        console.error('Failed to update psychological profile:', err);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Follow-up submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process follow-up' },
      { status: 500 }
    );
  }
}

// Get follow-up responses for a user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sceneId = searchParams.get('sceneId');

    let query = supabase
      .from('follow_up_responses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (sceneId) {
      query = query.eq('scene_id', sceneId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch follow-up responses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch responses' },
        { status: 500 }
      );
    }

    return NextResponse.json({ responses: data });
  } catch (error) {
    console.error('Follow-up fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch follow-up responses' },
      { status: 500 }
    );
  }
}
