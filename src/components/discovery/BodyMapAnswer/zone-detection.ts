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
    { name: { ru: 'Голова', en: 'Head' }, bounds: { x1: 40.00000000000001, y1: 5.6105863334334245, x2: 61.2, y2: 20.463184243946383 } },
    { name: { ru: 'Уши', en: 'Ears' }, bounds: { x1: 40.99999999999999, y1: 12.726312861783738, x2: 45.599999999999994, y2: 17.01055852037891 } },
    { name: { ru: 'Уши', en: 'Ears' }, bounds: { x1: 54.8, y1: 14.894831992028596, x2: 58.999999999999986, y2: 18.6526813496765 } },
    { name: { ru: 'Лицо', en: 'Face' }, bounds: { x1: 43.199999999999996, y1: 13.800083439163535, x2: 56.39999999999999, y2: 20.65268134967649 } },
    { name: { ru: 'Губы', en: 'Lips' }, bounds: { x1: 47.4, y1: 17.884273471649685, x2: 53, y2: 20.515837780568365 } },
    { name: { ru: 'Шея', en: 'Neck' }, bounds: { x1: 43.599999999999994, y1: 19.14740208948704, x2: 51.00000000000001, y2: 24 } },
    { name: { ru: 'Плечи', en: 'Shoulders' }, bounds: { x1: 33.60000000000001, y1: 22.326340674838246, x2: 60.400000000000006, y2: 26.221033601594275 } },
    { name: { ru: 'Грудь', en: 'Chest' }, bounds: { x1: 40.400000000000006, y1: 25.915809967513848, x2: 61.400000000000006, y2: 34.57891077229669 } },
    { name: { ru: 'Соски', en: 'Nipples' }, bounds: { x1: 44.8, y1: 27.957904983756926, x2: 48.8, y2: 30.810502894269877 } },
    { name: { ru: 'Соски', en: 'Nipples' }, bounds: { x1: 55, y1: 27.54737427643253, x2: 59.39999999999999, y2: 30.536815756053613 } },
    { name: { ru: 'Живот', en: 'Stomach' }, bounds: { x1: 44, y1: 35.04209501624308, x2: 61.20000000000001, y2: 43.894692926756036 } },
    { name: { ru: 'Пупок', en: 'Navel' }, bounds: { x1: 52.79999999999999, y1: 37.947346463378025, x2: 57.8, y2: 41.07363151210724 } },
    { name: { ru: 'Руки', en: 'Arms' }, bounds: { x1: 31.799999999999997, y1: 25.778966398405718, x2: 44.599999999999994, y2: 58.484301284704195 } },
    { name: { ru: 'Руки', en: 'Arms' }, bounds: { x1: 62.60000000000001, y1: 25.231592121973183, x2: 75.60000000000001, y2: 57.252709162731 } },
    { name: { ru: 'Кисти', en: 'Hands' }, bounds: { x1: 34.4, y1: 48, x2: 44.6, y2: 53.62100578853977 } },
    { name: { ru: 'Кисти', en: 'Hands' }, bounds: { x1: 62.6, y1: 48, x2: 72, y2: 53 } },
    { name: { ru: 'Пальцы', en: 'Fingers' }, bounds: { x1: 35.6, y1: 52.90525144713493, x2: 44, y2: 58.85259791051295 } },
    { name: { ru: 'Пальцы', en: 'Fingers' }, bounds: { x1: 61.999999999999986, y1: 49.89469292675604, x2: 69.39999999999998, y2: 56.79994437389098 } },
    { name: { ru: 'Пах', en: 'Groin' }, bounds: { x1: 51.199999999999996, y1: 42.76840787802681, x2: 59.4, y2: 47.410391642051835 } },
    { name: { ru: 'Пенис', en: 'Penis' }, bounds: { x1: 53.8, y1: 46, x2: 62.199999999999996, y2: 55.126285048729216 } },
    { name: { ru: 'Яички', en: 'Testicles' }, bounds: { x1: 50.4, y1: 48.44206720318856, x2: 56.4, y2: 52.93678794299909 } },
    { name: { ru: 'Бёдра', en: 'Thighs' }, bounds: { x1: 32.4, y1: 46.74729083726899, x2: 72.00000000000001, y2: 64.46304517867382 } },
    { name: { ru: 'Колени', en: 'Knees' }, bounds: { x1: 33.99999999999999, y1: 64.5156987152958, x2: 69.39999999999999, y2: 72.55779373153887 } },
    { name: { ru: 'Голени', en: 'Shins' }, bounds: { x1: 28.799999999999997, y1: 73.84203939013405, x2: 64.8, y2: 88.84203939013405 } },
    { name: { ru: 'Стопы', en: 'Feet' }, bounds: { x1: 23.4, y1: 88.75784935764788, x2: 67.4, y2: 99.31578215445933 } },
  ],
  'male-back': [
    { name: { ru: 'Затылок', en: 'Back of head' }, bounds: { x1: 39.4, y1: 2.3263406748382476, x2: 60.6, y2: 12.22103360159428 } },
    { name: { ru: 'Шея', en: 'Neck' }, bounds: { x1: 46.6, y1: 13.505279260189456, x2: 59.2, y2: 17.673659325161754 } },
    { name: { ru: 'Плечи', en: 'Shoulders' }, bounds: { x1: 35.599999999999994, y1: 17.178938585351208, x2: 66.8, y2: 22.989441479621096 } },
    { name: { ru: 'Верх спины', en: 'Upper back' }, bounds: { x1: 40, y1: 19.863156430891866, x2: 61.4, y2: 32.76840787802681 } },
    { name: { ru: 'Поясница', en: 'Lower back' }, bounds: { x1: 42, y1: 32.8210614146488, x2: 59.6, y2: 40.494720739810546 } },
    { name: { ru: 'Руки', en: 'Arms' }, bounds: { x1: 34.400000000000006, y1: 20.49472073981054, x2: 41.6, y2: 49.86315643089187 } },
    { name: { ru: 'Руки', en: 'Arms' }, bounds: { x1: 61.400000000000006, y1: 22.82106141464879, x2: 66.60000000000001, y2: 45.7578493576479 } },
    { name: { ru: 'Ягодицы', en: 'Buttocks' }, bounds: { x1: 37.6, y1: 40, x2: 65.80000000000001, y2: 51.442067203188564 } },
    { name: { ru: 'Анус', en: 'Anus' }, bounds: { x1: 49.80000000000001, y1: 44.4105307073244, x2: 54.00000000000001, y2: 48.61044726816086 } },
    { name: { ru: 'Пенис', en: 'Penis' }, bounds: { x1: 48, y1: 51.69477636591957, x2: 54.6, y2: 57.01055852037891 } },
    { name: { ru: 'Яички', en: 'Testicles' }, bounds: { x1: 48.800000000000004, y1: 48.715754341404825, x2: 54.6, y2: 52.44206720318856 } },
    { name: { ru: 'Бёдра', en: 'Thighs' }, bounds: { x1: 34.00000000000001, y1: 50.49472073981053, x2: 68.4, y2: 67.06307299172832 } },
    { name: { ru: 'Икры', en: 'Calves' }, bounds: { x1: 28.6, y1: 69.9894414796211, x2: 74.79999999999998, y2: 86.37885514618769 } },
    { name: { ru: 'Стопы', en: 'Feet' }, bounds: { x1: 25.800000000000004, y1: 87.66310080478286, x2: 75.00000000000001, y2: 97.12628504872923 } },
  ],
  'female-front': [
    { name: { ru: 'Голова', en: 'Head' }, bounds: { x1: 37.2, y1: 5.200055626109024, x2: 63, y2: 20.736871382162644 } },
    { name: { ru: 'Уши', en: 'Ears' }, bounds: { x1: 41.8, y1: 13.663239870055406, x2: 45.599999999999994, y2: 17.284245658595175 } },
    { name: { ru: 'Уши', en: 'Ears' }, bounds: { x1: 55.400000000000006, y1: 13.684217845540664, x2: 60.000000000000014, y2: 17.147402089487045 } },
    { name: { ru: 'Лицо', en: 'Face' }, bounds: { x1: 44.4, y1: 13.936927008271669, x2: 56.19999999999999, y2: 20.105307073243967 } },
    { name: { ru: 'Губы', en: 'Lips' }, bounds: { x1: 47.8, y1: 16.652681349676495, x2: 53.599999999999994, y2: 19.421089227703305 } },
    { name: { ru: 'Шея', en: 'Neck' }, bounds: { x1: 45, y1: 19.557932796811436, x2: 55.8, y2: 22.494720739810543 } },
    { name: { ru: 'Плечи', en: 'Shoulders' }, bounds: { x1: 37.2, y1: 22.326340674838246, x2: 63.6, y2: 26.90525144713494 } },
    { name: { ru: 'Грудь', en: 'Breasts' }, bounds: { x1: 39, y1: 27.28424565859518, x2: 58.60000000000001, y2: 33.62100578853977 } },
    { name: { ru: 'Соски', en: 'Nipples' }, bounds: { x1: 40.400000000000006, y1: 27.957904983756922, x2: 44, y2: 31.084190032486152 } },
    { name: { ru: 'Соски', en: 'Nipples' }, bounds: { x1: 53.800000000000004, y1: 28.231592121973193, x2: 57.400000000000006, y2: 31.768407878026814 } },
    { name: { ru: 'Живот', en: 'Stomach' }, bounds: { x1: 41, y1: 36.684217845540665, x2: 57.400000000000006, y2: 46.22103360159428 } },
    { name: { ru: 'Пупок', en: 'Navel' }, bounds: { x1: 47.199999999999996, y1: 38.63156430891867, x2: 51.79999999999999, y2: 41.62100578853976 } },
    { name: { ru: 'Руки', en: 'Arms' }, bounds: { x1: 31.400000000000006, y1: 26.18949710573011, x2: 40.00000000000001, y2: 48.631564308918676 } },
    { name: { ru: 'Руки', en: 'Arms' }, bounds: { x1: 58.8, y1: 23.31578215445934, x2: 74.19999999999999, y2: 49.042095016243074 } },
    { name: { ru: 'Кисти', en: 'Hands' }, bounds: { x1: 27.4, y1: 48, x2: 35.599999999999994, y2: 52.38941366656658 } },
    { name: { ru: 'Кисти', en: 'Hands' }, bounds: { x1: 66.60000000000002, y1: 48.13684356910814, x2: 74.40000000000002, y2: 51.56835225191779 } },
    { name: { ru: 'Пальцы', en: 'Fingers' }, bounds: { x1: 27.799999999999997, y1: 52.49472073981054, x2: 37.199999999999996, y2: 59.12628504872923 } },
    { name: { ru: 'Пальцы', en: 'Fingers' }, bounds: { x1: 66.4, y1: 51.12628504872922, x2: 76.19999999999999, y2: 57.48416221943163 } },
    { name: { ru: 'Пах', en: 'Groin' }, bounds: { x1: 47.8, y1: 44.68421784554065, x2: 54.8, y2: 48.915670902241274 } },
    { name: { ru: 'Вульва', en: 'Vulva' }, bounds: { x1: 49.2, y1: 48.60002781305451, x2: 54, y2: 52.115726528350315 } },
    { name: { ru: 'Бёдра', en: 'Thighs' }, bounds: { x1: 37.199999999999996, y1: 52.08419003248615, x2: 65.6, y2: 64.18935804045756 } },
    { name: { ru: 'Колени', en: 'Knees' }, bounds: { x1: 34.2, y1: 63.83148086975514, x2: 61.2, y2: 71.87357588599819 } },
    { name: { ru: 'Голени', en: 'Shins' }, bounds: { x1: 28.20000000000001, y1: 72.3367601299446, x2: 59.40000000000002, y2: 87.74729083726899 } },
    { name: { ru: 'Стопы', en: 'Feet' }, bounds: { x1: 26.8, y1: 87.799944373891, x2: 57, y2: 97.81050289426989 } },
  ],
  'female-back': [
    { name: { ru: 'Затылок', en: 'Back of head' }, bounds: { x1: 37, y1: 5.921593495921379, x2: 59.400000000000006, y2: 15.915809967513853 } },
    { name: { ru: 'Шея', en: 'Neck' }, bounds: { x1: 42.8, y1: 16.51583778056836, x2: 52.999999999999986, y2: 20 } },
    { name: { ru: 'Плечи', en: 'Shoulders' }, bounds: { x1: 37, y1: 20.326340674838246, x2: 62.6, y2: 24.494720739810543 } },
    { name: { ru: 'Верх спины', en: 'Upper back' }, bounds: { x1: 40.8, y1: 23.55793279681144, x2: 57.20000000000001, y2: 33.178938585351204 } },
    { name: { ru: 'Поясница', en: 'Lower back' }, bounds: { x1: 38, y1: 32, x2: 61.4, y2: 39.94734646337802 } },
    { name: { ru: 'Руки', en: 'Arms' }, bounds: { x1: 8, y1: 21.86315643089187, x2: 41.00000000000001, y2: 53.284245658595175 } },
    { name: { ru: 'Руки', en: 'Arms' }, bounds: { x1: 57.2, y1: 20.22103360159429, x2: 84.60000000000001, y2: 54.789524918784636 } },
    { name: { ru: 'Ягодицы', en: 'Buttocks' }, bounds: { x1: 31.200000000000003, y1: 39.315782154459335, x2: 63.40000000000001, y2: 48.56835225191779 } },
    { name: { ru: 'Анус', en: 'Anus' }, bounds: { x1: 44.800000000000004, y1: 42.768407878026814, x2: 49, y2: 46.11572652835032 } },
    { name: { ru: 'Вульва', en: 'Vulva' }, bounds: { x1: 44, y1: 45.663100804782836, x2: 49, y2: 49.378855146187654 } },
    { name: { ru: 'Бёдра', en: 'Thighs' }, bounds: { x1: 29.8, y1: 52.95790498375692, x2: 73.2, y2: 65.55779373153888 } },
    { name: { ru: 'Икры', en: 'Calves' }, bounds: { x1: 25.799999999999997, y1: 70.81050289426989, x2: 75.8, y2: 85.83148086975515 } },
    { name: { ru: 'Стопы', en: 'Feet' }, bounds: { x1: 21.000000000000004, y1: 86.15782154459339, x2: 78.6, y2: 93.97888295924218 } },
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
