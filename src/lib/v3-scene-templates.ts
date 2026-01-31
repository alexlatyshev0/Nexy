/**
 * V3 Scene Templates for image generation
 *
 * These templates define new scene types that need images generated:
 * - bondage-type: 6 swipe cards for different bondage styles
 * - positions-favorite: 8 swipe cards for sex positions
 * - lingerie-style: 8 small images for lingerie grid selection
 * - locations-favorite: 6 small images for location grid selection
 * - toys-type: 11 small images for toys grid selection
 * - single scenes: sex-swing, anal-hook
 *
 * Total: 41 templates
 */

export interface V3SceneTemplate {
  slug: string;
  title: { ru: string; en: string };
  category: string;
  scene_type: 'clarification' | 'main_question';
  clarification_for?: string[];
  role_direction?: string;
  paired_with?: string;
  image_prompt: string;
  intensity: number;
  is_active: boolean;
  // For grouped templates
  group?: string;
  group_order?: number;
}

export interface V3TemplateGroup {
  id: string;
  name: string;
  description: string;
  scene_type_ui: 'swipe_cards' | 'image_selection' | 'single';
  templates: V3SceneTemplate[];
}

// ============================================
// BONDAGE TYPE - 6 swipe cards
// ============================================
const bondageTypeTemplates: V3SceneTemplate[] = [
  {
    slug: 'bondage-type-restrain',
    title: { ru: 'Классическое связывание', en: 'Restrain' },
    category: 'bondage',
    scene_type: 'clarification',
    clarification_for: ['bondage-give', 'bondage-receive'],
    image_prompt: 'intimate bedroom scene, woman with wrists gently tied with soft rope to headboard, dim warm lighting, sensual atmosphere, tasteful artistic composition, focus on trust and intimacy',
    intensity: 2,
    is_active: true,
    group: 'bondage-type',
    group_order: 1,
  },
  {
    slug: 'bondage-type-shibari',
    title: { ru: 'Шибари', en: 'Shibari' },
    category: 'bondage',
    scene_type: 'clarification',
    clarification_for: ['bondage-give', 'bondage-receive'],
    image_prompt: 'artistic japanese shibari rope bondage on woman, intricate decorative rope patterns, red rope on skin, elegant aesthetic composition, soft lighting, artistic and sensual',
    intensity: 3,
    is_active: true,
    group: 'bondage-type',
    group_order: 2,
  },
  {
    slug: 'bondage-type-cross',
    title: { ru: 'Крест Св. Андрея', en: "St. Andrew's Cross" },
    category: 'bondage',
    scene_type: 'clarification',
    clarification_for: ['bondage-give', 'bondage-receive'],
    image_prompt: 'woman standing spread against wooden X-frame cross, leather cuffs on wrists and ankles, dungeon setting with dramatic lighting, BDSM aesthetic, powerful atmosphere',
    intensity: 3,
    is_active: true,
    group: 'bondage-type',
    group_order: 3,
  },
  {
    slug: 'bondage-type-spreader',
    title: { ru: 'Распорка', en: 'Spreader Bar' },
    category: 'bondage',
    scene_type: 'clarification',
    clarification_for: ['bondage-give', 'bondage-receive'],
    image_prompt: 'woman on bed with metal spreader bar between ankles, legs held apart, vulnerable position, intimate bedroom setting, soft lighting, sensual BDSM atmosphere',
    intensity: 3,
    is_active: true,
    group: 'bondage-type',
    group_order: 4,
  },
  {
    slug: 'bondage-type-suspension',
    title: { ru: 'Подвешивание', en: 'Suspension' },
    category: 'bondage',
    scene_type: 'clarification',
    clarification_for: ['bondage-give', 'bondage-receive'],
    image_prompt: 'woman partially suspended by ropes from ceiling, artistic rope work, dungeon or studio setting, dramatic lighting from above, advanced BDSM aesthetic, powerful and artistic',
    intensity: 4,
    is_active: true,
    group: 'bondage-type',
    group_order: 5,
  },
  {
    slug: 'bondage-type-chains',
    title: { ru: 'Цепи', en: 'Chains' },
    category: 'bondage',
    scene_type: 'clarification',
    clarification_for: ['bondage-give', 'bondage-receive'],
    image_prompt: 'woman with metal chains attached to collar and wrists, industrial dungeon setting, cold metal contrast with warm skin, dramatic lighting, powerful BDSM aesthetic',
    intensity: 3,
    is_active: true,
    group: 'bondage-type',
    group_order: 6,
  },
];

