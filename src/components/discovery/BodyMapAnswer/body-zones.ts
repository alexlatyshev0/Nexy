import type { BodyZoneId, BodyView, BodyGender, LocalizedString } from '@/lib/types';

// Body zone metadata
export interface BodyZoneMeta {
  id: BodyZoneId;
  label: LocalizedString;
  view: BodyView | 'both';
  gender: BodyGender | 'both';
}

// All body zones configuration
export const BODY_ZONES: BodyZoneMeta[] = [
  // Face
  {
    id: 'lips',
    label: { ru: 'Губы', en: 'Lips' },
    view: 'front',
    gender: 'both',
  },
  {
    id: 'cheeks',
    label: { ru: 'Щёки', en: 'Cheeks' },
    view: 'front',
    gender: 'both',
  },
  {
    id: 'ears',
    label: { ru: 'Уши', en: 'Ears' },
    view: 'front',
    gender: 'both',
  },
  {
    id: 'hair',
    label: { ru: 'Волосы', en: 'Hair' },
    view: 'front',
    gender: 'both',
  },
  {
    id: 'nape',
    label: { ru: 'Затылок', en: 'Nape' },
    view: 'back',
    gender: 'both',
  },
  // Neck
  {
    id: 'neck',
    label: { ru: 'Шея', en: 'Neck' },
    view: 'both',
    gender: 'both',
  },
  // Chest/torso
  {
    id: 'nipples',
    label: { ru: 'Соски', en: 'Nipples' },
    view: 'front',
    gender: 'both',
  },
  {
    id: 'chest',
    label: { ru: 'Грудь', en: 'Chest' },
    view: 'front',
    gender: 'both',
  },
  {
    id: 'belly',
    label: { ru: 'Живот', en: 'Belly' },
    view: 'front',
    gender: 'both',
  },
  // Arms
  {
    id: 'shoulders',
    label: { ru: 'Плечи', en: 'Shoulders' },
    view: 'both',
    gender: 'both',
  },
  {
    id: 'hands',
    label: { ru: 'Кисти рук', en: 'Hands' },
    view: 'front',
    gender: 'both',
  },
  {
    id: 'fingers',
    label: { ru: 'Пальцы', en: 'Fingers' },
    view: 'front',
    gender: 'both',
  },
  // Back
  {
    id: 'upper_back',
    label: { ru: 'Верх спины', en: 'Upper back' },
    view: 'back',
    gender: 'both',
  },
  {
    id: 'lower_back',
    label: { ru: 'Поясница', en: 'Lower back' },
    view: 'back',
    gender: 'both',
  },
  // Buttocks
  {
    id: 'buttocks',
    label: { ru: 'Ягодицы', en: 'Buttocks' },
    view: 'back',
    gender: 'both',
  },
  // Male genitals
  {
    id: 'penis',
    label: { ru: 'Пенис', en: 'Penis' },
    view: 'front',
    gender: 'male',
  },
  {
    id: 'testicles',
    label: { ru: 'Яички', en: 'Testicles' },
    view: 'front',
    gender: 'male',
  },
  // Female genitals
  {
    id: 'vulva',
    label: { ru: 'Вульва', en: 'Vulva' },
    view: 'front',
    gender: 'female',
  },
  {
    id: 'clitoris',
    label: { ru: 'Клитор', en: 'Clitoris' },
    view: 'front',
    gender: 'female',
  },
  // Anus
  {
    id: 'anus',
    label: { ru: 'Анус', en: 'Anus' },
    view: 'back',
    gender: 'both',
  },
  // Legs
  {
    id: 'inner_thighs',
    label: { ru: 'Внутр. бёдра', en: 'Inner thighs' },
    view: 'front',
    gender: 'both',
  },
  {
    id: 'feet',
    label: { ru: 'Ступни', en: 'Feet' },
    view: 'front',
    gender: 'both',
  },
];

// Get zones for a specific view and gender
export function getZonesForView(
  view: BodyView,
  gender: BodyGender
): BodyZoneMeta[] {
  return BODY_ZONES.filter((zone) => {
    const viewMatch = zone.view === view || zone.view === 'both';
    const genderMatch = zone.gender === gender || zone.gender === 'both';
    return viewMatch && genderMatch;
  });
}

// Get zone by id
export function getZoneById(id: BodyZoneId): BodyZoneMeta | undefined {
  return BODY_ZONES.find((zone) => zone.id === id);
}

// Get zone label by locale
export function getZoneLabel(
  id: BodyZoneId,
  locale: 'ru' | 'en' = 'ru'
): string {
  const zone = getZoneById(id);
  return zone?.label[locale] ?? id;
}

