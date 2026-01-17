# Discovery v1 Architecture

> Документация системы опроса сексуальных предпочтений. Версия сохранена в ветке `discovery1`.

## Обзор системы

Discovery v1 — система выявления сексуальных предпочтений через просмотр сцен и ответы на вопросы. Пользователь видит изображение сцены, читает описание и отвечает на вопрос (шкала/да-может-нет).

### Основные компоненты

```
scenes/v4/
├── scenes-v4-*.json          # 468 сцен в формате V4
├── preference-topics.json    # 31 топик с drilldown-вопросами
├── tags-taxonomy.json        # Таксономия тегов (21 категория)
├── body-map-scenes-v4.json   # Сцены для body map
└── scenes-manifest.json      # Схема валидации

src/app/(app)/discover/
└── page.tsx                  # Основная страница discovery

src/components/discovery/
├── TopicDrilldown.tsx        # Компонент follow-up вопросов
├── BodyMapAnswer/            # Компонент body map
└── ...

src/lib/
├── question-v4.ts            # Логика V4 вопросов
├── types.ts                  # Типы (SceneV4, TopicResponse, etc.)
└── scenes.client.ts          # Загрузка сцен из БД
```

---

## Формат сцены V4

```typescript
interface SceneV4 {
  id: string;                    // "scene_001"
  slug?: string;                 // URL-friendly ID
  priority: number;              // 1-10, порядок показа
  intensity: number;             // 1-5, уровень откровенности
  schema_version: 4;

  // Для генерации изображения
  generation_prompt: string;

  // Описание для пользователя
  user_description: LocalizedString;  // {en: "...", ru: "..."}

  // Контекст для AI
  ai_context: {
    description: string;
    tests: {
      primary_kink: string;
      secondary_kinks: string[];
      power_dynamic: string;
      gender_role_aspect: string;
    };
    emotional_range: {
      positive: string[];
      negative: string[];
      curious: string[];
    };
    profile_signals: {
      if_positive: string[];
      if_negative: string[];
      if_curious: string[];
    };
    correlations: {
      positive: string[];
      negative: string[];
    };
    taboo_context: {
      level: 1 | 2 | 3 | 4 | 5;
      common_concerns: string | null;
      normalization: string | null;
    };
  };

  // Участники сцены
  participants: string[];  // ["active_male", "receiving_female"]

  // Теги и измерения
  dimensions: string[];
  tags: string[];

  // Фильтрация по полу/ориентации
  relevant_for: {
    gender: "male" | "female" | "any";
    interested_in: "male" | "female" | "any";
  };

  // Конфигурация вопроса
  question_config: QuestionConfig;

  // Опционально
  follow_up?: FollowUp | null;
  body_map_config?: BodyMapSceneConfig | null;
}
```

---

## Типы вопросов (question_config.type)

### 1. Scale (шкала)
```json
{
  "type": "scale",
  "topic_ref": "dirty_talk",
  "question": {
    "en": "How much does this appeal to you?",
    "ru": "Насколько это тебе нравится?"
  }
}
```
Пользователь двигает слайдер 0-100.

### 2. Yes/Maybe/No (три варианта)
```json
{
  "type": "yes_maybe_no",
  "topic_ref": "bondage",
  "question": {
    "en": "Would you try this?",
    "ru": "Попробовал бы это?"
  },
  "show_experience": true
}
```
Три кнопки: Да / Может быть / Нет. Если `show_experience: true`, потом спрашивается "Пробовал?"

### 3. Topic Drilldown
```json
{
  "type": "topic_drilldown",
  "topic_ref": "dirty_talk"
}
```
После положительного ответа показываются follow-up вопросы из `preference-topics.json`.

### 4. Body Map
```json
{
  "type": "body_map",
  "question": {
    "en": "Where do you like to be touched?",
    "ru": "Где тебе нравится, когда тебя трогают?"
  }
}
```
Пользователь выбирает зоны на изображении тела.

