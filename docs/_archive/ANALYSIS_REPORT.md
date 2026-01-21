# Отчет о расхождениях между документацией и реализацией

## Дата анализа: 2025-01-XX
## Обновлено: 2025-01-XX - V2 Composite Scenes Flow полностью реализован

> **Статус:** ✅ Все критические компоненты V2 реализованы и интегрированы. Проект готов к использованию V2 flow.

---

## 1. КРИТИЧЕСКИЕ РАСХОЖДЕНИЯ

### 1.1 Версия системы Discovery

**Документация:**
- `DISCOVERY2_DESIGN.md` описывает V2 с **94 composite scenes** (обновлено)
- `intimate-discovery-v2.md` описывает базовую архитектуру v2

**Реализация:**
- ✅ **Обновлено**: Код переведен на работу **только с V2 composite scenes**
- В БД есть миграция `005_scenes_v2_composite.sql`, которая создает структуру для V2
- В папке `scenes/v2-ACTIVE-92-scenes/` есть **94 composite scenes** + 6 body-map + 2 activities = **102 элемента**
- Discovery page (`discover/page.tsx`) обновлен для работы с V2
- API route `/api/ai/question` обновлен для работы только с V2
- Создан `question-v2.ts` для работы с V2 сценами
- Удалена поддержка V3/V4 из основного кода

**Вывод:** Проект переведен на V2. V3/V4 код удален из основного flow.

---

### 1.2 Структура базы данных

**Документация V1/V4:**
```sql
-- Таблица scenes с полями для V4
question_config JSONB
schema_version INTEGER
topic_responses TABLE
```

**Документация V2:**
```sql
-- Отдельные таблицы для V2
composite_scene_responses TABLE
tag_preferences TABLE
```

**Реализация:**
- ✅ Таблица `scenes` содержит поля для V2:
  - V2: `version`, `role_direction`, `elements`, `question` (JSONB), `category`, `title`, `subtitle`
  - Также есть legacy поля для совместимости: `question_type`, `question_config`, `follow_up`
- Таблица `topic_responses` существует (используется для V4, но V4 больше не активен)
- ✅ **ОБНОВЛЕНО**: Таблицы `composite_scene_responses` и `tag_preferences` из документации V2 **СОЗДАНЫ** (миграция `009_add_v2_composite_tables.sql`)
- Используется таблица `scene_responses` с полями `elements_selected` и `follow_up_answers` для V2
- Теперь доступны обе таблицы: `scene_responses` (legacy) и `composite_scene_responses` (V2)

**Вывод:** БД полностью поддерживает V2 через таблицы `scenes`, `scene_responses`, `composite_scene_responses` и `tag_preferences`. Таблицы из документации V2 созданы согласно спецификации.

---

### 1.3 Компоненты UI

**Документация V1/V4:**
- ✅ `TopicDrilldown.tsx` - **РЕАЛИЗОВАН**
- ✅ `BodyMapAnswer/` - **РЕАЛИЗОВАН**
- ✅ `QuestionDisplay.tsx` - **РЕАЛИЗОВАН**
- ✅ `ScaleAnswer.tsx` - **РЕАЛИЗОВАН**
- ✅ `MultipleChoiceAnswer.tsx` - **РЕАЛИЗОВАН**

**Документация V2:**
- ✅ `CompositeSceneView` - **РЕАЛИЗОВАН** (`src/components/discovery/CompositeSceneView.tsx`)
- ✅ `FollowUpFlow` - **РЕАЛИЗОВАН** (`src/components/discovery/FollowUpFlow.tsx`)
- ✅ `ElementSelector` - **РЕАЛИЗОВАН** (`src/components/discovery/ElementSelector.tsx`)
- ✅ Компоненты для follow-up типов:
  - ✅ `ImageSelectAnswer` - **РЕАЛИЗОВАН**
  - ✅ `TextInputAnswer` - **РЕАЛИЗОВАН**
  - ✅ `TextWithSuggestionsAnswer` - **РЕАЛИЗОВАН**
  - ✅ `IntensityAnswer` - **РЕАЛИЗОВАН**
  - ✅ `RoleAnswer` - **РЕАЛИЗОВАН**
  - ✅ `ExperienceAnswer` - **РЕАЛИЗОВАН**

