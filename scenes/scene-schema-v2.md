# Scene Schema v2.0

## Overview

This document defines the enhanced scene structure for AI-driven intimate preference discovery.

---

## Priority System

```typescript
type ScenePriority = 1 | 2 | 3 | 4 | 5;

// Priority levels:
// 1 = CORE - Show to everyone, fundamental preferences
//     Examples: romantic vs passionate, giving vs receiving oral, basic positions
//
// 2 = COMMON - Show to most users, common variations
//     Examples: specific positions, light dominance/submission, dirty talk
//
// 3 = EXPLORATORY - Show based on signals from priority 1-2 answers
//     Examples: BDSM basics, anal play, toys, roleplay
//
// 4 = NICHE - Show only if clear interest signals exist
//     Examples: specific fetishes, intense BDSM, group dynamics
//
// 5 = EDGE - Show only if user explicitly shows interest in extreme content
//     Examples: extreme practices, rare kinks
```

---

## Scene Consolidation Rules

### Scenes that should be SEPARATE (different dynamics):
- M spanks F vs F spanks M (different power dynamics)
- M dominates F vs F dominates M
- M receives oral vs F receives oral
- Any scene where gender roles fundamentally change the dynamic

### Scenes that should be CONSOLIDATED with follow-up:
- Cum location (face/chest/stomach/back) → One scene + follow-up "where"
- Spanking implement (hand/paddle/belt) → One scene + follow-up "with what"
- Bondage type (hands/full body/specific) → One scene + follow-up "how much"
- Pain intensity (light/medium/heavy) → One scene + follow-up "how intense"
- Public location (restaurant/beach/car) → One scene + follow-up "where"

---

## TypeScript Schema

```typescript
interface Scene {
  // === IDENTIFICATION ===
  id: string;                    // e.g., "scene_001"
  version: number;               // Schema version

  // === GENERATION ===
  generation_prompt: string;     // For image generation (Civitai)

  // === USER-FACING (Multilingual) ===
  user_description: {
    en: string;                  // "A couple relaxing after passionate sex, bodies intertwined..."
    ru: string;                  // "Пара отдыхает после страстного секса, тела переплетены..."
  };

  // === AI CONTEXT (English only) ===
  ai_context: {
    // Brief description for AI
    description: string;         // "Post-sex cuddling, intimate aftercare moment"

    // What this scene tests
    tests: {
      primary_kink: string;      // Main thing being tested
      secondary_kinks: string[]; // Related aspects
      power_dynamic: "dominant" | "submissive" | "switch" | "equal" | "none";
      gender_role_aspect?: string; // If relevant
    };

    // Question generation guidance
    question_angles: {
      as_receiver?: string;      // Question if user would receive this
      as_giver?: string;         // Question if user would give this
      as_observer?: string;      // Question about watching/attitude
      emotional?: string;        // Question about feelings
      frequency?: string;        // Question about how often
    };

    // Emotional spectrum for answer generation
    emotional_range: {
      positive: string[];        // Feelings if attracted
      negative: string[];        // Feelings if repulsed
      curious: string[];         // Feelings if intrigued but uncertain
    };

    // What answers mean for profile
    profile_signals: {
      if_positive: string[];     // Tags to add if likes
      if_negative: string[];     // Tags to add if dislikes
      if_curious: string[];      // Tags to add if curious
    };

    // Correlation with other preferences
    correlations: {
      positive: string[];        // Often likes together
      negative: string[];        // Usually mutually exclusive
    };

    // Taboo handling
    taboo_context: {
      level: 1 | 2 | 3 | 4 | 5; // 1=vanilla, 5=extreme
      common_concerns?: string[];
      normalization?: string;    // How to frame non-judgmentally
    };

    // Gender-specific question adaptation
    gender_adaptation?: {
      for_male: string;
      for_female: string;
    };
  };

  // === FOLLOW-UP SYSTEM ===
  follow_up?: {
    // When to ask follow-up
    trigger: "if_positive" | "if_any_interest" | "always";

    // The detail being clarified
    detail_type: "location" | "implement" | "intensity" | "frequency" | "specifics";

    // Follow-up question
    question: {
      en: string;
      ru: string;
    };

    // Options for follow-up
    options: Array<{
      id: string;
      label: { en: string; ru: string };
      signal: string;            // What this choice signals
    }>;

    // Allow multiple selection?
    multi_select: boolean;
  };

  // === CATEGORIZATION ===
  priority: 1 | 2 | 3 | 4 | 5;   // When to show this scene
  intensity: 1 | 2 | 3 | 4 | 5;  // How explicit/intense

  // Parent scene for consolidated scenes
  parent_scene?: string;         // If this is a variant, reference parent

  // Participants info
  participants: Array<{
    role: string;
    gender: "male" | "female" | "any";
    action: string;
  }>;

  // Classification
  dimensions: string[];          // Profile dimensions affected
  tags: string[];                // Searchable tags

  // Who should see this
  relevant_for: {
    gender: "male" | "female" | "any";
    interested_in: "male" | "female" | "both" | "any";
  };

  // === QUESTION TYPE ===
  question_type: QuestionType;
}

// Question type definitions
type QuestionType =
  | { type: "interest_scale" }                    // 5-point interest scale
  | { type: "role_choice"; options: string[] }   // Which role appeals
  | { type: "boundary" }                          // OK / Fantasy only / Hard limit
  | { type: "emotional"; options: string[] }     // What feelings it evokes
  | { type: "comparison"; scene_b: string }      // Compare two scenes
  | { type: "conditional"; condition: string };  // "Would you if..."

// Standard answer scales
const INTEREST_SCALE = [
  { id: "love", label: { en: "Love it", ru: "Обожаю" }, weight: 1.0 },
  { id: "like", label: { en: "Interested", ru: "Интересно" }, weight: 0.5 },
  { id: "neutral", label: { en: "Neutral", ru: "Нейтрально" }, weight: 0.0 },
  { id: "dislike", label: { en: "Not for me", ru: "Не моё" }, weight: -0.5 },
  { id: "hard_no", label: { en: "Hard limit", ru: "Категорически нет" }, weight: -1.0 }
];

const ROLE_SCALE = [
  { id: "give", label: { en: "Want to give", ru: "Хочу делать" } },
  { id: "receive", label: { en: "Want to receive", ru: "Хочу получать" } },
  { id: "both", label: { en: "Both", ru: "Оба варианта" } },
  { id: "neither", label: { en: "Neither", ru: "Ни то, ни другое" } }
];

const BOUNDARY_SCALE = [
  { id: "yes", label: { en: "Would do", ru: "Готов(а)" } },
  { id: "fantasy", label: { en: "Fantasy only", ru: "Только в фантазиях" } },
  { id: "limit", label: { en: "Hard limit", ru: "Табу" } }
];

const EMOTIONAL_OPTIONS = [
  { id: "aroused", label: { en: "Aroused", ru: "Возбуждает" } },
  { id: "intrigued", label: { en: "Intrigued", ru: "Интригует" } },
  { id: "neutral", label: { en: "Neutral", ru: "Нейтрально" } },
  { id: "uncomfortable", label: { en: "Uncomfortable", ru: "Некомфортно" } },
  { id: "repulsed", label: { en: "Repulsed", ru: "Отталкивает" } }
];
```

