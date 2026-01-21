# Scenes System

> Полная документация: [`scenes/v2/README.md`](../scenes/v2/README.md)

## ⚠️ ОБЯЗАТЕЛЬНАЯ ВАЛИДАЦИЯ СЦЕН

При создании или редактировании сцен **ОБЯЗАТЕЛЬНО** проверять консистентность:

### 1. Gender Consistency (role_direction ↔ prompt ↔ description)

| Поле | Описание | Пример |
|------|----------|--------|
| `role_direction` | Кто делает действие | `m_to_f` = мужчина → женщина |
| `generation_prompt` | Промпт для изображения | "man's hand on woman's throat" |
| `user_description` | Что видит юзер | "Он сжимает твоё горло" |

**Правила:**
- `m_to_f` = мужчина активен → промпт: "man doing X to woman" → описание: "Он делает X"
- `f_to_m` = женщина активна → промпт: "woman doing X to man" → описание: "Она делает X"
- `mutual` = оба активны → любой промпт
- `solo` = один участник

**Типичные ошибки:**
```
❌ role_direction: f_to_m
   prompt: "man's hand on woman's throat"  ← НЕВЕРНО! должна быть woman
   description: "Он душит тебя"             ← НЕВЕРНО! должно быть "Она"

✓ role_direction: m_to_f
   prompt: "man's hand on woman's throat"
   description: "Он душит тебя"
```

### 2. Naming Convention (slug ↔ target audience)

| Суффикс | Аудитория | Партнёр | role_direction |
|---------|-----------|---------|----------------|
| `-hetero-f` | Гетеро-женщина | Мужчина | Обычно `m_to_f` (он делает ей) |
| `-hetero-m` | Гетеро-мужчина | Женщина | Обычно `f_to_m` (она делает ему) |
| `-gay` | Гей-мужчина | Мужчина | — |
| `-lesbian` | Лесбиянка | Женщина | — |

### 3. Validation Script

Запустить перед деплоем:
```bash
npx tsx scripts/validate-prompts.ts
npx tsx scripts/full-scene-audit.ts
```

### 4. Checklist для новой сцены

- [ ] `role_direction` соответствует суффиксу slug
- [ ] `generation_prompt` показывает правильный пол активного участника
- [ ] `user_description.ru` использует правильное местоимение (он/она)
- [ ] `user_description.en` использует правильное местоимение (he/she)
- [ ] `image_prompt` (если есть) совпадает с `generation_prompt`
- [ ] `gates_scenes` и `ai_context.gates` логичны для этой сцены

---

## Быстрый обзор

**135 composite scenes** организованы в 24 категории:

| Категория | Сцен | Примеры |
|-----------|------|---------|
| **baseline** | 14 | power-dynamic, intensity, pain-tolerance, anal-interest... |
| impact-pain | 12 | spanking, wax, choking, nipple play, whipping, CBT |
| control-power | 11 | bondage, collar, edging, feminization, free-use |
| extreme | 10 | fisting, needle play, mummification, breath play |
| oral | 7 | blowjob, cunnilingus, deepthroat, facesitting, rimming |
| ... | ... | [см. полный список](../scenes/v2/README.md#categories-24-total-135-scenes) |

## Baseline System

14 baseline сцен задают "ворота" (gates) для фильтрации контента:

```
power-dynamic  → dominant/submissive → unlock bondage/service scenes
pain-tolerance → no/light/yes       → skip/show pain scenes
anal-interest  → no/curious/yes     → skip/show anal scenes
group-interest → no/maybe/yes       → skip/show group scenes
...
```

## Структура сцены

```json
{
  "id": "scene_id",
  "slug": "scene-slug",
  "category": "baseline",
  "intensity": 1-5,
  "elements": [
    {
      "id": "element_id",
      "follow_ups": [...]
    }
  ],
  "ai_context": {
    "gates": {
      "answer_id": ["filter_1", "filter_2"]
    }
  }
}
```

## Файловая структура

```
scenes/v2/
├── composite/
│   ├── _index.json         # Реестр всех 135 сцен
│   ├── baseline/           # 14 foundational gates
│   │   ├── power-dynamic.json
│   │   ├── intensity.json
│   │   └── ...
│   └── {category}/         # 121 detailed scenes
│       └── {scene}.json
├── body-map/               # 6 body map activities
├── activities/             # sounds, clothing
└── README.md               # ПОЛНАЯ ДОКУМЕНТАЦИЯ
```

---

**→ Детали: [scenes/v2/README.md](../scenes/v2/README.md)**