**Вывод:** Все компоненты для V2 composite scenes реализованы и интегрированы в discovery flow.

---

### 1.4 API Routes

**Документация V1/V4:**
- ✅ `/api/ai/question` - **РЕАЛИЗОВАН** (поддерживает V3/V4)
- ✅ `/api/topics/[topicId]` - **РЕАЛИЗОВАН**
- ✅ `/api/follow-up` - **РЕАЛИЗОВАН**

**Документация V2:**
- ✅ API для загрузки composite scenes - **РЕАЛИЗОВАН** (через `/api/ai/question`)
- ✅ API для сохранения `composite_scene_responses` - **РЕАЛИЗОВАН** (прямое сохранение в `discover/page.tsx`)
- ✅ API для работы с `tag_preferences` - **РЕАЛИЗОВАН** (через `tag-preferences.ts`)

**Реализация:**
- ✅ API `/api/ai/question` работает с V2 сценами
- ✅ Сохранение в `composite_scene_responses` реализовано в `handleSubmit` и `FollowUpFlow.onComplete`
- ✅ Обновление `tag_preferences` реализовано через `updateTagPreferences()` в `tag-preferences.ts`
- ✅ Есть импорт V2 сцен (`/api/admin/import-scenes-v2`)

---

## 2. СРЕДНИЕ РАСХОЖДЕНИЯ

### 2.1 Формат сцен

**Документация V2:**
```typescript
interface CompositeScene {
  role_variant: "m_dom" | "f_dom" | "mutual" | "switch";
  related_scene?: string;
  elements: SceneElement[];
  question: {
    type: "multi_select";
    text: LocalizedString;
  };
}
```

**Реализация V2 (в БД):**
```typescript
// В миграции 005_scenes_v2_composite.sql
role_direction: 'm_to_f' | 'f_to_m' | 'mutual' | 'solo' | ... (много вариантов)
// Нет поля related_scene
elements: JSONB  // Массив элементов
question: JSONB  // Вопрос
```

**Вывод:** Поля `role_variant` и `related_scene` из документации не соответствуют `role_direction` в БД.

---

### 2.2 Follow-up типы

**Документация V2:**
- `multi_select`, `single_select`, `image_select`, `body_map`, `scale`, `text_input`, `text_with_suggestions`, `intensity`, `role`, `experience`

**Реализация:**
- ✅ В типах TypeScript (`types.ts`) определены все типы для V2:
  ```typescript
  type: 'multi_select' | 'single_select' | 'scale' | 'text' | 'image_select' | 
        'text_input' | 'text_with_suggestions' | 'intensity' | 'role' | 
        'experience' | 'body_map'
  ```
- ✅ Все типы follow-up реализованы с соответствующими компонентами

**Вывод:** Все типы follow-up из документации определены в коде и имеют UI компоненты.

---

### 2.3 Структура ответов

**Документация V2:**
```sql
CREATE TABLE composite_scene_responses (
  selected_elements TEXT[],
  element_responses JSONB,
  ...
);
```

**Реализация:**
- ✅ Таблица `composite_scene_responses` создана и используется:
  - `selected_elements TEXT[]` ✅
  - `element_responses JSONB` ✅ (структура: `{ elementId: { followUpId: answer } }`)
  - `skipped BOOLEAN` ✅
- ✅ Таблица `scene_responses` также обновляется для совместимости:
  - `elements_selected TEXT[]` ✅
  - `follow_up_answers JSONB` ✅

**Вывод:** Ответы сохраняются в `composite_scene_responses` согласно документации V2, плюс дублируются в `scene_responses` для совместимости.

