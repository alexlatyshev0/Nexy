import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/wishlist
 * Add user to orientation wishlist (for unavailable orientations like gay/bi)
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requested_orientation } = await req.json();

    // Validate orientation
    const validOrientations = ['gay_male', 'gay_female', 'bisexual'];
    if (!validOrientations.includes(requested_orientation)) {
      return NextResponse.json(
        { error: 'Invalid orientation. Must be: gay_male, gay_female, or bisexual' },
        { status: 400 }
      );
    }

    // Insert into wishlist (upsert to avoid duplicates)
    const { data, error } = await supabase
      .from('orientation_wishlist')
      .upsert(
        {
          user_id: user.id,
          requested_orientation,
        },
        {
          onConflict: 'user_id,requested_orientation',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('[Wishlist] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[Wishlist] Exception:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wishlist
 * Get user's wishlist entries
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('orientation_wishlist')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('[Wishlist] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('[Wishlist] Exception:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
