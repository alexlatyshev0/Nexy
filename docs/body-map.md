# Body Map System - Детальная Документация

## Обзор

Body Map — это интерактивная система для сбора предпочтений пользователя по зонам тела и действиям. Это **первый этап** Discovery flow, который выполняется до показа обычных сцен.

### Ключевые особенности

- **Универсальная карта тела** — одна карта для всех действий, а не отдельные карты для каждого действия
- **Zone-first режим** — пользователь сначала выбирает зону, затем действия для этой зоны
- **Разные действия для разных зон** — система знает, какие действия доступны для каждой зоны (например, спину можно царапать, а губы — нет)
- **Зоны с несколькими областями** — некоторые зоны (например, соски) имеют несколько областей на теле, но обрабатываются как одна зона
- **Многоязычная поддержка** — полная поддержка русского и английского языков
- **Сохранение в профиль** — все предпочтения сохраняются в `preference_profiles` и `body_map_responses`

## Архитектура

### Структура Body Map сцен

Body Map сцены создаются **динамически** на основе профиля пользователя, а не загружаются из базы данных. Количество сцен зависит от предпочтений пользователя:

```
Мужчина + Женщины → 2 body map:
  1. Твоё тело (себя)
  2. Тело партнёрши

Женщина + Мужчины → 2 body map:
  1. Твоё тело (себя)
  2. Тело партнёра

Мужчина + Оба → 3 body map:
  1. Твоё тело (себя)
  2. Тело партнёрши
  3. Тело партнёра

Женщина + Оба → 3 body map:
  1. Твоё тело (себя)
  2. Тело партнёра
  3. Тело партнёрши
```

### Создание виртуальных сцен

Виртуальные body map сцены создаются в `fetchBodyMapActivities()`:

```typescript
// 1. Body map для себя
{
  id: `bodymap_self_${user.id}`,
  slug: 'bodymap-self',
  title: { ru: 'Твоё тело', en: 'Your body' },
  question_type: 'body_map',
  ai_context: {
    action: 'universal',
    passes: [{ id: 'receive', question: { ru: '...', en: '...' } }],
    zones: { available: [...] }
  }
}

// 2. Body map для партнёра
{
  id: `bodymap_partner_female_${user.id}`,
  slug: 'bodymap-partner-female',
  title: { ru: 'Тело партнёрши', en: 'Partner\'s body (female)' },
  question_type: 'body_map',
  ai_context: {
    action: 'universal',
    passes: [{ id: 'give', question: { ru: '...', en: '...' } }],
    zones: { available: [...] }
  }
}
```

## Zone-First Режим

### Как это работает

1. **Пользователь видит тело** (себя или партнёра) на экране
2. **Нажимает на зону** тела (например, "Спина")
3. **Открывается панель действий** (`ZoneActionPanel`) с доступными действиями для этой зоны
4. **Выбирает действия** и указывает предпочтение для каждого:
   - ❤️ **Love** (Обожаю) — очень нравится
   - ⭐ **Sometimes** (Иногда) — иногда нравится
   - ❌ **No** (Не хочу) — не нравится / нельзя
5. **Сохраняет** настройки для зоны
6. **Повторяет** для других зон
7. **Переходит к следующему телу** (если есть)

### Определение доступных действий

Система использует `ZONE_ACTIONS` из `zone-actions.ts` для определения доступных действий для каждой зоны:

```typescript
export const ZONE_ACTIONS: Record<ZoneId, ActionId[]> = {
  lips: ['kiss', 'lick', 'bite', 'suck'],           // Губы: можно целовать, лизать, кусать, сосать
  back: ['kiss', 'lick', 'scratch', 'massage', 'wax', 'ice'], // Спина: можно царапать, массировать и т.д.
  buttocks: ['kiss', 'lick', 'bite', 'squeeze', 'spank', 'slap', 'scratch', 'massage'],
  // ... и так далее для всех зон
};
```

**Важно:** Для каждой зоны показываются только те действия, которые физически возможны и безопасны. Например:
- Губы нельзя царапать (scratch) — этого действия нет в списке для `lips`
- Спину можно царапать — это действие есть в списке для `back`

### Компоненты Zone-First режима

#### 1. BodySilhouette
Отображает силуэт тела (мужской/женский, спереди/сзади) и обрабатывает клики для определения зоны.

#### 2. ZoneActionPanel
Модальное окно, которое открывается при клике на зону:
- Показывает название зоны
- Список доступных действий для этой зоны
- Кнопки выбора предпочтения (Love/Sometimes/No) для каждого действия
- Кнопка "Готово" для сохранения

