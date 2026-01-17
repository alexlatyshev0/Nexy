import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const partnerId = searchParams.get('partnerId');

  if (!partnerId) {
    return NextResponse.json({ error: 'Missing partnerId' }, { status: 400 });
  }

  const { data } = await supabase
    .from('partner_chat_messages')
    .select('id, role, content, created_at')
    .eq('user_id', user.id)
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: true });

  return NextResponse.json(data || []);
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const partnerId = searchParams.get('partnerId');

  if (!partnerId) {
    return NextResponse.json({ error: 'Missing partnerId' }, { status: 400 });
  }

  await supabase
    .from('partner_chat_messages')
    .delete()
    .eq('user_id', user.id)
    .eq('partner_id', partnerId);

  return NextResponse.json({ success: true });
}
