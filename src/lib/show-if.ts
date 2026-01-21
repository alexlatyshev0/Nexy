/**
 * Show-if condition evaluation utilities for V2 follow-ups
 *
 * Implements conditional display logic based on:
 * - element_selected: Show if specific elements were selected
 * - answer_contains: Show if previous answers contain specific values
 * - interest_level: Show if user's interest level is within range
 */

import type { V2FollowUp } from './types';

/**
 * Context for evaluating show_if conditions
 */
export interface ShowIfContext {
  /** IDs of elements selected by user in current scene */
  selectedElements: string[];
  /** All responses collected so far: { elementId: { followUpId: answer } } */
  responses: Record<string, Record<string, unknown>>;
  /** User's interest level for current element (0-100), if known */
  interestLevel?: number;
  /** Current element ID being processed */
  currentElementId?: string;
}

/**
 * Check if a follow-up should be shown based on show_if conditions
 */
export function shouldShowFollowUp(
  followUp: V2FollowUp,
  context: ShowIfContext
): boolean {
  const { show_if } = followUp;

  // No conditions = always show
  if (!show_if) {
    return true;
  }

  // Check element_selected condition
  if (show_if.element_selected && show_if.element_selected.length > 0) {
    const hasRequiredElement = show_if.element_selected.some(
      (elementId) => context.selectedElements.includes(elementId)
    );
    if (!hasRequiredElement) {
      return false;
    }
  }

  // Check interest_level condition
  if (show_if.interest_level) {
    const { min, max } = show_if.interest_level;
    const level = context.interestLevel ?? 50; // Default to 50 if not set

    if (min !== undefined && level < min) {
      return false;
    }
    if (max !== undefined && level > max) {
      return false;
    }
  }

  // Check answer_contains condition
  if (show_if.answer_contains && show_if.answer_contains.length > 0) {
    const hasMatchingAnswer = checkAnswerContains(
      show_if.answer_contains,
      context.responses,
      context.currentElementId
    );
    if (!hasMatchingAnswer) {
      return false;
    }
  }

  return true;
}

/**
 * Check if any previous answer contains the specified values
 * Prioritizes current element's answers if provided
 */
function checkAnswerContains(
  requiredValues: string[],
  responses: Record<string, Record<string, unknown>>,
  currentElementId?: string
): boolean {
  // Collect answers, prioritizing current element
  const allAnswers: unknown[] = [];

  // First add current element's answers (if available)
  if (currentElementId && responses[currentElementId]) {
    for (const answer of Object.values(responses[currentElementId])) {
      allAnswers.push(answer);
    }
  }

  // Then add other elements' answers
  for (const [elementId, elementResponses] of Object.entries(responses)) {
    if (elementId === currentElementId) continue; // Skip already added
    for (const answer of Object.values(elementResponses)) {
      allAnswers.push(answer);
    }
  }

  // Check if any answer contains the required values
  for (const answer of allAnswers) {
    if (answerContainsValue(answer, requiredValues)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a single answer contains any of the required values
 */
function answerContainsValue(answer: unknown, requiredValues: string[]): boolean {
  if (answer === null || answer === undefined) {
    return false;
  }

  // String answer
  if (typeof answer === 'string') {
    return requiredValues.some(
      (value) => answer === value || answer.toLowerCase().includes(value.toLowerCase())
    );
  }

  // Array answer (multi-select)
  if (Array.isArray(answer)) {
    return requiredValues.some((value) =>
      answer.some((item) => {
        if (typeof item === 'string') {
          return item === value || item.toLowerCase().includes(value.toLowerCase());
        }
        if (typeof item === 'object' && item !== null) {
          // Check object properties
          return Object.values(item).some(
            (v) => typeof v === 'string' && (v === value || v.toLowerCase().includes(value.toLowerCase()))
          );
        }
        return false;
      })
    );
  }

  // Object answer (complex structures like { selected: [], drilldowns: {} })
  if (typeof answer === 'object') {
    const obj = answer as Record<string, unknown>;

    // Check 'selected' array
    if (Array.isArray(obj.selected)) {
      if (answerContainsValue(obj.selected, requiredValues)) {
        return true;
      }
    }

    // Check 'drilldowns' object
    if (obj.drilldowns && typeof obj.drilldowns === 'object') {
      for (const drilldownAnswers of Object.values(obj.drilldowns)) {
        if (answerContainsValue(drilldownAnswers, requiredValues)) {
          return true;
        }
      }
    }

    // Check other string values
    for (const value of Object.values(obj)) {
      if (typeof value === 'string' && requiredValues.includes(value)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Filter follow-ups based on show_if conditions
 */
export function filterFollowUps(
  followUps: V2FollowUp[],
  context: ShowIfContext
): V2FollowUp[] {
  return followUps.filter((followUp) => shouldShowFollowUp(followUp, context));
}

/**
 * Flatten follow-ups including nested drilldowns (Level 3 support)
 * Returns a flat array maintaining the hierarchical order
 */
export function flattenFollowUpsWithDrilldowns(
  followUps: V2FollowUp[],
  context: ShowIfContext,
  maxDepth: number = 3
): V2FollowUp[] {
  const result: V2FollowUp[] = [];

  function processFollowUp(followUp: V2FollowUp, depth: number) {
    if (depth > maxDepth) return;

    // Check if this follow-up should be shown
    if (!shouldShowFollowUp(followUp, context)) {
      return;
    }

    result.push(followUp);

    // Process nested follow_ups (Level 2, 3)
    if (followUp.follow_ups && followUp.follow_ups.length > 0) {
      for (const nestedFollowUp of followUp.follow_ups) {
        processFollowUp(nestedFollowUp, depth + 1);
      }
    }
  }

  for (const followUp of followUps) {
    processFollowUp(followUp, 1);
  }

  return result;
}

/**
 * Get drilldown follow-ups for selected options
 * Used when user selects options that have nested drilldowns
 */
export function getDrilldownsForSelectedOptions(
  followUp: V2FollowUp,
  selectedOptionIds: string[]
): V2FollowUp[] {
  const drilldowns: V2FollowUp[] = [];

  if (!followUp.config.options) {
    return drilldowns;
  }

  for (const option of followUp.config.options) {
    if (selectedOptionIds.includes(option.id) && option.drilldown) {
      drilldowns.push(option.drilldown);
    }
  }

  return drilldowns;
}
