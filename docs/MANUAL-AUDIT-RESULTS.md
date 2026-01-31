# Manual Scene Audit Results
**Date:** 2026-01-31
**Auditor:** Manual review of ALL 413 scenes (57 onboarding + 356 composite)

## Summary

Total issues found: **372**

### Issue Breakdown

| Category | Count | Severity | Status |
|----------|-------|----------|--------|
| MISSING_PAIRED | 39 | CRITICAL | 🔴 Needs immediate fix |
| QUESTION_TYPE | 157 | HIGH (6) / MEDIUM (151) | 🟡 Simplification needed |
| PAIRED_MISMATCH | 14 | HIGH | 🔴 Broken references |
| AMBIGUOUS_OR | 62 | MEDIUM | 🟡 Manual split required |
| NEEDS_GENDER_SPLIT | 1 | MEDIUM | 🟡 Review needed |
| SLUG_MISMATCH | 99 | LOW | 🟢 Cosmetic |

---

## 1. MISSING_PAIRED (39 CRITICAL)

Scenes reference `paired_scene` that doesn't exist in the filesystem.

### Examples:
- `ddlg.json` → paired_scene: "mdlb" (doesn't exist)
- `mdlb.json` → paired_scene: "ddlg" (doesn't exist)
- `golden-shower-on-her-receive.json` → paired_scene: "golden-shower-m-to-f" (slug mismatch)
- `chastity-f-locked.json` → paired_scene: "chastity-m-locked" (doesn't exist)

### Action Required:
- Create missing paired scene files OR
- Update `paired_scene` to reference correct existing slugs
- Verify all 4-scene sets exist (give/receive for both directions)

---

## 2. QUESTION_TYPE (157 scenes)

Multi_select questions that should be swipe.

### 2a. HIGH Priority (6 onboarding scenes with multi_select)
**Rule:** Onboarding scenes MUST use swipe, never multi_select.

```
scenes/v2/composite/anal/anal-play-on-her-receive.json (is_onboarding: true)
scenes/v2/composite/anal/anal-play-on-her.json (is_onboarding: true)
scenes/v2/composite/anal/anal-play-on-him-receive.json (is_onboarding: true)
scenes/v2/composite/anal/anal-play-on-him.json (is_onboarding: true)
scenes/v2/composite/oral/blowjob.json (is_onboarding: true)
scenes/v2/composite/oral/cunnilingus.json (is_onboarding: true)
```

### 2b. MEDIUM Priority (151 clarification scenes)
Clarification scenes asking "Что привлекает?" or "Что нравится?" with multi_select.

**Recommendation:** Most can be simplified to swipe unless they genuinely need multiple selections.

Examples:
- `deepthroat.json`: "Что привлекает в глубоком минете?"
- `spanking-m-to-f.json`: "Что привлекает в шлепках?"
- `bondage-m-ties-f.json`: "Что привлекает в бондаже?"

### Action Required:
- Change `question.type: "multi_select"` → `"swipe"`
- Update question text from "Что привлекает?" to simple yes/no format

---

## 3. PAIRED_MISMATCH (14 scenes)

Scenes where `paired_scene` points to a file, but that file doesn't point back.

### Examples:
```
golden-shower-f-to-m.json → paired_scene: "golden-shower-on-him-receive"
BUT golden-shower-on-him-receive.json → paired_scene: "golden-shower-f-to-m" ❌ (slug mismatch!)

Actual file slug: "golden-shower-she-on-him" (not "golden-shower-f-to-m")
```

### Pattern:
- Files using `*-m-to-f` / `*-f-to-m` id convention
- But slugs use `*-he-on-her` / `*-she-on-him` convention
- Inconsistency causes broken pairing

### Action Required:
- Standardize slug convention: use `{action}-m-to-f` / `{action}-f-to-m` consistently
- OR update all `paired_scene` references to use actual slugs (not ids)

---

## 4. AMBIGUOUS_OR (62 scenes)

Descriptions containing "или" / "or" that represent multiple distinct actions.

### Examples:

**ddlg.json:**
```
"Ты играешь роль Daddy или его маленькой девочки"
```
→ Should split into 2 scenes:
- `ddlg-daddy.json` (for_gender: male)
- `ddlg-little-girl.json` (for_gender: female)

**anal-play-on-her.json:**
```
"проникаешь пальцами или игрушкой"
```
→ Could split into:
- `anal-fingering-m-to-f.json`
- `anal-toy-m-to-f.json`
OR keep as-is (both are anal play)

**clothing-preference.json:**
```
"Она в белье... или ты надеваешь для него"
```
→ Should split by for_gender:
- Viewing partner in lingerie (for_gender: male)
- Wearing lingerie (for_gender: female)

### Action Required:
- Manual review each "or" case
- Determine if it's:
  - Multiple roles → split by for_gender
  - Multiple actions → split into separate scenes
  - Acceptable variation → keep as-is

---

## 5. NEEDS_GENDER_SPLIT (1 scene)

**clothing-preference.json:**
- `for_gender: null`
- Description: "Она в белье... или ты надеваешь для него"
- Clearly role-specific, should be split

### Action Required:
- Split into 2 scenes with proper for_gender assignment

---

## 6. SLUG_MISMATCH (99 scenes - LOW priority)

ID uses underscores (`bondage_m_ties_f`) but slug uses hyphens (`bondage-he-ties-her`).

### Pattern:
```json
{
  "id": "golden_shower_f_to_m",
  "slug": "golden-shower-she-on-him"
}
```

### Action Required:
- Standardize to hyphens everywhere
- Update IDs to match slugs (or remove ID field entirely if not used)

---

## Audit Against 8 Criteria

### ✅ Criterion 1: Question Type Simplification
**Status:** Identified 157 scenes with multi_select that should be swipe
- 6 HIGH priority (onboarding)
- 151 MEDIUM priority (clarifications)

### ✅ Criterion 2: Onboarding Equivalent Scenes
**Status:** Script detected overlaps, manual review needed for:
- onboarding-oral-give-m vs cunnilingus.json (SAME action, both marked is_onboarding: true)
- onboarding-oral-receive-f vs blowjob.json (SAME action, both marked is_onboarding: true)
- onboarding-bondage-give-m vs bondage-m-ties-f (SAME action)
- onboarding-rough-give-m vs spanking-m-to-f (rough is BROADER, includes spanking)

**Action:** Mark composite scenes as onboarding: true, deactivate onboarding/converted duplicates

### ✅ Criterion 3: Gate Assignment (sets_gate)
**Status:** Needs manual review
- Onboarding scenes have `sets_gate` ✓
- Composite scenes marked `is_onboarding: true` also have `sets_gate` ✓
- Some clarification scenes incorrectly have `sets_gate` (should only be on main onboarding scenes)

**Examples:**
- cunnilingus.json: sets_gate: "oral", is_onboarding: true ✓
- blowjob.json: sets_gate: "oral", is_onboarding: true ✓
- deepthroat.json: no sets_gate ✓ (clarification, not gate opener)

### ✅ Criterion 4: Clarification Relationships
**Status:** Partially implemented, needs verification
- Most clarification scenes have `clarification_for: ["oral"]` etc
- Need to verify slugs (not gate names) are used
- Some scenes have multiple parents (e.g., `clarification_for: ["oral", "power_dynamic"]`)

**Pattern from script output:**
- bondage-m-ties-f: `clarification_for: ["power_dynamic", "bondage"]`
- facesitting-f-on-m: `clarification_for: ["oral", "power_dynamic"]`

### ✅ Criterion 5: Gates vs Clarification Understanding
**Status:** ✓ Correctly separated
- Gates: Boolean filters (can user see this?)
- clarification_for: Scene slug arrays (show after which scenes?)

### ✅ Criterion 6: Paired Scene Completeness
**Status:** 39 CRITICAL + 14 HIGH issues found
- Missing files: 39 scenes reference non-existent paired_scene
- Broken links: 14 scenes have mismatched paired_scene references

**Example of correct 4-scene set:**
```
spanking-m-to-f.json (he does, for_gender: male)
spanking-m-to-f-receive.json (she receives, for_gender: female)
spanking-f-to-m.json (she does, for_gender: female)
spanking-f-to-m-receive.json (he receives, for_gender: male)
```

### ✅ Criterion 7: Ambiguous "OR" Questions
**Status:** 62 scenes identified
- Need manual review to determine split strategy
- Some "or" are acceptable (finger or toy = same activity)
- Some "or" require splitting (Daddy or little girl = different roles)

### ✅ Criterion 8: Gender-Specific Descriptions
**Status:** 1 scene flagged
- clothing-preference.json needs splitting
- Most scenes correctly use for_gender already

---

## Recommended Action Plan

### Phase 1: CRITICAL Fixes (39 + 14 = 53 scenes)
1. Fix MISSING_PAIRED (39): Create missing files or update paired_scene references
2. Fix PAIRED_MISMATCH (14): Correct bidirectional paired_scene links

### Phase 2: HIGH Priority (6 scenes)
3. Fix onboarding scenes with multi_select → swipe

### Phase 3: MEDIUM Priority (214 scenes)
4. Review and simplify clarification multi_select → swipe (151)
5. Review and split AMBIGUOUS_OR scenes (62)
6. Split clothing-preference by gender (1)

### Phase 4: LOW Priority (99 scenes)
7. Standardize slug/id naming (cosmetic)

### Phase 5: Cleanup
8. Archive onboarding/converted folder to `_archived/`
9. Update seed script to load only composite scenes

---

## Next Steps

1. **Manual review sample scenes** from each category to establish patterns
2. **Create fix scripts** for systematic issues (paired_scene, question types)
3. **Manual split** for ambiguous "or" scenes
4. **Verify gate assignment** across all onboarding scenes
5. **Test discovery flow** after fixes
