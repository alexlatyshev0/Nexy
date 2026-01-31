import type { BodyView, BodyGender } from '@/lib/types';

export interface DetectedZone {
  name: { ru: string; en: string };
  x: number;
  y: number;
  confidence: 'high' | 'medium' | 'low';
}

// Body zone regions for detection (percentages)
// These are approximate zones based on typical body proportions
// Use ZoneCalibrationTool to adjust these values visually
export const ZONE_REGIONS: Record<
  `${BodyGender}-${BodyView}`,
  Array<{
    name: { ru: string; en: string };
    bounds: { x1: number; y1: number; x2: number; y2: number };
  }>
> = {
  'male-front': [
    { name: { ru: 'Голова', en: 'Head' }, bounds: { x1: 36.2, y1: 4.321516610986392, x2: 60.60000000000001, y2: 12.728765909264188 } },
    { name: { ru: 'Уши', en: 'Ears' }, bounds: { x1: 39.599999999999994, y1: 12.609124705197642, x2: 44.199999999999996, y2: 16.893370363792815 } },
    { name: { ru: 'Уши', en: 'Ears' }, bounds: { x1: 53.60000000000001, y1: 11.965128077376251, x2: 57.8, y2: 15.722977435024154 } },
    { name: { ru: 'Лицо', en: 'Face' }, bounds: { x1: 42.79999999999999, y1: 10.284438741580718, x2: 55.59999999999999, y2: 19.246423470643364 } },
    { name: { ru: 'Губы', en: 'Lips' }, bounds: { x1: 45.8, y1: 15.774886653099998, x2: 52.2, y2: 18.289262805432585 } },
    { name: { ru: 'Шея', en: 'Neck' }, bounds: { x1: 43.4, y1: 17.741144210453914, x2: 54.600000000000016, y2: 21.421860555105937 } },
    { name: { ru: 'Плечи', en: 'Shoulders' }, bounds: { x1: 28.000000000000004, y1: 20.92008279580512, x2: 68.20000000000002, y2: 24.697587565975056 } },
    { name: { ru: 'Грудь', en: 'Chest' }, bounds: { x1: 38.20000000000001, y1: 24.74392840165291, x2: 62.6, y2: 34.4617226157106 } },
    { name: { ru: 'Соски', en: 'Nipples' }, bounds: { x1: 43.00000000000001, y1: 27.723528670584734, x2: 47.00000000000001, y2: 30.576126581097686 } },
    { name: { ru: 'Соски', en: 'Nipples' }, bounds: { x1: 59.400000000000006, y1: 27.781750589604716, x2: 63.8, y2: 30.771192069225798 } },
    { name: { ru: 'Живот', en: 'Stomach' }, bounds: { x1: 39.599999999999994, y1: 34.6905305464848, x2: 63.2, y2: 43.19156398723947 } },
    { name: { ru: 'Пупок', en: 'Navel' }, bounds: { x1: 53.39999999999999, y1: 36.4239004277588, x2: 58.4, y2: 39.55018547648802 } },
    { name: { ru: 'Руки', en: 'Arms' }, bounds: { x1: 25.199999999999992, y1: 24.84146114571697, x2: 38.99999999999999, y2: 46.29673299975043 } },
    { name: { ru: 'Руки', en: 'Arms' }, bounds: { x1: 62.60000000000001, y1: 25.465968435145374, x2: 69.2, y2: 46.58858691339647 } },
    { name: { ru: 'Кисти', en: 'Hands' }, bounds: { x1: 29, y1: 46.1249894946225, x2: 39.6, y2: 51.394430813403986 } },
    { name: { ru: 'Кисти', en: 'Hands' }, bounds: { x1: 69.60000000000001, y1: 49.16409335408644, x2: 75.39999999999999, y2: 51.76562271451212 } },
    { name: { ru: 'Пальцы', en: 'Fingers' }, bounds: { x1: 30.799999999999997, y1: 50.79586462858525, x2: 40.4, y2: 56.626022935377165 } },
    { name: { ru: 'Пальцы', en: 'Fingers' }, bounds: { x1: 68.39999999999998, y1: 50.59782186627261, x2: 72.59999999999997, y2: 56.21400359096052 } },
    { name: { ru: 'Пах', en: 'Groin' }, bounds: { x1: 53.2, y1: 43.23716050437118, x2: 61.800000000000004, y2: 47.87914426839621 } },
    { name: { ru: 'Пенис', en: 'Penis' }, bounds: { x1: 53.8, y1: 46, x2: 76.8, y2: 50.9530952886575 } },
    { name: { ru: 'Яички', en: 'Testicles' }, bounds: { x1: 54.59999999999999, y1: 49.4967606124634, x2: 61.99999999999999, y2: 54.10866950886003 } },
    { name: { ru: 'Бёдра', en: 'Thighs' }, bounds: { x1: 35.8, y1: 54.83327364170946, x2: 70.60000000000001, y2: 64.34585702208773 } },
    { name: { ru: 'Колени', en: 'Knees' }, bounds: { x1: 33.99999999999999, y1: 64.5156987152958, x2: 70.19999999999999, y2: 72.79217004471104 } },
    { name: { ru: 'Голени', en: 'Shins' }, bounds: { x1: 29.4, y1: 73.25609860720357, x2: 65.4, y2: 88.25609860720357 } },
    { name: { ru: 'Стопы', en: 'Feet' }, bounds: { x1: 27.79999999999999, y1: 88.28909673130352, x2: 75, y2: 97.32358349249573 } },
  ],
  'male-back': [
    { name: { ru: 'Затылок', en: 'Back of head' }, bounds: { x1: 21.6, y1: 3.849779823839782, x2: 42.800000000000004, y2: 13.744472750595815 } },
    { name: { ru: 'Шея', en: 'Neck' }, bounds: { x1: 29, y1: 13.40371665025602, x2: 41.6, y2: 17.57209671522832 } },
    { name: { ru: 'Плечи', en: 'Shoulders' }, bounds: { x1: 16.19999999999999, y1: 17.178938585351204, x2: 25.400000000000006, y2: 23.192566699487962 } },
    { name: { ru: 'Верх спины', en: 'Upper back' }, bounds: { x1: 24.799999999999997, y1: 15.292838983887256, x2: 58.4, y2: 26.268400842286923 } },
    { name: { ru: 'Поясница', en: 'Lower back' }, bounds: { x1: 27.400000000000002, y1: 26.11792915904205, x2: 61, y2: 31.963461505401952 } },
    { name: { ru: 'Руки', en: 'Arms' }, bounds: { x1: 14.799999999999997, y1: 23.03378598814643, x2: 25.999999999999996, y2: 41.50255489669736 } },
    { name: { ru: 'Руки', en: 'Arms' }, bounds: { x1: 59.799999999999976, y1: 19.774183116645712, x2: 71.4, y2: 33.46877355570217 } },
    { name: { ru: 'Ягодицы', en: 'Buttocks' }, bounds: { x1: 25.800000000000004, y1: 29.53905117685612, x2: 68.60000000000002, y2: 42.504557529046224 } },
    { name: { ru: 'Анус', en: 'Anus' }, bounds: { x1: 48.000000000000014, y1: 35.47302103318206, x2: 52.20000000000001, y2: 39.67293759401852 } },
    { name: { ru: 'Пенис', en: 'Penis' }, bounds: { x1: 44, y1: 42, x2: 50, y2: 48 } },
    { name: { ru: 'Яички', en: 'Testicles' }, bounds: { x1: 44, y1: 42.1141846957315, x2: 49.8, y2: 45.840497557515235 } },
    { name: { ru: 'Бёдра', en: 'Thighs' }, bounds: { x1: 23.400000000000013, y1: 44.705651973604695, x2: 76.20000000000002, y2: 60.563065955988435 } },
    { name: { ru: 'Икры', en: 'Calves' }, bounds: { x1: 19.400000000000006, y1: 63.6925596637481, x2: 88.39999999999999, y2: 80.99603681971561 } },
    { name: { ru: 'Стопы', en: 'Feet' }, bounds: { x1: 19.4, y1: 89.08497734385095, x2: 99, y2: 99.18749912053252 } },
  ],
  'female-front': [
    { name: { ru: 'Голова', en: 'Head' }, bounds: { x1: 42.800000000000004, y1: 1.5672227719401146, x2: 64.6, y2: 13.119641204066543 } },
    { name: { ru: 'Уши', en: 'Ears' }, bounds: { x1: 44.800000000000004, y1: 11.905417521263999, x2: 48.6, y2: 15.526423309803768 } },
    { name: { ru: 'Уши', en: 'Ears' }, bounds: { x1: 58.60000000000001, y1: 10.988890244060507, x2: 63.20000000000002, y2: 14.452074488006888 } },
    { name: { ru: 'Лицо', en: 'Face' }, bounds: { x1: 45.20000000000001, y1: 10.186905997516666, x2: 62.199999999999996, y2: 15.769345279558495 } },
    { name: { ru: 'Губы', en: 'Lips' }, bounds: { x1: 50.599999999999994, y1: 14.308918217954618, x2: 56.39999999999999, y2: 17.077326095981427 } },
    { name: { ru: 'Шея', en: 'Neck' }, bounds: { x1: 48.6, y1: 17.21416966508956, x2: 59.4, y2: 20.150957608088667 } },
    { name: { ru: 'Плечи', en: 'Shoulders' }, bounds: { x1: 38.20000000000001, y1: 19.16226044701371, x2: 71.80000000000001, y2: 23.8583593758965 } },
    { name: { ru: 'Грудь', en: 'Breasts' }, bounds: { x1: 38.800000000000004, y1: 22.71390755173752, x2: 64.60000000000002, y2: 31.042866343645706 } },
    { name: { ru: 'Соски', en: 'Nipples' }, bounds: { x1: 39.800000000000004, y1: 24.793824755932388, x2: 43.199999999999996, y2: 27.568545334903337 } },
    { name: { ru: 'Соски', en: 'Nipples' }, bounds: { x1: 57.99999999999999, y1: 25.41907636390694, x2: 62.39999999999999, y2: 28.01838686727181 } },
    { name: { ru: 'Живот', en: 'Stomach' }, bounds: { x1: 42, y1: 32.348256051855195, x2: 68.00000000000001, y2: 42.82257706059756 } },
    { name: { ru: 'Пупок', en: 'Navel' }, bounds: { x1: 48.599999999999994, y1: 35.70186039426632, x2: 53.19999999999999, y2: 38.69130187388741 } },
    { name: { ru: 'Руки', en: 'Arms' }, bounds: { x1: 32.40000000000002, y1: 26.775437888660583, x2: 41.20000000000001, y2: 44.5299788284054 } },
    { name: { ru: 'Руки', en: 'Arms' }, bounds: { x1: 63.79999999999998, y1: 23.081405841287157, x2: 73.79999999999998, y2: 40.01860695911386 } },
    { name: { ru: 'Кисти', en: 'Hands' }, bounds: { x1: 29.2, y1: 44.36716714583109, x2: 37.39999999999999, y2: 48.75658081239767 } },
    { name: { ru: 'Кисти', en: 'Hands' }, bounds: { x1: 72.20000000000003, y1: 45.44151596762798, x2: 79.80000000000003, y2: 48.638648337265444 } },
    { name: { ru: 'Пальцы', en: 'Fingers' }, bounds: { x1: 28.799999999999994, y1: 48.97907604222772, x2: 38.599999999999994, y2: 54.55594694187157 } },
    { name: { ru: 'Пальцы', en: 'Fingers' }, bounds: { x1: 71.60000000000002, y1: 48.07939297749077, x2: 78.60000000000002, y2: 53.49976489550443 } },
    { name: { ru: 'Пах', en: 'Groin' }, bounds: { x1: 51.4, y1: 42.10607840064659, x2: 58.4, y2: 46.33753145734721 } },
    { name: { ru: 'Вульва', en: 'Vulva' }, bounds: { x1: 50.80000000000001, y1: 44.9671949588856, x2: 59.4, y2: 50.24071602297282 } },
    { name: { ru: 'Бёдра', en: 'Thighs' }, bounds: { x1: 32.599999999999994, y1: 49.97480321393646, x2: 75, y2: 60.08777255994428 } },
    { name: { ru: 'Колени', en: 'Knees' }, bounds: { x1: 28, y1: 60.31583617217232, x2: 75, y2: 68.24074303182928 } },
    { name: { ru: 'Голени', en: 'Shins' }, bounds: { x1: 19.200000000000014, y1: 68.1179864928452, x2: 80.20000000000003, y2: 83.64570535675571 } },
    { name: { ru: 'Стопы', en: 'Feet' }, bounds: { x1: 12.8, y1: 85.5733693987552, x2: 79.2, y2: 94.88079897961752 } },
  ],
  'female-back': [
    { name: { ru: 'Затылок', en: 'Back of head' }, bounds: { x1: 48.6, y1: 3.1090777378551255, x2: 75.60000000000001, y2: 17.67363231630526 } },
    { name: { ru: 'Шея', en: 'Neck' }, bounds: { x1: 55, y1: 17, x2: 68, y2: 21 } },
    { name: { ru: 'Плечи', en: 'Shoulders' }, bounds: { x1: 40.999999999999986, y1: 17.631013073358087, x2: 79.39999999999999, y2: 20.979076042227728 } },
    { name: { ru: 'Верх спины', en: 'Upper back' }, bounds: { x1: 42.199999999999996, y1: 19.10478284653987, x2: 72.6, y2: 26.850778129702128 } },
    { name: { ru: 'Поясница', en: 'Lower back' }, bounds: { x1: 37.400000000000006, y1: 25.437463231178743, x2: 63.800000000000004, y2: 31.74417550235145 } },
    { name: { ru: 'Руки', en: 'Arms' }, bounds: { x1: 20, y1: 21, x2: 42, y2: 46 } },
    { name: { ru: 'Руки', en: 'Arms' }, bounds: { x1: 65.40000000000002, y1: 27.955451936276493, x2: 77.60000000000002, y2: 46.35197764458588 } },
    { name: { ru: 'Ягодицы', en: 'Buttocks' }, bounds: { x1: 14.200000000000003, y1: 29.47197700122745, x2: 64.80000000000001, y2: 45.87302465043763 } },
    { name: { ru: 'Анус', en: 'Anus' }, bounds: { x1: 32.60000000000001, y1: 34.096484290655866, x2: 39.40000000000001, y2: 39.436001602942966 } },
    { name: { ru: 'Вульва', en: 'Vulva' }, bounds: { x1: 32.599999999999994, y1: 39.56931666230595, x2: 42.79999999999999, y2: 45.62883413543265 } },
    { name: { ru: 'Бёдра', en: 'Thighs' }, bounds: { x1: 11.400000000000002, y1: 46.27818005834957, x2: 72, y2: 62.15933719054215 } },
    { name: { ru: 'Икры', en: 'Calves' }, bounds: { x1: 15.199999999999996, y1: 69.63862132840896, x2: 84.79999999999998, y2: 85.36272824341079 } },
    { name: { ru: 'Стопы', en: 'Feet' }, bounds: { x1: 23.4, y1: 89.43908992900403, x2: 88.79999999999998, y2: 99.6039144753747 } },
  ],
};

