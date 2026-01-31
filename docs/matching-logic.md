# Логика матчинга (matching.ts)

## Обзор

Система матчинга определяет какие предпочтения показывать пользователям на основе:
1. **interest_level** — насколько пользователь заинтересован (0-100)
2. **role_preference** — какую роль хочет (give/receive/both/null)

## Алгоритм: getTagBasedMatches

Основная функция для матчинга по tag_preferences.

### Входные данные

```typescript
interface TagPreference {
  tag_ref: string;           // например "blowjob", "bondage"
  interest_level: number;    // 0-100
  role_preference: 'give' | 'receive' | 'both' | null;
}
```

### Логика complementary roles

```typescript
function areRolesComplementary(roleA, roleB): boolean {
  // 'both' или null — матчится с любым
  if (roleA === 'both' || roleB === 'both') return true;
  if (roleA === null || roleB === null) return true;

  // give ↔ receive = complementary
  return (roleA === 'give' && roleB === 'receive') ||
         (roleA === 'receive' && roleB === 'give');
}
```

### Матрица результатов

| Я хочу? | Партнёр хочет? | Роли совпадают? | Результат |
|---------|----------------|-----------------|-----------|
| ✓ | ✓ | ✓ | **MATCH** — показываем обоим |
| ✓ | ✓ | ✗ | **HIDDEN** — оба хотят, но роли конфликтуют |
| ✓ | ✗ | - | **HIDDEN** — я хочу, партнёр нет |
| ✗ | ✓ | - | **PARTNER_NO** — партнёр хочет, я нет (безопасно показать) |
| ✗ | ✗ | - | пропускаем |

### Пример: "Оба хотят, но роли не совпадают"

```
User A: blowjob, interest=80, role_preference="give"
User B: blowjob, interest=85, role_preference="give"

Оба хотят делать blowjob (give), никто не хочет получать.
→ Результат: HIDDEN (не матч)
```

**Правильный матч:**
```
User A: blowjob, interest=80, role_preference="give"
User B: blowjob, interest=85, role_preference="receive"

A хочет делать ← → B хочет получать
→ Результат: MATCH ✓
```

## threshold (порог)

По умолчанию `threshold = 50`.

- `interest_level >= 50` → пользователь хочет
- `interest_level < 50` → пользователь НЕ хочет

## Три категории результатов

1. **matches** — оба хотят И роли complementary
2. **partnerDoesntWant** — партнёр не хочет (безопасно показать мне)
3. **iWantButHidden** — я хочу, но партнёр нет ИЛИ роли конфликтуют (скрыто от меня)

## role_preference NULL

- `null` трактуется как `both` — готов на любую роль
- Обычно у mutual сцен или когда пользователь не выбрал роль

## Расчёт interest_level

См. [tag-preferences.ts](../src/lib/tag-preferences.ts):

```typescript
// База: 50 если выбрано
// Experience модификаторы:
//   tried + enjoyed → +70
//   tried + neutral → +60
//   not_interested → -30
// Итог: Math.max(existing, calculated) — сохраняем максимум
```

## Два алгоритма матчинга

1. **getMatchResults()** — для flat preferences (старый формат)
2. **getTagBasedMatches()** — для tag_preferences (актуальный)

В продакшене используется `getTagBasedMatches()`.