### 5. What Appeals (мульти-выбор)
```json
{
  "type": "what_appeals",
  "options": [
    {"id": "hair_pull", "label": {"ru": "Потянуть за волосы"}},
    {"id": "neck_bite", "label": {"ru": "Укусить за шею"}}
  ]
}
```
Множественный выбор "что нравится".

---

## Система топиков (preference-topics.json)

Топик — это центральная тема, которая спрашивается один раз и применяется ко всем связанным сценам.

```json
{
  "dirty_talk": {
    "id": "dirty_talk",
    "name": {"en": "Dirty Talk", "ru": "Грязные разговоры"},
    "related_tags": ["dirty_talk", "verbal_arousal", "degradation"],
    "related_kinks": ["dirty_talk", "verbal_humiliation", "begging"],

    "questions": {
      "types": {
        "question": {"ru": "Какие слова тебя возбуждают?"},
        "type": "multi_choice_drilldown",
        "options": [
          {
            "id": "praising",
            "label": {"ru": "Хвалящие"},
            "drilldown": {
              "question": {"ru": "Какая похвала?"},
              "type": "multi_choice",
              "options": [...]
            }
          },
          {
            "id": "degrading",
            "label": {"ru": "Унизительные"},
            "drilldown": {
              "question": {"ru": "Какие унизительные слова ок?"},
              "type": "multi_choice",
              "options": [...],
              "allow_custom": true
            }
          }
        ]
      },
      "intensity": {
        "question": {"ru": "Насколько откровенно?"},
        "type": "scale"
      },
      "role": {
        "question": {"ru": "Что тебе ближе?"},
        "type": "single_choice",
        "options": [
          {"id": "hear", "label": {"ru": "Слышать"}},
          {"id": "speak", "label": {"ru": "Говорить"}},
          {"id": "both", "label": {"ru": "И то и другое"}}
        ]
      }
    },

    "experience": {
      "show": true,
      "question": {"ru": "Твой опыт с грязными разговорами?"},
      "options": [...]
    }
  }
}
```

### Типы вопросов в топиках

| Тип | Описание |
|-----|----------|
| `multi_choice` | Множественный выбор |
| `multi_choice_drilldown` | Множественный выбор с вложенными уточнениями |
| `single_choice` | Один вариант |
| `scale` | Шкала интенсивности |

---

## Таксономия тегов (tags-taxonomy.json)

21 категория тегов:

| Категория | Примеры тегов | Кол-во |
|-----------|---------------|--------|
| acts_basic | vaginal, oral, blowjob, fingering | 9 |
| acts_anal | anal, rimming, pegging, prostate | 8 |
| positions | missionary, doggy, cowgirl, face_sitting | 9 |
| bdsm_bondage | handcuffs, rope, shibari, blindfold, gag | 12 |
| bdsm_impact | spanking, whipping, caning, paddling | 7 |
| bdsm_power | dominant, submissive, femdom, worship | 10 |
| bdsm_psychological | humiliation, praise, edging, begging | 9 |
| bdsm_extreme | breath_play, cbt, wax_play, clamps | 7 |
| group | threesome, orgy, gangbang, cuckold | 10 |
| voyeur_exhib | voyeur, public, filmed, caught | 8 |
| roleplay | boss, teacher, maid, stranger | 12 |
| clothing_fetish | lingerie, stockings, latex, leather | 11 |
| body_parts | breasts, ass, feet, mouth | 12 |
| fluids | cum, facial, creampie, squirting | 8 |
| toys_equipment | vibrator, dildo, strapon, plug | 8 |
| locations | bedroom, bathroom, office, dungeon | 14 |
| relationship | couple, affair, stranger, first_time | 10 |
| emotions_mood | romantic, passionate, rough, gentle | 10 |
| timing | morning, quickie, marathon, spontaneous | 7 |
| gender_age | milf, cougar, feminization, size_difference | 7 |
| technology | video_call, sexting, porn_watching | 5 |
| sensory | temperature, massage, food_play | 5 |

### Связи тегов

