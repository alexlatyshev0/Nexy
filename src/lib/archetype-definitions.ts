/**
 * Archetype definitions using REAL tag_refs from scenes.
 *
 * Tags are grouped by prefix to match actual data in tag_preferences.
 * Algorithm checks if user has ANY tag starting with prefix and interest_level > threshold.
 */

export interface ArchetypeDefinition {
  id: string;
  name: { ru: string; en: string };
  description: { ru: string; en: string };
  indicators: {
    /** Tag prefixes that indicate this archetype (e.g., "bondage_" matches bondage_material, bondage_parts) */
    high?: string[];
    moderate?: string[];
    /** Tag prefixes that contradict this archetype */
    low?: string[];
    /** Role pattern: 'give', 'receive', 'balanced' */
    rolePattern?: 'give' | 'receive' | 'balanced';
  };
  intensityRange: [number, number];
}

/**
 * Tag prefixes mapped to archetype categories.
 * These match actual tag_ref values in the database.
 */
export const TAG_PREFIXES = {
  // Power dynamics
  bondage: ['bondage_', 'blindfold_'],
  collar: ['collar_', 'ownership_', 'leash'],
  control: ['edging_', 'orgasm_control_', 'forced_o_', 'chastity_'],
  freeUse: ['free_use_'],

  // Pain/Impact
  spanking: ['spanking_', 'impact_', 'casual_ass_slap'],
  wax: ['wax_'],
  nipplePlay: ['nipple_', 'clamps_'],
  cbt: ['cbt_'],

  // Verbal
  degradation: ['degradation_', 'sph', 'verbal_humiliation'],
  praise: ['praise_'],
  dirtyTalk: ['verbal_', 'talk_'],

  // Primal/CNC
  primal: ['primal_'],
  cnc: ['cnc_', 'somno'],
  choking: ['choking_', 'breath_'],

  // Romantic/Sensual
  romantic: ['romantic_', 'eye_contact', 'massage_'],
  aftercare: ['aftercare_'],

  // Exhibitionism/Voyeurism
  exhib: ['exhib_', 'public_', 'filming_'],
  voyeur: ['voyeur_', 'watching_'],

  // Worship/Service
  worship: ['worship_', 'cock_worship', 'pussy_worship', 'foot_worship', 'foot_activities'],
  service: ['service_'],
  pet: ['pet_'],

  // Group/Sharing
  cuckold: ['cuckold_'],
  hotwife: ['hotwife_', 'stag_', 'vixen_'],
  group: ['group_', 'threesome', 'orgy_', 'mfm_', 'fmf_', 'swing_', 'gb_'],

  // Fetishes
  latex: ['fetish_material', 'latex', 'harness_'],
  feet: ['foot_'],
  lingerie: ['lingerie_', 'stocking_'],

  // Roleplay
  roleplay: ['roleplay_', 'teacher_', 'boss_', 'doctor_', 'uniform_'],
  ageplay: ['ddlg_', 'mdlb_', 'daddy_', 'mommy_', 'little_space'],

  // Anal
  anal: ['anal_', 'rimming_', 'pegging_', 'plug_', 'prostate_'],

  // Oral
  oral: ['oral_', 'blowjob_', 'cunnilingus_', 'facesitting_', 'throat_'],
} as const;

