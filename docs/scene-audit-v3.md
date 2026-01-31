# Scene Audit V3 - Mapping to New Architecture

## Overview

This document maps all existing scenes to the new V3 architecture:
- `main_question` - основной вопрос темы (онбординг или discovery)
- `clarification` - уточняющие сцены, связанные с main_question через `clarification_for`

---

## ⚠️ ВАЖНО: Gates и clarification_for — ДВЕ НЕЗАВИСИМЫЕ СИСТЕМЫ

### Gates (гейты) — ФИЛЬТР ВИДИМОСТИ
- **Что это:** Boolean значения в `user_gates.gates`
- **Как работает:** Если гейт закрыт → сцена НЕ показывается вообще
- **Откуда:** Вычисляется триггером из ответов на сцены с `sets_gate`
- **Пример:** `user_gates.gates.oral = false` → все сцены требующие oral скрыты

### clarification_for — ПОСЛЕДОВАТЕЛЬНОСТЬ ПОКАЗА
- **Что это:** Массив **slug-ов сцен** (НЕ gate names!)
- **Как работает:** После ответа YES на сцену "oral-interest", показываем сцены где `clarification_for.includes("oral-interest")`
- **Пример:** `deepthroat.json` имеет `clarification_for: ["oral-interest", "blowjob"]` → показывается после YES на эти сцены

### Эти системы работают параллельно:
1. **Gates** отфильтровывает недоступные сцены (МОЖНО ли показать)
2. **clarification_for** определяет порядок показа оставшихся (КОГДА показать)

## Onboarding Categories → main_question

Существующие категории онбординга (`scenes/v2/onboarding/categories.json`) остаются как есть.
Они определяют гейты и направляют пользователя к clarification сценам в discovery.

| Category ID | Title (RU) | Gates |
|-------------|------------|-------|
| oral-give | Оральный секс (ты ласкаешь) | cunnilingus-give, blowjob-give, rimming-give |
| oral-receive | Оральный секс (тебя ласкают) | blowjob-receive, cunnilingus-receive, deepthroat, facesitting |
| anal-give | Анальный секс (ты проникаешь) | anal-give, pegging-give, butt-plug |
| anal-receive | Анальный секс (в тебя проникают) | anal-receive, pegging-receive, prostate-play |
| group | Групповой секс | threesome, gangbang, orgy, swinging |
| toys | Игрушки | vibrator, dildo, cock-ring, nipple-clamps |
| roleplay | Ролевые игры | boss, teacher, doctor, stranger, pet-play, ddlg |
| quickie | Быстрый секс | quickie, kitchen-counter |
| romantic | Романтика | romantic-sex, emotional-sex, massage, body-worship |
| power-dom | Доминирование | collar, free-use, objectification |
| power-sub | Подчинение | collar, chastity, feminization |
| rough-give | Грубый секс (ты сверху) | spanking-give, choking-give, hair-pulling-give |
| rough-receive | Грубый секс (ты снизу) | spanking-receive, choking-receive, primal, cnc |
| public | Вне спальни | public-sex, locations |
| exhibitionism | Показать себя | exhibitionism, voyeurism, striptease |
| recording | Съёмка | filming, sexting |
| dirty-talk-give | Грязные разговоры (ты говоришь) | dirty-talk-give, degradation-give |
| dirty-talk-receive | Грязные разговоры (тебе говорят) | dirty-talk-receive, degradation-receive |
| praise-give | Похвала (ты хвалишь) | praise-give |
| praise-receive | Похвала (тебя хвалят) | praise-receive |
| lingerie | Красивое бельё | lingerie, stockings, heels, latex |
| foot-give | Ноги (ты поклоняешься) | foot-worship-give |
| foot-receive | Ноги (тебе поклоняются) | foot-worship-receive |
| bondage-give | Связывание (ты связываешь) | bondage-give, rope, shibari |
| bondage-receive | Связывание (тебя связывают) | bondage-receive, mummification |
| watersports | Золотой дождь | golden-shower-* |
| ~~body-fluids~~ | ~~DEPRECATED~~ | см. finish-preference, squirting, watersports |
| ~~extreme~~ | ~~DEPRECATED~~ | см. EXTREME Category section |

---

## ~~Baseline Scenes~~ — НЕ НУЖНЫ

**Решение:** Baseline сцены как отдельные сущности в БД избыточны.

Их функция полностью покрывается **Onboarding Categories** (см. выше):
- Онбординг собирает ответы через категории → вычисляет гейты (для фильтрации)
- Discovery показывает clarification сцены по slug-ам родительских сцен
- Intro slides можно генерировать программно из данных категорий

**Что делать с существующими baseline сценами в БД:**
- Можно удалить или оставить неактивными
- `clarification_for` в clarification сценах содержит **slug-и сцен** (например `oral-interest`, `toys-interest`) — НЕ gate names!

**Исключение — finish-preference:**
Это NEW main_question, которая не покрывается текущим онбордингом. См. секцию BODY-FLUIDS.

---

## ORAL Category Mapping

### Main Questions
| Slug | scene_type | context |
|------|------------|---------|
| oral-preference | main_question | both |

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| blowjob | clarification | ['oral-preference', 'oral-receive'] | oral >= 1 |
| cunnilingus | clarification | ['oral-preference', 'oral-give'] | oral >= 1 |
| deepthroat | clarification | ['oral-preference', 'blowjob'] | oral >= 1 |
| facesitting-f-on-m | clarification | ['oral-preference', 'power-dom'] | oral >= 1, power >= 1 |
| facesitting-m-on-f | clarification | ['oral-preference', 'power-dom'] | oral >= 1, power >= 1 |
| rimming-m-to-f | clarification | ['oral-preference', 'anal-interest'] | oral >= 1 |
| rimming-f-to-m | clarification | ['oral-preference', 'anal-interest'] | oral >= 1 |
| finger-sucking | clarification | ['oral-preference'] | oral >= 1 |

