# Полный аудит сцен

Дата: 2026-01-30

---

## 1. ДУБЛИКАТЫ — деактивировать

Generic сцены, у которых есть направленные версии (m-to-f / f-to-m):

### Уже деактивированы ✓
- `baseline/oral-preference.json`
- `baseline/anal-interest.json`
- `impact-pain/nipple-play.json`
- `extreme/fisting.json`
- `extreme/breath-play.json`
- `exhibitionism/glory-hole.json`
- `control-power/ruined-orgasm.json`
- `cnc-rough/somnophilia.json`
- `body-fluids/spitting.json`
- `body-fluids/golden-shower.json`

### НУЖНО ДЕАКТИВИРОВАТЬ
- [ ] `extreme/knife-play.json` — есть knife-play-m-to-f и knife-play-f-to-m

---

## 2. НУЖНО РАЗДЕЛИТЬ — разные действия в одной сцене

### Критично (разные части тела / направления)

| Файл | Проблема | Нужно создать |
|------|----------|---------------|
| `extreme/fisting-m-to-f.json` | "вагинально или анально" | fisting-vaginal-m-to-f + fisting-anal-m-to-f |
| `extreme/figging.json` | "ты вставляешь или он вставляет" | figging-m-to-f + figging-f-to-m |
| `extreme/needle-play.json` | "ты вводишь или он вводит" | needle-play-m-to-f + needle-play-f-to-m |
| `extreme/breeding-kink.json` | "ты кончаешь или он кончает" | breeding-kink-m (он кончает) + breeding-kink-f (она принимает) |
| `toys/dildo.json` | "вагинально или анально, соло или с партнёром" | dildo-vaginal + dildo-anal (минимум) |
| `group/threesome-mfm.json` | "с двумя мужчинами или с женщиной и мужчиной" | НЕПОНЯТНО, исправить описание |
| `group/threesome-fmf.json` | "с двумя женщинами или с мужчиной и женщиной" | НЕПОНЯТНО, исправить описание |
| `group/double-penetration.json` | "спереди и сзади, или оба в одно место" | dp-vaginal-anal + dp-double-vaginal + dp-double-anal |

---

## 3. СУБЪЕКТИВНЫЕ ОПИСАНИЯ — убрать оценки

| Файл | Проблема | Исправить на |
|------|----------|--------------|
| `locations/location-car.json` | "Тесно, неудобно, но так возбуждающе" | "На заднем сиденье или откинув переднее" |
| `lingerie-styles/lingerie-fishnet.json` | "Дерзко и сексуально" | "Бельё в крупную или мелкую сетку" |
| `oral/rimming-f-to-m.json` | "невероятные ощущения" | убрать |
| `manual/handjob.json` | "Она чувствует каждую реакцию" | убрать |
| `exhibitionism/no-panties-walk.json` | "Ощущение тайны, лёгкого ветерка, и возбуждения" | убрать |
| `impact-pain/face-slapping-f-to-m.json` | "Femdom, наказание, или просто проверка его реакции" | убрать |

---

## 4. ТРЕТЬЕ ЛИЦО — нужно второе лицо

Проверить ВСЕ файлы. Формула:
- `for_gender: "male"` → "Ты делаешь ей..."
- `for_gender: "female"` → "Ты делаешь ему..." / "Он делает тебе..."
- `for_gender: null` → "Ты и партнёр..." ИЛИ разделять на две сцены

### Примеры ошибок (из all-scenes-ru.md):
- "Мужчина играет роль Daddy..." → "Ты играешь роль Daddy..."
- "Женщина в роли Mommy..." → "Ты играешь роль Mommy..."
- "Пара занимается сексом..." → "Ты и партнёр занимаетесь сексом..."
- "Один партнёр шлёпает другого" → КТО КОГО? Разделять!

---

## 5. ПРОВЕРИТЬ for_gender

Сцены с `for_gender: null` (mutual) которые на самом деле направленные:

| Файл | role_direction | Проблема |
|------|----------------|----------|
| `chastity/chastity-f-locked.json` | m_keyholder_f_locked | for_gender должен быть null ИЛИ разделить на 2 |
| `chastity/chastity-m-locked.json` | f_keyholder_m_locked | for_gender должен быть null ИЛИ разделить на 2 |
| `cuckold/cuckold.json` | cuckold | Сложная сцена, возможно нужны 2 версии |
| `cuckold/hotwife.json` | hotwife | Сложная сцена, возможно нужны 2 версии |

---

## 6. ОТСУТСТВУЮЩИЕ ПАРНЫЕ СЦЕНЫ

Проверить что для каждой m-to-f есть f-to-m и наоборот:

### Нужно проверить:
- [ ] Все impact-pain сцены
- [ ] Все control-power сцены
- [ ] Все extreme сцены
- [ ] Все worship-service сцены

---

## 7. ПОРЯДОК ИСПРАВЛЕНИЙ

1. Деактивировать дубликаты (knife-play.json)
2. Создать недостающие разделённые сцены
3. Исправить user_description (второе лицо, убрать субъективность)
4. Проверить for_gender и role_direction
5. Регенерировать all-scenes-ru.md

---

## СЛЕДУЮЩИЕ ШАГИ

Начать с категории EXTREME:
1. Деактивировать knife-play.json
2. Разделить fisting-m-to-f на vaginal и anal
3. Создать figging-m-to-f и figging-f-to-m
4. Создать needle-play-m-to-f и needle-play-f-to-m
5. Разделить breeding-kink на M и F версии