---

## Scene Consolidation Map

### CUM LOCATION → Consolidate to ONE scene

**Keep:** `scene_cum_on_body` (generic)

**Comment out / Convert to follow-up options:**
- ~~scene_187 (facial)~~ → follow-up option "face"
- ~~scene_188 (chest)~~ → follow-up option "chest"
- ~~scene_194 (stomach)~~ → follow-up option "stomach"
- scene for back → follow-up option "back"

**Follow-up structure:**
```json
{
  "follow_up": {
    "trigger": "if_positive",
    "detail_type": "location",
    "question": {
      "en": "Where do you find it most appealing?",
      "ru": "Куда привлекательнее всего?"
    },
    "options": [
      { "id": "face", "label": { "en": "Face", "ru": "Лицо" }, "signal": "facial_positive" },
      { "id": "chest", "label": { "en": "Chest", "ru": "Грудь" }, "signal": "pearl_necklace_positive" },
      { "id": "stomach", "label": { "en": "Stomach", "ru": "Живот" }, "signal": "body_cum_positive" },
      { "id": "back", "label": { "en": "Back", "ru": "Спина" }, "signal": "back_cum_positive" },
      { "id": "inside", "label": { "en": "Inside (creampie)", "ru": "Внутрь" }, "signal": "creampie_positive" }
    ],
    "multi_select": true
  }
}
```

---

### SPANKING → Keep SEPARATE by gender dynamic, consolidate implements

**Keep as separate scenes:**
- `scene_spanking_m_gives_f` - M spanks F (male dominant)
- `scene_spanking_f_gives_m` - F spanks M (female dominant)

**Each has follow-up for implement:**
```json
{
  "follow_up": {
    "trigger": "if_positive",
    "detail_type": "implement",
    "question": {
      "en": "What appeals most?",
      "ru": "Что привлекает больше?"
    },
    "options": [
      { "id": "hand", "label": { "en": "Hand", "ru": "Рука" }, "signal": "hand_spanking" },
      { "id": "paddle", "label": { "en": "Paddle", "ru": "Падл" }, "signal": "paddle" },
      { "id": "belt", "label": { "en": "Belt", "ru": "Ремень" }, "signal": "belt" },
      { "id": "crop", "label": { "en": "Riding crop", "ru": "Стек" }, "signal": "crop" }
    ],
    "multi_select": true
  }
}
```