// ============================================
// POSITIONS - 8 swipe cards
// ============================================
const positionsTemplates: V3SceneTemplate[] = [
  {
    slug: 'position-missionary',
    title: { ru: 'Миссионерская', en: 'Missionary' },
    category: 'positions',
    scene_type: 'clarification',
    clarification_for: ['symmetric'],
    image_prompt: 'intimate couple in missionary position, man on top facing woman, eye contact, romantic bedroom setting, soft warm lighting, passionate and connected',
    intensity: 1,
    is_active: true,
    group: 'positions-favorite',
    group_order: 1,
  },
  {
    slug: 'position-doggy',
    title: { ru: 'Догги-стайл', en: 'Doggy Style' },
    category: 'positions',
    scene_type: 'clarification',
    clarification_for: ['symmetric'],
    image_prompt: 'couple in doggy style position, woman on all fours, man behind her, bedroom setting, sensual lighting, intimate and passionate',
    intensity: 2,
    is_active: true,
    group: 'positions-favorite',
    group_order: 2,
  },
  {
    slug: 'position-cowgirl',
    title: { ru: 'Наездница', en: 'Cowgirl' },
    category: 'positions',
    scene_type: 'clarification',
    clarification_for: ['symmetric'],
    image_prompt: 'woman on top riding man, cowgirl position, her hands on his chest, confident expression, bedroom setting, warm sensual lighting',
    intensity: 2,
    is_active: true,
    group: 'positions-favorite',
    group_order: 3,
  },
  {
    slug: 'position-reverse-cowgirl',
    title: { ru: 'Обратная наездница', en: 'Reverse Cowgirl' },
    category: 'positions',
    scene_type: 'clarification',
    clarification_for: ['symmetric'],
    image_prompt: 'woman on top facing away from man, reverse cowgirl position, view from behind her, bedroom setting, sensual atmosphere',
    intensity: 2,
    is_active: true,
    group: 'positions-favorite',
    group_order: 4,
  },
  {
    slug: 'position-69',
    title: { ru: '69', en: '69' },
    category: 'positions',
    scene_type: 'clarification',
    clarification_for: ['symmetric', 'oral-give', 'oral-receive'],
    image_prompt: 'couple in 69 position, mutual oral pleasure, artistic side view, intimate bedroom setting, soft lighting, passionate and connected',
    intensity: 2,
    is_active: true,
    group: 'positions-favorite',
    group_order: 5,
  },
  {
    slug: 'position-spooning',
    title: { ru: 'На боку (спуны)', en: 'Spooning' },
    category: 'positions',
    scene_type: 'clarification',
    clarification_for: ['symmetric', 'romantic'],
    image_prompt: 'couple lying on their sides spooning position, man behind woman, intimate embrace, cozy bedroom, warm morning light, romantic and gentle',
    intensity: 1,
    is_active: true,
    group: 'positions-favorite',
    group_order: 6,
  },
  {
    slug: 'position-standing',
    title: { ru: 'Стоя', en: 'Standing' },
    category: 'positions',
    scene_type: 'clarification',
    clarification_for: ['symmetric', 'spontaneous'],
    image_prompt: 'couple having sex standing up, woman lifted or against wall, passionate embrace, dramatic lighting, intense and spontaneous',
    intensity: 2,
    is_active: true,
    group: 'positions-favorite',
    group_order: 7,
  },
  {
    slug: 'position-seated',
    title: { ru: 'Сидя', en: 'Seated' },
    category: 'positions',
    scene_type: 'clarification',
    clarification_for: ['symmetric'],
    image_prompt: 'couple in seated position, man on chair or couch, woman straddling him facing, intimate eye contact, living room or bedroom, warm lighting',
    intensity: 2,
    is_active: true,
    group: 'positions-favorite',
    group_order: 8,
  },
];

