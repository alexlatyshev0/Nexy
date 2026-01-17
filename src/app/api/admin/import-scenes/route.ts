import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import * as fs from 'fs';
import * as path from 'path';

interface V3SceneJSON {
  id: string;
  priority: number;
  intensity: number;
  generation_prompt: string;
  user_description: {
    en: string;
    ru: string;
  };
  ai_context: Record<string, unknown>;
  participants: Array<{
    role: string;
    gender: string;
    action: string;
  }>;
  dimensions: string[];
  tags: string[];
  relevant_for: {
    gender: string;
    interested_in: string;
  };
  question_type: string | { type: string };
  follow_up?: Record<string, unknown> | null;
}

export async function POST() {
  const supabase = await createServiceClient();

  try {
    const scenesDir = path.join(process.cwd(), 'scenes', 'v3');

    if (!fs.existsSync(scenesDir)) {
      return NextResponse.json({ error: 'Scenes directory not found' }, { status: 404 });
    }

    const files = fs.readdirSync(scenesDir)
      .filter(f => f.startsWith('scenes-v3-') && f.endsWith('.json'))
      .sort();

    if (files.length === 0) {
      return NextResponse.json({ error: 'No scene files found' }, { status: 404 });
    }

    let totalImported = 0;
    let totalErrors = 0;
    const errors: string[] = [];

    for (const file of files) {
      const filePath = path.join(scenesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);

      const scenes: V3SceneJSON[] = Array.isArray(parsed) ? parsed : parsed.scenes;

      for (const scene of scenes) {
        try {
          const questionType = typeof scene.question_type === 'object'
            ? scene.question_type.type
            : scene.question_type;

          const dbScene = {
            slug: scene.id,
            priority: scene.priority,
            intensity: scene.intensity,
            description: scene.user_description?.ru || (scene.ai_context as { description?: string })?.description || '',
            generation_prompt: scene.generation_prompt,
            user_description: scene.user_description,
            ai_context: scene.ai_context,
            participants: scene.participants,
            dimensions: scene.dimensions,
            tags: scene.tags,
            relevant_for: scene.relevant_for,
            question_type: questionType,
            follow_up: scene.follow_up || null,
            image_url: '',
          };

          const { error } = await supabase
            .from('scenes')
            .insert(dbScene);

          if (error) {
            errors.push(`${scene.id}: ${error.message}`);
            totalErrors++;
          } else {
            totalImported++;
          }
        } catch (e) {
          errors.push(`${scene.id}: ${(e as Error).message}`);
          totalErrors++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported: totalImported,
      errors: totalErrors,
      errorDetails: errors.slice(0, 20),
      files: files.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