---

### 2.4 Body Map

**Документация V2:**
- Body Map должен быть **ПЕРВЫМ** шагом в discovery flow
- 6 activities: Kissing, Licking, Touch, Light slapping, Biting, Spanking
- Можно пропустить при желании

**Реализация:**
- ✅ **ОБНОВЛЕНО**: Body Map реализован как **отдельный этап ПЕРЕД сценами**
- ✅ Показывается первым, если пользователь еще не прошел Body Map
- ✅ Есть кнопка "Пропустить Body Map" для пропуска
- ✅ После прохождения/пропуска Body Map пользователь переходит к обычным сценам
- ✅ Информация о пропуске сохраняется в `user_flow_state.tag_scores.body_map_skipped`

**Вывод:** Body Map теперь работает как отдельный этап перед сценами, как описано в V2, с возможностью пропуска.

---

## 3. МЕЛКИЕ РАСХОЖДЕНИЯ

### 3.1 Количество сцен

**Документация V2:**
- ~35 composite scenes

**Реализация:**
- 92 composite scenes в `scenes/v2-ACTIVE-92-scenes/`

**Вывод:** Количество сцен больше, чем в документации.

---

### 3.2 Поля в таблице scenes

**Документация:**
- Разные поля для разных версий

**Реализация:**
- Все поля существуют одновременно (legacy compatibility)
- Много дублирующихся полей: `question_type` и `question_config`, `description` и `ai_description`

**Вывод:** Структура БД перегружена полями для совместимости.

---

### 3.3 Admin Panel

**Документация (`ADMIN_PANEL.md`):**
- Описывает работу с `image_prompt` и `generation_prompt`
- Описывает QA поля

**Реализация:**
- ✅ Все описанные поля существуют
- ✅ API routes реализованы
- ✅ Функционал соответствует документации

**Вывод:** Admin Panel соответствует документации.

---

## 4. ОТСУТСТВУЮЩИЕ ФУНКЦИИ

### 4.1 V2 Composite Scenes Flow

**Должно быть:**
1. Показ composite scene с изображением
2. Выбор элементов (multi_select)
3. Follow-up вопросы для выбранных элементов
4. Сохранение в `composite_scene_responses`

**Реализовано:**
- ✅ **CompositeSceneView** - отображение сцены с изображением, заголовком, описанием
- ✅ **ElementSelector** - UI для выбора элементов с поддержкой min/max ограничений
- ✅ **FollowUpFlow** - полный flow для follow-up вопросов с навигацией
- ✅ Сохранение в `composite_scene_responses` с правильной структурой:
  - `selected_elements` - массив ID выбранных элементов
  - `element_responses` - JSONB с ответами на follow-up по каждому элементу
  - `skipped` - флаг пропуска сцены
- ✅ Обновление `tag_preferences` на основе выбранных элементов и follow-up ответов
- ✅ Обработка всех случаев: пропуск сцены, пропуск элементов, пропуск follow-up

---

### 4.2 Tag Preferences Aggregation

**Документация V2:**
- Таблица `tag_preferences` для агрегированных предпочтений по тегам

**Реализация:**
- ✅ Таблица `tag_preferences` создана (миграция `011_finalize_v2.sql`)
- ✅ Логика агрегации реализована в `src/lib/tag-preferences.ts`:
  - `updateTagPreferences()` - обновляет предпочтения на основе выбранных элементов
  - Извлекает `interest_level` из выбранных элементов (базовый: 50)
  - Извлекает `role_preference` из follow-up типа `role`
  - Извлекает `intensity_preference` из follow-up типа `intensity`/`scale`
  - Извлекает `experience_level` из follow-up типа `experience`
  - Сохраняет специфичные предпочтения в `specific_preferences`
  - Отслеживает `source_scenes` (какие сцены внесли вклад)
- ✅ Автоматически вызывается при сохранении ответов на composite scenes

---