**New clarifications needed:**
- [ ] cock-worship - clarification_for: ['oral-preference', 'power-sub']
- [ ] pussy-worship - clarification_for: ['oral-preference', 'power-sub']
- [ ] edging-with-mouth - clarification_for: ['oral-preference', 'edging']
- [ ] gentle-slow-sucking - clarification_for: ['blowjob'] - gates: gentleness

---

## ANAL Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| anal-play-on-her | clarification | ['anal-interest', 'anal-give'] | anal >= 1 |
| anal-play-on-him | clarification | ['anal-interest', 'anal-receive'] | anal >= 1 |
| pegging | clarification | ['anal-interest', 'anal-receive', 'power-sub'] | anal >= 1 |
| figging | clarification | ['anal-interest', 'extreme'] | anal >= 1, extreme >= 1 |

**New clarifications needed:**
- [ ] butt-plug-wear - clarification_for: ['anal-interest', 'toys']
- [ ] prostate-massage - clarification_for: ['anal-interest', 'anal-receive']

---

## CONTROL-POWER Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| bondage-m-ties-f | clarification | ['power-dom', 'bondage-give'] | power >= 1 |
| bondage-f-ties-m | clarification | ['power-sub', 'bondage-receive'] | power >= 1 |
| collar-m-owns-f | clarification | ['power-dom'] | power >= 2 |
| collar-f-owns-m | clarification | ['power-sub'] | power >= 2 |
| edging-m-to-f | clarification | ['power-dom', 'orgasm-control'] | power >= 1 |
| edging-f-to-m | clarification | ['power-sub', 'orgasm-control'] | power >= 1 |
| feminization | clarification | ['power-sub'] | power >= 2 |
| free-use-f-available | clarification | ['power-dom', 'power-sub'] | power >= 2 |
| free-use-m-available | clarification | ['power-dom', 'power-sub'] | power >= 2 |
| forced-orgasm-m-to-f | clarification | ['power-dom'] | power >= 1 |
| forced-orgasm-f-to-m | clarification | ['power-sub'] | power >= 1 |
| ruined-orgasm | clarification | ['power-dom', 'power-sub'] | power >= 2 |
| orgasm-control | clarification | ['power-dom', 'power-sub'] | power >= 1 |
| objectification | clarification | ['power-dom', 'power-sub'] | power >= 2 |
| somnophilia-m-to-f | clarification | ['power-dom', 'free-use'] | power >= 2 |
| somnophilia-f-to-m | clarification | ['power-sub', 'free-use'] | power >= 2 |

**Note:** Somnophilia — про беспомощность и использование (не rough). Близко к free-use и objectification.

---

## IMPACT-PAIN Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| spanking-m-to-f | clarification | ['rough-give', 'pain-tolerance'] | rough >= 1 |
| spanking-f-to-m | clarification | ['rough-receive', 'pain-tolerance'] | rough >= 1 |
| wax-play-m-to-f | clarification | ['pain-tolerance', 'sensory'] | pain >= 1 |
| wax-play-f-to-m | clarification | ['pain-tolerance', 'sensory'] | pain >= 1 |
| choking-m-to-f | clarification | ['rough-give'] | rough >= 1 |
| choking-f-to-m | clarification | ['rough-receive'] | rough >= 1 |
| nipple-play-m-to-f | clarification | ['pain-tolerance'] | pain >= 1 |
| nipple-play-f-to-m | clarification | ['pain-tolerance'] | pain >= 1 |
| whipping-caning | clarification | ['pain-tolerance', 'extreme'] | pain >= 2 |
| face-slapping-m-to-f | clarification | ['rough-give', 'degradation'] | rough >= 2 |
| face-slapping-f-to-m | clarification | ['rough-receive'] | rough >= 2 |
| cbt | clarification | ['pain-tolerance', 'extreme'] | pain >= 2 |

**New clarifications needed (body_map_activity):**
- [ ] spanking-body-map - scene_type: body_map_activity, activity: 'spanking', clarification_for: ['spanking', 'pain-tolerance']
- [ ] kissing-body-map - scene_type: body_map_activity, activity: 'kissing', clarification_for: ['romantic']
- [ ] biting-body-map - scene_type: body_map_activity, activity: 'biting', clarification_for: ['rough', 'pain-tolerance']

---

## CNC-ROUGH Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| cnc-m-takes-f | clarification | ['rough-give', 'power-dom'] | rough >= 2, power >= 1 |
| cnc-f-takes-m | clarification | ['rough-receive', 'power-sub'] | rough >= 2, power >= 1 |
| primal | clarification | ['rough-give', 'rough-receive'] | rough >= 2 |

**Note:** CNC = борьба, сопротивление, rough энергия. Somnophilia → см. CONTROL-POWER.

---

## VERBAL Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| praise-m-to-f | clarification | ['praise-give', 'verbal-preference'] | verbal >= 1 |
| praise-f-to-m | clarification | ['praise-receive', 'verbal-preference'] | verbal >= 1 |
| degradation-m-to-f | clarification | ['dirty-talk-give', 'power-dom'] | verbal >= 1, power >= 1 |
| degradation-f-to-m | clarification | ['dirty-talk-receive', 'power-sub'] | verbal >= 1, power >= 1 |
| dirty-talk | clarification | ['dirty-talk-give', 'dirty-talk-receive'] | verbal >= 1 |

**New clarifications needed (multi_choice_text):**
- [ ] pet-names - scene_type: multi_choice_text, clarification_for: ['praise', 'verbal-preference']
  - Options: малыш/малышка (→tenderness), хорошая девочка (→praise), шлюха (→degradation)
  - allow_other: true

---

## WORSHIP-SERVICE Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| foot-worship-m-to-f | clarification | ['foot-give', 'body-fetishes'] | feet >= 1 |
| foot-worship-f-to-m | clarification | ['foot-receive', 'body-fetishes'] | feet >= 1 |
| body-worship-m-to-f | clarification | ['romantic', 'body-fetishes'] | romantic >= 1 |
| body-worship-f-to-m | clarification | ['romantic', 'body-fetishes'] | romantic >= 1 |
| armpit | clarification | ['body-fetishes'] | - |
| genital-worship | clarification | ['oral-preference', 'body-fetishes'] | oral >= 1 |
| lactation | clarification | ['body-fetishes'] | - |