#### 3. BodyMapAnswer
Главный компонент, который координирует весь процесс:
- Управляет состоянием выбранных зон
- Хранит предпочтения по зонам и действиям
- Обрабатывает переход между пассами (give/receive)
- Отправляет финальный ответ

## Структура данных

### ZoneActionPreferences

Для каждой зоны хранятся предпочтения по всем доступным действиям:

```typescript
type ZoneActionPreferences = {
  [actionId: ActionId]: 'love' | 'sometimes' | 'no' | null;
};

// Пример:
{
  'back': {
    'scratch': 'love',      // Обожаю царапать спину
    'massage': 'sometimes', // Иногда массировать спину
    'kiss': null            // Нет предпочтения
  },
  'lips': {
    'kiss': 'love',         // Обожаю целовать губы
    'lick': 'sometimes',    // Иногда лизать губы
    'bite': 'no'            // Не хочу кусать губы
  }
}
```

### BodyMapAnswer

Полный ответ body map содержит массив пассов (passes):

```typescript
interface BodyMapAnswer {
  passes: BodyMapPassAnswer[];
}

interface BodyMapPassAnswer {
  action: 'universal';  // Всегда 'universal' для универсальной body map
  subject: 'give' | 'receive';
  gender: 'male' | 'female';
  view: 'front' | 'back';
  zoneActionPreferences: AllZonePreferences; // { [zoneId]: { [actionId]: preference } }
}
```

## Сохранение данных

### 1. body_map_responses

Сохраняется список зон, для которых были указаны предпочтения:

```sql
INSERT INTO body_map_responses (
  user_id,
  activity_id,  -- 'bodymap-self', 'bodymap-partner-female', etc.
  pass,         -- 'give' или 'receive'
  zones_selected -- ['back', 'lips', 'buttocks', ...]
);
```

### 2. scene_responses

Сохраняется полный ответ с детальными предпочтениями:

```sql
INSERT INTO scene_responses (
  user_id,
  scene_id,
  question_type: 'body_map',
  answer: {
    passes: [
      {
        subject: 'receive',
        gender: 'male',
        zoneActionPreferences: {
          'back': { 'scratch': 'love', 'massage': 'sometimes' },
          'lips': { 'kiss': 'love', 'bite': 'no' }
        }
      }
    ]
  }
);
```

### 3. preference_profiles

Обновляется профиль предпочтений пользователя:

```json
{
  "body_map": {
    "bodymap-self": {
      "zoneActionPreferences": [...],
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    "bodymap-partner-female": {
      "zoneActionPreferences": [...],
      "updatedAt": "2024-01-15T10:35:00Z"
    }
  },
  "tags": {
    "spank_give": { "score": 2, "count": 1 },  // Извлечено из zone+action
    "scratch_receive": { "score": 2, "count": 1 }
  }
}
```

## Многоязычная поддержка

### Переводы зон

Все названия зон переведены в `ZONE_LABELS`:

```typescript
export const ZONE_LABELS: Record<ZoneId, { ru: string; en: string }> = {
  lips: { ru: 'Губы', en: 'Lips' },
  back: { ru: 'Спина', en: 'Back' },
  buttocks: { ru: 'Ягодицы', en: 'Buttocks' },
  // ... все зоны
};
```

### Переводы действий

Все названия действий переведены в `ACTIONS`:

```typescript
export const ACTIONS: Record<ActionId, ActionInfo> = {
  kiss: { id: 'kiss', label: { ru: 'Целовать', en: 'Kiss' } },
  scratch: { id: 'scratch', label: { ru: 'Царапать', en: 'Scratch' } },
  spank: { id: 'spank', label: { ru: 'Шлёпать', en: 'Spank' } },
  // ... все действия
};
```

### Использование locale

Все компоненты принимают `locale: 'ru' | 'en'` и используют его для отображения:

```typescript
// Получение перевода зоны
const zoneLabel = getZoneLabel('back', locale); // 'Спина' или 'Back'

// Получение перевода действия
const actionLabel = getActionLabel('scratch', locale); // 'Царапать' или 'Scratch'
```

## Определение зон тела

### Zone Detection

При клике на тело система определяет, какая зона была выбрана, используя координаты клика и границы зон:

