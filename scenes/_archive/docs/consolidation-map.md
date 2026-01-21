# Scene Consolidation Map

This document maps existing scenes to the new consolidated structure.

---

## Scene Counts

| Source | Count | Notes |
|--------|-------|-------|
| Base concepts | 92 | Unique scene ideas |
| With M/F variants | 182 | Many scenes have `_m_to_f` and `_f_to_m` versions |
| Images needed | 95 | Some variants share images |
| Clothing items | 34 | Separate clothing category |

**Total in DB: 182 scenes** (imported from `v2-ACTIVE-92-scenes/`)

---

## Prompt Writing Guidelines

### ✅ MUST DO:

1. **Always specify gender and position**
   - Bad: `couple in bedroom, one person on top`
   - Good: `woman sitting on man's lap facing him, man lying on bed`

2. **Only ONE action per prompt**
   - Bad: `he strokes her hair, then kisses her neck, then spanks her`
   - Good: `man spanking woman's bare bottom with open palm`

3. **Always specify clothing state**
   - Bad: `couple in bedroom`
   - Good: `naked woman, man in unbuttoned shirt, no pants`
   - Good: `woman in black lingerie, man fully clothed in suit`

4. **Can mention lighting and setting**
   - Good: `warm bedroom lighting, silk sheets`
   - Good: `dimly lit room, candles on nightstand`

5. **If there's spoken text, write it explicitly**
   - Good: `woman whispering "you're mine" into man's ear`

### ⛔ NEVER DO:

1. **Never specify art style** - style is set separately via `styleVariant`
   - Bad: `photorealistic, cinematic, 4k, masterpiece`
   - Bad: `anime style, illustration`