---

## GROUP Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| threesome-fmf | clarification | ['group'] | group >= 1 |
| threesome-mfm | clarification | ['group'] | group >= 1 |
| gangbang | clarification | ['group'] | group >= 2 |
| orgy | clarification | ['group'] | group >= 2 |
| swinging | clarification | ['group'] | group >= 1 |
| double-penetration | clarification | ['group', 'anal-interest'] | group >= 1, anal >= 1 |

---

## ROLEPLAY Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| teacher-m-student-f | clarification | ['roleplay'] | roleplay >= 1 |
| teacher-f-student-m | clarification | ['roleplay'] | roleplay >= 1 |
| boss-m-secretary-f | clarification | ['roleplay'] | roleplay >= 1 |
| boss-f-subordinate-m | clarification | ['roleplay'] | roleplay >= 1 |
| doctor-patient | clarification | ['roleplay'] | roleplay >= 1 |
| stranger | clarification | ['roleplay'] | roleplay >= 1 |
| service-roleplay | clarification | ['roleplay', 'power-sub'] | roleplay >= 1 |
| taboo-roleplay | clarification | ['roleplay'] | roleplay >= 2 |

---

## PET-PLAY & AGE-PLAY Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| pet-play-f-is-pet | clarification | ['roleplay', 'power-dom'] | roleplay >= 1, power >= 1 |
| pet-play-m-is-pet | clarification | ['roleplay', 'power-sub'] | roleplay >= 1, power >= 1 |
| ddlg | clarification | ['roleplay', 'power-dom'] | roleplay >= 2, power >= 2 |
| mdlb | clarification | ['roleplay', 'power-sub'] | roleplay >= 2, power >= 2 |

---

## CLOTHING Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| lingerie-f | clarification | ['lingerie'] | lingerie >= 1 |
| lingerie-m | clarification | ['lingerie'] | lingerie >= 1 |
| stockings | clarification | ['lingerie'] | lingerie >= 1 |
| heels-only | clarification | ['lingerie', 'foot-receive'] | lingerie >= 1 |
| harness-f | clarification | ['lingerie'] | lingerie >= 1 |
| harness-m | clarification | ['lingerie'] | lingerie >= 1 |
| uniforms-f | clarification | ['lingerie', 'roleplay'] | lingerie >= 1 |
| uniforms-m | clarification | ['lingerie', 'roleplay'] | lingerie >= 1 |
| latex-leather | clarification | ['lingerie'] | lingerie >= 2 |
| torn-clothes | clarification | ['rough-give', 'rough-receive'] | rough >= 1 |

**New clarifications needed (image_selection):**
- [ ] lingerie-style-selection - scene_type: image_selection, clarification_for: ['lingerie']
  - image_options: lace, mesh, satin, latex, leather, corset

---

## EXHIBITIONISM Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| exhibitionism | clarification | ['exhibitionism'] | - |
| voyeurism | clarification | ['exhibitionism'] | - |
| striptease-f | clarification | ['exhibitionism'] | - |
| striptease-m | clarification | ['exhibitionism'] | - |
| glory-hole | clarification | ['exhibitionism', 'oral-receive', 'public'] | oral >= 1 |
| public-sex | clarification | ['public', 'exhibitionism'] | public >= 1 |

**Note:** glory-hole пересекает несколько тем:
- exhibitionism (анонимность, показ)
- oral-receive / blowjob (минет через отверстие)
- public (часто в публичных местах)

---

## EXTREME Category — DEPRECATED

**Проблема:** "extreme" — искусственная категория, объединяющая слишком разные вещи.
Лучше распределить по реальным темам:

### Распределение по реальным категориям:

| Slug | Реальная категория | clarification_for | Gates |
|------|-------------------|-------------------|-------|
| breath-play | rough/power | ['rough-give', 'rough-receive', 'power-dom'] | rough >= 2 |
| knife-play | edge-play (отдельная ниша) | ['power-dom', 'pain-tolerance'] | rough >= 2, power >= 2 |
| needle-play | pain/BDSM | ['pain-tolerance', 'bondage-give'] | pain >= 2 |
| fisting | penetration | ['anal-interest'] | anal >= 2 |
| fisting-m-to-f | penetration | ['anal-give'] | anal >= 2 |
| mummification | bondage | ['bondage-receive'] | bondage >= 2 |
| lactation | body-fetishes | ['body-fetishes'] | - |
| fucking-machine | toys | ['toys'] | toys >= 2 |
| breeding-kink | **отдельная ниша** | standalone | creampie >= 1 (или без гейта) |
| objectification | power-dynamic | ['power-dom', 'power-sub'] | power >= 2 |
| electrostim | sensory/toys | ['toys', 'sensory'] | toys >= 1 |

### Активные сцены из extreme (БД) — распределить:

| Slug | Новая категория | clarification_for | Gates |
|------|-----------------|-------------------|-------|
| breath-play-m-to-f-give/receive | IMPACT-PAIN | ['rough-give'] | rough >= 2 |
| breath-play-f-to-m-give/receive | IMPACT-PAIN | ['rough-receive'] | rough >= 2 |
| figging | ANAL | ['anal-interest'] | anal >= 1 |
| fisting-m-to-f-give/receive | ANAL | ['anal-give'] | anal >= 2 |
| fisting-f-to-m-give/receive | ANAL | ['anal-receive'] | anal >= 2 |
| fucking-machine | TOYS | ['toys'] | toys >= 2 |
| knife-play-m-to-f-give/receive | IMPACT-PAIN (edge-play) | ['rough-give', 'power-dom'] | rough >= 2, power >= 2 |
| knife-play-f-to-m-give/receive | IMPACT-PAIN (edge-play) | ['rough-receive', 'power-sub'] | rough >= 2, power >= 2 |
| lactation-give/receive | WORSHIP-SERVICE | ['body-fetishes'] | - |
| needle-play | IMPACT-PAIN (BDSM) | ['pain-tolerance', 'bondage'] | pain >= 2 |
| objectification-f-give/receive | CONTROL-POWER | ['power-dom'] | power >= 2 |
| objectification-m-give/receive | CONTROL-POWER | ['power-sub'] | power >= 2 |

