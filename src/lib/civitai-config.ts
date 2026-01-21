export const GLOBAL_STYLE = {
  prefix: "masterpiece, best quality, highly detailed, professional photography, cinematic lighting, ",
  realism: "photorealistic, 8k uhd, high resolution, detailed skin texture, ",
  mood: "sensual atmosphere, intimate, soft shadows, ",
  negative: "ugly, deformed, noisy, blurry, low quality, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, username, watermark, signature, text, deformed tongue, huge tongue, long tongue, abnormal tongue, extra fingers, missing fingers, deformed fingers, illustration, drawing, sketch, cartoon, anime, comic, painted",
};

export const STYLE_VARIANTS = {
  none: {
    prefix: "",
    realism: "",
    mood: "",
    negative: "",
  },

  artistic: {
    prefix: "artistic, oil painting style, renaissance aesthetic, classical art, ",
    negative: "photo, photograph, realistic, 3d render, ",
  },

  noir: {
    prefix: "film noir, black and white, high contrast, dramatic shadows, ",
    negative: "colorful, bright, ",
  },

  soft: {
    prefix: "soft focus, dreamy, pastel colors, romantic, ethereal, ",
    negative: "harsh, dark, gritty, ",
  },

  editorial: {
    prefix: "vogue magazine, fashion photography, studio lighting, editorial, ",
    negative: "amateur, casual, ",
  },
};

export function buildPrompt(
  scenePrompt: string,
  styleVariant: keyof typeof STYLE_VARIANTS | 'default' = 'default'
): { prompt: string; negativePrompt: string } {
  // "none" - only use the scene prompt, no style prefixes, user controls style via prefix
  if (styleVariant === 'none') {
    return {
      prompt: scenePrompt,
      negativePrompt: "ugly, deformed, bad anatomy, child, underage, minor, deformed tongue, huge tongue, extra fingers, missing fingers, deformed fingers",
    };
  }

  const style = styleVariant === 'default'
    ? GLOBAL_STYLE
    : { ...GLOBAL_STYLE, ...STYLE_VARIANTS[styleVariant] };

  return {
    prompt: `${style.prefix}${style.realism}${style.mood}${scenePrompt}`,
    negativePrompt: `${GLOBAL_STYLE.negative}, ${style.negative || ''}`,
  };
}
