/**
 * Scene Element Conditions Engine
 *
 * Evaluates skip_if, prefill_if, show_only_if conditions for scene elements
 * based on user's body_map data and onboarding responses.
 *
 * Condition syntax:
 * - body_map.{action}.{role}.{zone}  → checks if zone was selected
 * - body_map.{action}.{role}.any     → checks if any zone selected for action/role
 * - onboarding.{category}            → checks onboarding response (0=NO, 1=YES, 2=VERY)
 * - onboarding.{category} >= 1       → comparison operators
 *
 * Examples:
 * - "body_map.licking.give.genitals" → true if user marked they like licking genitals
 * - "onboarding.rough >= 1"          → true if rough play answer is YES or VERY
 * - "body_map.kissing.receive.any"   → true if any zone marked for receiving kisses
 */

import type { OnboardingResponses } from './onboarding-gates';

// Body map data structure
export interface BodyMapData {
  [action: string]: {
    give?: string[];  // zones user likes to give this action to
    receive?: string[];  // zones user likes to receive this action on
  };
}

// Context for evaluating conditions
export interface ConditionContext {
  bodyMap: BodyMapData;
  onboarding: OnboardingResponses;
}

// Condition evaluation result
export interface ElementConditionResult {
  skip: boolean;
  skipReason?: string;
  prefill?: unknown;
  prefillReason?: string;
  show: boolean;
  hideReason?: string;
}

// Scene element with conditions
export interface SceneElementWithConditions {
  id: string;
  skip_if?: string;
  skip_reason?: { ru: string; en: string };
  prefill_if?: string;
  prefill_value?: unknown;
  prefill_reason?: { ru: string; en: string };
  show_only_if?: string;
  hide_reason?: { ru: string; en: string };
  // ... other element properties
}

/**
 * Parse and evaluate a single condition string
 */
export function evaluateCondition(
  condition: string,
  context: ConditionContext
): boolean {
  const trimmed = condition.trim();

  // Handle comparison operators
  const comparisonMatch = trimmed.match(/^(.+?)\s*(>=|<=|>|<|==|!=)\s*(\d+)$/);
  if (comparisonMatch) {
    const [, path, operator, valueStr] = comparisonMatch;
    const value = parseInt(valueStr, 10);
    const actualValue = getValueFromPath(path.trim(), context);

    if (typeof actualValue !== 'number') return false;

    switch (operator) {
      case '>=': return actualValue >= value;
      case '<=': return actualValue <= value;
      case '>': return actualValue > value;
      case '<': return actualValue < value;
      case '==': return actualValue === value;
      case '!=': return actualValue !== value;
      default: return false;
    }
  }

  // Handle boolean conditions (existence check)
  const value = getValueFromPath(trimmed, context);
  return Boolean(value);
}

/**
 * Get value from dot-notation path
 */
function getValueFromPath(
  path: string,
  context: ConditionContext
): unknown {
  const parts = path.split('.');

  if (parts[0] === 'body_map' && parts.length >= 3) {
    return evaluateBodyMapPath(parts.slice(1), context.bodyMap);
  }

  if (parts[0] === 'onboarding' && parts.length >= 2) {
    const category = parts[1];
    return context.onboarding[category] ?? 0;
  }

  return undefined;
}

/**
 * Evaluate body_map path: action.role.zone
 */
function evaluateBodyMapPath(
  parts: string[],
  bodyMap: BodyMapData
): boolean | number {
  const [action, role, zone] = parts;

  if (!action || !role) return false;

  const actionData = bodyMap[action];
  if (!actionData) return false;

  const zones = role === 'give' ? actionData.give : actionData.receive;
  if (!zones || !Array.isArray(zones)) return false;

  // Special case: "any" checks if array is not empty
  if (zone === 'any') {
    return zones.length > 0;
  }

  // Check if specific zone exists
  return zones.includes(zone);
}

/**
 * Parse compound conditions with AND/OR
 */