### Неактивные в extreme:
- breeding-kink — отдельная ниша, триггерится через creampie
- mummification — все варианты неактивны

### Рекомендация:
Убрать категорию "extreme" из онбординга. Эти сцены должны открываться через:
- rough >= 2 (breath-play, knife-play)
- bondage >= 2 (needle-play)
- anal >= 2 (fisting), anal >= 1 (figging)
- toys >= 2 (fucking-machine)
- power >= 2 (objectification)

---

## CHASTITY Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| chastity-m-locked | clarification | ['power-sub'] | power >= 2 |
| chastity-f-locked | clarification | ['power-sub'] | power >= 2 |

---

## BODY-FLUIDS Category — DEPRECATED

**Решение:** Разбить на отдельные категории:

### 1. finish-preference (NEW paired main_question)

**Для мужчины:**
```json
{
  "slug": "finish-preference-m",
  "scene_type": "main_question",
  "context": "both",
  "role_direction": "m_to_f",
  "paired_with": "finish-preference-f",
  "title": { "ru": "Финиш", "en": "Finish" },
  "question": {
    "ru": "Куда тебе нравится кончать?",
    "en": "Where do you like to cum?"
  },
  "options": [
    { "id": "inside", "label": { "ru": "Внутрь", "en": "Inside" }, "triggers": ["breeding-kink"] },
    { "id": "face", "label": { "ru": "На лицо", "en": "On face" } },
    { "id": "body", "label": { "ru": "На тело/грудь", "en": "On body/chest" } },
    { "id": "mouth", "label": { "ru": "В рот", "en": "In mouth" } }
  ],
  "allow_multiple": true
}
```

**Для женщины:**
```json
{
  "slug": "finish-preference-f",
  "scene_type": "main_question",
  "context": "both",
  "role_direction": "f_receives",
  "paired_with": "finish-preference-m",
  "title": { "ru": "Финиш", "en": "Finish" },
  "question": {
    "ru": "Куда тебе нравится когда кончают?",
    "en": "Where do you like him to cum?"
  },
  "options": [
    { "id": "inside", "label": { "ru": "Внутрь", "en": "Inside" }, "triggers": ["breeding-kink"] },
    { "id": "face", "label": { "ru": "На лицо", "en": "On face" } },
    { "id": "body", "label": { "ru": "На тело/грудь", "en": "On body/chest" } },
    { "id": "mouth", "label": { "ru": "В рот", "en": "In mouth" } }
  ],
  "allow_multiple": true
}
```

**Gates:** нет (показывается всем)
**Trigger:** выбор "inside" → активирует breeding-kink clarification

### 2. squirting (NEW gate)
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| squirting-give | clarification | ['finish-preference'] | - |
| squirting-receive | clarification | ['oral-give', 'finish-preference'] | - |

### 3. watersports (NEW gate)
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| golden-shower-m-to-f | clarification | ['watersports'] | watersports >= 1 |
| golden-shower-f-to-m | clarification | ['watersports'] | watersports >= 1 |

**Note:** watersports — отдельный гейт в онбординге (табуированная тема)

### 4. spitting → degradation
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| spitting-m-to-f | clarification | ['degradation-give', 'power-dom'] | power >= 1 |
| spitting-f-to-m | clarification | ['degradation-receive', 'power-sub'] | power >= 1 |

### 5. breeding-kink — отдельная ниша
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| breeding-kink | clarification | ['finish-preference'] | creampie selected |

**Логика показа:**
1. User отвечает на finish-preference
2. Если выбрал "creampie" / "внутрь" → показываем breeding-kink как clarification
3. Вопрос: "Возбуждает ли мысль о возможной беременности?"

**Note:** Breeding kink — уникальная тема:
- Фантазия об оплодотворении/беременности
- Триггер: выбор creampie в finish-preference
- Не показывается без этого триггера

---

## MANUAL Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| handjob | clarification | ['manual', 'foreplay'] | - |
| fingering | clarification | ['manual', 'foreplay'] | - |
| titfuck | clarification | ['manual'] | - |

**Note:** Manual — базовые активности, показываются без гейтов.

---

## MASSAGE Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| massage-m-to-f | clarification | ['romantic', 'foreplay'] | romantic >= 1 |
| massage-f-to-m | clarification | ['romantic', 'foreplay'] | romantic >= 1 |

**Note:** Massage — часть романтики/прелюдии.

---

## SOLO-MUTUAL Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| joi | clarification | ['dirty-talk-give', 'power-dom'] | verbal >= 1 |
| masturbation-m-for-f | clarification | ['exhibitionism', 'voyeurism'] | - |
| masturbation-f-for-m | clarification | ['exhibitionism', 'voyeurism'] | - |
| mutual-masturbation | clarification | ['exhibitionism'] | - |

**Note:** JOI связан с вербальным контролем; мастурбация — с exhibitionism/voyeurism.

---

## EMOTIONAL-CONTEXT Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| emotional-sex | clarification | ['romantic'] | romantic >= 1 |
| first-time-together | clarification | ['romantic'] | - |
| makeup-sex | clarification | ['romantic', 'rough'] | - |
| angry-sex | clarification | ['rough-give', 'rough-receive'] | rough >= 1 |
| cheating-fantasy | clarification | ['fantasy-reality'] | - |

**Note:** Эмоциональный контекст — пересекается с romantic и rough.

---

## ROMANTIC Category Mapping

### Main Questions
| Slug | scene_type | context |
|------|------------|---------|
| romantic | main_question | onboarding |

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| romantic-sex | clarification | ['romantic'] | romantic >= 1 |
| aftercare | clarification | ['romantic', 'rough'] | - |
| quickie | clarification | ['spontaneous'] | - |

**Note:** Aftercare важен после интенсивных сессий (rough/BDSM).

---