// ============================================
// LINGERIE STYLE - 8 small grid images
// ============================================
const lingerieTemplates: V3SceneTemplate[] = [
  {
    slug: 'lingerie-lace',
    title: { ru: 'Кружево', en: 'Lace' },
    category: 'clothing',
    scene_type: 'clarification',
    clarification_for: ['lingerie'],
    image_prompt: 'woman wearing delicate black lace lingerie set, bra and panties, elegant feminine aesthetic, soft bedroom lighting, tasteful and romantic',
    intensity: 1,
    is_active: true,
    group: 'lingerie-style',
    group_order: 1,
  },
  {
    slug: 'lingerie-fishnet',
    title: { ru: 'Сеточка', en: 'Fishnet' },
    category: 'clothing',
    scene_type: 'clarification',
    clarification_for: ['lingerie'],
    image_prompt: 'woman wearing black fishnet bodysuit or fishnet stockings with garter belt, sexy mesh pattern, edgy club aesthetic, dramatic lighting, confident seductive pose',
    intensity: 2,
    is_active: true,
    group: 'lingerie-style',
    group_order: 2,
  },
  {
    slug: 'lingerie-sheer',
    title: { ru: 'Полупрозрачное', en: 'Sheer' },
    category: 'clothing',
    scene_type: 'clarification',
    clarification_for: ['lingerie'],
    image_prompt: 'woman wearing sheer see-through negligee or babydoll, delicate transparent fabric, soft romantic aesthetic, bedroom lighting, teasing and elegant',
    intensity: 2,
    is_active: true,
    group: 'lingerie-style',
    group_order: 3,
  },
  {
    slug: 'lingerie-stockings',
    title: { ru: 'Чулки', en: 'Stockings' },
    category: 'clothing',
    scene_type: 'clarification',
    clarification_for: ['lingerie'],
    image_prompt: 'woman wearing elegant thigh-high stockings with lace tops and garter belt, classic pin-up aesthetic, warm boudoir lighting, seductive leg focus',
    intensity: 2,
    is_active: true,
    group: 'lingerie-style',
    group_order: 4,
  },
  {
    slug: 'lingerie-satin',
    title: { ru: 'Атлас', en: 'Satin' },
    category: 'clothing',
    scene_type: 'clarification',
    clarification_for: ['lingerie'],
    image_prompt: 'woman wearing luxurious satin lingerie, silk chemise or slip, elegant and glamorous, soft lighting, classic beauty aesthetic',
    intensity: 1,
    is_active: true,
    group: 'lingerie-style',
    group_order: 5,
  },
  {
    slug: 'lingerie-latex',
    title: { ru: 'Латекс', en: 'Latex' },
    category: 'clothing',
    scene_type: 'clarification',
    clarification_for: ['lingerie', 'fetish'],
    image_prompt: 'woman wearing shiny black latex lingerie or bodysuit, fetish aesthetic, dramatic lighting, powerful and edgy, BDSM vibes',
    intensity: 3,
    is_active: true,
    group: 'lingerie-style',
    group_order: 6,
  },
  {
    slug: 'lingerie-leather',
    title: { ru: 'Кожа', en: 'Leather' },
    category: 'clothing',
    scene_type: 'clarification',
    clarification_for: ['lingerie', 'fetish'],
    image_prompt: 'woman wearing leather lingerie or harness, straps and buckles, edgy dominatrix aesthetic, dramatic lighting, powerful pose',
    intensity: 3,
    is_active: true,
    group: 'lingerie-style',
    group_order: 7,
  },
  {
    slug: 'lingerie-corset',
    title: { ru: 'Корсет', en: 'Corset' },
    category: 'clothing',
    scene_type: 'clarification',
    clarification_for: ['lingerie'],
    image_prompt: 'woman wearing elegant corset with stockings, hourglass silhouette, vintage burlesque aesthetic, warm boudoir lighting, classic sensuality',
    intensity: 2,
    is_active: true,
    group: 'lingerie-style',
    group_order: 8,
  },
];

// ============================================
// LOCATIONS - 6 small grid images
// ============================================
const locationsTemplates: V3SceneTemplate[] = [
  {
    slug: 'location-bedroom',
    title: { ru: 'Спальня', en: 'Bedroom' },
    category: 'locations',
    scene_type: 'clarification',
    clarification_for: ['public', 'spontaneous'],
    image_prompt: 'intimate couple in luxurious bedroom, large bed with soft sheets, romantic evening lighting, candles, private and comfortable atmosphere',
    intensity: 1,
    is_active: true,
    group: 'locations-favorite',
    group_order: 1,
  },
  {
    slug: 'location-shower',
    title: { ru: 'Душ', en: 'Shower' },
    category: 'locations',
    scene_type: 'clarification',
    clarification_for: ['public', 'spontaneous'],
    image_prompt: 'couple in steamy shower together, water running over bodies, glass shower door, wet skin, passionate embrace, sensual bathroom setting',
    intensity: 2,
    is_active: true,
    group: 'locations-favorite',
    group_order: 2,
  },
  {
    slug: 'location-kitchen',
    title: { ru: 'Кухня', en: 'Kitchen' },
    category: 'locations',
    scene_type: 'clarification',
    clarification_for: ['public', 'spontaneous'],
    image_prompt: 'couple being intimate on kitchen counter, spontaneous passion, modern kitchen setting, morning light through window, playful and urgent',
    intensity: 2,
    is_active: true,
    group: 'locations-favorite',
    group_order: 3,
  },
  {
    slug: 'location-car',
    title: { ru: 'Машина', en: 'Car' },
    category: 'locations',
    scene_type: 'clarification',
    clarification_for: ['public', 'spontaneous'],
    image_prompt: 'couple in car backseat, steamy windows, night time, parked in secluded area, passionate and forbidden feeling, cramped intimate space',
    intensity: 2,
    is_active: true,
    group: 'locations-favorite',
    group_order: 4,
  },
  {
    slug: 'location-nature',
    title: { ru: 'Природа', en: 'Nature' },
    category: 'locations',
    scene_type: 'clarification',
    clarification_for: ['public', 'spontaneous'],
    image_prompt: 'couple making love outdoors in nature, secluded forest clearing or beach, golden hour sunlight, blanket on grass, free and adventurous',
    intensity: 2,
    is_active: true,
    group: 'locations-favorite',
    group_order: 5,
  },
  {
    slug: 'location-hotel',
    title: { ru: 'Отель', en: 'Hotel' },
    category: 'locations',
    scene_type: 'clarification',
    clarification_for: ['public', 'spontaneous'],
    image_prompt: 'couple in upscale hotel room, large window with city view at night, king size bed, luxurious atmosphere, exciting getaway feeling',
    intensity: 2,
    is_active: true,
    group: 'locations-favorite',
    group_order: 6,
  },
];