### 4.3 Scene Progression Algorithm

**Документация V2:**
- Адаптивный flow на основе интересов
- Пропуск сцен с уже отвеченными элементами (`dedupe_by_tag`)

**Реализация:**
- ✅ Адаптивный flow реализован в `src/lib/scene-progression.ts`:
  - `getAdaptiveScenes()` - получает адаптивно отсортированные сцены
  - `calculateSceneScore()` - рассчитывает score сцены на основе предпочтений пользователя
  - `shouldSkipSceneByDedupe()` - проверяет, нужно ли пропустить сцену (все элементы уже отвечены)
  - `getAnsweredElementIds()` - получает все уже отвеченные элементы
  - `getAnsweredTagRefs()` - получает все уже отвеченные теги
- ✅ Dedupe_by_tag логика реализована:
  - Сцены пропускаются, если все их элементы уже были выбраны в других сценах
  - Проверка по element ID и tag_ref
- ✅ Адаптивная приоритизация:
  - Score на основе `tag_preferences` (interest_level, intensity_preference, role_preference)
  - Бонус за новые элементы, которые пользователь еще не видел
  - Штраф за высокую интенсивность, если пользователь не показал интерес к интенсивным сценам
  - Учет приоритета сцены (priority field)
- ✅ Интегрировано в `getFilteredScenesClient()` с опцией `enableAdaptiveFlow`

---

## 5. РЕКОМЕНДАЦИИ

### 5.1 Критичные

1. ✅ **Определить активную версию:** (ЗАВЕРШЕНО)
   - ✅ Проект полностью переведен на V2
   - ✅ Все компоненты V2 реализованы
   - ✅ Документация обновлена

2. ✅ **Создать таблицы для V2:** (ЗАВЕРШЕНО)
   - ✅ `composite_scene_responses` - создана в миграции `009_add_v2_composite_tables.sql`
   - ✅ `tag_preferences` - создана в миграции `009_add_v2_composite_tables.sql`

3. ✅ **Реализовать UI для V2:** (ЗАВЕРШЕНО)
   - ✅ `CompositeSceneView` - реализован
   - ✅ `ElementSelector` - реализован
   - ✅ `FollowUpFlow` - реализован
   - ✅ Все follow-up компоненты реализованы

### 5.2 Важные

1. **Унифицировать структуру БД:** (опционально)
   - Разделить таблицы по версиям или
   - Очистить дублирующиеся поля
   - *Примечание: Текущая структура работает, унификация не критична*

2. ✅ **Обновить документация:** (ЗАВЕРШЕНО)
   - ✅ Документация обновлена и отражает текущее состояние V2
   - ✅ Создан `V2_IMPLEMENTATION_STATUS.md` со статусом реализации
   - ✅ `ANALYSIS_REPORT.md` обновлен

3. ✅ **Реализовать Body Map как отдельный этап:** (ЗАВЕРШЕНО)
   - ✅ Body Map показывается как отдельный этап ПЕРЕД сценами
   - ✅ Есть возможность пропуска
   - ✅ Соответствует документации V2

### 5.3 Желательные

1. ✅ **Добавить недостающие follow-up типы:** (ЗАВЕРШЕНО)
   - ✅ `image_select` - реализован (`ImageSelectAnswer.tsx`)
   - ✅ `text_with_suggestions` - реализован (`TextWithSuggestionsAnswer.tsx`)
   - ✅ `intensity` - реализован (`IntensityAnswer.tsx`)
   - ✅ `role` - реализован (`RoleAnswer.tsx`)
   - ✅ `experience` - реализован (`ExperienceAnswer.tsx`)

2. ✅ **Реализовать адаптивный flow:** (ЗАВЕРШЕНО)
   - ✅ Реализован в `scene-progression.ts`
   - ✅ Dedupe_by_tag логика работает
   - ✅ Адаптивная приоритизация на основе tag_preferences
   - ✅ Интегрировано в discovery flow