// Action labels
export const ACTION_LABELS: Record<string, LocalizedString> = {
  kiss: { ru: 'Целовать', en: 'Kiss' },
  lick_suck: { ru: 'Лизать/сосать', en: 'Lick/suck' },
  light_slap: { ru: 'Легонько шлёпать', en: 'Light slap' },
  spank: { ru: 'Пороть', en: 'Spank' },
  bite_scratch: { ru: 'Кусать/царапать', en: 'Bite/scratch' },
  squeeze_twist: { ru: 'Сжимать/крутить', en: 'Squeeze/twist' },
};

// Preference colors
export const PREFERENCE_COLORS = {
  love: {
    fill: 'rgba(34, 197, 94, 0.6)',
    stroke: '#16a34a',
    label: { ru: 'Люблю', en: 'Love' },
  },
  sometimes: {
    fill: 'rgba(234, 179, 8, 0.6)',
    stroke: '#ca8a04',
    label: { ru: 'Иногда', en: 'Sometimes' },
  },
  no: {
    fill: 'rgba(239, 68, 68, 0.6)',
    stroke: '#dc2626',
    label: { ru: 'Нет', en: 'No' },
  },
} as const;

// ============================================
// ZONE COORDINATES
// ============================================

export type SilhouetteType = 'male-front' | 'male-back' | 'female-front' | 'female-back';

export type ShapeType = 'ellipse' | 'rect' | 'circle';