---

### BONDAGE → Keep SEPARATE by who is bound, consolidate type

**Keep as separate scenes:**
- `scene_bondage_f_bound` - F is bound
- `scene_bondage_m_bound` - M is bound

**Each has follow-up for type:**
```json
{
  "follow_up": {
    "trigger": "if_positive",
    "detail_type": "specifics",
    "question": {
      "en": "What type of restraint?",
      "ru": "Какой тип связывания?"
    },
    "options": [
      { "id": "hands_light", "label": { "en": "Hands held/light", "ru": "Руки придержаны/легко" }, "signal": "light_restraint" },
      { "id": "hands_tied", "label": { "en": "Hands tied", "ru": "Руки связаны" }, "signal": "hand_bondage" },
      { "id": "spread", "label": { "en": "Spread eagle", "ru": "Растянут(а)" }, "signal": "spread_bondage" },
      { "id": "full", "label": { "en": "Full body/rope", "ru": "Полное/шибари" }, "signal": "full_bondage" }
    ],
    "multi_select": true
  }
}
```

---

### SQUIRTING → Consolidate variants

**Keep:** `scene_squirting_basic`

**Comment out / Convert to follow-up:**
- ~~scene_281 (on face)~~ → follow-up option
- ~~scene_282 (on body)~~ → follow-up option
- ~~scene_283 (drinking)~~ → follow-up option
- ~~scene_284 (multiple)~~ → intensity follow-up
- etc.

---

### ANAL PLAY → Keep SEPARATE by receiver gender

**Keep as separate scenes:**
- `scene_anal_f_receives` - F receives anal
- `scene_anal_m_receives` - M receives (prostate/pegging)

**Each has follow-up for type:**
```json
{
  "follow_up": {
    "trigger": "if_positive",
    "detail_type": "specifics",
    "question": {
      "en": "What type interests you?",
      "ru": "Что интересует?"
    },
    "options": [
      { "id": "finger", "label": { "en": "Finger", "ru": "Пальцы" }, "signal": "anal_finger" },
      { "id": "tongue", "label": { "en": "Tongue (rimming)", "ru": "Язык (римминг)" }, "signal": "rimming" },
      { "id": "toy", "label": { "en": "Toy/plug", "ru": "Игрушка/пробка" }, "signal": "anal_toy" },
      { "id": "penetration", "label": { "en": "Full penetration", "ru": "Проникновение" }, "signal": "anal_penetration" }
    ],
    "multi_select": true
  }
}
```

---

## Priority Assignment Guide

