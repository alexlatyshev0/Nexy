import type { MatchResult } from './types';
import { flattenObject } from './utils/object';

// Tag preference from database
export interface TagPreference {
  tag_ref: string;
  interest_level: number;
  role_preference: 'give' | 'receive' | 'both' | null;
}

// Extended match result with role info
export interface RoleMatchResult extends MatchResult {
  myRole?: 'give' | 'receive' | 'both' | null;
  partnerRole?: 'give' | 'receive' | 'both' | null;
  isComplementary?: boolean;
}

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

/**
 * Check if two roles are complementary (give matches receive)
 */
function areRolesComplementary(
  roleA: 'give' | 'receive' | 'both' | null,
  roleB: 'give' | 'receive' | 'both' | null
): boolean {
  // If either has 'both', they match with anyone
  if (roleA === 'both' || roleB === 'both') return true;
  // If either is null, treat as 'both' (mutual activity)
  if (roleA === null || roleB === null) return true;
  // Complementary: give matches receive
  return (roleA === 'give' && roleB === 'receive') ||
         (roleA === 'receive' && roleB === 'give');
}

/**
 * Get matches based on tag_preferences with role complementarity
 * This handles give/receive pairing correctly
 */
export function getTagBasedMatches(
  myTags: TagPreference[],
  partnerTags: TagPreference[],
  threshold = 50
): {
  matches: RoleMatchResult[];
  partnerDoesntWant: RoleMatchResult[];
  iWantButHidden: RoleMatchResult[];
} {
  const matches: RoleMatchResult[] = [];
  const partnerDoesntWant: RoleMatchResult[] = [];
  const iWantButHidden: RoleMatchResult[] = [];

  // Create maps for quick lookup
  const myTagMap = new Map(myTags.map(t => [t.tag_ref, t]));
  const partnerTagMap = new Map(partnerTags.map(t => [t.tag_ref, t]));

  // Get all unique tags
  const allTags = new Set([
    ...myTags.map(t => t.tag_ref),
    ...partnerTags.map(t => t.tag_ref),
  ]);

  for (const tagRef of allTags) {
    const myTag = myTagMap.get(tagRef);
    const partnerTag = partnerTagMap.get(tagRef);

    const myInterest = myTag?.interest_level || 0;
    const partnerInterest = partnerTag?.interest_level || 0;
    const myRole = myTag?.role_preference || null;
    const partnerRole = partnerTag?.role_preference || null;

    const iWant = myInterest >= threshold;
    const partnerWants = partnerInterest >= threshold;
    const rolesMatch = areRolesComplementary(myRole, partnerRole);

    const result: RoleMatchResult = {
      dimension: tagRef,
      myValue: myInterest,
      partnerValue: partnerInterest,
      visibility: 'hidden',
      myRole,
      partnerRole,
      isComplementary: rolesMatch,
    };

    if (iWant && partnerWants && rolesMatch) {
      // Both want AND roles are complementary → match!
      result.visibility = 'match';
      matches.push(result);
    } else if (iWant && partnerWants && !rolesMatch) {
      // Both want but roles don't match (both want to give or both want to receive)
      // Hide from user - they might want the same thing but not together
      result.visibility = 'hidden';
      iWantButHidden.push(result);
    } else if (iWant && !partnerWants) {
      // I want, partner doesn't → hide from me
      result.visibility = 'hidden';
      iWantButHidden.push(result);
    } else if (!iWant && partnerWants) {
      // Partner wants, I don't → safe to show
      result.visibility = 'partner_no';
      partnerDoesntWant.push(result);
    }
    // Both don't want → skip
  }

  return {
    matches: matches.sort((a, b) => b.myValue - a.myValue),
    partnerDoesntWant,
    iWantButHidden,
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