```typescript
// zone-detection.ts
export function detectZone(
  x: number,  // Координата X (0-100)
  y: number,  // Координата Y (0-100)
  gender: 'male' | 'female',
  view: 'front' | 'back'
): DetectedZone | null {
  // Определяет зону на основе координат и границ зон
  // Некоторые зоны (например, соски) имеют несколько областей на теле,
  // но все они маппятся на один ZoneId
}
```

**Зоны с несколькими областями:**
- **Соски (`nipples`)**: имеет две области (левый и правый сосок), но обрабатывается как одна зона. При клике на любую область открывается панель действий для зоны "Соски".

### Доступные зоны

Полный список зон зависит от пола и вида (спереди/сзади):

**Мужское тело (спереди):**
- Голова, Уши, Лицо, Губы
- Шея, Плечи
- Грудь, Соски (одна зона с двумя областями: левый и правый сосок)
- Живот, Пупок
- Руки, Кисти, Пальцы
- Пах, Пенис, Яички
- Бёдра, Колени, Голени, Стопы

**Женское тело (спереди):**
- Голова, Уши, Лицо, Губы
- Шея, Плечи
- Грудь, Соски (одна зона с двумя областями: левый и правый сосок)
- Живот, Пупок
- Руки, Кисти, Пальцы
- Пах, Вульва
- Бёдра, Колени, Голени, Стопы

**Примечание:** Некоторые зоны имеют несколько областей на теле (например, соски имеют левую и правую области), но обрабатываются как одна зона `nipples` в системе. При клике на любую из областей сосков открывается одна и та же панель действий для зоны "Соски".

**Сзади (оба пола):**
- Затылок, Шея
- Плечи
- Верх спины, Поясница
- Руки
- Ягодицы, Анус
- Бёдра, Икры, Стопы

## Поток работы (User Flow)

### 1. Инициализация

```typescript
// discover/page.tsx
const fetchBodyMapActivities = async (userId: string) => {
  // 1. Получить профиль пользователя
  const profile = await getProfile(userId);
  
  // 2. Создать виртуальные body map сцены на основе:
  //    - gender (пол пользователя)
  //    - interested_in (кто нравится: 'male', 'female', 'both')
  
  // 3. Вернуть массив виртуальных сцен
  return virtualScenes;
};
```

### 2. Отображение Body Map

```typescript
// Для каждой body map сцены:
// 1. Загрузить вопрос через API
const question = await fetchQuestion(sceneId);

// 2. Отобразить BodyMapAnswer с zoneFirstMode={true}
<BodyMapAnswer
  config={bodyMapConfig}
  partnerGender={bodyGender}  // Определяется из slug сцены
  userGender={bodyGender}
  locale={locale}
  zoneFirstMode={true}
  onSubmit={handleSubmit}
/>
```

### 3. Взаимодействие пользователя

```
1. Пользователь видит тело на экране
   ↓
2. Нажимает на зону (например, "Спина")
   ↓
3. Открывается ZoneActionPanel с действиями для спины:
   - Царапать (scratch)
   - Массировать (massage)
   - Целовать (kiss)
   - Лизать (lick)
   - Воск (wax)
   - Лёд (ice)
   ↓
4. Пользователь выбирает предпочтения:
   - Царапать: ❤️ Love
   - Массировать: ⭐ Sometimes
   - Остальные: не выбрано
   ↓
5. Нажимает "Готово"
   ↓
6. Зона помечается как настроенная
   ↓
7. Повторяет для других зон
   ↓
8. Нажимает "Далее" для перехода к следующему телу
```

### 4. Сохранение ответа

```typescript
const handleSubmit = async (answer: BodyMapAnswer) => {
  // 1. Сохранить в body_map_responses (список зон)
  await saveBodyMapResponse(userId, sceneSlug, pass, zones);
  
  // 2. Сохранить в scene_responses (полный ответ)
  await saveSceneResponse(userId, sceneId, answer);
  
  // 3. Обновить preference_profiles
  await updatePreferenceProfile(userId, {
    body_map: {
      [sceneSlug]: {
        zoneActionPreferences: answer.passes,
        updatedAt: new Date()
      }
    },
    tags: extractTags(answer) // Извлечь теги из zone+action
  });
  
  // 4. Перейти к следующей body map сцене или обычным сценам
  await moveToNextScene();
};
```

## Извлечение тегов из Body Map

Система автоматически извлекает теги на основе комбинаций зона+действие:

```typescript
// Примеры маппинга:
'buttocks' + 'spank' + 'love' → boost: ['spanking', 'impact_play', 'discipline']
'back' + 'scratch' + 'love' → boost: ['scratching', 'primal', 'marking']
'lips' + 'kiss' + 'love' → boost: ['kissing', 'romantic', 'oral_attention']
```