/**
 * Detect all zones within a radius of the tap point
 * Used for Tap → Confirm flow on mobile when multiple zones are close
 */
export function detectZonesInRadius(
  x: number,
  y: number,
  gender: BodyGender,
  view: BodyView,
  radiusPercent: number = 5 // Default 5% radius for mobile tap
): DetectedZone[] {
  const key = `${gender}-${view}` as const;
  const zones = ZONE_REGIONS[key];

  if (!zones) return [];

  const matches: DetectedZone[] = [];

  for (const zone of zones) {
    const { x1, y1, x2, y2 } = zone.bounds;

    // Check if the tap point is within the zone bounds OR within radius of zone center
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

    // Point is inside zone
    const isInside = x >= x1 && x <= x2 && y >= y1 && y <= y2;

    // Point is within radius of zone center
    const isNearCenter = distance <= radiusPercent + Math.max(x2 - x1, y2 - y1) / 2;

    // Point is within radius of zone edges
    const isNearEdge =
      x >= x1 - radiusPercent &&
      x <= x2 + radiusPercent &&
      y >= y1 - radiusPercent &&
      y <= y2 + radiusPercent;

    if (isInside || isNearCenter || isNearEdge) {
      // Calculate confidence based on how centered the point is
      let confidence: 'high' | 'medium' | 'low';
      if (isInside) {
        const distFromCenter = Math.sqrt(
          Math.pow((x - centerX) / (x2 - x1), 2) + Math.pow((y - centerY) / (y2 - y1), 2)
        );
        confidence = distFromCenter < 0.3 ? 'high' : distFromCenter < 0.5 ? 'medium' : 'low';
      } else {
        confidence = 'low';
      }

      matches.push({
        name: zone.name,
        x,
        y,
        confidence,
      });
    }
  }

  // Remove duplicates (same zone name) and keep highest confidence
  const uniqueMatches = new Map<string, DetectedZone>();
  for (const match of matches) {
    const key = match.name.en;
    const existing = uniqueMatches.get(key);
    if (!existing || getConfidenceScore(match.confidence) > getConfidenceScore(existing.confidence)) {
      uniqueMatches.set(key, match);
    }
  }

  // Sort by confidence (high first) then by zone name
  return Array.from(uniqueMatches.values()).sort((a, b) => {
    const confDiff = getConfidenceScore(b.confidence) - getConfidenceScore(a.confidence);
    if (confDiff !== 0) return confDiff;
    return a.name.en.localeCompare(b.name.en);
  });
}