```json
{
  "implies": {
    "femdom": ["dominant", "female"],
    "pegging": ["strapon", "anal", "femdom"]
  },
  "often_together": {
    "blindfold": ["bondage", "teasing", "sensory"],
    "collar": ["leash", "submissive", "ownership"]
  },
  "mutually_exclusive": {
    "dominant": ["submissive"],
    "rough": ["gentle"]
  }
}
```

---

## База данных

### Таблица: scenes
```sql
CREATE TABLE scenes (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  priority INTEGER,
  intensity INTEGER,
  schema_version INTEGER,
  generation_prompt TEXT,
  image_url TEXT,
  user_description JSONB,
  ai_context JSONB,
  participants TEXT[],
  dimensions TEXT[],
  tags TEXT[],
  relevant_for JSONB,
  question_config JSONB,
  follow_up JSONB,
  body_map_config JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Таблица: topic_responses
```sql
CREATE TABLE topic_responses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  topic_ref TEXT NOT NULL,
  interest_level INTEGER,  -- 0-100
  drilldown_responses JSONB,  -- {"types": ["praising", "degrading"], ...}
  experience JSONB,
  first_scene_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, topic_ref)
);
```

### Таблица: preference_profiles
```sql
CREATE TABLE preference_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users UNIQUE,
  preferences JSONB,  -- {"scene_001": 75, "scene_002": 30, ...}
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

---

## Поток данных

```
1. Пользователь открывает /discover
   ↓
2. Загружаются сцены из БД (getScenes)
   - Фильтрация по gender/interested_in
   - Сортировка по priority
   - Исключение уже отвеченных
   ↓
3. Показывается текущая сцена
   - Изображение (image_url)
   - Описание (user_description[locale])
   - Вопрос (question_config.question[locale])
   ↓
4. Пользователь отвечает
   - scale: слайдер 0-100
   - yes_maybe_no: кнопка
   ↓
5. Сохраняется ответ
   - preference_profiles.preferences[scene_id] = value
   ↓
6. Проверка на drilldown
   - Если topic_ref && interest >= 50%
   - Загрузить топик из API: GET /api/topics/{topicRef}
   - Показать TopicDrilldown компонент
   ↓
7. Drilldown ответы сохраняются
   - topic_responses.drilldown_responses = {...}
   ↓
8. Следующая сцена
```

---

## Компоненты UI

### TopicDrilldown
Показывает follow-up вопросы после положительного ответа на сцену.

```tsx
<TopicDrilldown
  topic={topicData}
  initialInterest={75}  // из ответа на сцену
  locale="ru"
  onComplete={(responses) => saveToDb(responses)}
  onSkip={() => moveToNext()}
/>
```

### BodyMapAnswer
Позволяет выбирать зоны на изображении тела.

```tsx
<BodyMapAnswer
  gender={userGender}
  side="front"  // front | back
  selectedZones={["neck", "chest"]}
  onZoneToggle={(zone) => toggleZone(zone)}
/>
```

---

## Проблемы v1

1. **468 сцен** — слишком много для полного прохождения
2. **Много похожих сцен** — дублирование предпочтений
3. **Одна сцена = один вопрос** — неэффективно
4. **Drilldown привязан к топикам** — не ко всем сценам применим
5. **Нет композитных сцен** — каждая сцена тестирует 1-2 предпочтения
6. **Таксономия неполная** — отсутствуют many kinks (CNC, torn clothing, etc.)

---

## Статистика v1

- Сцен: 468
- Топиков с drilldown: 31
- Категорий тегов: 21
- Уникальных тегов: ~200
- Средний intensity: 2.5
- Сцен с body_map: 12
- Сцен с follow_up: 45

---

## Файлы для backup

Ветка `discovery1` содержит:
- `scenes/v4/*` — все сцены и конфиги
- `src/components/discovery/*` — UI компоненты
- `src/app/(app)/discover/page.tsx` — основная страница
- `src/lib/question-v4.ts` — логика вопросов
- `supabase/migrations/*` — миграции БД