Эти теги используются для:
- Персонализации порядка показа сцен
- Определения совместимости пар
- Генерации рекомендаций

## Технические детали

### Компоненты

| Компонент | Файл | Описание |
|-----------|------|----------|
| `BodyMapAnswer` | `BodyMapAnswer.tsx` | Главный компонент, координирует весь процесс |
| `ZoneActionPanel` | `ZoneActionPanel.tsx` | Модальное окно выбора действий для зоны |
| `BodySilhouette` | `BodySilhouette.tsx` | Отображение силуэта тела и обработка кликов |
| `zone-actions.ts` | `zone-actions.ts` | Определение доступных действий для зон |
| `zone-detection.ts` | `zone-detection.ts` | Определение зоны по координатам клика |

### Типы данных

```typescript
// Зоны тела
type ZoneId = 'head' | 'lips' | 'ears' | 'neck' | 'shoulders' | 'chest' | 'breasts' | 
              'nipples' | 'stomach' | 'navel' | 'back' | 'lower_back' | 'arms' | 'hands' | 
              'buttocks' | 'anus' | 'groin' | 'penis' | 'testicles' | 'vulva' | 'thighs' | 'knees' | 'feet';

// Действия
type ActionId = 'kiss' | 'lick' | 'bite' | 'suck' | 'pinch' | 'twist' | 
                'squeeze' | 'spank' | 'slap' | 'scratch' | 'massage' | 'touch' | 
                'clamps' | 'wax' | 'ice' | 'finger' | 'penetrate' | 'toys' | 'whisper';

// Предпочтения
type ZonePreference = 'love' | 'sometimes' | 'no';

// Предпочтения по зонам и действиям
type ZoneActionPreferences = Partial<Record<ActionId, ZonePreference | null>>;
type AllZonePreferences = Partial<Record<ZoneId, ZoneActionPreferences>>;
```

### API

Body Map не требует отдельного API endpoint — всё обрабатывается через стандартный flow:

1. **Загрузка вопроса**: `POST /api/ai/question` с `sceneId` body map сцены
2. **Сохранение ответа**: `handleSubmit()` в `discover/page.tsx` сохраняет напрямую в БД

## Примеры использования

### Пример 1: Мужчина, интересуется женщинами

```typescript
// Создаются 2 body map сцены:
[
  {
    slug: 'bodymap-self',
    title: { ru: 'Твоё тело', en: 'Your body' },
    // Показывает мужское тело
    // Pass: receive (где тебе нравится, когда тебя касаются)
  },
  {
    slug: 'bodymap-partner-female',
    title: { ru: 'Тело партнёрши', en: 'Partner\'s body (female)' },
    // Показывает женское тело
    // Pass: give (где ты любишь касаться партнёрши)
  }
]
```

### Пример 2: Женщина, интересуется обоими полами

```typescript
// Создаются 3 body map сцены:
[
  {
    slug: 'bodymap-self',
    // Женское тело, receive
  },
  {
    slug: 'bodymap-partner-male',
    // Мужское тело, give
  },
  {
    slug: 'bodymap-partner-female',
    // Женское тело, give
  }
]
```

## Проверка статуса Body Map

Система проверяет, завершил ли пользователь Body Map:

```typescript
const checkBodyMapStatus = async (userId: string) => {
  // Проверяет наличие записей в body_map_responses
  // или user_flow_state.body_map_completed
  
  if (hasResponses) return 'completed';
  if (skipped) return 'skipped';
  return 'pending';
};
```

Если статус `pending`, показывается Body Map. Если `completed` или `skipped`, показываются обычные сцены.

## Интеграция с Flow Engine

Body Map ответы обрабатываются flow engine для:
- Определения начальных тегов пользователя
- Персонализации порядка показа сцен
- Пропуска нерелевантных сцен

```typescript
// flow-engine.ts
export function processBodyMapResponses(
  state: FlowState,
  responses: BodyMapAnswer[]
): FlowState {
  // Извлекает теги из zone+action комбинаций
  // Обновляет tagScores
  // Возвращает обновлённое состояние
}
```

## Будущие улучшения

- [ ] Визуальная индикация настроенных зон на теле
- [ ] Возможность редактирования предпочтений после сохранения
- [ ] Экспорт body map данных для анализа
- [ ] Поддержка дополнительных языков
- [ ] Анимации при выборе зон
- [ ] Подсказки по безопасности для определённых зон