// ============================================
// TOYS - 11 small grid images (with paired scenes)
// ============================================
const toysTemplates: V3SceneTemplate[] = [
  {
    slug: 'toy-vibrator',
    title: { ru: 'Вибратор', en: 'Vibrator' },
    category: 'toys',
    scene_type: 'clarification',
    clarification_for: ['toys'],
    role_direction: 'm_to_f',
    image_prompt: 'woman using elegant vibrator on herself, pleasuring with sex toy, intimate bedroom setting, soft lighting, sensual self-pleasure',
    intensity: 2,
    is_active: true,
    group: 'toys-type',
    group_order: 1,
  },
  {
    slug: 'toy-dildo',
    title: { ru: 'Дилдо', en: 'Dildo' },
    category: 'toys',
    scene_type: 'clarification',
    clarification_for: ['toys'],
    role_direction: 'm_to_f',
    image_prompt: 'woman using realistic dildo, penetrating herself with toy, intimate bedroom, sensual atmosphere, self-pleasure scene',
    intensity: 2,
    is_active: true,
    group: 'toys-type',
    group_order: 2,
  },
  {
    slug: 'toy-wand',
    title: { ru: 'Wand массажёр', en: 'Wand Massager' },
    category: 'toys',
    scene_type: 'clarification',
    clarification_for: ['toys'],
    role_direction: 'm_to_f',
    image_prompt: 'woman using magic wand massager between her legs, powerful vibrator on clitoris, intense pleasure expression, bedroom setting',
    intensity: 2,
    is_active: true,
    group: 'toys-type',
    group_order: 3,
  },
  {
    slug: 'toy-clamps-on-her',
    title: { ru: 'Зажимы на ней', en: 'Clamps on Her' },
    category: 'toys',
    scene_type: 'clarification',
    clarification_for: ['toys', 'pain'],
    role_direction: 'm_to_f',
    image_prompt: 'woman wearing nipple clamps with chain, metal clamps on nipples, BDSM aesthetic, pain and pleasure expression, dramatic lighting',
    intensity: 3,
    is_active: true,
    group: 'toys-type',
    group_order: 4,
  },
  {
    slug: 'toy-clamps-on-him',
    title: { ru: 'Зажимы на нём', en: 'Clamps on Him' },
    category: 'toys',
    scene_type: 'clarification',
    clarification_for: ['toys', 'pain'],
    role_direction: 'f_to_m',
    image_prompt: 'man wearing nipple clamps with chain, metal clamps on male nipples, BDSM aesthetic, pain expression, dramatic lighting, male submission',
    intensity: 3,
    is_active: true,
    group: 'toys-type',
    group_order: 5,
  },
  {
    slug: 'toy-cock-ring',
    title: { ru: 'Эрекционное кольцо', en: 'Cock Ring' },
    category: 'toys',
    scene_type: 'clarification',
    clarification_for: ['toys'],
    role_direction: 'f_to_m',
    image_prompt: 'couple using vibrating cock ring during sex, ring visible at base, intimate position, bedroom setting, enhanced pleasure for both',
    intensity: 2,
    is_active: true,
    group: 'toys-type',
    group_order: 6,
  },
  {
    slug: 'toy-beads-on-her',
    title: { ru: 'Шарики в ней', en: 'Beads in Her' },
    category: 'toys',
    scene_type: 'clarification',
    clarification_for: ['toys', 'anal-interest'],
    role_direction: 'm_to_f',
    image_prompt: 'woman with anal beads being slowly inserted or removed, string of graduated beads, intimate bedroom, sensual expression, BDSM aesthetic',
    intensity: 3,
    is_active: true,
    group: 'toys-type',
    group_order: 7,
  },
  {
    slug: 'toy-beads-on-him',
    title: { ru: 'Шарики в нём', en: 'Beads in Him' },
    category: 'toys',
    scene_type: 'clarification',
    clarification_for: ['toys', 'anal-interest'],
    role_direction: 'f_to_m',
    image_prompt: 'man with anal beads being used on him, bent over position, string of beads visible, intimate bedroom, male anal play, BDSM aesthetic',
    intensity: 3,
    is_active: true,
    group: 'toys-type',
    group_order: 8,
  },
  {
    slug: 'toy-clitoral',
    title: { ru: 'Клиторальная', en: 'Clitoral Toy' },
    category: 'toys',
    scene_type: 'clarification',
    clarification_for: ['toys'],
    role_direction: 'm_to_f',
    image_prompt: 'woman using clitoral suction toy like Satisfyer or Womanizer, air pulse stimulator on clitoris, intense pleasure expression, bedroom setting, modern sex toy',
    intensity: 2,
    is_active: true,
    group: 'toys-type',
    group_order: 9,
  },
];

