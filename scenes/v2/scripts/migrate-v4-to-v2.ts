/**
 * Migration script: v4 scenes → v2 composite scenes
 *
 * Maps old granular scene responses to new composite structure
 */

// v4 scene ID → v2 composite scene mapping
export const V4_TO_V2_MAPPING: Record<string, {
  v2Scene: string;
  element?: string;
  followUp?: string;
  value?: string;
}> = {
  // === ORAL ===
  "scene_025": { v2Scene: "oral/blowjob" },
  "scene_026": { v2Scene: "oral/blowjob", element: "depth", value: "deepthroat" },
  "scene_027": { v2Scene: "oral/cunnilingus" },
  "scene_028": { v2Scene: "oral/facesitting-f-on-m" },
  "scene_029": { v2Scene: "oral/facesitting-m-on-f" },
  "scene_030": { v2Scene: "oral/rimming-m-to-f" },
  "scene_031": { v2Scene: "oral/rimming-f-to-m" },

  // === IMPACT ===
  "scene_041": { v2Scene: "impact-pain/spanking-m-to-f", element: "intensity", value: "light" },
  "scene_042": { v2Scene: "impact-pain/spanking-m-to-f", element: "intensity", value: "hard" },
  "scene_043": { v2Scene: "impact-pain/spanking-f-to-m" },
  "scene_044": { v2Scene: "impact-pain/spanking-m-to-f", element: "implement", value: "paddle" },
  "scene_045": { v2Scene: "impact-pain/spanking-m-to-f", element: "implement", value: "belt" },
  "scene_051": { v2Scene: "cnc-rough/primal", element: "actions", value: "biting" },
  "scene_052": { v2Scene: "cnc-rough/primal", element: "marks", value: "any" },
  "scene_053": { v2Scene: "impact-pain/choking-m-to-f" },
  "scene_054": { v2Scene: "impact-pain/choking-f-to-m" },
  "scene_055": { v2Scene: "sensory/ice-play" },
  "scene_057": { v2Scene: "impact-pain/wax-play-m-to-f" },
  "scene_058": { v2Scene: "impact-pain/wax-play-f-to-m" },

  // === BONDAGE ===
  "scene_061": { v2Scene: "control-power/bondage-m-ties-f", element: "type", value: "hands" },
  "scene_062": { v2Scene: "control-power/bondage-m-ties-f", element: "type", value: "full" },
  "scene_063": { v2Scene: "control-power/bondage-f-ties-m" },
  "scene_064": { v2Scene: "sensory/blindfold" },

  // === ANAL ===
  "scene_071": { v2Scene: "anal/anal-play-on-her", element: "type", value: "finger" },
  "scene_072": { v2Scene: "anal/anal-play-on-her", element: "type", value: "plug" },
  "scene_073": { v2Scene: "anal/anal-play-on-her", element: "type", value: "full" },
  "scene_074": { v2Scene: "anal/anal-play-on-him" },
  "scene_075": { v2Scene: "anal/pegging" },

  // === BODY FLUIDS ===
  "scene_081": { v2Scene: "body-fluids/cum-where-to-finish", element: "where", value: "face" },
  "scene_082": { v2Scene: "body-fluids/cum-where-to-finish", element: "where", value: "chest" },
  "scene_083": { v2Scene: "body-fluids/cum-where-to-finish", element: "where", value: "inside" },
  "scene_084": { v2Scene: "body-fluids/cum-where-to-finish", element: "where", value: "mouth" },
  "scene_201": { v2Scene: "body-fluids/golden-shower-m-to-f" },
  "scene_202": { v2Scene: "body-fluids/golden-shower-f-to-m" },
  "scene_281": { v2Scene: "body-fluids/squirting" },

  // === VERBAL ===
  "scene_109": { v2Scene: "verbal/dirty-talk" },
  "scene_110": { v2Scene: "verbal/dirty-talk" },
  "scene_111": { v2Scene: "verbal/dirty-talk", element: "type", value: "begging" },
  "scene_114": { v2Scene: "verbal/degradation-m-to-f" },
  "scene_115": { v2Scene: "verbal/degradation-m-to-f", element: "type", value: "body_writing" },

  // === ROLEPLAY ===
  "scene_121": { v2Scene: "roleplay/boss-secretary" },
  "scene_122": { v2Scene: "roleplay/stranger" },
  "scene_123": { v2Scene: "roleplay/teacher-student" },
  "scene_124": { v2Scene: "roleplay/doctor-patient" },
  "scene_125": { v2Scene: "roleplay/service-roleplay", element: "role", value: "maid" },
  "scene_126": { v2Scene: "roleplay/service-roleplay", element: "role", value: "nurse" },

  // === GROUP ===
  "scene_073_threesome_fmf": { v2Scene: "group/threesome-fmf" },
  "scene_074_threesome_mfm": { v2Scene: "group/threesome-mfm" },
  "scene_131": { v2Scene: "group/gangbang" },
  "scene_132": { v2Scene: "group/orgy" },
  "scene_133": { v2Scene: "group/swinging" },

  // === EXHIBITIONISM ===
  "scene_101": { v2Scene: "exhibitionism/exhibitionism" },
  "scene_102": { v2Scene: "exhibitionism/voyeurism" },
  "scene_305": { v2Scene: "exhibitionism/public-sex" },

  // === PET PLAY ===
  "scene_319": { v2Scene: "pet-play/pet-play-f-is-pet" },
  "scene_320": { v2Scene: "pet-play/pet-play-m-is-pet" },

  // === CHASTITY ===
  "scene_313": { v2Scene: "chastity/chastity-m-locked" },
  "scene_318": { v2Scene: "chastity/chastity-f-locked" },

  // === ROMANTIC/PACE ===
  "scene_481": { v2Scene: "romantic/romantic-sex", element: "pace", value: "lazy_morning" },
  "scene_485": { v2Scene: "romantic/quickie" },
  "scene_488": { v2Scene: "romantic/aftercare" },
  "scene_498": { v2Scene: "romantic/romantic-sex" },

  // === CUCKOLD ===
  "scene_141": { v2Scene: "cuckold/cuckold" },
  "scene_142": { v2Scene: "cuckold/hotwife" },

  // === TOYS ===
  "scene_297": { v2Scene: "toys/remote-control" },
  "scene_298": { v2Scene: "toys/vibrator" },

  // === EXTREME ===
  "scene_electrostim": { v2Scene: "sensory/electrostim" },
  "scene_needle": { v2Scene: "extreme/needle-play" },
  "scene_mummification": { v2Scene: "extreme/mummification" },
};

