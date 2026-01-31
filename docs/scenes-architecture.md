# Scenes Architecture

## Overview

Scenes are the core content unit in the visual onboarding flow. Each scene represents a sexual activity/preference that users can swipe on to indicate their interest level.

## Database Schema

### Core Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `slug` | TEXT | Unique identifier (e.g., `blowjob-give`) |
| `version` | INT | Schema version (2 = current) |
| `category` | TEXT | Category grouping (e.g., `oral`, `bondage`) |
| `role_direction` | TEXT | Direction of action (`m_to_f`, `f_to_m`, `mlm`, `wlw`, `solo`) |
| `is_active` | BOOLEAN | Whether scene is shown to users (default: true) |

### Localized Content (JSONB)

| Field | Type | Description |
|-------|------|-------------|
| `title` | `{en, ru}` | Scene title |
| `user_description` | `{en, ru}` | Description shown to user during swipe |
| `ai_description` | `{en, ru}` | Internal description for AI |

### Image Fields

| Field | Type | Description |
|-------|------|-------------|
| `image_url` | TEXT | Current active image URL |
| `image_variants` | JSONB[] | Array of all generated images |
| `generation_prompt` | TEXT | Current prompt for image generation |

### Paired Scenes

| Field | Type | Description |
|-------|------|-------------|
| `paired_with` | UUID | Links give/receive scene pairs |

## Paired Scenes (Give/Receive)

### Concept

For directional actions (one person does something TO another), we create TWO scenes:
- **Give scene** (`*-give`): Perspective of the person performing the action
- **Receive scene** (`*-receive`): Perspective of the person receiving the action

Both scenes share the same image but have different `user_description` to match the user's perspective.

### Example: Blowjob

```
blowjob-give (for F):
  user_description.ru: "Ты на коленях перед ним, берёшь его член в рот..."

blowjob-receive (for M):
  user_description.ru: "Она на коленях перед тобой, берёт твой член в рот..."
```

### Database Linking

Both scenes have `paired_with` pointing to each other:
```sql
blowjob-give.paired_with = blowjob-receive.id
blowjob-receive.paired_with = blowjob-give.id
```

### Admin UI

In the admin panel, paired scenes are displayed as ONE block:
- Green section: Give scene description
- Purple section: Receive scene description
- Shared image gallery

### Scripts

| Script | Purpose |
|--------|---------|
| `scripts/create-perspective-scenes.ts` | Create give/receive pairs from JSON |
| `scripts/link-paired-scenes.ts` | Link existing pairs with `paired_with` |
| `scripts/data/perspective-descriptions.json` | Source descriptions for all pairs |

## Scene Visibility

### is_active Flag

- `is_active = true`: Scene shown in onboarding (default)
- `is_active = false`: Scene hidden from users

Currently hidden:
- `mlm` (male-male) scenes
- `wlw` (female-female) scenes

These will be enabled when gay/lesbian content is ready.

### Admin Filters

| Filter | Shows |
|--------|-------|
| Active | `is_active = true` (default) |
| Inactive | `is_active = false` |
| Paired | Scenes with `paired_with` set |

## Image Variants (Gallery)

Each scene can have multiple images stored in `image_variants`:

```typescript
interface ImageVariant {
  url: string;
  prompt: string;
  created_at: string;
  qa_status?: 'passed' | 'failed' | null;
}
```

### Admin Gallery

In the admin panel, each scene has a gallery section:
- Shows all images in `image_variants`
- **"Add image"** button to upload new images
- Click image to view fullscreen
- **"Use"** button to set as main `image_url`
- **"Delete"** button to remove from gallery

### App Behavior

In the app, a random image from `image_variants` is shown for each scene on each session.

## Migrations

| Migration | Description |
|-----------|-------------|
| `022_is_active_and_wishlist.sql` | Added `is_active` flag |
| `025_paired_scenes.sql` | Added `paired_with` field |