export const ARCHETYPES: ArchetypeDefinition[] = [
  // ===== ROMANTIC =====
  {
    id: 'romantic_lover',
    name: { ru: 'Романтик', en: 'Romantic Lover' },
    description: {
      ru: 'Ценит эмоциональную связь, нежность и интимность',
      en: 'Values emotional connection, tenderness, and intimacy',
    },
    indicators: {
      high: ['romantic_', 'aftercare_', 'eye_contact', 'massage_'],
      low: ['degradation_', 'impact_', 'primal_'],
    },
    intensityRange: [1, 2],
  },

  // ===== DOMINANT =====
  {
    id: 'dominant',
    name: { ru: 'Доминант', en: 'Dominant' },
    description: {
      ru: 'Предпочитает контроль, направление и власть',
      en: 'Prefers control, direction, and power',
    },
    indicators: {
      high: ['bondage_', 'collar_', 'edging_', 'orgasm_control_', 'spanking_'],
      moderate: ['degradation_', 'free_use_', 'ownership_'],
      rolePattern: 'give',
    },
    intensityRange: [3, 5],
  },

  // ===== SUBMISSIVE =====
  {
    id: 'submissive',
    name: { ru: 'Сабмиссив', en: 'Submissive' },
    description: {
      ru: 'Получает удовольствие от подчинения и отдачи контроля',
      en: 'Enjoys submission and surrendering control',
    },
    indicators: {
      high: ['bondage_', 'collar_', 'chastity_', 'service_'],
      moderate: ['worship_', 'pet_', 'free_use_'],
      rolePattern: 'receive',
    },
    intensityRange: [2, 5],
  },

  // ===== SWITCH =====
  {
    id: 'switch',
    name: { ru: 'Свитч', en: 'Switch' },
    description: {
      ru: 'Наслаждается обеими ролями — доминирования и подчинения',
      en: 'Enjoys both dominant and submissive roles',
    },
    indicators: {
      high: ['bondage_', 'spanking_'],
      rolePattern: 'balanced',
    },
    intensityRange: [2, 5],
  },

  // ===== SADIST =====
  {
    id: 'sadist',
    name: { ru: 'Садист', en: 'Sadist' },
    description: {
      ru: 'Получает удовольствие от причинения консенсуальной боли',
      en: 'Derives pleasure from inflicting consensual pain',
    },
    indicators: {
      high: ['spanking_', 'impact_', 'wax_', 'cbt_'],
      moderate: ['nipple_', 'clamps_', 'primal_marks'],
      rolePattern: 'give',
    },
    intensityRange: [3, 5],
  },

  // ===== MASOCHIST =====
  {
    id: 'masochist',
    name: { ru: 'Мазохист', en: 'Masochist' },
    description: {
      ru: 'Получает удовольствие от получения боли',
      en: 'Derives pleasure from receiving pain',
    },
    indicators: {
      high: ['spanking_', 'impact_', 'wax_', 'pain_'],
      moderate: ['nipple_', 'clamps_'],
      rolePattern: 'receive',
    },
    intensityRange: [3, 5],
  },

  // ===== PRIMAL =====
  {
    id: 'primal',
    name: { ru: 'Примал', en: 'Primal' },
    description: {
      ru: 'Привлекает животная страсть, инстинкты, физическая интенсивность',
      en: 'Drawn to animal passion, instincts, physical intensity',
    },
    indicators: {
      high: ['primal_', 'cnc_', 'choking_'],
      moderate: ['spanking_', 'breath_'],
    },
    intensityRange: [3, 5],
  },

  // ===== EXHIBITIONIST =====
  {
    id: 'exhibitionist',
    name: { ru: 'Эксгибиционист', en: 'Exhibitionist' },
    description: {
      ru: 'Возбуждается от того, что на него смотрят или могут увидеть',
      en: 'Aroused by being watched or risk of being seen',
    },
    indicators: {
      high: ['exhib_', 'public_', 'filming_'],
      moderate: ['strip_'],
    },
    intensityRange: [2, 4],
  },

  // ===== VOYEUR =====
  {
    id: 'voyeur',
    name: { ru: 'Вуайерист', en: 'Voyeur' },
    description: {
      ru: 'Возбуждается от наблюдения за другими',
      en: 'Aroused by watching others',
    },
    indicators: {
      high: ['voyeur_', 'watching_', 'cuckold_'],
    },
    intensityRange: [2, 4],
  },

  // ===== SENSUALIST =====
  {
    id: 'sensualist',
    name: { ru: 'Сенсуалист', en: 'Sensualist' },
    description: {
      ru: 'Фокус на физических ощущениях, текстурах, температуре',
      en: 'Focused on physical sensations, textures, temperature',
    },
    indicators: {
      high: ['massage_', 'blindfold_', 'wax_', 'ice_', 'temperature_'],
      moderate: ['romantic_'],
    },
    intensityRange: [2, 4],
  },

  // ===== BRAT =====
  {
    id: 'brat',
    name: { ru: 'Брат', en: 'Brat' },
    description: {
      ru: 'Любит игривое неподчинение и "заслуживать" наказание',
      en: 'Enjoys playful defiance and "earning" punishment',
    },
    indicators: {
      high: ['spanking_', 'primal_'],
      moderate: ['cnc_resistance'],
      rolePattern: 'receive',
    },
    intensityRange: [2, 4],
  },

  // ===== CUCKOLD =====
  {
    id: 'cuckold',
    name: { ru: 'Куколд', en: 'Cuckold' },
    description: {
      ru: 'Возбуждается от того, что партнёрша с другими',
      en: 'Aroused by partner being with others',
    },
    indicators: {
      high: ['cuckold_', 'hotwife_'],
      moderate: ['voyeur_', 'degradation_cuckold'],
    },
    intensityRange: [3, 5],
  },

  // ===== PERFORMER =====
  {
    id: 'performer',
    name: { ru: 'Перформер', en: 'Performer' },
    description: {
      ru: 'Любит перевоплощаться, играть роли, создавать сценарии',
      en: 'Loves transformation, playing roles, creating scenarios',
    },
    indicators: {
      high: ['roleplay_', 'uniform_', 'teacher_', 'boss_'],
      moderate: ['exhib_', 'strip_'],
    },
    intensityRange: [2, 4],
  },

  // ===== SERVICE =====
  {
    id: 'service_oriented',
    name: { ru: 'Сервисный', en: 'Service Oriented' },
    description: {
      ru: 'Получает удовольствие от служения и заботы о партнёре',
      en: 'Derives pleasure from serving and caring for partner',
    },
    indicators: {
      high: ['service_', 'worship_', 'massage_'],
      moderate: ['aftercare_', 'pet_'],
      rolePattern: 'give',
    },
    intensityRange: [2, 4],
  },

  // ===== PET =====
  {
    id: 'pet',
    name: { ru: 'Питомец', en: 'Pet' },
    description: {
      ru: 'Наслаждается ролью питомца, уход от взрослых забот',
      en: 'Enjoys the pet role, escape from adult concerns',
    },
    indicators: {
      high: ['pet_', 'collar_'],
      moderate: ['praise_', 'service_'],
    },
    intensityRange: [2, 4],
  },

  // ===== EXPLORER =====
  {
    id: 'explorer',
    name: { ru: 'Исследователь', en: 'Explorer' },
    description: {
      ru: 'Любопытен и открыт ко всему новому',
      en: 'Curious and open to everything new',
    },
    indicators: {
      high: ['openness_', 'fantasy_'],
      moderate: ['roleplay_', 'toys_'],
    },
    intensityRange: [2, 4],
  },
];

/**
 * Check if a tag matches any of the given prefixes.
 */
export function tagMatchesPrefixes(tagRef: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => tagRef.startsWith(prefix) || tagRef === prefix);
}
