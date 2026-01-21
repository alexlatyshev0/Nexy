import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for admin operations (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const sceneId = formData.get('sceneId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!sceneId) {
      return NextResponse.json({ error: 'No sceneId provided' }, { status: 400 });
    }

    // Convert File to ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Determine content type
    const contentType = file.type || 'image/webp';
    const extension = contentType.split('/')[1] || 'webp';
    const fileName = `${sceneId}.${extension}`;

    console.log('[UploadImage] Uploading:', {
      sceneId,
      fileName,
      contentType,
      size: buffer.byteLength,
    });

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('scenes')
      .upload(fileName, buffer, {
        contentType,
        cacheControl: '0',
        upsert: true,
      });

    if (uploadError) {
      console.error('[UploadImage] Upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('scenes')
      .getPublicUrl(fileName);

    const imageUrl = `${publicUrl}?t=${Date.now()}`;

    // Update scene in database
    const { error: updateError } = await supabase
      .from('scenes')
      .update({ image_url: imageUrl })
      .eq('id', sceneId);

    if (updateError) {
      console.error('[UploadImage] DB update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log('[UploadImage] Success:', imageUrl);

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error('[UploadImage] Exception:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
