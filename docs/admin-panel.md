# Admin Panel Documentation

> Документация админ-панели для управления сценами, изображениями и пользователями

## Обзор

Админ-панель состоит из двух страниц:

### /admin/scenes - Управление сценами
- Просмотр всех сцен из базы данных
- Генерация изображений для сцен
- QA проверка изображений
- Ручное принятие/отклонение изображений
- Редактирование промптов и инструкций

### /admin/users - Управление пользователями
- Просмотр всех пользователей с количеством ответов
- Просмотр детальных ответов пользователя
- Сброс ответов пользователя (полный или частичный)

---

## Поля промптов в базе данных

### image_prompt (TEXT)
**Оригинальный/дефолтный промпт** из JSON файлов сцен.

- Источник: файлы `scenes/v2/composite/*.json`
- Не изменяется при QA итерациях
- Используется как "чистая копия" для сброса

### generation_prompt (TEXT)
**Рабочая копия промпта** для генерации изображений.

- При импорте сцены: копируется из `image_prompt`
- При QA итерациях: модифицируется prompt rewriter'ом
- Используется для генерации изображений

### Логика работы

```
JSON файл (image_prompt)
       │
       ▼
┌──────────────────┐
│  База данных     │
│  - image_prompt  │ ← Оригинал (не меняется)
│  - generation_   │ ← Рабочая копия (QA модифицирует)
│      prompt      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Генерация       │
│  изображения     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌─────────────────┐
│  QA Проверка     │────►│ Passed: done    │
│  (если включена) │     │ Failed: rewrite │
└──────────────────┘     │   generation_   │
                         │   prompt        │
                         └─────────────────┘
```

---

## Кнопка Reset

**Что делает:** Копирует `image_prompt` → `generation_prompt`

**Когда использовать:**
- После неудачных QA итераций, когда промпт "испортился"
- Для возврата к исходному промпту

**Важно:** Если `image_prompt` пустой или содержит неправильные данные, нужно запустить синхронизацию:

```bash
npx tsx scripts/update-prompts-in-db.ts
```

---

## QA Поля

### qa_status (TEXT)
Статус последней QA проверки:
- `'passed'` - изображение прошло проверку
- `'failed'` - изображение не прошло проверку
- `null` - проверка не проводилась

### qa_attempts (INTEGER)
Количество попыток QA для текущего промпта.

### qa_last_assessment (JSONB)
Результаты последней QA проверки. Пример:
```json
{
  "score": 0.75,
  "issues": ["missing element: handcuffs"],
  "suggestions": "Add more visible restraints"
}
```

---

## Поле accepted (BOOLEAN)

Ручное принятие/отклонение изображения:
- `true` - изображение вручную принято
- `false` - изображение вручную отклонено
- `null` - не просмотрено

**Фильтры в админке:**
- "Accepted" - показать только `accepted = true`
- "Rejected" - показать только `accepted = false`
- "Not reviewed" - показать `accepted = null` с изображением

---

## Prompt Instructions

### prompt_instructions (TEXT)
Инструкции для prompt rewriter о том, как модифицировать промпт при QA.

**Пример:**
```
Focus more on the restraints.
Make sure handcuffs are clearly visible.
Avoid adding tattoos.
```

**Как использует prompt rewriter:**
1. Читает `generation_prompt`
2. Читает `prompt_instructions`
3. Модифицирует промпт согласно инструкциям
4. Сохраняет результат в `generation_prompt`

---

## Скрипты

### update-prompts-in-db.ts
Синхронизирует `image_prompt` из JSON файлов в базу данных.

```bash
npx tsx scripts/update-prompts-in-db.ts
```

**Важно:** Не перезаписывает `generation_prompt` - сохраняет пользовательские изменения.

### improve-image-prompts.ts
Улучшает промпты в JSON файлах с помощью AI.

```bash
npx tsx scripts/improve-image-prompts.ts
```

### remove-style-from-prompts.ts
Удаляет суффиксы стиля из промптов в JSON файлах.

```bash
npx tsx scripts/remove-style-from-prompts.ts
```

---

## API Routes

### POST /api/admin/update-scene
Обновляет поля сцены.

**Разрешённые поля:**
- `user_description`
- `priority`
- `prompt_instructions`
- `generation_prompt`
- `accepted`

**Пример:**
```typescript
await fetch('/api/admin/update-scene', {
  method: 'POST',
  body: JSON.stringify({
    sceneId: 'uuid-here',
    field: 'accepted',
    value: true
  })
});
```

### POST /api/admin/reset-prompt
Сбрасывает `generation_prompt` к `image_prompt`.

**Пример:**
```typescript
await fetch('/api/admin/reset-prompt', {
  method: 'POST',
  body: JSON.stringify({
    sceneId: 'uuid-here',
    imagePrompt: scene.image_prompt
  })
});
```

---

## Prompt Rewriter

Файл: `src/lib/prompt-rewriter.ts`

### Функции дедупликации

При QA итерациях промпт может накапливать повторяющиеся фразы. Для этого есть:

#### cleanAccumulatedEmphasis()
Удаляет накопленные паттерны типа:
- "focus on X"
- "clearly showing X"
- "X clearly visible"