// ============================================
// SINGLE SCENES
// ============================================
const singleSceneTemplates: V3SceneTemplate[] = [
  {
    slug: 'sex-swing',
    title: { ru: 'Секс-качели', en: 'Sex Swing' },
    category: 'toys',
    scene_type: 'clarification',
    clarification_for: ['toys', 'positions'],
    image_prompt: 'couple using sex swing, woman suspended in harness swing, man standing between her legs, bedroom or playroom setting, adventurous atmosphere',
    intensity: 3,
    is_active: true,
  },
  {
    slug: 'anal-hook',
    title: { ru: 'Анальный крюк', en: 'Anal Hook' },
    category: 'toys',
    scene_type: 'clarification',
    clarification_for: ['anal-interest', 'bondage-give', 'bondage-receive'],
    image_prompt: 'woman with stainless steel anal hook attached to rope, bent forward position, rope connecting hook to hair or collar, BDSM aesthetic, dungeon or bedroom setting, dramatic lighting, vulnerable and controlled',
    intensity: 4,
    is_active: true,
  },
];

// ============================================
// TEMPLATE GROUPS (for UI)
// ============================================
export const V3_TEMPLATE_GROUPS: V3TemplateGroup[] = [
  {
    id: 'bondage-type',
    name: 'Типы бондажа',
    description: '6 свайп-карточек для выбора типа связывания',
    scene_type_ui: 'swipe_cards',
    templates: bondageTypeTemplates,
  },
  {
    id: 'positions-favorite',
    name: 'Любимые позы',
    description: '8 свайп-карточек для выбора поз',
    scene_type_ui: 'swipe_cards',
    templates: positionsTemplates,
  },
  {
    id: 'lingerie-style',
    name: 'Стиль белья',
    description: '8 маленьких картинок для grid-выбора',
    scene_type_ui: 'image_selection',
    templates: lingerieTemplates,
  },
  {
    id: 'locations-favorite',
    name: 'Любимые места',
    description: '6 маленьких картинок для grid-выбора',
    scene_type_ui: 'image_selection',
    templates: locationsTemplates,
  },
  {
    id: 'toys-type',
    name: 'Игрушки',
    description: '11 картинок для grid-выбора (парные plug/clamps/beads)',
    scene_type_ui: 'image_selection',
    templates: toysTemplates,
  },
  {
    id: 'single-scenes',
    name: 'Отдельные сцены',
    description: 'Одиночные новые сцены',
    scene_type_ui: 'single',
    templates: singleSceneTemplates,
  },
];

// All templates flat list
export const ALL_V3_TEMPLATES: V3SceneTemplate[] = [
  ...bondageTypeTemplates,
  ...positionsTemplates,
  ...lingerieTemplates,
  ...locationsTemplates,
  ...toysTemplates,
  ...singleSceneTemplates,
];

// Helper to get templates by group
export function getTemplatesByGroup(groupId: string): V3SceneTemplate[] {
  const group = V3_TEMPLATE_GROUPS.find(g => g.id === groupId);
  return group?.templates ?? [];
}

// Helper to get a single template by slug
export function getTemplateBySlug(slug: string): V3SceneTemplate | undefined {
  return ALL_V3_TEMPLATES.find(t => t.slug === slug);
}