## SENSORY Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| blindfold | clarification | ['sensory', 'bondage'] | - |
| ice-play | clarification | ['sensory'] | - |
| feather-tickle | clarification | ['sensory'] | - |
| electrostim | clarification | ['sensory', 'toys'] | toys >= 1 |
| wax-play | clarification | ['sensory', 'pain-tolerance'] | pain >= 1 |

**Note:** Sensory play — отдельная категория, пересекается с bondage и pain.

---

## TOYS Category Mapping

### Main Questions
| Slug | scene_type | context |
|------|------------|---------|
| toys-interest | main_question | both |

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| vibrator | clarification | ['toys'] | toys >= 1 |
| dildo | clarification | ['toys'] | toys >= 1 |
| butt-plug | clarification | ['toys', 'anal-interest'] | toys >= 1 |
| cock-ring | clarification | ['toys'] | toys >= 1 |
| nipple-clamps | clarification | ['toys', 'pain-tolerance'] | toys >= 1 |
| remote-control-toy | clarification | ['toys', 'public'] | toys >= 1 |
| fucking-machine | clarification | ['toys'] | toys >= 2 |
| **sex-swing** | clarification | ['toys', 'positions'] | toys >= 1 | ← NEW

**Notes:**
- fucking-machine требует более высокий гейт (toys >= 2)
- sex-swing (качели) — связана с toys и positions, т.к. это и девайс, и позиция

---

## FILMING/RECORDING Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| filming | clarification | ['recording', 'exhibitionism'] | - |
| sexting | clarification | ['recording', 'exhibitionism'] | - |

**Note:** Recording — отдельный гейт в онбординге.

---

## INTIMACY Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| casual-intimate-touch | clarification | ['romantic'] | - |
| morning-teasing | clarification | ['romantic', 'foreplay'] | - |
| kitchen-counter | clarification | ['spontaneous', 'public'] | - |

**Note:** Intimacy outside bedroom — пересекается с romantic и spontaneous.

---

## CUCKOLD/HOTWIFE Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| cuckold | clarification | ['group', 'power-sub'] | group >= 1, power >= 1 |
| hotwife | clarification | ['group', 'power-dom'] | group >= 1 |

**Note:** Cuckold/Hotwife — разные динамики:
- Cuckold: он смотрит (submissive angle)
- Hotwife: она свободна (empowerment angle)

---

## SYMMETRIC Category Mapping

### Clarifications
| Slug | scene_type | clarification_for | Gates |
|------|------------|-------------------|-------|
| sex-positions | clarification | ['baseline'] | - |
| sex-locations | clarification | ['public', 'spontaneous'] | - |

**Note:** Позы и локации — универсальные темы без направления.

---

## Shared Clarifications (Multiple main_questions)

These clarification scenes can be triggered by multiple main_questions.
**Deduplication rule:** First main_question to trigger it wins; subsequent main_questions skip it.

| Slug | clarification_for |
|------|-------------------|
| deepthroat | ['oral-preference', 'blowjob', 'rough-receive'] |
| facesitting-* | ['oral-preference', 'power-dom'] |
| rimming-* | ['oral-preference', 'anal-interest'] |
| primal | ['rough-give', 'rough-receive', 'cnc'] |
| bondage-* | ['power-dom', 'power-sub'] |
| pet-play-* | ['roleplay', 'power-dom', 'power-sub'] |
| torn-clothes | ['rough-give', 'rough-receive', 'lingerie'] |

---

## Active Scenes from DB (211 scenes)

**Источник:** `scenes/v2/scenes-status.json`

### ORAL (активные)
- blowjob-give, blowjob-receive
- cunnilingus-give, cunnilingus-receive
- deepthroat-give, deepthroat-receive
- facesitting-she-on-him, facesitting-he-on-her-give, facesitting-he-on-her-receive
- rimming-he-to-her-give, rimming-he-to-her-receive, rimming-she-to-him-give, rimming-she-to-him-receive
- finger-sucking-*

### ANAL (активные)
- anal-play-on-her-give, anal-play-on-her-receive
- anal-play-on-him-give, anal-play-on-him-receive
- pegging-give, pegging-receive
- fisting-m-to-f-give, fisting-m-to-f-receive (из extreme → anal)
- fisting-f-to-m-give, fisting-f-to-m-receive (из extreme → anal)
- figging (из extreme → anal)

### CONTROL-POWER (активные)
- bondage-he-ties-her-give, bondage-he-ties-her-receive
- bondage-she-ties-him-give, bondage-she-ties-him-receive
- collar-he-owns-her-give, collar-he-owns-her-receive
- collar-she-owns-him-give, collar-she-owns-him-receive
- feminization
- free-use-f-available-give, free-use-f-available-receive
- free-use-m-available-give, free-use-m-available-receive
- forced-orgasm-on-her-give, forced-orgasm-on-her-receive
- forced-orgasm-on-him-give, forced-orgasm-on-him-receive
- orgasm-control-m-to-f, orgasm-control-f-to-m
- objectification-m-to-f, objectification-f-to-m (из extreme → power)

### IMPACT-PAIN (активные)
- spanking-he-spanks-her-give, spanking-he-spanks-her-receive
- spanking-she-spanks-him-give, spanking-she-spanks-him-receive
- wax-play-he-on-her-give, wax-play-he-on-her-receive
- wax-play-she-on-him-give, wax-play-she-on-him-receive
- nipple-play-he-on-her-give, nipple-play-he-on-her-receive
- nipple-play-she-on-him-give, nipple-play-she-on-him-receive
- face-slapping-he-slaps-her-give, face-slapping-he-slaps-her-receive
- face-slapping-she-slaps-him-give, face-slapping-she-slaps-him-receive
- cbt-give, cbt-receive
- choking-he-chokes-her-give, choking-he-chokes-her-receive (в БД is_active=false, но в админке показано как активная в Экстрим)
- choking-she-chokes-him-give, choking-she-chokes-him-receive (в БД is_active=false, но в админке показано как активная в Экстрим)
- breath-play-m-to-f-give, breath-play-m-to-f-receive (из extreme → rough)
- breath-play-f-to-m-give, breath-play-f-to-m-receive (из extreme → rough)
- knife-play-m-to-f-give, knife-play-m-to-f-receive (из extreme → edge-play)
- knife-play-f-to-m-give, knife-play-f-to-m-receive (из extreme → edge-play)
- needle-play (из extreme → pain/BDSM)
- **INACTIVE:** whipping-*, mummification-*