#### deduplicatePhrases()
Удаляет дубликаты из comma-separated списка.

### improvePromptFromHints()
Главная функция для улучшения промпта на основе QA feedback.

---

## Миграции базы данных

### 005_scenes_v2_composite.sql
Добавляет `image_prompt` колонку.

### 006_add_missing_columns.sql
Добавляет:
- `generation_prompt`
- `qa_status`
- `qa_attempts`
- `qa_last_assessment`
- `prompt_instructions`

### 008_add_accepted_field.sql
Добавляет `accepted` колонку.

---

## Troubleshooting

### Проблема: Reset не работает / после перезагрузки появляется старый промпт

**Причина:** `image_prompt` в БД пустой или содержит неправильные данные.

**Решение:**
```bash
npx tsx scripts/update-prompts-in-db.ts
```

### Проблема: Кнопки Accept/Reject не сохраняются

**Причина:** RLS блокирует запись через клиентский Supabase.

**Решение:** Используется API route с service role key (уже реализовано).

### Проблема: Промпт накапливает дубликаты при QA

**Причина:** Prompt rewriter добавляет одни и те же фразы многократно.

**Решение:** Функции `cleanAccumulatedEmphasis()` и `deduplicatePhrases()` автоматически очищают промпт перед каждой итерацией.

---

## Структура файлов

```
src/app/admin/
├── scenes/
│   └── page.tsx              # Страница управления сценами
└── users/
    └── page.tsx              # Страница управления пользователями

src/app/api/admin/
├── update-scene/
│   └── route.ts              # API для обновления полей сцены
├── reset-prompt/
│   └── route.ts              # API для сброса промпта
└── users/
    ├── route.ts              # API для списка пользователей
    └── [userId]/
        ├── responses/
        │   └── route.ts      # API для ответов пользователя
        └── reset/
            └── route.ts      # API для сброса ответов

src/lib/
└── prompt-rewriter.ts        # Логика модификации промптов

scripts/
├── update-prompts-in-db.ts   # Синхронизация image_prompt из JSON
├── improve-image-prompts.ts  # AI улучшение промптов
└── remove-style-from-prompts.ts

supabase/migrations/
├── 005_scenes_v2_composite.sql
├── 006_add_missing_columns.sql
└── 008_add_accepted_field.sql
```

---

## Управление пользователями (/admin/users)

### Таблица пользователей

Показывает всех пользователей с информацией:
- Email (из auth.users)
- Gender / Interested In (из profiles)
- Количество scene_responses
- Количество body_map_responses
- Количество просмотренных сцен (seen_scenes)
- Статус калибровки (calibration_complete)

Сортировка по количеству ответов (самые активные сверху).

### Просмотр ответов пользователя

При клике на иконку глаза открывается диалог с:
- Статистика: количество ответов по типам
- Scene Responses: таблица с ответами на сцены
- Flow State: tag_scores, intensity, give/receive balance
- Discovery Profile: archetypes, top/bottom tags
- Excluded Preferences: исключённые категории

### Сброс ответов

Кнопки для сброса:
- **Reset All** - удаляет все данные пользователя
- **Reset Scene Responses** - только scene_responses
- **Reset Flow State** - только user_flow_state
- **Reset Profiles** - preference_profiles + user_discovery_profiles

### API Routes для пользователей

#### GET /api/admin/users
Возвращает список всех пользователей с количеством ответов.

**Ответ:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "gender": "male",
      "interested_in": "female",
      "scene_responses_count": 15,
      "body_map_responses_count": 3,
      "seen_scenes_count": 20,
      "calibration_complete": true,
      "total_responses": 18
    }
  ]
}
```

#### GET /api/admin/users/[userId]/responses
Возвращает все ответы конкретного пользователя.

**Ответ:**
```json
{
  "sceneResponses": [...],
  "bodyMapResponses": [...],
  "flowState": {...},
  "preferenceProfile": {...},
  "discoveryProfile": {...},
  "excludedPreferences": [...]
}
```

#### POST /api/admin/users/[userId]/reset
Сбрасывает ответы пользователя.

**Тело запроса:**
```json
{
  "tables": ["scene_responses", "user_flow_state"]
}
```

Если `tables` не указан, сбрасываются все таблицы:
- scene_responses
- body_map_responses
- user_flow_state
- preference_profiles
- user_discovery_profiles
- excluded_preferences

**Ответ:**
```json
{
  "success": true,
  "userId": "uuid",
  "results": {
    "scene_responses": { "deleted": 15 },
    "user_flow_state": { "deleted": 1 }
  }
}
```

### Таблицы с ответами пользователей

| Таблица | Описание |
|---------|----------|
| `scene_responses` | Ответы на сцены (liked, rating, elements) |
| `body_map_responses` | Ответы body map (zones_selected) |
| `user_flow_state` | Состояние прохождения (tag_scores, seen_scenes) |
| `preference_profiles` | Профиль предпочтений (JSONB preferences) |
| `user_discovery_profiles` | Профиль открытий (archetypes, tags) |
| `excluded_preferences` | Исключённые категории |
