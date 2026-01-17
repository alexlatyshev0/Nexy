# Scene Library v2.0

## Structure

This folder contains the upgraded scene library with:
- Full AI context for question generation
- Multilingual user descriptions (en/ru)
- Priority levels for adaptive questioning
- Follow-up questions for preference details
- Balanced consolidation (not over-aggressive)

## Files Created

| File | Scenes | Priority | Category |
|------|--------|----------|----------|
| `scenes-v2-romance-001-012.json` | 12 | P1-P2 | Romance & Tenderness |
| `scenes-v2-passion-013-024.json` | 12 | P1-P3 | Passion & Intensity |
| `scenes-v2-impact-045-054.json` | 9 | P3-P4 | Impact Play & Pain |
| `scenes-v2-cum-finish.json` | 6 | P3-P4 | Cum/Finish Preferences |
| `scenes-v2-anal.json` | 5 | P3-P5 | Anal Play |
| `scenes-v2-oral.json` | 6 | P1-P2 | Oral Sex |
| `scenes-v2-exhibitionism.json` | 6 | P3-P4 | Exhibitionism & Voyeurism |
| `scenes-v2-verbal.json` | 6 | P2-P4 | Dirty Talk & Verbal |
| `scenes-v2-bondage.json` | 8 | P2-P5 | Bondage & Restraint |
| `scenes-v2-sensory.json` | 7 | P1-P4 | Sensory Play |
| `scenes-v2-roleplay.json` | 8 | P3-P5 | Roleplay & Fantasy |
| `scenes-v2-edge.json` | 7 | P4-P5 | Edge Play |
| **TOTAL** | **92** | P1-P5 | All Categories |

## Key Decisions

### Separate Scenes (NOT consolidated)
These stay as separate scenes because visual/emotional impact differs significantly:

- **Spanking M→F vs F→M** - Different power dynamics
- **Choking M→F vs F→M** - Different power dynamics
- **Cum facial vs chest vs internal** - Different emotional reactions
- **Anal F receives vs M receives** - Completely different dynamics
- **Rimming F receives vs M receives** - Different taboo levels
- **Biting M→F vs F→M** - Different meaning

### Consolidated with Follow-ups
These use one base scene + follow-up question:

- **Spanking intensity** → Light / Medium / Hard follow-up
- **Spanking implement** → Hand / Paddle / Belt / Crop follow-up
- **Cum body location** → Stomach / Back / Ass follow-up
- **Anal type** → Finger / Rimming / Plug / Full follow-up
- **Pegging position** → Missionary / Doggy / Riding follow-up
- **Bondage level** → Hands held / Tied / Full follow-up

## Priority System

| Priority | Description | When Shown |
|----------|-------------|------------|
| P1 | CORE | Everyone - fundamental preferences |
| P2 | COMMON | Most users - common variations |
| P3 | EXPLORATORY | Based on P1-P2 signals |
| P4 | NICHE | Clear interest signals needed |
| P5 | EDGE | Explicit interest only |

## Scene Structure

```typescript
{
  id: string;
  priority: 1-5;
  intensity: 1-5;

  generation_prompt: string;           // For image generation

  user_description: {
    en: string;                        // User-facing description
    ru: string;
  };

  ai_context: {
    description: string;               // AI understanding
    tests: {
      primary_kink: string;
      secondary_kinks: string[];
      power_dynamic: string;
      gender_role_aspect: string;
    };
    question_angles: {...};            // How to ask
    emotional_range: {...};            // Expected reactions
    profile_signals: {...};            // What answers mean
    correlations: {...};               // Related preferences
    taboo_context: {...};              // Normalization
  };

  follow_up?: {                        // Optional detail question
    trigger: string;
    detail_type: string;
    question: { en, ru };
    options: [...];
    multi_select: boolean;
  };

  question_type: { type: string };
}
```

## Completion Status

### Files Created - ALL COMPLETE
- [x] Romance & Tenderness (12 scenes)
- [x] Passion & Intensity (12 scenes)
- [x] Impact Play (9 scenes)
- [x] Cum/Finish Preferences (6 scenes)
- [x] Anal Play (5 scenes)
- [x] Oral Sex (6 scenes)
- [x] Bondage & Restraint (8 scenes)
- [x] Dirty Talk & Verbal (6 scenes)
- [x] Exhibitionism & Voyeurism (6 scenes)
- [x] Sensory Play (7 scenes)
- [x] Roleplay & Fantasy (8 scenes)
- [x] Edge Play (7 scenes)

### Final Statistics
- Original library: ~500 scenes
- V2 consolidated: 92 active scenes
- Consolidation ratio: ~5.4:1
- Scenes with follow-ups: 10

## Usage

AI should:
1. Select scenes based on user's gender/interests and current profile
2. Show higher priority scenes first
3. Use `ai_context` to generate appropriate questions
4. Interpret answers using `profile_signals`
5. Ask `follow_up` questions when triggered
6. Build preference profile from signals
