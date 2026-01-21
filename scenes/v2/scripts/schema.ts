/**
 * JSON Schema Validation for Discovery 2
 *
 * Validates scene files, body map activities, and other JSON structures
 */

// ============================================
// SCHEMA DEFINITIONS
// ============================================

export const LocalizedStringSchema = {
  type: 'object',
  properties: {
    ru: { type: 'string', minLength: 1 },
    en: { type: 'string', minLength: 1 },
  },
  required: ['ru', 'en'],
  additionalProperties: false,
};

export const FollowUpOptionSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^[a-z_]+$' },
    label: LocalizedStringSchema,
  },
  required: ['id', 'label'],
  additionalProperties: false,
};

export const FollowUpSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^[a-z_]+$' },
    type: { type: 'string', enum: ['multi_select', 'single_select', 'scale'] },
    question: LocalizedStringSchema,
    config: {
      type: 'object',
      properties: {
        options: { type: 'array', items: FollowUpOptionSchema },
        min: { type: 'number' },
        max: { type: 'number' },
      },
    },
  },
  required: ['id', 'type', 'question'],
  additionalProperties: false,
};

export const ElementSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^[a-z_]+$' },
    label: LocalizedStringSchema,
    tag_ref: { type: 'string' },
    follow_ups: { type: 'array', items: FollowUpSchema },
  },
  required: ['id', 'label'],
  additionalProperties: false,
};

export const AiContextSchema = {
  type: 'object',
  properties: {
    tests_primary: { type: 'array', items: { type: 'string' }, minItems: 1 },
    tests_secondary: { type: 'array', items: { type: 'string' } },
    emotional_range: { type: 'array', items: { type: 'string' } },
    profile_signals: { type: 'object' },
  },
  required: ['tests_primary', 'tests_secondary'],
  additionalProperties: false,
};

export const SceneSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^[a-z_]+$' },
    slug: { type: 'string', pattern: '^[a-z-]+$' },
    version: { type: 'number', const: 2 },
    paired_scene: { type: 'string' },
    role_direction: {
      type: 'string',
      enum: [
        'm_to_f', 'f_to_m', 'mutual', 'wlw', 'mlm', 'group',
        'm_dom_f_pet', 'f_dom_m_pet', 'f_dom_m_sub',
        'cuckold', 'hotwife',
      ],
    },
    title: LocalizedStringSchema,
    subtitle: LocalizedStringSchema,
    description: LocalizedStringSchema,
    image_prompt: { type: 'string', minLength: 10 },
    intensity: { type: 'integer', minimum: 1, maximum: 5 },
    category: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' }, minItems: 1 },
    elements: { type: 'array', items: ElementSchema },
    question: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['multi_select', 'single_select'] },
        text: LocalizedStringSchema,
        min_selections: { type: 'integer', minimum: 0 },
      },
      required: ['type', 'text'],
    },
    ai_context: AiContextSchema,
  },
  required: [
    'id', 'slug', 'version', 'role_direction',
    'title', 'subtitle', 'description', 'image_prompt',
    'intensity', 'category', 'tags', 'elements',
    'question', 'ai_context',
  ],
  additionalProperties: false,
};

export const BodyMapPassSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', enum: ['give', 'receive'] },
    question: LocalizedStringSchema,
    instruction: LocalizedStringSchema,
  },
  required: ['id', 'question'],
  additionalProperties: false,
};

export const BodyMapZonesSchema = {
  type: 'object',
  properties: {
    available: { type: 'array', items: { type: 'string' }, minItems: 1 },
    highlight_erogenous: { type: 'boolean' },
    highlight_safe: { type: 'array', items: { type: 'string' } },
    highlight_primal: { type: 'boolean' },
    highlight_impact: { type: 'boolean' },
    caution: { type: 'array', items: { type: 'string' } },
  },
  required: ['available'],
  additionalProperties: false,
};