export function evaluateCompoundCondition(
  condition: string,
  context: ConditionContext
): boolean {
  // Handle OR (||)
  if (condition.includes('||')) {
    const parts = condition.split('||').map(p => p.trim());
    return parts.some(part => evaluateCompoundCondition(part, context));
  }

  // Handle AND (&&)
  if (condition.includes('&&')) {
    const parts = condition.split('&&').map(p => p.trim());
    return parts.every(part => evaluateCompoundCondition(part, context));
  }

  // Handle NOT (!)
  if (condition.startsWith('!')) {
    return !evaluateCondition(condition.slice(1).trim(), context);
  }

  // Simple condition
  return evaluateCondition(condition, context);
}

/**
 * Evaluate all conditions for a scene element
 */
export function evaluateElementConditions(
  element: SceneElementWithConditions,
  context: ConditionContext,
  locale: 'ru' | 'en' = 'ru'
): ElementConditionResult {
  const result: ElementConditionResult = {
    skip: false,
    show: true,
  };

  // Check show_only_if first (if element should be shown at all)
  if (element.show_only_if) {
    const shouldShow = evaluateCompoundCondition(element.show_only_if, context);
    if (!shouldShow) {
      result.show = false;
      result.hideReason = element.hide_reason?.[locale];
      return result;
    }
  }

  // Check skip_if (skip but remember the element exists)
  if (element.skip_if) {
    const shouldSkip = evaluateCompoundCondition(element.skip_if, context);
    if (shouldSkip) {
      result.skip = true;
      result.skipReason = element.skip_reason?.[locale];
    }
  }

  // Check prefill_if (auto-fill value based on previous answers)
  if (element.prefill_if && !result.skip) {
    const shouldPrefill = evaluateCompoundCondition(element.prefill_if, context);
    if (shouldPrefill) {
      result.prefill = element.prefill_value;
      result.prefillReason = element.prefill_reason?.[locale];
    }
  }

  return result;
}

/**
 * Process all elements in a scene, applying conditions
 */
export function processSceneElements<T extends SceneElementWithConditions>(
  elements: T[],
  context: ConditionContext,
  locale: 'ru' | 'en' = 'ru'
): Array<T & { conditionResult: ElementConditionResult }> {
  return elements.map(element => ({
    ...element,
    conditionResult: evaluateElementConditions(element, context, locale),
  }));
}

/**
 * Filter scene elements to only visible ones
 */
export function getVisibleElements<T extends SceneElementWithConditions>(
  elements: T[],
  context: ConditionContext
): T[] {
  return elements.filter(element => {
    if (element.show_only_if) {
      return evaluateCompoundCondition(element.show_only_if, context);
    }
    return true;
  });
}

/**
 * Get elements that should be skipped
 */
export function getSkippedElements<T extends SceneElementWithConditions>(
  elements: T[],
  context: ConditionContext
): T[] {
  return elements.filter(element => {
    if (element.skip_if) {
      return evaluateCompoundCondition(element.skip_if, context);
    }
    return false;
  });
}

/**
 * Get elements that should be prefilled
 */
export function getPrefillableElements<T extends SceneElementWithConditions>(
  elements: T[],
  context: ConditionContext
): Array<{ element: T; value: unknown }> {
  return elements
    .filter(element => {
      if (element.prefill_if) {
        return evaluateCompoundCondition(element.prefill_if, context);
      }
      return false;
    })
    .map(element => ({
      element,
      value: element.prefill_value,
    }));
}

// ============================================================================
// Utility functions for building conditions
// ============================================================================

/**
 * Build a body_map condition string
 */
export function bodyMapCondition(
  action: string,
  role: 'give' | 'receive',
  zone: string
): string {
  return `body_map.${action}.${role}.${zone}`;
}

/**
 * Build an onboarding condition string
 */
export function onboardingCondition(
  category: string,
  operator?: '>=' | '<=' | '>' | '<' | '==' | '!=',
  value?: number
): string {
  if (operator && value !== undefined) {
    return `onboarding.${category} ${operator} ${value}`;
  }
  return `onboarding.${category}`;
}

/**
 * Combine conditions with AND
 */
export function and(...conditions: string[]): string {
  return conditions.join(' && ');
}

/**
 * Combine conditions with OR
 */
export function or(...conditions: string[]): string {
  return conditions.join(' || ');
}

/**
 * Negate a condition
 */
export function not(condition: string): string {
  return `!${condition}`;
}