export interface EllipseShape {
  type: 'ellipse';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export interface RectShape {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
}

export interface CircleShape {
  type: 'circle';
  cx: number;
  cy: number;
  r: number;
}

export type ZoneShape = EllipseShape | RectShape | CircleShape;

export interface ZoneCoordinate {
  zoneId: BodyZoneId;
  shapes: ZoneShape[];
}

// ============================================
// ZONE COORDINATES FOR ANIME DOLLS
// ============================================
// Images: man_front.jpg, man_back.jpg, woman_front.jpeg, woman_back.jpeg
// ViewBox: 0 0 100 200 (adjusted for anime proportions - longer legs)

export const ZONE_COORDINATES: Record<SilhouetteType, ZoneCoordinate[]> = {
  // man_front.jpg - новые координаты
  'male-front': [
    // Голова/Hair - from Head bounds
    { zoneId: 'hair', shapes: [{ type: 'ellipse', cx: 48.4, cy: 17, rx: 12.2, ry: 8.4 }] },
    // Лицо/Cheeks - from Face bounds, split into two
    { zoneId: 'cheeks', shapes: [
      { type: 'ellipse', cx: 46, cy: 29.5, rx: 5, ry: 9 },
      { type: 'ellipse', cx: 52, cy: 29.5, rx: 5, ry: 9 },
    ]},
    // Губы/Lips
    { zoneId: 'lips', shapes: [{ type: 'ellipse', cx: 49, cy: 34, rx: 3.2, ry: 2.5 }] },
    // Уши/Ears
    { zoneId: 'ears', shapes: [
      { type: 'ellipse', cx: 41.9, cy: 29.5, rx: 2.3, ry: 4.3 },
      { type: 'ellipse', cx: 55.7, cy: 27.7, rx: 2.1, ry: 3.8 },
    ]},
    // Шея/Neck
    { zoneId: 'neck', shapes: [{ type: 'rect', x: 43.4, y: 35.5, width: 11.2, height: 7.4, rx: 2 }] },
    // Плечи/Shoulders
    { zoneId: 'shoulders', shapes: [{ type: 'rect', x: 28, y: 41.8, width: 40.2, height: 7.6, rx: 2 }] },
    // Грудь/Chest
    { zoneId: 'chest', shapes: [{ type: 'rect', x: 38.2, y: 49.5, width: 24.4, height: 19.4, rx: 3 }] },
    // Соски/Nipples
    { zoneId: 'nipples', shapes: [
      { type: 'circle', cx: 45, cy: 58.3, r: 2.9 },
      { type: 'circle', cx: 61.6, cy: 58.6, r: 3 },
    ]},
    // Живот/Belly (Stomach + Navel area)
    { zoneId: 'belly', shapes: [{ type: 'ellipse', cx: 51.4, cy: 77.9, rx: 11.8, ry: 8.5 }] },
    // Руки/Arms → Кисти/Hands
    { zoneId: 'hands', shapes: [
      { type: 'ellipse', cx: 34.3, cy: 97.5, rx: 5.3, ry: 5.3 },
      { type: 'ellipse', cx: 70.5, cy: 102, rx: 4, ry: 5 },
    ]},
    // Пальцы/Fingers
    { zoneId: 'fingers', shapes: [
      { type: 'rect', x: 30.8, y: 101.6, width: 9.6, height: 11.6, rx: 1 },
      { type: 'rect', x: 68.4, y: 101.2, width: 4.2, height: 11.2, rx: 1 },
    ]},
    // Пенис/Penis
    { zoneId: 'penis', shapes: [{ type: 'ellipse', cx: 57.5, cy: 96.7, rx: 4, ry: 9.3 }] },
    // Яички/Testicles
    { zoneId: 'testicles', shapes: [{ type: 'ellipse', cx: 58.3, cy: 103.6, rx: 3.7, ry: 4.6 }] },
    // Бёдра/Thighs → inner_thighs
    { zoneId: 'inner_thighs', shapes: [{ type: 'rect', x: 35.8, y: 109.7, width: 34.8, height: 19, rx: 2 }] },
    // Стопы/Feet
    { zoneId: 'feet', shapes: [
      { type: 'ellipse', cx: 38, cy: 185.6, rx: 10, ry: 9 },
      { type: 'ellipse', cx: 64, cy: 185.6, rx: 10, ry: 9 },
    ]},
  ],
  // man_back.jpg - back view, legs spread
  'male-back': [
    { zoneId: 'hair', shapes: [{ type: 'ellipse', cx: 50, cy: 5, rx: 14, ry: 7 }] },
    { zoneId: 'nape', shapes: [{ type: 'ellipse', cx: 50, cy: 14, rx: 6, ry: 4 }] },
    { zoneId: 'ears', shapes: [
      { type: 'ellipse', cx: 36, cy: 8, rx: 2, ry: 3 },
      { type: 'ellipse', cx: 64, cy: 8, rx: 2, ry: 3 },
    ]},
    { zoneId: 'neck', shapes: [{ type: 'rect', x: 43, y: 16, width: 14, height: 5, rx: 2 }] },
    { zoneId: 'shoulders', shapes: [
      { type: 'rect', x: 20, y: 21, width: 18, height: 7, rx: 2 },
      { type: 'rect', x: 62, y: 21, width: 18, height: 7, rx: 2 },
    ]},
    { zoneId: 'upper_back', shapes: [{ type: 'rect', x: 30, y: 26, width: 40, height: 18, rx: 3 }] },
    { zoneId: 'lower_back', shapes: [{ type: 'rect', x: 35, y: 46, width: 30, height: 12, rx: 3 }] },
    { zoneId: 'hands', shapes: [
      { type: 'ellipse', cx: 22, cy: 62, rx: 4, ry: 5 },
      { type: 'ellipse', cx: 78, cy: 62, rx: 4, ry: 5 },
    ]},
    { zoneId: 'fingers', shapes: [
      { type: 'rect', x: 18, y: 67, width: 8, height: 6, rx: 1 },
      { type: 'rect', x: 74, y: 67, width: 8, height: 6, rx: 1 },
    ]},
    { zoneId: 'buttocks', shapes: [
      { type: 'ellipse', cx: 42, cy: 66, rx: 10, ry: 10 },
      { type: 'ellipse', cx: 58, cy: 66, rx: 10, ry: 10 },
    ]},
    { zoneId: 'anus', shapes: [{ type: 'circle', cx: 50, cy: 72, r: 3 }] },
    { zoneId: 'inner_thighs', shapes: [
      { type: 'rect', x: 38, y: 80, width: 10, height: 20, rx: 2 },
      { type: 'rect', x: 52, y: 80, width: 10, height: 20, rx: 2 },
    ]},
    { zoneId: 'feet', shapes: [
      { type: 'ellipse', cx: 32, cy: 188, rx: 6, ry: 5 },
      { type: 'ellipse', cx: 68, cy: 188, rx: 6, ry: 5 },
    ]},
  ],
  // woman_front.jpeg - frontal view, anime proportions
  'female-front': [
    { zoneId: 'hair', shapes: [{ type: 'ellipse', cx: 50, cy: 4, rx: 16, ry: 7 }] },
    { zoneId: 'cheeks', shapes: [
      { type: 'ellipse', cx: 44, cy: 11, rx: 4, ry: 4 },
      { type: 'ellipse', cx: 56, cy: 11, rx: 4, ry: 4 },
    ]},
    { zoneId: 'lips', shapes: [{ type: 'ellipse', cx: 50, cy: 15, rx: 3, ry: 1.5 }] },
    { zoneId: 'ears', shapes: [
      { type: 'ellipse', cx: 35, cy: 10, rx: 2, ry: 3 },
      { type: 'ellipse', cx: 65, cy: 10, rx: 2, ry: 3 },
    ]},
    { zoneId: 'neck', shapes: [{ type: 'rect', x: 44, y: 18, width: 12, height: 5, rx: 2 }] },
    { zoneId: 'shoulders', shapes: [
      { type: 'rect', x: 26, y: 23, width: 12, height: 5, rx: 2 },
      { type: 'rect', x: 62, y: 23, width: 12, height: 5, rx: 2 },
    ]},
    { zoneId: 'chest', shapes: [
      { type: 'ellipse', cx: 40, cy: 32, rx: 9, ry: 7 },
      { type: 'ellipse', cx: 60, cy: 32, rx: 9, ry: 7 },
    ]},
    { zoneId: 'nipples', shapes: [
      { type: 'circle', cx: 40, cy: 33, r: 3 },
      { type: 'circle', cx: 60, cy: 33, r: 3 },
    ]},
    { zoneId: 'belly', shapes: [{ type: 'ellipse', cx: 50, cy: 50, rx: 10, ry: 10 }] },
    { zoneId: 'hands', shapes: [
      { type: 'ellipse', cx: 22, cy: 58, rx: 4, ry: 6 },
      { type: 'ellipse', cx: 78, cy: 58, rx: 4, ry: 6 },
    ]},
    { zoneId: 'fingers', shapes: [
      { type: 'rect', x: 18, y: 64, width: 8, height: 6, rx: 1 },
      { type: 'rect', x: 74, y: 64, width: 8, height: 6, rx: 1 },
    ]},
    { zoneId: 'vulva', shapes: [{ type: 'ellipse', cx: 50, cy: 68, rx: 4, ry: 5 }] },
    { zoneId: 'clitoris', shapes: [{ type: 'circle', cx: 50, cy: 64, r: 2 }] },
    { zoneId: 'inner_thighs', shapes: [
      { type: 'rect', x: 40, y: 72, width: 8, height: 20, rx: 2 },
      { type: 'rect', x: 52, y: 72, width: 8, height: 20, rx: 2 },
    ]},
    { zoneId: 'feet', shapes: [
      { type: 'ellipse', cx: 40, cy: 188, rx: 6, ry: 5 },
      { type: 'ellipse', cx: 58, cy: 190, rx: 6, ry: 5 },
    ]},
  ],
  // woman_back.jpeg - back view, legs spread, bent forward
  'female-back': [
    { zoneId: 'hair', shapes: [{ type: 'ellipse', cx: 50, cy: 6, rx: 14, ry: 10 }] },
    { zoneId: 'nape', shapes: [{ type: 'ellipse', cx: 50, cy: 16, rx: 5, ry: 3 }] },
    { zoneId: 'ears', shapes: [
      { type: 'ellipse', cx: 36, cy: 10, rx: 2, ry: 3 },
      { type: 'ellipse', cx: 64, cy: 10, rx: 2, ry: 3 },
    ]},
    { zoneId: 'neck', shapes: [{ type: 'rect', x: 44, y: 18, width: 12, height: 4, rx: 2 }] },
    { zoneId: 'shoulders', shapes: [
      { type: 'rect', x: 28, y: 22, width: 12, height: 5, rx: 2 },
      { type: 'rect', x: 60, y: 22, width: 12, height: 5, rx: 2 },
    ]},
    { zoneId: 'upper_back', shapes: [{ type: 'rect', x: 35, y: 26, width: 30, height: 14, rx: 3 }] },
    { zoneId: 'lower_back', shapes: [{ type: 'rect', x: 40, y: 42, width: 20, height: 10, rx: 3 }] },
    { zoneId: 'hands', shapes: [
      { type: 'ellipse', cx: 18, cy: 52, rx: 4, ry: 5 },
      { type: 'ellipse', cx: 82, cy: 52, rx: 4, ry: 5 },
    ]},
    { zoneId: 'fingers', shapes: [
      { type: 'rect', x: 14, y: 57, width: 8, height: 5, rx: 1 },
      { type: 'rect', x: 78, y: 57, width: 8, height: 5, rx: 1 },
    ]},
    { zoneId: 'buttocks', shapes: [
      { type: 'ellipse', cx: 40, cy: 60, rx: 12, ry: 12 },
      { type: 'ellipse', cx: 60, cy: 60, rx: 12, ry: 12 },
    ]},
    { zoneId: 'anus', shapes: [{ type: 'circle', cx: 50, cy: 66, r: 3 }] },
    { zoneId: 'inner_thighs', shapes: [
      { type: 'rect', x: 32, y: 74, width: 12, height: 22, rx: 2 },
      { type: 'rect', x: 56, y: 74, width: 12, height: 22, rx: 2 },
    ]},
    { zoneId: 'feet', shapes: [
      { type: 'ellipse', cx: 28, cy: 186, rx: 6, ry: 6 },
      { type: 'ellipse', cx: 72, cy: 186, rx: 6, ry: 6 },
    ]},
  ],
};

// Helper to get coordinates for a silhouette
export function getZoneCoordinates(silhouetteType: SilhouetteType): ZoneCoordinate[] {
  return ZONE_COORDINATES[silhouetteType];
}
