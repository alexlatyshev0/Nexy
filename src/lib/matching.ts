import type { MatchResult } from './types';
import { flattenObject } from './ai';

export function calculateVisibility(
  myValue: number,
  partnerValue: number,
  threshold = 50
): 'match' | 'partner_no' | 'hidden' {
  const iWant = myValue >= threshold;
  const partnerWants = partnerValue >= threshold;

  if (iWant && partnerWants) {
    // Both want → match!
    return 'match';
  } else if (iWant && !partnerWants) {
    // I want, partner doesn't → hide from me
    return 'hidden';
  } else {
    // Partner wants, I don't → show that I don't want (safe)
    // Or both don't want → can show or hide (doesn't matter)
    return 'partner_no';
  }
}

interface PreferenceValue {
  value?: number;
  [key: string]: unknown;
}

export function getMatchResults(
  myPreferences: Record<string, unknown>,
  partnerPreferences: Record<string, unknown>,
  threshold = 50
): {
  matches: MatchResult[];
  partnerDoesntWant: MatchResult[];
} {
  const myFlat = flattenObject(myPreferences);
  const partnerFlat = flattenObject(partnerPreferences);

  const allDimensions = new Set([
    ...Object.keys(myFlat),
    ...Object.keys(partnerFlat),
  ]);

  const matches: MatchResult[] = [];
  const partnerDoesntWant: MatchResult[] = [];

  for (const dim of allDimensions) {
    // Skip non-value keys
    if (!dim.endsWith('.value') && !dim.endsWith('value')) {
      continue;
    }

    const baseDim = dim.replace(/\.value$/, '').replace(/\.overall$/, '');

    let myVal = 0;
    let partnerVal = 0;

    const myData = myFlat[dim];
    const partnerData = partnerFlat[dim];

    if (typeof myData === 'number') {
      myVal = myData;
    } else if (myData && typeof myData === 'object' && 'value' in (myData as PreferenceValue)) {
      myVal = (myData as PreferenceValue).value || 0;
    }

    if (typeof partnerData === 'number') {
      partnerVal = partnerData;
    } else if (partnerData && typeof partnerData === 'object' && 'value' in (partnerData as PreferenceValue)) {
      partnerVal = (partnerData as PreferenceValue).value || 0;
    }

    const visibility = calculateVisibility(myVal, partnerVal, threshold);

    const result: MatchResult = {
      dimension: baseDim,
      myValue: myVal,
      partnerValue: partnerVal,
      visibility,
    };

    if (visibility === 'match') {
      matches.push(result);
    } else if (visibility === 'partner_no') {
      // Show that partner doesn't want (safe to show)
      partnerDoesntWant.push(result);
    }
    // 'hidden' → don't add, user won't know
  }

  // Remove duplicates based on base dimension
  const uniqueMatches = matches.filter(
    (m, i, arr) => arr.findIndex((x) => x.dimension === m.dimension) === i
  );
  const uniquePartnerDoesntWant = partnerDoesntWant.filter(
    (m, i, arr) => arr.findIndex((x) => x.dimension === m.dimension) === i
  );

  return {
    matches: uniqueMatches.sort((a, b) => b.myValue - a.myValue),
    partnerDoesntWant: uniquePartnerDoesntWant,
  };
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
