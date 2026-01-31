import type { Locale } from '@/lib/types';

export type ActionId =
  | 'kiss'
  | 'lick'
  | 'bite'
  | 'suck'
  | 'pinch'
  | 'twist'
  | 'squeeze'
  | 'spank'
  | 'slap'
  | 'scratch'
  | 'massage'
  | 'touch'
  | 'touch_outside'
  | 'clamps'
  | 'wax'
  | 'ice'
  | 'finger'
  | 'penetrate'
  | 'anal_sex'
  | 'toys'
  | 'whisper';

export type ZoneId =
  | 'head'
  | 'lips'
  | 'ears'
  | 'neck'
  | 'shoulders'
  | 'chest'
  | 'breasts'
  | 'nipples'
  | 'stomach'
  | 'navel'
  | 'back'
  | 'lower_back'
  | 'arms'
  | 'hands'
  | 'fingers'
  | 'buttocks'
  | 'anus'
  | 'groin'
  | 'penis'
  | 'testicles'
  | 'vulva'
  | 'thighs'
  | 'knees'
  | 'feet';

export interface ActionInfo {
  id: ActionId;
  label: { ru: string; en: string };
  icon?: string;
}

// All available actions with labels
export const ACTIONS: Record<ActionId, ActionInfo> = {
  kiss: { id: 'kiss', label: { ru: 'Целовать', en: 'Kiss' } },
  lick: { id: 'lick', label: { ru: 'Лизать', en: 'Lick' } },
  bite: { id: 'bite', label: { ru: 'Кусать', en: 'Bite' } },
  suck: { id: 'suck', label: { ru: 'Сосать', en: 'Suck' } },
  pinch: { id: 'pinch', label: { ru: 'Щипать', en: 'Pinch' } },
  twist: { id: 'twist', label: { ru: 'Выкручивать', en: 'Twist' } },
  squeeze: { id: 'squeeze', label: { ru: 'Сжимать', en: 'Squeeze' } },
  spank: { id: 'spank', label: { ru: 'Шлёпать', en: 'Spank' } },
  slap: { id: 'slap', label: { ru: 'Бить', en: 'Slap' } },
  scratch: { id: 'scratch', label: { ru: 'Царапать', en: 'Scratch' } },
  massage: { id: 'massage', label: { ru: 'Массировать', en: 'Massage' } },
  touch: { id: 'touch', label: { ru: 'Трогать', en: 'Touch' } },
  touch_outside: { id: 'touch_outside', label: { ru: 'Трогать снаружи', en: 'Touch outside' } },
  clamps: { id: 'clamps', label: { ru: 'Зажимы', en: 'Clamps' } },
  wax: { id: 'wax', label: { ru: 'Воск', en: 'Wax' } },
  ice: { id: 'ice', label: { ru: 'Лёд', en: 'Ice' } },
  finger: { id: 'finger', label: { ru: 'Пальцами', en: 'Finger' } },
  penetrate: { id: 'penetrate', label: { ru: 'Проникать', en: 'Penetrate' } },
  anal_sex: { id: 'anal_sex', label: { ru: 'Анальный секс', en: 'Anal sex' } },
  toys: { id: 'toys', label: { ru: 'Игрушки', en: 'Toys' } },
  whisper: { id: 'whisper', label: { ru: 'Шептать', en: 'Whisper' } },
};

// Zone labels
export const ZONE_LABELS: Record<ZoneId, { ru: string; en: string }> = {
  head: { ru: 'Голова', en: 'Head' },
  lips: { ru: 'Губы', en: 'Lips' },
  ears: { ru: 'Уши', en: 'Ears' },
  neck: { ru: 'Шея', en: 'Neck' },
  shoulders: { ru: 'Плечи', en: 'Shoulders' },
  chest: { ru: 'Грудь', en: 'Chest' },
  breasts: { ru: 'Грудь', en: 'Breasts' },
  nipples: { ru: 'Соски', en: 'Nipples' },
  stomach: { ru: 'Живот', en: 'Stomach' },
  navel: { ru: 'Пупок', en: 'Navel' },
  back: { ru: 'Спина', en: 'Back' },
  lower_back: { ru: 'Поясница', en: 'Lower back' },
  arms: { ru: 'Руки', en: 'Arms' },
  hands: { ru: 'Кисти', en: 'Hands' },
  fingers: { ru: 'Пальцы', en: 'Fingers' },
  buttocks: { ru: 'Ягодицы', en: 'Buttocks' },
  anus: { ru: 'Анус', en: 'Anus' },
  groin: { ru: 'Пах', en: 'Groin' },
  penis: { ru: 'Пенис', en: 'Penis' },
  testicles: { ru: 'Яички', en: 'Testicles' },
  vulva: { ru: 'Вульва', en: 'Vulva' },
  thighs: { ru: 'Бёдра', en: 'Thighs' },
  knees: { ru: 'Колени', en: 'Knees' },
  feet: { ru: 'Стопы', en: 'Feet' },
};

