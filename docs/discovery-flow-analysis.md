# Discovery Flow — Анализ кода

## Общий поток (scenes.client.ts → scene-progression.ts)

```
User открывает /discover
        ↓
getFilteredScenesClient()
        ↓
[1] RPC get_excluded_scene_ids (timeout 2 сек)
        ↓
[2] Запрос scene_responses (seen scenes)
        ↓
[3] Запрос scenes (version=2, is_active=true)
        ↓
getAdaptiveScenes()
        ↓
[Filtering Pipeline]
        ↓
[Scoring Pipeline]
        ↓
[Exploration/Exploitation]
        ↓
Return top N scenes
```

---

## Шаг 1: getFilteredScenesClient (scenes.client.ts)

### 1.1 Получение excluded scene IDs
```typescript
// RPC с timeout 2 сек (раньше мог висеть долго)
const rpcPromise = supabaseClient.rpc('get_excluded_scene_ids', { p_user_id: userId });
const timeoutPromise = new Promise((resolve) => setTimeout(..., 2000));
await Promise.race([rpcPromise, timeoutPromise]);
```

### 1.2 Получение seen scene IDs
```typescript
const { data: seen } = await supabaseClient
  .from('scene_responses')
  .select('scene_id, question_type')
  .eq('user_id', userId);

// Фильтрация body_map ответов (они не должны блокировать сцены)
const seenIds = seen.filter(s =>
  !s.scene_id.includes('bodymap-') &&
  s.question_type !== 'body_map'
);
```

### 1.3 Запрос сцен
```typescript
const query = supabaseClient
  .from('scenes')
  .select('*')
  .eq('version', 2)
  .eq('is_active', true)          // Только активные
  .lte('intensity', maxIntensity); // По уровню интенсивности
```

---

## Шаг 2: getAdaptiveScenes (scene-progression.ts)

### 2.1 Comfort-Based Intensity Limit

**Константы:**
- `MILD_PHASE_SCENE_COUNT = 10` — первые 10 сцен только mild

**Логика:**
```
answeredCount < 10  → maxIntensity = 2 (mild only)
answeredCount >= 10 → maxIntensity = 3
avgInterest >= 60   → maxIntensity = 4
avgInterest >= 75 && count >= 20 → maxIntensity = 5 (все)
```

### 2.2 Фильтр: V2 Composite Scenes
```typescript
allScenes.filter(s =>
  !s.tags?.includes('body_map') &&  // Исключаем body_map
  s.version === 2 &&                 // Только V2
  Array.isArray(s.elements)          // С элементами
);
```

### 2.3 Фильтр: Baseline Gates

**BASELINE_CATEGORY_GATES:**
```
baseline-bdsm     → [control-power, bondage, discipline]
baseline-anal     → [anal, pegging, prostate]
baseline-group    → [threesome, gangbang, orgy, swinging]
baseline-public   → [public, exhibitionism, outdoor]
baseline-roleplay → [roleplay, ageplay, petplay, uniform]
baseline-fetish   → [fetish, feet, latex, leather]
baseline-pain     → [impact, pain, cbt, nipple-torture]
baseline-humiliation → [humiliation, degradation, verbal]
baseline-bodyfluids → [watersports, spitting, cum]
baseline-voyeur   → [voyeur, watching]
baseline-exhib    → [exhib, showing-off]
baseline-toys     → [toys, vibrator, dildo]
baseline-oral     → [oral, blowjob, cunnilingus]
baseline-vanilla  → [romantic, tender, vanilla]
```

**Логика:**
1. Hardcore категории заблокированы по умолчанию
2. Если user ответил на baseline сцену с интересом → категория разблокирована
3. Если user skip или 0 элементов → категория заблокирована
4. tag_preferences с interest >= 40 или experience='tried' → разблокирует

**HARDCORE_CATEGORIES_BLOCKED_BY_DEFAULT:**
```
pain, cbt, nipple-torture, impact,
humiliation, degradation,
watersports, spitting,
ageplay, gangbang, orgy
```

### 2.4 Фильтр: Inter-Scene Gates

**SCENE_REQUIRES_SCENE:**
```
deepthroat      → requires [blowjob], minInterest: 60
facesitting     → requires [cunnilingus], minInterest: 60
mummification   → requires [bondage], minInterest: 70
fisting         → requires [anal], minInterest: 70
double-penetration → requires [anal, threesome], minInterest: 60
pet-play        → requires [collar], minInterest: 60
electrostim     → requires [wax-play, ice-play], minInterest: 60
degradation     → requires [dirty-talk], minInterest: 60
gangbang        → requires [threesome], minInterest: 70
orgy            → requires [threesome], minInterest: 70
```

**Логика:**
- Сцена заблокирована если user не ответил на prerequisite сцену с достаточным интересом
- Interest рассчитывается: `40 + elementsCount * 20` (max 100)

### 2.5 Фильтр: Dedupe by Tag