2. **Never use speech bubbles**
   - Bad: `speech bubble showing "I love you"`
   - Good: (just don't mention text at all, or describe the whisper/speaking)

3. **Never use quality words**
   - Bad: `beautiful, stunning, perfect, high quality, detailed`

4. **Avoid vague descriptions**
   - Bad: `intimate moment, passionate scene`
   - Good: `man kissing woman's neck while holding her waist`

### 📝 PROMPT TEMPLATE:

```
[WHO - explicit genders], [CLOTHING STATE], [SPECIFIC ACTION], [SETTING/LIGHTING if relevant]
```

**Examples:**

```
naked woman lying face down on bed, man's hands massaging her back with oil, warm bedroom lighting

woman in red lingerie sitting on man's face, man naked lying on back, her hands gripping headboard

man standing behind naked woman bent over desk, his hand raised mid-spank, office setting

woman whispering into man's ear, her lips touching his earlobe, both in formal evening wear, dimly lit restaurant booth
```

---

## Legend

- ✅ **KEEP** - Scene remains, may get follow-up added
- 🔄 **MERGE** - Becomes follow-up option in parent scene
- ❌ **COMMENT** - Too specific, remove or keep for later
- 🆕 **CREATE** - New consolidated scene needed

---

## Priority 1: CORE (Show to everyone)

These scenes test fundamental preferences.

### Romantic vs Passionate Spectrum
| Scene | Status | Notes |
|-------|--------|-------|
| scene_001 (morning tenderness M→F) | ✅ KEEP | P1 |
| scene_002 (morning tenderness F→M) | ✅ KEEP | P1 |
| scene_003 (slow dancing) | ✅ KEEP | P1 |
| scene_006 (passionate kiss M leads) | ✅ KEEP | P1 |
| scene_007 (passionate kiss F leads) | ✅ KEEP | P1 |
| scene_011 (forehead to forehead) | ✅ KEEP | P1 |

### Oral - Giving vs Receiving
| Scene | Status | Notes |
|-------|--------|-------|
| 🆕 scene_oral_f_receives | CREATE | Consolidated cunnilingus - P1 |
| 🆕 scene_oral_m_receives | CREATE | Consolidated blowjob - P1 |

**Follow-up for both:**
```json
{
  "detail_type": "style",
  "options": [
    { "id": "gentle", "label": { "en": "Gentle, teasing", "ru": "Нежно, дразняще" } },
    { "id": "passionate", "label": { "en": "Passionate, hungry", "ru": "Страстно, жадно" } },
    { "id": "dominant", "label": { "en": "Dominant, controlling", "ru": "Доминантно, контролируя" } },
    { "id": "sloppy", "label": { "en": "Messy, intense", "ru": "Неряшливо, интенсивно" } }
  ]
}
```

### Basic Positions - Who Controls
| Scene | Status | Notes |
|-------|--------|-------|
| scene_013 (wall sex M leads) | ✅ KEEP | P1 |
| scene_014 (cowgirl F controls) | ✅ KEEP | P1 |
| scene_015 (missionary M controls) | ✅ KEEP | P1 |
| 🆕 scene_doggy | CREATE | P2 |

### Pace Preference
| Scene | Status | Notes |
|-------|--------|-------|
| 🆕 scene_slow_sensual | CREATE | P1 |
| 🆕 scene_fast_passionate | CREATE | P1 |

### Eye Contact Importance
| Scene | Status | Notes |
|-------|--------|-------|
| Tests via follow-up on other scenes | - | Add to cowgirl, missionary |

### Aftercare
| Scene | Status | Notes |
|-------|--------|-------|
| scene_049 (aftercare spanking) | ✅ KEEP | P1 - generalize to aftercare |
| 🆕 scene_aftercare_cuddling | CREATE | P1 |

---

## Priority 2: COMMON (Show to most)

### Light Dominance/Submission
| Scene | Status | Notes |
|-------|--------|-------|
| scene_053 (hand on throat M→F) | ✅ KEEP | P2 |
| scene_054 (hand on throat F→M) | ✅ KEEP | P2 |
| scene_014 (pinning wrists F→M) | ✅ KEEP | P2 |
| scene_015 (pinning wrists M→F) | ✅ KEEP | P2 |

### Hair Pulling
| Scene | Status | Notes |
|-------|--------|-------|
| 🆕 scene_hair_pulling_m_does | CREATE | P2 |
| 🆕 scene_hair_pulling_f_does | CREATE | P2 |

### Dirty Talk
| Scene | Status | Notes |
|-------|--------|-------|
| scene_109 (M whispers to F) | ✅ KEEP | P2 |
| scene_110 (F whispers to M) | ✅ KEEP | P2 |
| scene_111-114 | 🔄 MERGE | → follow-up on type (praise, degrading, commanding) |

### Massage / Sensual Touch
| Scene | Status | Notes |
|-------|--------|-------|
| scene_008 (M massages F) | ✅ KEEP | P2 |
| scene_009 (F massages M) | ✅ KEEP | P2 |

### Bath/Shower Together
| Scene | Status | Notes |
|-------|--------|-------|
| scene_004 (bath M holds F) | ✅ KEEP | P2 |
| scene_005 (bath F holds M) | ✅ KEEP | P2 |

---

## Priority 3: EXPLORATORY

### Spanking - KEEP SEPARATE BY DYNAMIC
| Scene | Status | Notes |
|-------|--------|-------|
| scene_045 (M spanks F - hand) | ✅ KEEP as base | P3 |
| scene_046 (F spanks M - hand) | ✅ KEEP as base | P3 |
| scene_047 (M uses paddle on F) | 🔄 MERGE | → follow-up implement |
| scene_048 (F uses crop on M) | 🔄 MERGE | → follow-up implement |

**Follow-up for spanking scenes:**
```json
{
  "trigger": "if_positive",
  "detail_type": "implement",
  "question": {
    "en": "What implement appeals most?",
    "ru": "Чем предпочтительнее?"
  },
  "options": [
    { "id": "hand", "label": { "en": "Hand only", "ru": "Только рукой" } },
    { "id": "paddle", "label": { "en": "Paddle", "ru": "Падл/шлёпалка" } },
    { "id": "belt", "label": { "en": "Belt", "ru": "Ремень" } },
    { "id": "crop", "label": { "en": "Riding crop", "ru": "Стек" } },
    { "id": "various", "label": { "en": "Variety", "ru": "Разное" } }
  ],
  "multi_select": true
}
```

**Intensity follow-up:**
```json
{
  "trigger": "if_positive",
  "detail_type": "intensity",
  "question": {
    "en": "What intensity level?",
    "ru": "Какая интенсивность?"
  },
  "options": [
    { "id": "light", "label": { "en": "Light, playful", "ru": "Лёгкие, игривые" } },
    { "id": "medium", "label": { "en": "Medium, feeling it", "ru": "Средние, ощутимые" } },
    { "id": "hard", "label": { "en": "Hard, leaving marks", "ru": "Сильные, со следами" } },
    { "id": "extreme", "label": { "en": "Very hard, bruising", "ru": "Очень сильные" } }
  ]
}
```

### Bondage - KEEP SEPARATE BY WHO IS BOUND
| Scene | Status | Notes |
|-------|--------|-------|
| 🆕 scene_bondage_f_bound | CREATE | P3 - consolidated |
| 🆕 scene_bondage_m_bound | CREATE | P3 - consolidated |

**Follow-up:**
```json
{
  "detail_type": "specifics",
  "options": [
    { "id": "held", "label": { "en": "Hands held down", "ru": "Руки придержаны" } },
    { "id": "tied_hands", "label": { "en": "Hands tied", "ru": "Руки связаны" } },
    { "id": "spread", "label": { "en": "Spread eagle", "ru": "Растянут(а)" } },
    { "id": "shibari", "label": { "en": "Full rope/shibari", "ru": "Полное связывание" } }
  ]
}
```

### Blindfold
| Scene | Status | Notes |
|-------|--------|-------|
| scene_055 (F blindfolded, ice) | ✅ KEEP | P3 - generalize to blindfold |
| scene_056 (M blindfolded, ice) | ✅ KEEP | P3 |

### Toys
| Scene | Status | Notes |
|-------|--------|-------|
| scene_261 (magic wand on F) | ✅ KEEP | P3 |
| 🆕 scene_toys_on_m | CREATE | P3 |

### Anal Play - KEEP SEPARATE BY RECEIVER
| Scene | Status | Notes |
|-------|--------|-------|
| scene_139 (F receives anal) | ✅ KEEP as base | P3 |
| scene_289-296 (M receives anal) | ✅ KEEP one as base | P3 |

**Follow-up:**
```json
{
  "detail_type": "specifics",
  "options": [
    { "id": "finger", "label": { "en": "Finger(s)", "ru": "Пальцы" } },
    { "id": "rimming", "label": { "en": "Tongue (rimming)", "ru": "Язык (римминг)" } },
    { "id": "plug", "label": { "en": "Plug/toy", "ru": "Пробка/игрушка" } },
    { "id": "penetration", "label": { "en": "Full penetration", "ru": "Полное проникновение" } }
  ]
}
```

### Roleplay
| Scene | Status | Notes |
|-------|--------|-------|
| scene_119 (teacher-student M dom) | ✅ KEEP | P3 |
| scene_120 (teacher-student F dom) | ✅ KEEP | P3 |
| scene_121-126 | ❌ COMMENT | Too specific - can ask via follow-up |

**Follow-up for roleplay interest:**
```json
{
  "detail_type": "specifics",
  "question": { "en": "What scenarios appeal?", "ru": "Какие сценарии интересуют?" },
  "options": [
    { "id": "teacher", "label": { "en": "Teacher/student", "ru": "Учитель/ученик" } },
    { "id": "boss", "label": { "en": "Boss/employee", "ru": "Босс/подчинённый" } },
    { "id": "stranger", "label": { "en": "Strangers meeting", "ru": "Незнакомцы" } },
    { "id": "service", "label": { "en": "Service person", "ru": "Обслуживание" } },
    { "id": "uniform", "label": { "en": "Uniforms", "ru": "Униформа" } }
  ],
  "multi_select": true
}
```

### Exhibitionism / Voyeurism
| Scene | Status | Notes |
|-------|--------|-------|
| scene_101 (F masturbates, M watches) | ✅ KEEP | P3 |
| scene_102 (M masturbates, F watches) | ✅ KEEP | P3 |
| scene_104 (F at window) | ✅ KEEP | P3 |
| scene_105-106 (secret watching) | 🔄 MERGE | → follow-up on watched vs watcher |

---

## Priority 4: NICHE

### Cum Location - CONSOLIDATE
| Scene | Status | Notes |
|-------|--------|-------|
| 🆕 scene_cum_on_body | CREATE | P4 - one scene |
| scene_187 (facial) | 🔄 MERGE | → follow-up option |
| scene_188 (chest) | 🔄 MERGE | → follow-up option |
| scene_194 (stomach) | 🔄 MERGE | → follow-up option |
| scene_193 (creampie) | ✅ KEEP SEPARATE | Different dynamic (internal) |

**Follow-up:**
```json
{
  "trigger": "if_positive",
  "detail_type": "location",
  "question": { "en": "Where is most appealing?", "ru": "Куда привлекательнее?" },
  "options": [
    { "id": "face", "label": { "en": "Face", "ru": "Лицо" } },
    { "id": "mouth", "label": { "en": "In mouth", "ru": "В рот" } },
    { "id": "chest", "label": { "en": "Chest", "ru": "Грудь" } },
    { "id": "stomach", "label": { "en": "Stomach", "ru": "Живот" } },
    { "id": "back", "label": { "en": "Back/ass", "ru": "Спина/попа" } }
  ],
  "multi_select": true
}
```

### Squirting - CONSOLIDATE
| Scene | Status | Notes |
|-------|--------|-------|
| scene_190 (basic squirt) | ✅ KEEP as base | P4 |
| scene_281 (on face) | 🔄 MERGE | → follow-up option |
| scene_282 (on body) | 🔄 MERGE | → follow-up option |
| scene_283 (drinking) | ❌ COMMENT | P5 - too specific |
| scene_284-288 | ❌ COMMENT | Too specific variants |
| scene_285 (during sex) | ✅ KEEP | Different context |

### Pegging - CONSOLIDATE
| Scene | Status | Notes |
|-------|--------|-------|
| scene_140 (basic pegging) | ✅ KEEP as base | P4 |
| scene_251 (missionary pegging) | 🔄 MERGE | → follow-up position |
| scene_252 (strap-on BJ) | ✅ KEEP | Different act |
| scene_253 (doggy pegging) | 🔄 MERGE | → follow-up position |
| scene_254-256 | ❌ COMMENT | Too specific |

### Forced Orgasm - CONSOLIDATE
| Scene | Status | Notes |
|-------|--------|-------|
| scene_257 (forced orgasm F) | ✅ KEEP | P4 |
| scene_258 (forced orgasm M) | ✅ KEEP | P4 |
| scene_259-262 | 🔄 MERGE or ❌ | Variants |

### Degradation/Humiliation
| Scene | Status | Notes |
|-------|--------|-------|
| scene_114 (verbal humiliation F→M) | ✅ KEEP | P4 |
| 🆕 scene_verbal_humiliation_m→f | CREATE | P4 |

### Breath Play
| Scene | Status | Notes |
|-------|--------|-------|
| scene_053 (light choking M→F) | ✅ KEEP | P3 (light version) |
| scene_054 (light choking F→M) | ✅ KEEP | P3 (light version) |

### Biting / Marking
| Scene | Status | Notes |
|-------|--------|-------|
| scene_051 (M bites F) | ✅ KEEP | P3 |
| scene_052 (F bites M) | ✅ KEEP | P3 |

### Nipple Play
| Scene | Status | Notes |
|-------|--------|-------|
| scene_050 (F pinches M nipple) | ✅ KEEP | P3 |
| scene_148 (nipple clamps F) | ✅ KEEP | P4 |
| scene_149 (nipple clamps M) | ✅ KEEP | P4 |

### Temperature Play
| Scene | Status | Notes |
|-------|--------|-------|
| scene_055-056 (ice) | ✅ KEEP | P3 |
| scene_057-058 (wax) | ✅ KEEP | P3 |

### Body Writing
| Scene | Status | Notes |
|-------|--------|-------|
| scene_115-118 | ✅ KEEP one | P4 |

### Overstimulation
| Scene | Status | Notes |
|-------|--------|-------|
| scene_199 (overstim M) | ✅ KEEP | P4 |
| scene_200 (overstim F) | ✅ KEEP | P4 |

---

## Priority 5: EDGE

### Watersports
| Scene | Status | Notes |
|-------|--------|-------|
| scene_201 (golden shower F→M) | ✅ KEEP | P5 |
| scene_202 (golden shower M→F) | ✅ KEEP | P5 |
| scene_203-206 | ❌ COMMENT | Too specific |

### CNC (Consensual Non-Consent)
| Scene | Status | Notes |
|-------|--------|-------|
| scene_207 (CNC M aggressor) | ✅ KEEP | P5 |
| scene_208 (CNC F aggressor) | ✅ KEEP | P5 |
| scene_209-212 | ❌ COMMENT | Too specific variants |

### Spitting
| Scene | Status | Notes |
|-------|--------|-------|
| scene_157 (M spits in F mouth) | ✅ KEEP | P5 |
| scene_158 (F spits on M face) | ✅ KEEP | P5 |
| scene_159-162 | ❌ COMMENT | Too specific |

### Anal Hook / Extreme Bondage
| Scene | Status | Notes |
|-------|--------|-------|
| scene_165 (anal hook F) | ✅ KEEP | P5 |
| scene_166 (anal hook M) | ✅ KEEP | P5 |

---

## Summary: Scenes to Keep vs Comment

### KEEP (with possible follow-ups): ~80 scenes
### COMMENT OUT: ~300+ scenes (merge into follow-ups)

### New Consolidated Scenes to Create: ~15
- scene_oral_f_receives
- scene_oral_m_receives
- scene_doggy
- scene_slow_sensual
- scene_fast_passionate
- scene_aftercare_cuddling
- scene_hair_pulling_m_does
- scene_hair_pulling_f_does
- scene_bondage_f_bound
- scene_bondage_m_bound
- scene_toys_on_m
- scene_cum_on_body
- scene_verbal_humiliation_m_to_f

---

## V2 Files Created - Final Count

| File | Category | Scene Count | Priority Range |
|------|----------|-------------|----------------|
| `scenes-v2-romance-001-012.json` | Romance & Tenderness | 12 | P1-P2 |
| `scenes-v2-passion-013-024.json` | Passion & Intensity | 12 | P1-P2 |
| `scenes-v2-impact-045-054.json` | Impact Play | 9 | P3 |
| `scenes-v2-cum-finish.json` | Cum / Finish Preferences | 6 | P3-P4 |
| `scenes-v2-anal.json` | Anal Play | 5 | P3-P4 |
| `scenes-v2-oral.json` | Oral Sex | 6 | P1-P2 |
| `scenes-v2-exhibitionism.json` | Exhibitionism / Voyeurism | 6 | P3-P4 |
| `scenes-v2-verbal.json` | Dirty Talk & Verbal | 6 | P2-P4 |
| `scenes-v2-bondage.json` | Bondage & Restraint | 8 | P2-P5 |
| `scenes-v2-sensory.json` | Sensory Play | 7 | P1-P4 |
| `scenes-v2-roleplay.json` | Roleplay & Fantasy | 8 | P3-P5 |
| `scenes-v2-edge.json` | Edge Play | 7 | P4-P5 |
| **TOTAL** | | **92** | P1-P5 |

### By Priority Level

| Priority | Count | Description |
|----------|-------|-------------|
| P1 (CORE) | ~20 | Show to everyone - fundamental preferences |
| P2 (COMMON) | ~25 | Show to most - widely enjoyed |
| P3 (EXPLORATORY) | ~25 | Show if openness indicated |
| P4 (NICHE) | ~15 | Show if specific signals present |
| P5 (EDGE) | ~7 | Show only with explicit openness to extreme |

### Scenes with Follow-ups

These scenes have additional detail questions triggered by positive response:

- `scene_spanking_m_to_f` - intensity + implement
- `scene_spanking_f_to_m` - intensity + implement
- `scene_anal_f_receives_basic` - anal play type
- `scene_pegging` - positions/dynamics
- `scene_cum_body_general` - location preference
- `scene_dirty_talk_m_to_f` - talk type
- `scene_sensation_variety` - sensation preferences
- `scene_uniform_fetish` - uniform types
- `scene_pet_play` - pet play type
- `scene_public_sex` - location preference

---

## Question Types Summary

| Type | When to use | Example scenes |
|------|-------------|----------------|
| `interest_scale` | General appeal | Most scenes |
| `role_choice` | Both roles possible | Oral, spanking, bondage |
| `boundary` | Taboo content | Anal, watersports, CNC |
| `emotional` | Nuanced reactions | Romantic scenes |
| `comparison` | A vs B preference | Gentle vs rough |

---

## Follow-up Types Summary

| Type | When to use | Example |
|------|-------------|---------|
| `location` | Where on body | Cum, kissing |
| `implement` | What tool/method | Spanking, bondage |
| `intensity` | How hard/soft | Pain play, roughness |
| `frequency` | How often | Any positive interest |
| `specifics` | Detailed variants | Roleplay scenarios, positions |