### CNC-ROUGH (активные)
- cnc-he-takes-her-give, cnc-he-takes-her-receive
- cnc-she-takes-him-give, cnc-she-takes-him-receive
- somnophilia-m-to-f-give, somnophilia-m-to-f-receive
- somnophilia-f-to-m-give, somnophilia-f-to-m-receive
- **INACTIVE:** primal

### VERBAL (активные)
- praise-he-praises-her-give, praise-he-praises-her-receive
- praise-she-praises-him-give, praise-she-praises-him-receive
- degradation-he-degrades-her-give, degradation-he-degrades-her-receive
- degradation-she-degrades-him-give, degradation-she-degrades-him-receive
- dirty-talk
- moaning-and-screaming

### BODY-FLUIDS (активные)
- cum-where-to-finish
- squirting, squirting-on-self-give, squirting-on-self-receive
- squirt-receiving-give, squirt-receiving-receive
- golden-shower-he-on-her-give, golden-shower-he-on-her-receive
- golden-shower-she-on-him-give, golden-shower-she-on-him-receive
- spitting-he-on-her-give, spitting-he-on-her-receive
- spitting-she-on-him-give, spitting-she-on-him-receive

### WORSHIP-SERVICE (активные)
- foot-worship-he-worships-her-give, foot-worship-he-worships-her-receive
- foot-worship-she-worships-his-give, foot-worship-she-worships-his-receive
- body-worship-he-worships-her-give, body-worship-he-worships-her-receive
- body-worship-she-worships-him-give, body-worship-she-worships-him-receive
- cock-worship-give, cock-worship-receive
- pussy-worship-give, pussy-worship-receive
- armpit
- lactation (из extreme → body-fetishes)

### GROUP (активные)
- gangbang, orgy, swinging-partner-swap, double-penetration
- **INACTIVE:** threesome-fmf, threesome-mfm

### ROLEPLAY (активные)
- boss-m-secretary-f-give, boss-m-secretary-f-receive
- boss-f-subordinate-m-give, boss-f-subordinate-m-receive
- teacher-m-student-f-give, teacher-m-student-f-receive
- teacher-f-student-m-give, teacher-f-student-m-receive
- doctor-patient, stranger-roleplay, service-roleplay
- **INACTIVE:** taboo-roleplay

### PET-PLAY & AGE-PLAY (активные)
- pet-play-she-is-pet-give, pet-play-she-is-pet-receive
- pet-play-he-is-pet-give, pet-play-he-is-pet-receive
- daddy-dom-little-girl, mommy-dom-little-boy

### CLOTHING (активные)
- female-lingerie-give, female-lingerie-receive
- male-lingerie-give, male-lingerie-receive
- stockings-garters, heels-only, latex-leather
- female-harness-give, female-harness-receive
- male-harness-give, male-harness-receive
- female-uniforms-give, female-uniforms-receive
- male-uniforms-give, male-uniforms-receive
- torn-clothes

### EXHIBITIONISM (активные)
- exhibitionism, voyeurism, public-sex
- female-striptease-give, female-striptease-receive
- male-striptease-give, male-striptease-receive
- glory-hole-blowjob-give, glory-hole-blowjob-receive
- **INACTIVE:** glory-hole-cunnilingus-*

### ~~EXTREME~~ — DEPRECATED, распределено по категориям:
**См. секцию "EXTREME Category — DEPRECATED" выше**

### TOYS (активные)
- fucking-machine (из extreme → toys)
- butt-plug-she-wears-give, butt-plug-she-wears-receive
- butt-plug-he-wears-give, butt-plug-he-wears-receive
- cock-ring-give, cock-ring-receive
- nipple-clamps, remote-control-toy
- **INACTIVE:** vibrator-play, dildo-play

### SENSORY (активные)
- electrostim (уже в sensory, не в extreme)
- feather-tickle
- ice-play-he-on-her-give, ice-play-he-on-her-receive
- ice-play-she-on-him-give, ice-play-she-on-him-receive

### MANUAL (активные)
- handjob-give, handjob-receive
- fingering-give, fingering-receive
- titfuck

### MASSAGE (активные)
- massage-he-massages-her-give, massage-he-massages-her-receive
- massage-she-massages-him-give, massage-she-massages-him-receive

### SOLO-MUTUAL (активные)
- joi
- masturbation-he-for-her-give, masturbation-he-for-her-receive
- masturbation-she-for-him-give, masturbation-she-for-him-receive
- **INACTIVE:** mutual-masturbation

### EMOTIONAL-CONTEXT (активные)
- emotional-sex, first-time-together, makeup-sex
- **INACTIVE:** angry-sex, cheating-fantasy

### ROMANTIC (активные)
- romantic-sex
- **INACTIVE:** aftercare, quickie

### OTHER (активные)
- cuckold, hotwife-vixen
- filming, sexting
- chastity-he-locked, chastity-f-locked
- sex-locations
- **INACTIVE:** sex-positions, lgbtq-*, casual-intimate-touch

---

## INACTIVE Categories (полностью)

Эти категории/сцены полностью неактивны:
- **~~baseline~~** — не нужны, см. секцию выше (можно удалить из БД)
- **lgbtq** — wlw, mlm
- **whipping** — все варианты
- **mummification** — все варианты
- **ruined-orgasm** — все варианты
- **edging (старые)** — заменены на orgasm-control
- **primal** — неактивна
- **breeding-kink** — неактивна (будет активироваться через creampie)

### ⚠️ Data Issue: choking
В БД (`is_active: false`) но в админке отображается как активная в категории "Экстрим".
Возможно расхождение между полем is_active и логикой показа в админке.
**TODO:** Проверить и синхронизировать статус choking сцен.

---

## New Scene Types to Create

### ~~body_map_activity~~ — НЕ НУЖНО
Покрывается существующим body map функционалом.