```typescript
// Получаем уже отвеченные элементы и теги
const answeredElementIds = await getAnsweredElementIds(supabase, userId);
const answeredTagRefs = await getAnsweredTagRefs(supabase, userId);

// Скипаем сцену если ВСЕ её элементы уже отвечены
shouldSkipSceneByDedupe(scene, answeredElementIds, answeredTagRefs);
```

**Логика:**
- Сцена пропускается если все её elements с `dedupe_by_tag=true` уже отвечены

---

## Шаг 3: Scoring (calculateSceneScoreSync)

**Формула:**
```
score = baseScore
      + interestBoost
      + intensityMatch
      + roleMatch
      + newElementsBonus
      + breadthBonus
```

### 3.1 Base Score
```typescript
const baseScore = 100 - (scene.priority || 50);
// priority 1 → score 99
// priority 50 → score 50
// priority 100 → score 0
```

### 3.2 Interest Level Boost
```typescript
for (element of scene.elements) {
  const pref = tagPrefMap.get(element.tag_ref);
  if (pref) {
    score += (pref.interest_level || 0) * 0.5;
    // interest_level 100 → +50 points
  }
}
```

### 3.3 Intensity Match
```typescript
if (pref.intensity_preference && scene.intensity) {
  const diff = Math.abs(pref.intensity_preference - scene.intensity * 20);
  if (diff <= 20) {
    score += 10;  // Bonus
  } else {
    score -= diff * 0.1;  // Penalty
  }
}
```

### 3.4 Role Preference Match
```typescript
// Определяем доминантную роль user по его tag_preferences
const roleCounts = { give: 0, receive: 0, both: 0 };
for (pref of tagPrefs) {
  if (pref.role_preference) roleCounts[pref.role_preference]++;
}

if (matchesRolePreference(userRole, scene.role_direction)) {
  score += 15;  // Match bonus
} else {
  score -= 10;  // Mismatch penalty
}
```

**matchesRolePreference логика:**
- `both` или `null` → match всё
- `mutual`, `universal`, `solo`, `group` → match всё
- `give` + `m_to_f` (male user) → match
- `give` + `f_to_m` (female user) → match
- `receive` + `f_to_m` (male user) → match
- `receive` + `m_to_f` (female user) → match

### 3.5 New Elements Bonus
```typescript
const newElements = scene.elements.filter(e => !answeredElementIds.has(e.id));
score += newElements.length * 5;
// 3 новых элемента → +15 points
```

### 3.6 Breadth-First Bonus
```typescript
// Только для первых 15 сцен
if (answeredCount <= 15 && !seenCategories.has(scene.category)) {
  score += Math.max(0, 20 - answeredCount);
  // answeredCount=0 → +20 points
  // answeredCount=10 → +10 points
  // answeredCount=15 → +5 points
}
```

---

## Шаг 4: Exploration vs Exploitation

**Константы:**
```
EXPLOITATION_RATIO = 0.7  // 70% лучших по score
EXPLORATION_RATIO = 0.3   // 30% случайных из остальных
```

**Логика:**
```typescript
const exploitCount = Math.ceil(limit * 0.7);  // e.g., 7 из 10
const exploreCount = limit - exploitCount;     // e.g., 3 из 10

// Top N по score → exploit
const exploitScenes = sorted.slice(0, exploitCount);

// Random из остальных → explore
const remaining = sorted.slice(exploitCount);
const exploreScenes = shuffle(remaining).slice(0, exploreCount);

// Смешиваем и перемешиваем
return shuffle([...exploitScenes, ...exploreScenes]);
```

---

## Запросы к БД (оптимизировано)

| Запрос | Когда | Кол-во |
|--------|-------|--------|
| RPC get_excluded_scene_ids | scenes.client.ts | 1 (timeout 2s) |
| scene_responses (seen) | scenes.client.ts | 1 |
| scenes | scenes.client.ts | 1 |
| scene_responses (comfort) | getAdaptiveScenes | 1 |
| tag_preferences (comfort) | getAdaptiveScenes | 1 |
| scene_responses (baselines) | getBaselineGates | 1 |
| tag_preferences (gates) | getBaselineGates | 1 |
| scene_responses (interests) | getSceneResponseInterests | 1 |
| scene_responses (elements) | getAnsweredElementIds | 1 |
| tag_preferences (tags) | getAnsweredTagRefs | 1 |
| scene_responses (categories) | getSeenCategories | 1 |
| tag_preferences (scoring) | scoring | 1 |

**Итого: ~12 запросов** (раньше было ~200+ из-за scoring в цикле)

---

## Диаграмма Pipeline

```
[All 211 active V2 scenes]
           ↓
    [Intensity Filter]      ← maxIntensity from comfort (2-5)
           ↓
    [Baseline Gates]        ← blocked categories
           ↓
    [Inter-Scene Gates]     ← prerequisite scenes
           ↓
    [Dedupe by Tag]         ← skip fully answered scenes
           ↓
    [Scoring]               ← interest + role + newness
           ↓
    [Exploit/Explore]       ← 70/30 split
           ↓
    [Top 10 scenes]
```
