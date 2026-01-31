/**
 * V3 Scene Components Index
 *
 * New architecture components for scene types without nested follow-ups.
 */

// Main renderer
export { SceneRendererV3, type SceneV3Response } from './SceneRendererV3';

// Individual components
export { IntroSlideV3 } from './IntroSlideV3';
export { MultiChoiceTextV3 } from './MultiChoiceTextV3';
export { ImageSelectionV3 } from './ImageSelectionV3';
export { BodyMapActivityV3 } from './BodyMapActivityV3';
export { PairedTextV3 } from './PairedTextV3';
export { ScaleTextV3 } from './ScaleTextV3';

// Group components (for discovery flow)
export { SwipeCardsGroupV3, type SwipeCardResponse, type SwipeResponseValue } from './SwipeCardsGroupV3';
