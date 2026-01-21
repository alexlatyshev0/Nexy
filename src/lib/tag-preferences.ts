import type { SupabaseClient } from '@supabase/supabase-js';
import type { SceneV2, V2Element } from './types';

/**
 * Update tag_preferences based on composite scene response
 */
export async function updateTagPreferences(
  supabase: SupabaseClient,
  userId: string,
  scene: SceneV2,
  selectedElements: string[],
  elementResponses: Record<string, Record<string, unknown>> = {}
): Promise<void> {
  if (!selectedElements || selectedElements.length === 0) {
    return;
  }

  const sceneSlug = scene.slug || scene.id;

  // Process each selected element
  for (const elementId of selectedElements) {
    const element = scene.elements.find((e) => e.id === elementId);
    if (!element) continue;

    const tagRef = element.tag_ref;
    if (!tagRef) continue;

    // Get existing tag preference
    const { data: existing } = await supabase
      .from('tag_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('tag_ref', tagRef)
      .single();

    // Calculate interest level (base: 50 for selection, can be adjusted by follow-ups)
    let interestLevel = 50;
    let rolePreference: 'give' | 'receive' | 'both' | null = null;
    let intensityPreference: number | null = null;
    const specificPreferences: Record<string, unknown> = {};
    let experienceLevel: 'tried' | 'want_to_try' | 'not_interested' | 'curious' | null = null;

    // Process follow-up responses for this element
    const elementResponse = elementResponses[elementId];
    if (elementResponse) {
      for (const [followUpId, followUpAnswer] of Object.entries(elementResponse)) {
        // Find the follow-up to understand its type
        const followUp = element.follow_ups?.find((f) => f.id === followUpId);
        if (!followUp) continue;

        switch (followUp.type) {
          case 'role':
            // Extract role preference
            if (typeof followUpAnswer === 'string') {
              rolePreference = followUpAnswer as 'give' | 'receive' | 'both';
            }
            break;

          case 'intensity':
          case 'scale':
            // Extract intensity preference
            if (typeof followUpAnswer === 'number') {
              intensityPreference = followUpAnswer;
              // Adjust interest level based on intensity
              interestLevel = Math.max(30, Math.min(100, followUpAnswer));
            }
            break;

          case 'experience':
            // Extract experience level
            if (typeof followUpAnswer === 'string') {
              experienceLevel = followUpAnswer as 'tried' | 'want_to_try' | 'not_interested' | 'curious';
              // Adjust interest level based on experience
              if (experienceLevel === 'tried') {
                interestLevel = Math.max(interestLevel, 70);
              } else if (experienceLevel === 'want_to_try') {
                interestLevel = Math.max(interestLevel, 60);
              } else if (experienceLevel === 'not_interested') {
                interestLevel = Math.min(interestLevel, 30);
              }
            }
            break;

          default:
            // Store other follow-up answers in specific_preferences
            specificPreferences[followUpId] = followUpAnswer;
            break;
        }
      }
    }

    // Get source scenes list
    const sourceScenes = existing?.source_scenes || [];
    if (!sourceScenes.includes(sceneSlug)) {
      sourceScenes.push(sceneSlug);
    }

    // Merge specific preferences
    const mergedSpecificPreferences = {
      ...(existing?.specific_preferences as Record<string, unknown> || {}),
      ...specificPreferences,
    };

    // Upsert tag preference
    await supabase
      .from('tag_preferences')
      .upsert({
        user_id: userId,
        tag_ref: tagRef,
        interest_level: existing
          ? Math.max(existing.interest_level || 0, interestLevel) // Keep maximum interest
          : interestLevel,
        role_preference: rolePreference || existing?.role_preference || null,
        intensity_preference: intensityPreference || existing?.intensity_preference || null,
        specific_preferences: mergedSpecificPreferences,
        experience_level: experienceLevel || existing?.experience_level || null,
        source_scenes: sourceScenes,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,tag_ref',
      });
  }
}