### multi_choice_text (текстовые опции + "своё", БЕЗ КАРТИНКИ)

> ⚠️ Эти сцены про слова — картинка не нужна, только текстовый выбор

| Slug | clarification_for | Вопрос | Опции |
|------|-------------------|--------|-------|
| pet-names | ['praise-give', 'praise-receive'] | Какими словами нравится называть/когда называют? | малыш/малышка, хорошая девочка, шлюха, [своё] |
| dirty-words | ['dirty-talk-give', 'dirty-talk-receive'] | Какие слова возбуждают? | член/хуй, киска/пизда, трахать, [своё] |
| degradation-words | ['degradation-give', 'degradation-receive'] | Какие унизительные слова нравятся? | шлюха, сучка, грязная девочка, [своё] |
| aftercare-preference | ['rough', 'bondage'] | Что нужно после интенсивной сессии? | обнимашки, вода/еда, тишина, разговор, [своё] |

### swipe_cards (свайп-карточки с картинками — 6-8 штук)

> Полноценные свайп-карточки, как main_question, но внутри discovery для уточнения

#### bondage-type
**clarification_for:** `['bondage-give', 'bondage-receive']`
**Вопрос:** Какой тип связывания нравится?
**Карточки (6 штук, каждая с картинкой):**
1. **Restrain** — классическое: наручники, верёвки, ремни
2. **Шибари** — японское декоративное связывание
3. **St. Andrew's Cross** — крест для фиксации стоя
4. **Spreader bar** — распорка для ног/рук
5. **Подвешивание (suspension)** — полное или частичное подвешивание
6. **Цепи** — металлические цепи для фиксации

#### positions-favorite
**clarification_for:** `['symmetric']`
**Вопрос:** Какие позы нравятся больше?
**Карточки (8 штук в 2 столбика, каждая с картинкой):**
1. Миссионерская
2. Догги-стайл
3. Наездница
4. Обратная наездница
5. 69
6. Спуны (на боку)
7. Стоя
8. Сидя (на стуле/диване)

### image_selection (выбор из маленьких картинок — grid)

| Slug | clarification_for | Вопрос | Опции (картинки) |
|------|-------------------|--------|------------------|
| lingerie-style | ['lingerie'] | Какой стиль белья нравится? | кружево, сетка, атлас, латекс, кожа, корсет |
| locations-favorite | ['public', 'spontaneous'] | Где хочется заняться сексом? | спальня, душ, кухня, машина, природа, отель |

### Куда добавить качели (sex swing)?

**Решение:** Добавить в категорию **TOYS** как отдельную clarification сцену:
```
slug: sex-swing
scene_type: clarification
clarification_for: ['toys', 'positions']
title: "Секс-качели"
```
Качели — это и игрушка, и место/позиция, поэтому связана с обеими категориями.

### Анальный крюк (anal hook)

**Решение:** Добавить в категорию **TOYS** как clarification сцену:
```
slug: anal-hook
scene_type: clarification
clarification_for: ['anal-interest', 'bondage-give', 'bondage-receive']
title: "Анальный крюк"
intensity: 4
```
Анальный крюк — пересекает anal и bondage, требует обоих гейтов.

### paired_text (два связанных вопроса без картинки)

| Slug | clarification_for | Вопрос 1 (give) | Вопрос 2 (receive) |
|------|-------------------|-----------------|-------------------|
| initiation-style | ['romantic', 'spontaneous'] | Как ты приглашаешь к сексу? | Как тебе нравится когда приглашают? |
| oral-communication | ['oral-give', 'oral-receive'] | Как говоришь что хочешь орального? | Как нравится когда предлагают оральное? |
| anal-communication | ['anal-give', 'anal-receive'] | Как говоришь что хочешь анального? | Как нравится когда предлагают анальное? |

### scale_text (шкала без картинки)

| Slug | clarification_for | Вопрос | Шкала |
|------|-------------------|--------|-------|
| pain-enjoyment | ['pain-tolerance'] | Насколько боль добавляет удовольствия? | 0 (никогда) — 5 (очень) |
| exhib-comfort | ['exhibitionism'] | Насколько комфортно показывать себя? | 0 (только наедине) — 5 (где угодно) |
| control-preference | ['power-dom', 'power-sub'] | Насколько нравится контролировать/подчиняться? | -5 (полный контроль) — +5 (полное подчинение) |

### finish-preference (NEW paired main_question)

> См. полное описание в секции **BODY-FLUIDS Category — DEPRECATED**

Две версии по полу:
- **finish-preference-m** — "Куда тебе нравится кончать?"
- **finish-preference-f** — "Куда тебе нравится когда кончают?"

Опции одинаковые: внутрь (→ breeding-kink), на лицо, на тело, в рот. `allow_multiple: true`

---

## 🎨 Сводка по новым картинкам

### Нужно сгенерировать:

**swipe_cards bondage-type (6 картинок):**
1. Restrain (наручники/верёвки) — пара, один связан классическим способом
2. Шибари — декоративная верёвочная обвязка
3. St. Andrew's Cross — человек на кресте
4. Spreader bar — распорка на ногах/руках
5. Подвешивание — частичное или полное подвешивание
6. Цепи — металлические цепи для фиксации

**swipe_cards positions-favorite (8 картинок):**
1. Миссионерская
2. Догги-стайл
3. Наездница
4. Обратная наездница
5. 69
6. Спуны (на боку)
7. Стоя
8. Сидя

**image_selection lingerie-style (8 маленьких):**
- кружево, сеточка (fishnet), полупрозрачное, чулки, атлас, латекс, кожа, корсет

**image_selection locations-favorite (6 маленьких):**
- спальня, душ, кухня, машина, природа, отель

**Новые clarification сцены:**
- sex-swing (качели) — 1 картинка
- anal-hook (анальный крюк) — 1 картинка
- finish-preference-m/f — 1 общая картинка (paired, разный текст вопроса)

