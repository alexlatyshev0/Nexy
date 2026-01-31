# Scenes System

> Полная документация: [`scenes/v2/README.md`](../scenes/v2/README.md)

## ⚠️ ОБЯЗАТЕЛЬНАЯ ВАЛИДАЦИЯ СЦЕН

При создании или редактировании сцен **ОБЯЗАТЕЛЬНО** проверять консистентность:

### 1. Gender Consistency (role_direction ↔ description)

| Поле | Описание | Пример |
|------|----------|--------|
| `role_direction` | **КОМУ показывается карточка** | `m_to_f` = показывается мужчине |
| `user_description` | Текст от лица читающего | "Она делает X твоему телу" |

**Правила role_direction:**
- `m_to_f` = карточка показывается **МУЖЧИНЕ** (он читает описание)
- `f_to_m` = карточка показывается **ЖЕНЩИНЕ** (она читает описание)
- `mutual` = показывается обоим
- `solo` = один участник

**Правила для описаний:**
- Если `m_to_f`: описание для мужчины → "Ты делаешь ей..." или "Она делает тебе..."
- Если `f_to_m`: описание для женщины → "Ты делаешь ему..." или "Он делает тебе..."

**Правила для give/receive пар:**
- `-give` и `-receive` варианты ДОЛЖНЫ иметь **РАЗНЫЕ** role_direction
- Каждый партнёр видит свою версию описания со своей перспективы

**Примеры:**
```
ice-play-she-on-him-give:
  role_direction: m_to_f (показывается мужчине)
  description: "Она проводит кубиком льда по твоему телу"

ice-play-she-on-him-receive:
  role_direction: f_to_m (показывается женщине)
  description: "Ты проводишь кубиком льда по его телу"
```

**Типичные ошибки:**
```
❌ give и receive с ОДИНАКОВЫМ role_direction
   Оба партнёра видят одно описание — НЕВЕРНО!

✓ give: m_to_f, receive: f_to_m
   Каждый видит описание со своей перспективы
```

### 2. Naming Convention (slug ↔ role_direction)

**Современный формат slug:**
| Паттерн | Описание | role_direction |
|---------|----------|----------------|
| `*-he-on-her-give` | Он делает ей, карточка для него | `m_to_f` |
| `*-he-on-her-receive` | Он делает ей, карточка для неё | `f_to_m` |
| `*-she-on-him-give` | Она делает ему, карточка для него | `m_to_f` |
| `*-she-on-him-receive` | Она делает ему, карточка для неё | `f_to_m` |

**Примеры:**
```
blowjob-give:    f_to_m (женщина читает "Ты берёшь его член...")
blowjob-receive: m_to_f (мужчина читает "Она берёт твой член...")

cunnilingus-give:    m_to_f (мужчина читает "Ты лижешь её...")
cunnilingus-receive: f_to_m (женщина читает "Он лижет тебя...")
```

**Устаревший формат (не используется):**
| Суффикс | Аудитория |
|---------|-----------|
| `-hetero-f` | Гетеро-женщина |
| `-hetero-m` | Гетеро-мужчина |

### 3. Validation Script

Запустить перед деплоем:
```bash
npx tsx scripts/validate-prompts.ts
npx tsx scripts/full-scene-audit.ts
```

### 4. Checklist для новой сцены

- [ ] `role_direction` определяет КОМУ показывается карточка (m_to_f = мужчине, f_to_m = женщине)
- [ ] `user_description.ru` написано от лица читающего (м читает "Она/ты...", ж читает "Он/ты...")
- [ ] `user_description.en` соответствует ru версии
- [ ] Для give/receive пар: role_direction РАЗНЫЕ (одна m_to_f, другая f_to_m)
- [ ] `sets_gate` указан для сцен, которые открывают гейты

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