// Actions available for each zone
export const ZONE_ACTIONS: Record<ZoneId, ActionId[]> = {
  head: ['kiss', 'lick', 'touch', 'massage'],
  lips: ['kiss', 'lick', 'bite', 'suck'],
  ears: ['kiss', 'lick', 'bite', 'suck', 'whisper'],
  neck: ['kiss', 'lick', 'bite', 'suck', 'squeeze'],
  shoulders: ['kiss', 'bite', 'massage', 'scratch'],
  chest: ['kiss', 'lick', 'touch', 'scratch', 'wax', 'ice'],
  breasts: ['kiss', 'lick', 'bite', 'squeeze', 'massage', 'spank', 'wax', 'ice'],
  nipples: ['kiss', 'bite', 'suck', 'twist', 'clamps', 'wax', 'ice'],
  stomach: ['kiss', 'lick', 'touch', 'scratch', 'wax', 'ice'],
  navel: ['kiss', 'lick', 'touch', 'scratch', 'wax', 'ice'],
  back: ['kiss', 'lick', 'scratch', 'massage', 'wax', 'ice'],
  lower_back: ['kiss', 'massage', 'scratch', 'wax'],
  arms: ['kiss', 'lick', 'bite', 'scratch'],
  hands: ['kiss', 'lick', 'bite', 'suck', 'massage'],
  fingers: ['kiss', 'lick', 'bite', 'suck', 'massage', 'touch'],
  buttocks: ['kiss', 'lick', 'bite', 'squeeze', 'spank', 'slap', 'scratch', 'massage'],
  anus: ['lick', 'touch_outside', 'finger', 'toys', 'anal_sex'],
  groin: ['kiss', 'lick', 'touch', 'massage'],
  penis: ['kiss', 'lick', 'suck', 'squeeze', 'massage', 'slap', 'toys'],
  testicles: ['kiss', 'lick', 'suck', 'squeeze', 'massage', 'slap', 'wax', 'ice'],
  vulva: ['kiss', 'lick', 'suck', 'touch', 'finger', 'penetrate', 'toys', 'spank'],
  thighs: ['kiss', 'lick', 'bite', 'scratch', 'spank', 'massage'],
  knees: ['kiss', 'lick', 'touch', 'scratch', 'massage'],
  feet: ['kiss', 'lick', 'suck', 'massage', 'touch'],
};

// Map detected zone names to ZoneId
export const ZONE_NAME_TO_ID: Record<string, ZoneId> = {
  // Russian
  'Голова': 'head',
  'Губы': 'lips',
  'Уши': 'ears',
  'Шея': 'neck',
  'Плечи': 'shoulders',
  'Грудь': 'chest',
  'Соски': 'nipples',
  'Левый сосок': 'nipples',
  'Правый сосок': 'nipples',
  'Живот': 'stomach',
  'Пупок': 'navel',
  'Верх спины': 'back',
  'Поясница': 'lower_back',
  'Руки': 'arms',
  'Кисти': 'hands',
  'Пальцы': 'fingers',
  'Ягодицы': 'buttocks',
  'Анус': 'anus',
  'Пах': 'groin',
  'Пенис': 'penis',
  'Яички': 'testicles',
  'Вульва': 'vulva',
  'Бёдра': 'thighs',
  'Колени': 'knees',
  'Стопы': 'feet',
  'Затылок': 'neck',
  // English
  'Head': 'head',
  'Lips': 'lips',
  'Ears': 'ears',
  'Neck': 'neck',
  'Shoulders': 'shoulders',
  'Chest': 'chest',
  'Breasts': 'breasts',
  'Nipples': 'nipples',
  'Left nipple': 'nipples',
  'Right nipple': 'nipples',
  'Stomach': 'stomach',
  'Navel': 'navel',
  'Upper back': 'back',
  'Lower back': 'lower_back',
  'Arms': 'arms',
  'Hands': 'hands',
  'Fingers': 'fingers',
  'Buttocks': 'buttocks',
  'Anus': 'anus',
  'Groin': 'groin',
  'Penis': 'penis',
  'Testicles': 'testicles',
  'Vulva': 'vulva',
  'Thighs': 'thighs',
  'Knees': 'knees',
  'Feet': 'feet',
  'Back of head': 'neck',
};

// Get ZoneId from detected zone name
export function getZoneId(zoneName: string, locale: Locale = 'ru'): ZoneId | null {
  return ZONE_NAME_TO_ID[zoneName] || null;
}

// Get actions for a zone
export function getActionsForZone(zoneId: ZoneId): ActionInfo[] {
  const actionIds = ZONE_ACTIONS[zoneId] || [];
  return actionIds.map((id) => ACTIONS[id]);
}

// Get zone label
export function getZoneLabel(zoneId: ZoneId, locale: Locale = 'ru'): string {
  return ZONE_LABELS[zoneId]?.[locale] || zoneId;
}

// Get action label
export function getActionLabel(actionId: ActionId, locale: Locale = 'ru'): string {
  return ACTIONS[actionId]?.label[locale] || actionId;
}