### НЕ нужны картинки:
- multi_choice_text (pet-names, dirty-words, degradation-words, aftercare-preference) — текстовые сцены
- paired_text (initiation-style, oral-communication, anal-communication) — без картинок
- scale_text (pain-enjoyment, exhib-comfort, control-preference) — без картинок

### Итого новых картинок: ~31
- 6 bondage-type (большие, swipe)
- 8 positions-favorite (большие, swipe)
- 8 lingerie-style (маленькие, grid)
- 6 locations-favorite (маленькие, grid)
- 1 sex-swing (большая)
- 1 anal-hook (большая)
- 1 finish-preference (большая)

---

## Migration Steps

1. **Add scene_type to all existing scenes:**
   - baseline/* → main_question, context: 'both'
   - other composite/* → clarification

2. **Add clarification_for to clarification scenes:**
   - Based on mappings above

3. **Create new scenes:**
   - body_map_activity scenes
   - multi_choice_text scenes
   - image_selection scenes
   - paired_text scenes

4. **Update flow logic:**
   - Use scene-sequencing-v3.ts for discovery
   - Show intro slides before clarification groups
   - Implement deduplication

---

## Implementation Status

### ✅ Completed

1. **Database Migration** (`028_scene_types_v3.sql`):
   - [x] Added `scene_type` column to scenes
   - [x] Added `clarification_for` array column
   - [x] Added `context` column (onboarding/discovery/both)
   - [x] Created `user_clarification_tracking` table for deduplication
   - [x] Added indexes for efficient queries

2. **TypeScript Types** (`src/lib/types.ts`):
   - [x] `SceneTypeV3` enum
   - [x] `SceneContext` type
   - [x] `SceneV2Extended` interface
   - [x] `IntroSlide` interface
   - [x] `ClarificationTracking` interface

3. **Scene Sequencing Logic** (`src/lib/scene-sequencing-v3.ts`):
   - [x] `getClarificationsFor()` - get clarifications for main_question
   - [x] `getNextDiscoveryScenesV3()` - orchestrate discovery flow
   - [x] `markClarificationShown()` - deduplication tracking
   - [x] `buildDiscoveryContextV3()` - build context from user data
   - [x] Gates support on clarification scenes
   - [x] Role direction filtering

4. **UI Components** (`src/components/discovery/`):
   - [x] `IntroSlideV3` - intro slide before clarification group
   - [x] `MultiChoiceTextV3` - text options with "Other" input
   - [x] `ImageSelectionV3` - grid of selectable images (2 columns)
   - [x] `BodyMapActivityV3` - body map for specific activity
   - [x] `PairedTextV3` - give/receive paired questions
   - [x] `ScaleTextV3` - scale without image
   - [x] `SwipeCardsGroupV3` - swipe card group (bondage-type, positions)
   - [x] `SceneRendererV3` - universal renderer that routes by scene_type
   - [x] `v3-index.ts` - exports all V3 components

5. **Admin Tooling** (`src/app/api/admin/create-v3-scenes/`):
   - [x] POST: Create scenes from templates
   - [x] GET: List templates with status
   - [x] V3 Scene Creator dialog in admin panel

6. **Scene Templates** (`src/lib/v3-scene-templates.ts`):
   - [x] 32 templates with image prompts:
     - bondage-type (6 swipe cards)
     - positions-favorite (8 swipe cards)
     - lingerie-style (8 image selection)
     - locations-favorite (6 image selection)
     - single scenes (sex-swing, anal-hook, finish-preference-m/f)

7. **Content Migration** (2026-01-30) ✅:
   - [x] Added `scene_type: 'clarification'` to 202 scenes
   - [x] Added `clarification_for` to 184 scenes (full mapping)
   - [x] Fixed `paired_scene` references (underscore → hyphen) - 50 scenes
   - [x] Added missing `paired_scene` - 12 scenes
   - [x] Removed deprecated `elements[]` - 214 scenes
   - [x] Standardized tag naming - 9 scenes
   - **Scripts:** `scripts/add-clarification-for.ts`, `scripts/fix-tag-naming.ts`

8. **CRITICAL FIX: clarification_for canonical names** (2026-01-30) ✅:
   - **Problem:** `clarification_for` had detailed names (`bondage-give`, `oral-receive`)
   - **Expected:** Canonical gate names matching `OnboardingResponses` interface
   - **Fix:** 158 files updated, 233 mappings applied
   - **Key mappings:**
     - `bondage-give`, `bondage-receive` → `bondage`
     - `oral-preference`, `oral-give`, `oral-receive` → `oral`
     - `rough-give`, `rough-receive`, `pain-tolerance` → `rough`
     - `power-dom`, `power-sub` → `power_dynamic`
     - `dirty-talk-give`, `dirty-talk-receive` → `dirty_talk`
     - `watersports`, `finish-preference` → `body_fluids`
   - **Script:** `scripts/fix-clarification-for.ts`

### 🔄 In Progress

- [ ] Generate images for V3 templates (via admin panel)
- [ ] Integrate V3 components into discovery page flow
- [ ] Load updated scenes to DB: `npx tsx supabase/seed-v2-data.ts`

### ⏳ Pending

1. **Testing:**
   - [ ] Test intro slides in discovery
   - [ ] Test deduplication (deep-throat via two main_questions)
   - [ ] Test gates on clarification
   - [ ] Test multi_choice_text with custom input

---

## Priority Order for Implementation

### ✅ COMPLETED

1. **Content Migration (High Priority):**
   - [x] Mark all baseline scenes as main_question (14 scenes kept without scene_type)
   - [x] Add clarification_for to oral scenes (blowjob, cunnilingus, etc.)
   - [x] Add clarification_for to rough/power scenes
   - [x] Add clarification_for to ALL remaining categories

### ⏳ REMAINING

2. **Testing (High Priority):**
   - [ ] Test intro slides
   - [ ] Load scenes to database
   - [ ] Test discovery flow end-to-end

3. **Medium Priority:**
   - [ ] Create body_map_activity scenes
   - [ ] Create multi_choice_text scenes

4. **Low Priority:**
   - [ ] Create image_selection scenes
   - [ ] Create paired_text scenes
   - [ ] Fine-tune deduplication rules
