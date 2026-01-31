'use client';

import type {
  Locale,
  SceneV2Extended,
  BodyGender,
  BodyMapAnswer as BodyMapAnswerType,
} from '@/lib/types';
import { IntroSlideV3 } from './IntroSlideV3';
import { MultiChoiceTextV3 } from './MultiChoiceTextV3';
import { ImageSelectionV3 } from './ImageSelectionV3';
import { BodyMapActivityV3 } from './BodyMapActivityV3';
import { PairedTextV3 } from './PairedTextV3';
import { ScaleTextV3 } from './ScaleTextV3';
import { CompositeSceneView } from './CompositeSceneView';
import type { IntroSlide } from '@/lib/types';

// Response types for different scene types
export type SceneV3Response =
  | { type: 'multi_choice_text'; selected: string[]; customValue?: string }
  | { type: 'image_selection'; selected: string[] }
  | { type: 'body_map_activity'; answer: BodyMapAnswerType }
  | { type: 'paired_text'; answers: { give: number; receive: number } }
  | { type: 'scale_text'; value: number }
  | { type: 'main_question' | 'clarification'; response: unknown };

interface SceneRendererV3Props {
  scene: SceneV2Extended;
  locale?: Locale;
  userGender: BodyGender;
  partnerGender: BodyGender;
  onSubmit: (response: SceneV3Response) => void;
  loading?: boolean;
}

/**
 * Universal scene renderer for V3 architecture.
 *
 * Renders the appropriate component based on scene_type:
 * - main_question, clarification → CompositeSceneView (existing)
 * - multi_choice_text → MultiChoiceTextV3
 * - image_selection → ImageSelectionV3
 * - body_map_activity → BodyMapActivityV3
 * - paired_text → PairedTextV3
 * - scale_text → ScaleTextV3
 */
export function SceneRendererV3({
  scene,
  locale = 'ru',
  userGender,
  partnerGender,
  onSubmit,
  loading = false,
}: SceneRendererV3Props) {
  const sceneType = scene.scene_type;

  // Route to appropriate component based on scene_type
  switch (sceneType) {
    case 'multi_choice_text':
      return (
        <MultiChoiceTextV3
          scene={scene}
          locale={locale}
          loading={loading}
          onSubmit={(selected, customValue) =>
            onSubmit({ type: 'multi_choice_text', selected, customValue })
          }
        />
      );

    case 'image_selection':
      return (
        <ImageSelectionV3
          scene={scene}
          locale={locale}
          loading={loading}
          onSubmit={(selected) =>
            onSubmit({ type: 'image_selection', selected })
          }
        />
      );

    case 'body_map_activity':
      return (
        <BodyMapActivityV3
          scene={scene}
          userGender={userGender}
          partnerGender={partnerGender}
          locale={locale}
          loading={loading}
          onSubmit={(answer) =>
            onSubmit({ type: 'body_map_activity', answer })
          }
        />
      );

    case 'paired_text':
      return (
        <PairedTextV3
          scene={scene}
          locale={locale}
          loading={loading}
          onSubmit={(answers) =>
            onSubmit({ type: 'paired_text', answers })
          }
        />
      );

    case 'scale_text':
      return (
        <ScaleTextV3
          scene={scene}
          locale={locale}
          loading={loading}
          onSubmit={(value) =>
            onSubmit({ type: 'scale_text', value })
          }
        />
      );

    default:
      // Default: show as CompositeSceneView (display only)
      return (
        <CompositeSceneView
          scene={scene}
          locale={locale}
        />
      );
  }
}

// Re-export intro slide for convenience
export { IntroSlideV3 } from './IntroSlideV3';
export type { IntroSlide };