### Priority 1 (CORE) - Show to everyone
- Basic romantic vs passionate preference
- Giving vs receiving oral
- Preferred pace (slow/fast)
- Eye contact preference
- Basic position preferences (who's on top)
- Aftercare importance
- Verbal vs silent preference

### Priority 2 (COMMON) - Show to most
- Specific positions
- Light dominance/submission
- Dirty talk
- Hair pulling, light roughness
- Public displays of affection
- Teasing/edging basics
- Lingerie/clothing preferences

### Priority 3 (EXPLORATORY) - Based on P1-P2 signals
- BDSM basics (bondage, spanking, blindfolds)
- Anal play introduction
- Toys
- Roleplay scenarios
- Exhibitionism/voyeurism
- Power exchange dynamics
- Group sex curiosity

### Priority 4 (NICHE) - Clear interest signals needed
- Specific BDSM practices
- Intense pain play
- Humiliation/degradation
- Specific fetishes (feet, latex, etc.)
- Cuckolding
- Watersports adjacent
- Extreme restraint

### Priority 5 (EDGE) - Explicit interest only
- Extreme practices
- Edge play
- Rare specific fetishes

---

## Example Scene with Full Schema

```json
{
  "id": "scene_spanking_m_gives_f",
  "version": 2,

  "generation_prompt": "bedroom scene, man sitting on edge of bed, woman lying across his lap face down, his hand raised mid-spank about to connect with her bare buttocks, her skin showing pink marks from previous spanks, she grips the bedsheets, expression mixing pain and pleasure, he looks down at her with dominant focus, intimate bedroom lighting",

  "user_description": {
    "en": "He has her across his lap, hand raised for another spank. Her skin is already pink from his attention. She grips the sheets, lost in the sensation.",
    "ru": "Она лежит у него на коленях, его рука занесена для следующего шлепка. Её кожа уже розовая от его внимания. Она вцепилась в простыни, потерявшись в ощущениях."
  },

  "ai_context": {
    "description": "Male spanking female in OTK position. Erotic punishment, visible arousal from both.",

    "tests": {
      "primary_kink": "spanking_receiving_f",
      "secondary_kinks": ["pain_pleasure", "submission", "punishment", "vulnerability"],
      "power_dynamic": "dominant",
      "gender_role_aspect": "traditional male dominant spanking"
    },

    "question_angles": {
      "as_receiver": "Would you enjoy being spanked like this?",
      "as_giver": "Would you enjoy spanking your partner like this?",
      "emotional": "What feelings does this scene evoke?",
      "frequency": "How often would you want this?"
    },

    "emotional_range": {
      "positive": ["excitement", "surrender", "trust", "catharsis", "arousal from pain"],
      "negative": ["fear", "trauma trigger", "too violent", "degrading"],
      "curious": ["intrigued but nervous", "might try with right person", "lighter version maybe"]
    },

    "profile_signals": {
      "if_positive": ["enjoys_spanking", "pain_pleasure_positive", "submission_leaning", "likes_punishment_play"],
      "if_negative": ["pain_averse", "spanking_hard_limit", "gentle_only"],
      "if_curious": ["spanking_curious", "might_try_light"]
    },

    "correlations": {
      "positive": ["bondage", "dominance_submission", "hair_pulling", "rough_sex"],
      "negative": ["vanilla_only", "always_gentle", "pain_hard_limit"]
    },

    "taboo_context": {
      "level": 3,
      "common_concerns": ["too painful", "feels wrong", "trauma associations"],
      "normalization": "Consensual impact play is common and can enhance trust and arousal for many couples"
    },

    "gender_adaptation": {
      "for_male": "Focus on desire to give/spank",
      "for_female": "Focus on desire to receive/be spanked"
    }
  },

  "follow_up": {
    "trigger": "if_positive",
    "detail_type": "implement",
    "question": {
      "en": "What would you prefer to be spanked with?",
      "ru": "Чем предпочтительнее?"
    },
    "options": [
      { "id": "hand", "label": { "en": "Hand only", "ru": "Только рука" }, "signal": "hand_spanking" },
      { "id": "paddle", "label": { "en": "Paddle", "ru": "Падл" }, "signal": "paddle_spanking" },
      { "id": "belt", "label": { "en": "Belt", "ru": "Ремень" }, "signal": "belt_spanking" },
      { "id": "various", "label": { "en": "Variety is good", "ru": "Разнообразие" }, "signal": "implements_variety" }
    ],
    "multi_select": true
  },

  "priority": 3,
  "intensity": 3,

  "participants": [
    { "role": "spanker", "gender": "male", "action": "spanks her" },
    { "role": "spanked", "gender": "female", "action": "receives spanking" }
  ],

  "dimensions": ["spanking", "pain_pleasure", "dominance", "punishment"],
  "tags": ["spanking", "otk", "discipline", "pain", "submission"],

  "relevant_for": { "gender": "any", "interested_in": "any" },

  "question_type": { "type": "interest_scale" }
}
```

---

## Scenes to Comment Out (Convert to Follow-ups)

### Cum Location Variants (keep one generic, others → follow-up)
```
// COMMENTED - Merged into scene_cum_on_body with follow-up
// - scene_187 (facial)
// - scene_188 (chest/pearl necklace)
// - scene_194 (stomach)
// - scene_193 (creampie) - KEEP SEPARATE - different dynamic (internal vs external)
```

### Squirt Variants (keep basic, others → follow-up or intensity)
```
// COMMENTED - Merged into scene_squirting with follow-up
// - scene_281 (on face)
// - scene_282 (on body)
// - scene_283 (drinking) - Consider keeping if extreme enough
// - scene_284 (multiple) → intensity follow-up
// - scene_285 (during penetration) - KEEP - different context
// - scene_286 (technique) - KEEP - educational angle
// - scene_287 (distance) - COMMENT - just variation
// - scene_288 (in glass) - COMMENT - too specific
```

### Bondage Variants (keep M-bound and F-bound, consolidate types)
```
// COMMENTED - Merged into bondage scenes with follow-up
// - Various hand-only scenes → follow-up "light"
// - Various full-body scenes → follow-up "full"
// - Keep: scene_bondage_f, scene_bondage_m (separate by who's bound)
```

### Oral Intensity Variants (keep basic, add intensity follow-up)
```
// COMMENTED - Merged with intensity follow-up
// - scene_151-156 (deepthroat variants) → keep one + intensity follow-up
// - Various messy oral → follow-up option
```

### Spanking Implement Variants
```
// COMMENTED - Merged into spanking scenes with implement follow-up
// - Hand spanking specific
// - Paddle specific
// - Belt specific
// Keep: scene_spanking_m_gives_f, scene_spanking_f_gives_m (separate by dynamic)
```

---

## Next Steps

1. Apply this schema to existing scenes
2. Create consolidated scene list
3. Mark scenes for commenting
4. Add follow-up structures to kept scenes
5. Translate user_description to en/ru
6. Assign priorities to all scenes