3. ✅ **Добавить агрегацию tag preferences:** (ЗАВЕРШЕНО)
   - ✅ Реализована в `tag-preferences.ts`
   - ✅ Автоматически обновляется при сохранении ответов
   - ✅ Готова для аналитики и matching

---

## 6. ИТОГОВАЯ СВОДКА (ОБНОВЛЕНО)

| Категория | Статус | Комментарий |
|-----------|--------|-------------|
| V2 Composite Scenes | ✅ Реализовано | Полный flow с CompositeSceneView, ElementSelector, FollowUpFlow |
| Body Map | ✅ Реализовано | Отдельный этап перед сценами с возможностью пропуска |
| Element Selection | ✅ Реализовано | ElementSelector с поддержкой min/max ограничений |
| Element Follow-ups | ✅ Реализовано | FollowUpFlow с поддержкой всех типов follow-up |
| Follow-up Components | ✅ Реализовано | Все типы: image_select, text_input, text_with_suggestions, intensity, role, experience |
| Tag Preferences | ✅ Реализовано | Автоматическая агрегация в `tag_preferences` таблицу |
| Scene Progression | ✅ Реализовано | Адаптивный flow с dedupe_by_tag и приоритизацией |
| Admin Panel | ✅ Реализовано | Соответствует документации |
| API Routes | ✅ Реализовано | `/api/ai/question` работает с V2, сохранение в `composite_scene_responses` |
| База данных | ✅ Поддерживает V2 | Через таблицы `scenes`, `scene_responses`, `composite_scene_responses` и `tag_preferences` |
| V3/V4 Код | ✅ Удален | Заархивирован в `src/lib/_archive/` |

---

## 7. ВЫВОДЫ (ОБНОВЛЕНО)

Проект **полностью переведен на V2**:
- ✅ V2 composite scenes (94) импортированы в БД
- ✅ Discovery flow полностью работает с V2
- ✅ API routes обновлены для работы только с V2
- ✅ V3/V4 код удален из основного flow (заархивирован)
- ✅ Создан `question-v2.ts` для работы с V2 сценами
- ✅ Все UI компоненты для V2 реализованы и интегрированы
- ✅ Body Map реализован как отдельный этап перед сценами с возможностью пропуска
- ✅ Tag preferences агрегация реализована и работает автоматически

**Текущее состояние:**
- ✅ Полный V2 Composite Scenes Flow реализован:
  - Показ сцены через `CompositeSceneView`
  - Выбор элементов через `ElementSelector`
  - Follow-up вопросы через `FollowUpFlow` с поддержкой всех типов
  - Сохранение в `composite_scene_responses` с правильной структурой
  - Автоматическое обновление `tag_preferences`
- ✅ Body Map показывается как отдельный этап ПЕРЕД сценами (6 activities)
- ✅ Все follow-up типы реализованы с UI компонентами
- ✅ Обработка всех случаев: пропуск сцены, пропуск элементов, пропуск follow-up

**Завершено:**
1. ✅ Основная миграция на V2
2. ✅ Создание таблиц `composite_scene_responses` и `tag_preferences` (миграция `011_finalize_v2.sql`)
3. ✅ Обновление документации БД (создан `docs/DATABASE_SCHEMA_V2.md`)
4. ✅ Body Map как отдельный этап перед сценами с возможностью пропуска
5. ✅ Все UI компоненты для V2 (CompositeSceneView, ElementSelector, FollowUpFlow, все follow-up типы)
6. ✅ Сохранение в `composite_scene_responses` и обновление `tag_preferences`
7. ✅ Интеграция всех компонентов в discovery flow
8. ✅ Адаптивный flow с dedupe_by_tag и приоритизацией на основе tag_preferences

**Осталось (опционально):**
- ⚠️ Генерация изображений для всех composite scenes (по мере необходимости)
- ⚠️ Дополнительные оптимизации flow (exploration vs exploitation баланс)