// Tag-based fallback mapping
export const TAG_TO_V2_MAPPING: Record<string, string> = {
  "spanking": "impact-pain/spanking-m-to-f",
  "choking": "impact-pain/choking-m-to-f",
  "breath_play": "impact-pain/choking-m-to-f",
  "wax": "impact-pain/wax-play-m-to-f",
  "bondage": "control-power/bondage-m-ties-f",
  "blindfold": "sensory/blindfold",
  "ice": "sensory/ice-play",
  "oral": "oral/blowjob",
  "cunnilingus": "oral/cunnilingus",
  "deepthroat": "oral/deepthroat",
  "facesitting": "oral/facesitting-f-on-m",
  "rimming": "oral/rimming-m-to-f",
  "anal": "anal/anal-play-on-her",
  "pegging": "anal/pegging",
  "cum": "body-fluids/cum-where-to-finish",
  "golden_shower": "body-fluids/golden-shower-m-to-f",
  "squirting": "body-fluids/squirting",
  "dirty_talk": "verbal/dirty-talk",
  "praise": "verbal/praise-m-to-f",
  "degradation": "verbal/degradation-m-to-f",
  "roleplay": "roleplay/stranger",
  "maid": "roleplay/service-roleplay",
  "nurse": "roleplay/service-roleplay",
  "threesome": "group/threesome-fmf",
  "gangbang": "group/gangbang",
  "exhibitionism": "exhibitionism/exhibitionism",
  "voyeurism": "exhibitionism/voyeurism",
  "public": "exhibitionism/public-sex",
  "pet_play": "pet-play/pet-play-f-is-pet",
  "chastity": "chastity/chastity-m-locked",
  "cuckold": "cuckold/cuckold",
  "hotwife": "cuckold/hotwife",
  "primal": "cnc-rough/primal",
  "cnc": "cnc-rough/cnc-m-takes-f",
  "aftercare": "romantic/aftercare",
  "romantic": "romantic/romantic-sex",
  "latex": "clothing/latex-leather",
  "leather": "clothing/latex-leather",
  "lingerie": "clothing/lingerie",
  "foot_worship": "worship-service/foot-worship-m-to-f",
  "massage": "massage/massage-m-to-f",
  "ddlg": "age-play/ddlg",
  "electrostim": "sensory/electrostim",
};

interface V4Response {
  sceneId: string;
  response: "yes" | "maybe" | "no";
  experience?: boolean;
  details?: string[];
}

interface V2MigratedResponse {
  sceneSlug: string;
  interest: "yes" | "maybe" | "no";
  elements?: Record<string, string | string[]>;
}

/**
 * Migrate a single v4 response to v2 format
 */
export function migrateV4Response(v4Response: V4Response): V2MigratedResponse | null {
  const mapping = V4_TO_V2_MAPPING[v4Response.sceneId];

  if (!mapping) {
    console.warn(`No mapping found for v4 scene: ${v4Response.sceneId}`);
    return null;
  }

  const result: V2MigratedResponse = {
    sceneSlug: mapping.v2Scene,
    interest: v4Response.response,
  };

  // Add element/follow-up data if available
  if (mapping.element && mapping.value) {
    result.elements = {
      [mapping.element]: mapping.value,
    };
  }

  return result;
}

/**
 * Migrate all v4 responses to v2 format
 */
export function migrateAllResponses(
  v4Responses: V4Response[]
): V2MigratedResponse[] {
  const migrated: V2MigratedResponse[] = [];
  const sceneInterests: Record<string, V2MigratedResponse> = {};

  for (const v4Response of v4Responses) {
    const result = migrateV4Response(v4Response);
    if (!result) continue;

    // Merge with existing if same scene
    const existing = sceneInterests[result.sceneSlug];
    if (existing) {
      // Keep highest interest level
      if (result.interest === "yes" || existing.interest === "no") {
        existing.interest = result.interest;
      }
      // Merge elements
      if (result.elements) {
        existing.elements = { ...existing.elements, ...result.elements };
      }
    } else {
      sceneInterests[result.sceneSlug] = result;
    }
  }

  return Object.values(sceneInterests);
}

/**
 * Find v2 scene by tag (fallback)
 */
export function findV2SceneByTag(tag: string): string | null {
  return TAG_TO_V2_MAPPING[tag] || null;
}