export const BodyMapActivitySchema = {
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^bodymap_[a-z_]+$' },
    slug: { type: 'string', pattern: '^[a-z-]+$' },
    version: { type: 'number', const: 2 },
    type: { type: 'string', const: 'body_map' },
    order: { type: 'integer', minimum: 1 },
    title: LocalizedStringSchema,
    subtitle: LocalizedStringSchema,
    description: LocalizedStringSchema,
    intensity: { type: 'integer', minimum: 1, maximum: 5 },
    action: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    passes: { type: 'array', items: BodyMapPassSchema, minItems: 2 },
    zones: BodyMapZonesSchema,
    ai_context: AiContextSchema,
  },
  required: [
    'id', 'slug', 'version', 'type', 'order',
    'title', 'subtitle', 'description',
    'intensity', 'action', 'tags', 'passes', 'zones', 'ai_context',
  ],
  additionalProperties: false,
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export interface ValidationError {
  path: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Simple schema validator (no external dependencies)
 */
function validateObject(
  obj: any,
  schema: any,
  path: string = ''
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (schema.type === 'object') {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      errors.push({ path, message: 'Expected object', value: typeof obj });
      return errors;
    }

    // Check required properties
    if (schema.required) {
      for (const prop of schema.required) {
        if (!(prop in obj)) {
          errors.push({ path: `${path}.${prop}`, message: 'Required property missing' });
        }
      }
    }

    // Validate properties
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in obj) {
          errors.push(...validateObject(obj[key], propSchema, `${path}.${key}`));
        }
      }
    }

    // Check for additional properties
    if (schema.additionalProperties === false && schema.properties) {
      const allowed = new Set(Object.keys(schema.properties));
      for (const key of Object.keys(obj)) {
        if (!allowed.has(key)) {
          errors.push({
            path: `${path}.${key}`,
            message: 'Additional property not allowed',
          });
        }
      }
    }
  }

  if (schema.type === 'array') {
    if (!Array.isArray(obj)) {
      errors.push({ path, message: 'Expected array', value: typeof obj });
      return errors;
    }

    if (schema.minItems && obj.length < schema.minItems) {
      errors.push({
        path,
        message: `Array must have at least ${schema.minItems} items`,
        value: obj.length,
      });
    }

    if (schema.items) {
      obj.forEach((item, idx) => {
        errors.push(...validateObject(item, schema.items, `${path}[${idx}]`));
      });
    }
  }

  if (schema.type === 'string') {
    if (typeof obj !== 'string') {
      errors.push({ path, message: 'Expected string', value: typeof obj });
    } else {
      if (schema.minLength && obj.length < schema.minLength) {
        errors.push({
          path,
          message: `String must be at least ${schema.minLength} characters`,
          value: obj.length,
        });
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(obj)) {
        errors.push({
          path,
          message: `String must match pattern ${schema.pattern}`,
          value: obj,
        });
      }
      if (schema.enum && !schema.enum.includes(obj)) {
        errors.push({
          path,
          message: `Value must be one of: ${schema.enum.join(', ')}`,
          value: obj,
        });
      }
    }
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    if (typeof obj !== 'number') {
      errors.push({ path, message: `Expected ${schema.type}`, value: typeof obj });
    } else {
      if (schema.type === 'integer' && !Number.isInteger(obj)) {
        errors.push({ path, message: 'Expected integer', value: obj });
      }
      if (schema.minimum !== undefined && obj < schema.minimum) {
        errors.push({
          path,
          message: `Value must be >= ${schema.minimum}`,
          value: obj,
        });
      }
      if (schema.maximum !== undefined && obj > schema.maximum) {
        errors.push({
          path,
          message: `Value must be <= ${schema.maximum}`,
          value: obj,
        });
      }
      if (schema.const !== undefined && obj !== schema.const) {
        errors.push({
          path,
          message: `Value must be ${schema.const}`,
          value: obj,
        });
      }
    }
  }

  if (schema.type === 'boolean') {
    if (typeof obj !== 'boolean') {
      errors.push({ path, message: 'Expected boolean', value: typeof obj });
    }
  }

  return errors;
}

/**
 * Validate a scene object
 */
export function validateScene(scene: any): ValidationResult {
  const errors = validateObject(scene, SceneSchema, 'scene');
  return { valid: errors.length === 0, errors };
}

/**
 * Validate a body map activity
 */
export function validateBodyMapActivity(activity: any): ValidationResult {
  const errors = validateObject(activity, BodyMapActivitySchema, 'activity');
  return { valid: errors.length === 0, errors };
}

/**
 * Validate multiple scenes and return summary
 */
export function validateScenes(scenes: any[]): {
  valid: number;
  invalid: number;
  errors: { file: string; errors: ValidationError[] }[];
} {
  let valid = 0;
  let invalid = 0;
  const allErrors: { file: string; errors: ValidationError[] }[] = [];

  for (const scene of scenes) {
    const result = validateScene(scene);
    if (result.valid) {
      valid++;
    } else {
      invalid++;
      allErrors.push({
        file: scene.id || 'unknown',
        errors: result.errors,
      });
    }
  }

  return { valid, invalid, errors: allErrors };
}

/**
 * CLI validation runner
 */
export async function runValidation(scenesDir: string): Promise<void> {
  console.log('Validating scenes...\n');

  // In production, this would read files from the directory
  // For now, just log the expected behavior

  console.log(`Would validate scenes in: ${scenesDir}`);
  console.log('\nUsage:');
  console.log('  import { validateScenes } from "./schema";');
  console.log('  const scenes = loadAllScenes();');
  console.log('  const result = validateScenes(scenes);');
  console.log('  console.log(result);');
}

export default {
  // Schemas
  SceneSchema,
  BodyMapActivitySchema,

  // Validators
  validateScene,
  validateBodyMapActivity,
  validateScenes,

  // CLI
  runValidation,
};
