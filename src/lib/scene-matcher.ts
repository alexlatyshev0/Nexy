/**
 * Scene Matcher
 * Matches image analysis results against scenes in the database
 */

import { ImageAnalysis } from './image-analyzer';

export interface SceneData {
  id: string;
  slug: string;
  title: { ru: string; en: string };
  category: string;
  tags?: string[];
  ai_description?: { ru: string; en: string };
  image_prompt?: string;
}

export interface SceneSuggestion {
  id: string;
  slug: string;
  title: { ru: string; en: string };
  category: string;
  score: number;
  matchReasons: string[];
}

/**
 * Match scenes to an image analysis result
 * Returns scenes sorted by relevance score
 */
export function matchScenesToImage(
  analysis: ImageAnalysis,
  scenes: SceneData[]
): SceneSuggestion[] {
  // Normalize keywords for matching
  const keywords = (analysis.keywords || []).map(k => k.toLowerCase().trim());
  const activityWords = (analysis.activity || '')
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3);
  const moodLower = (analysis.mood || '').toLowerCase();
  const settingLower = (analysis.setting || '').toLowerCase();
  const elementsLower = (analysis.elements || []).map(e => e.toLowerCase());

  return scenes
    .map(scene => {
      let score = 0;
      const reasons: string[] = [];

      // Normalize scene data
      const sceneTags = (scene.tags || []).map(t => t.toLowerCase());
      const category = (scene.category || '').toLowerCase();
      const slug = (scene.slug || '').toLowerCase();
      const aiDesc = (scene.ai_description?.en || '').toLowerCase();
      const imagePrompt = (scene.image_prompt || '').toLowerCase();

      // 1. Tag matching (+10 per match)
      const tagMatches: string[] = [];
      for (const kw of keywords) {
        for (const tag of sceneTags) {
          if (tag.includes(kw) || kw.includes(tag)) {
            if (!tagMatches.includes(kw)) {
              tagMatches.push(kw);
            }
          }
        }
      }
      if (tagMatches.length > 0) {
        score += tagMatches.length * 10;
        reasons.push(`Tags: ${tagMatches.slice(0, 3).join(', ')}`);
      }

      // 2. Category matching (+20)
      const categoryMatches = keywords.some(kw =>
        category.includes(kw) || kw.includes(category)
      );
      if (categoryMatches) {
        score += 20;
        reasons.push(`Category: ${scene.category}`);
      }

      // 3. Slug matching (+15 for direct match)
      const slugMatches = keywords.some(kw =>
        slug.includes(kw) || kw.includes(slug.replace(/-/g, ' '))
      );
      if (slugMatches) {
        score += 15;
        reasons.push(`Slug match`);
      }

      // 4. Activity words in ai_description (+5 per word)
      if (aiDesc) {
        const descMatches = activityWords.filter(w => aiDesc.includes(w));
        if (descMatches.length > 0) {
          score += descMatches.length * 5;
          reasons.push(`Activity match`);
        }
      }

      // 5. Activity words in image_prompt (+3 per word)
      if (imagePrompt) {
        const promptMatches = activityWords.filter(w => imagePrompt.includes(w));
        if (promptMatches.length > 0) {
          score += promptMatches.length * 3;
        }
      }

      // 6. Mood in image_prompt (+5)
      if (moodLower && imagePrompt.includes(moodLower)) {
        score += 5;
        reasons.push(`Mood: ${analysis.mood}`);
      }

      // 7. Setting in image_prompt (+3)
      if (settingLower && imagePrompt.includes(settingLower)) {
        score += 3;
      }

      // 8. Elements matching (+3 per element)
      for (const element of elementsLower) {
        if (
          sceneTags.some(tag => tag.includes(element) || element.includes(tag)) ||
          imagePrompt.includes(element)
        ) {
          score += 3;
        }
      }

      // 9. Keywords in image_prompt (+2 per keyword)
      for (const kw of keywords) {
        if (imagePrompt.includes(kw)) {
          score += 2;
        }
      }

      return {
        id: scene.id,
        slug: scene.slug,
        title: scene.title,
        category: scene.category,
        score,
        matchReasons: reasons,
      };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);
}