function getConfidenceScore(conf: 'high' | 'medium' | 'low'): number {
  return conf === 'high' ? 3 : conf === 'medium' ? 2 : 1;
}

/**
 * Check if multiple zones need disambiguation
 * Returns true if there are 2+ unique zones detected
 */
export function needsZoneConfirmation(
  x: number,
  y: number,
  gender: BodyGender,
  view: BodyView,
  radiusPercent: number = 5
): boolean {
  const zones = detectZonesInRadius(x, y, gender, view, radiusPercent);
  return zones.length > 1;
}

export function detectZone(
  x: number,
  y: number,
  gender: BodyGender,
  view: BodyView
): DetectedZone | null {
  const key = `${gender}-${view}` as const;
  const zones = ZONE_REGIONS[key];

  if (!zones) return null;

  // Find matching zones (can match multiple, return most specific)
  // Check zones in reverse order to prioritize smaller zones that come later in the array
  const matches: Array<{
    zone: (typeof zones)[number];
    area: number;
    index: number;
  }> = [];

  // Check zones in reverse order - smaller zones (like navel, knees) are usually defined after larger ones
  for (let i = zones.length - 1; i >= 0; i--) {
    const zone = zones[i];
    const { x1, y1, x2, y2 } = zone.bounds;
    if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
      const area = (x2 - x1) * (y2 - y1);
      matches.push({ zone, area, index: i });
    }
  }

  if (matches.length === 0) {
    return {
      name: { ru: 'Неизвестная область', en: 'Unknown area' },
      x,
      y,
      confidence: 'low',
    };
  }

  // Return the smallest matching zone (most specific)
  // Prioritize smaller zones - they are more specific (e.g., navel over stomach, knees over thighs)
  // Special priority for Fingers and Hands - they should always be preferred over larger zones
  matches.sort((a, b) => {
    const aIsFingers = a.zone.name.ru === 'Пальцы' || a.zone.name.en === 'Fingers';
    const bIsFingers = b.zone.name.ru === 'Пальцы' || b.zone.name.en === 'Fingers';
    const aIsHands = a.zone.name.ru === 'Кисти' || a.zone.name.en === 'Hands';
    const bIsHands = b.zone.name.ru === 'Кисти' || b.zone.name.en === 'Hands';
    
    // Fingers have ABSOLUTE highest priority - always prefer over everything else
    if (aIsFingers && !bIsFingers) return -1;
    if (!aIsFingers && bIsFingers) return 1;
    
    // If both are fingers, prefer smaller area or later index
    if (aIsFingers && bIsFingers) {
      const areaDiff = a.area - b.area;
      if (Math.abs(areaDiff) < 5) return b.index - a.index; // Prefer later (more specific)
      return areaDiff; // Prefer smaller
    }
    
    // Hands have second highest priority (but lower than fingers)
    // If one is hands and other is not fingers, prefer hands
    if (aIsHands && !bIsHands && !bIsFingers) return -1;
    if (!aIsHands && bIsHands && !aIsFingers) return 1;
    
    // If both are hands, prefer smaller area or later index
    if (aIsHands && bIsHands) {
      const areaDiff = a.area - b.area;
      if (Math.abs(areaDiff) < 5) return b.index - a.index;
      return areaDiff;
    }
    
    const areaDiff = a.area - b.area;
    // If areas are very close (within 5% of smaller area), prefer later zone (higher index = smaller zone)
    const threshold = Math.min(a.area, b.area) * 0.05;
    if (Math.abs(areaDiff) < threshold || Math.abs(areaDiff) < 5) {
      // Prefer zone that appears later in array (usually smaller, more specific zones)
      return b.index - a.index;
    }
    // Otherwise prefer smaller area
    return areaDiff;
  });
  const best = matches[0];
  
  // Debug logging for navel, knees, fingers, and hands
  if (best.zone.name.ru === 'Пупок' || best.zone.name.ru === 'Колени' || best.zone.name.ru === 'Пальцы' || best.zone.name.ru === 'Кисти' || 
      best.zone.name.en === 'Navel' || best.zone.name.en === 'Knees' || best.zone.name.en === 'Fingers' || best.zone.name.en === 'Hands') {
    console.log('[ZoneDetection] Detected:', best.zone.name.ru, 'at', x, y, {
      matches: matches.length,
      area: best.area,
      index: best.index,
      allMatches: matches.map(m => ({
        name: m.zone.name.ru,
        area: m.area,
        index: m.index,
        bounds: m.zone.bounds
      })),
      selected: {
        name: best.zone.name.ru,
        area: best.area,
        index: best.index
      }
    });
  }

  // Calculate confidence based on how centered the point is within the zone
  const { x1, y1, x2, y2 } = best.zone.bounds;
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;
  const distFromCenter = Math.sqrt(
    Math.pow((x - centerX) / (x2 - x1), 2) + Math.pow((y - centerY) / (y2 - y1), 2)
  );

  let confidence: 'high' | 'medium' | 'low';
  if (distFromCenter < 0.3) {
    confidence = 'high';
  } else if (distFromCenter < 0.5) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    name: best.zone.name,
    x,
    y,
    confidence,
  };
}
