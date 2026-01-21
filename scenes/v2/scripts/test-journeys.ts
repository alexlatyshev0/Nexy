/**
 * Test User Journeys
 *
 * Predefined user response patterns for testing the discovery flow
 * Each journey represents a different archetype
 */

import { BodyMapResponse, UserResponse } from './flow-engine';

export interface TestJourney {
  id: string;
  name: string;
  description: string;
  expectedArchetype: string;
  bodyMapResponses: BodyMapResponse[];
  sceneResponses: {
    sceneId: string;
    liked: boolean;
    rating?: number;
    elementsSelected: string[];
  }[];
  expectedTags: string[];
  expectedIntensity: number;
}

// ============================================
// TEST JOURNEYS
// ============================================

export const testJourneys: TestJourney[] = [
  // Journey 1: Romantic Lover
  {
    id: 'romantic_lover',
    name: 'Romantic Lover Journey',
    description: 'User who prefers gentle, sensual, intimate experiences',
    expectedArchetype: 'romantic_lover',
    bodyMapResponses: [
      // Kissing - many zones, both give and receive
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'neck', 'ears', 'chest'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'neck', 'shoulders', 'back'] },
      // Light touch - extensive
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['face', 'hair', 'neck', 'back', 'arms', 'hands'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['face', 'neck', 'back', 'shoulders', 'chest'] },
      // No impact zones
      { activityId: 'light_slapping', pass: 'give', zonesSelected: [] },
      { activityId: 'light_slapping', pass: 'receive', zonesSelected: [] },
      { activityId: 'spanking', pass: 'give', zonesSelected: [] },
      { activityId: 'spanking', pass: 'receive', zonesSelected: [] },
    ],
    sceneResponses: [
      { sceneId: 'romantic_sex', liked: true, rating: 5, elementsSelected: ['eye_contact', 'slow', 'music'] },
      { sceneId: 'massage_m_to_f', liked: true, rating: 5, elementsSelected: ['full_body', 'oil'] },
      { sceneId: 'aftercare', liked: true, rating: 5, elementsSelected: ['cuddling', 'talking', 'food'] },
      { sceneId: 'spanking_m_to_f', liked: false, rating: 1, elementsSelected: [] },
      { sceneId: 'bondage_m_ties_f', liked: false, rating: 2, elementsSelected: [] },
      { sceneId: 'praise_m_to_f', liked: true, rating: 4, elementsSelected: ['gentle', 'loving'] },
      { sceneId: 'blindfold', liked: true, rating: 3, elementsSelected: ['sensory'] },
    ],
    expectedTags: ['romantic', 'sensual', 'intimate', 'massage', 'aftercare'],
    expectedIntensity: 1.5,
  },

  // Journey 2: Dominant Male
  {
    id: 'dominant_male',
    name: 'Dominant Male Journey',
    description: 'User who prefers being in control, giving discipline',
    expectedArchetype: 'dominant',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'neck'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips'] },
      { activityId: 'light_slapping', pass: 'give', zonesSelected: ['face', 'buttocks', 'thighs'] },
      { activityId: 'light_slapping', pass: 'receive', zonesSelected: [] },
      { activityId: 'spanking', pass: 'give', zonesSelected: ['buttocks', 'thighs'] },
      { activityId: 'spanking', pass: 'receive', zonesSelected: [] },
      { activityId: 'biting', pass: 'give', zonesSelected: ['neck', 'shoulders', 'inner_thighs'] },
      { activityId: 'biting', pass: 'receive', zonesSelected: [] },
    ],
    sceneResponses: [
      { sceneId: 'spanking_m_to_f', liked: true, rating: 5, elementsSelected: ['otk', 'hand', 'implements'] },
      { sceneId: 'bondage_m_ties_f', liked: true, rating: 5, elementsSelected: ['rope', 'cuffs', 'blindfold'] },
      { sceneId: 'collar_m_owns_f', liked: true, rating: 4, elementsSelected: ['daily', 'leash'] },
      { sceneId: 'degradation_m_to_f', liked: true, rating: 4, elementsSelected: ['name_calling', 'position'] },
      { sceneId: 'praise_m_to_f', liked: true, rating: 4, elementsSelected: ['good_girl', 'rewards'] },
      { sceneId: 'edging_m_to_f', liked: true, rating: 5, elementsSelected: ['denial', 'begging'] },
      { sceneId: 'spanking_f_to_m', liked: false, rating: 1, elementsSelected: [] },
      { sceneId: 'collar_f_owns_m', liked: false, rating: 1, elementsSelected: [] },
    ],
    expectedTags: ['dominant', 'spanking', 'bondage', 'discipline', 'control'],
    expectedIntensity: 3.5,
  },

  // Journey 3: Submissive Female
  {
    id: 'submissive_female',
    name: 'Submissive Female Journey',
    description: 'User who prefers receiving, surrendering control',
    expectedArchetype: 'submissive',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'neck', 'ears', 'inner_thighs'] },
      { activityId: 'light_slapping', pass: 'give', zonesSelected: [] },
      { activityId: 'light_slapping', pass: 'receive', zonesSelected: ['face', 'buttocks'] },
      { activityId: 'spanking', pass: 'give', zonesSelected: [] },
      { activityId: 'spanking', pass: 'receive', zonesSelected: ['buttocks', 'thighs'] },
      { activityId: 'biting', pass: 'give', zonesSelected: [] },
      { activityId: 'biting', pass: 'receive', zonesSelected: ['neck', 'shoulders', 'chest'] },
    ],
    sceneResponses: [
      { sceneId: 'spanking_m_to_f', liked: true, rating: 5, elementsSelected: ['otk', 'implements', 'marks'] },
      { sceneId: 'bondage_m_ties_f', liked: true, rating: 5, elementsSelected: ['helpless', 'rope', 'teased'] },
      { sceneId: 'collar_m_owns_f', liked: true, rating: 5, elementsSelected: ['owned', 'symbol', 'leash'] },
      { sceneId: 'choking_m_to_f', liked: true, rating: 4, elementsSelected: ['during_sex', 'control'] },
      { sceneId: 'degradation_m_to_f', liked: true, rating: 4, elementsSelected: ['name_calling', 'objectification'] },
      { sceneId: 'praise_m_to_f', liked: true, rating: 5, elementsSelected: ['good_girl', 'proud'] },
      { sceneId: 'aftercare', liked: true, rating: 5, elementsSelected: ['holding', 'blankets', 'water'] },
    ],
    expectedTags: ['submissive', 'masochist', 'bondage', 'discipline', 'praise'],
    expectedIntensity: 3.5,
  },

  // Journey 4: Submissive Male
  {
    id: 'submissive_male',
    name: 'Submissive Male Journey',
    description: 'Male user who prefers receiving, surrendering control to female',
    expectedArchetype: 'submissive',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'neck', 'ears', 'chest'] },
      { activityId: 'light_slapping', pass: 'give', zonesSelected: [] },
      { activityId: 'light_slapping', pass: 'receive', zonesSelected: ['face', 'chest'] },
      { activityId: 'spanking', pass: 'give', zonesSelected: [] },
      { activityId: 'spanking', pass: 'receive', zonesSelected: ['buttocks', 'thighs'] },
      { activityId: 'biting', pass: 'give', zonesSelected: [] },
      { activityId: 'biting', pass: 'receive', zonesSelected: ['neck', 'shoulders', 'chest'] },
      { activityId: 'licking', pass: 'give', zonesSelected: ['feet', 'genitals'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['neck'] },
    ],
    sceneResponses: [
      { sceneId: 'spanking_f_to_m', liked: true, rating: 5, elementsSelected: ['otk', 'implements', 'marks'] },
      { sceneId: 'bondage_f_ties_m', liked: true, rating: 5, elementsSelected: ['helpless', 'rope', 'teased'] },
      { sceneId: 'collar_f_owns_m', liked: true, rating: 5, elementsSelected: ['owned', 'symbol', 'leash'] },
      { sceneId: 'pegging', liked: true, rating: 4, elementsSelected: ['submission', 'trust'] },
      { sceneId: 'facesitting_f_on_m', liked: true, rating: 5, elementsSelected: ['worship', 'breath_control'] },
      { sceneId: 'foot_worship_m_to_f', liked: true, rating: 5, elementsSelected: ['kissing', 'massage', 'devotion'] },
      { sceneId: 'praise_f_to_m', liked: true, rating: 5, elementsSelected: ['good_boy', 'proud'] },
      { sceneId: 'degradation_f_to_m', liked: true, rating: 3, elementsSelected: ['name_calling'] },
      { sceneId: 'aftercare', liked: true, rating: 5, elementsSelected: ['holding', 'praise', 'water'] },
      { sceneId: 'spanking_m_to_f', liked: false, rating: 1, elementsSelected: [] },
      { sceneId: 'boss_secretary', liked: false, rating: 1, elementsSelected: [] },
    ],
    expectedTags: ['submissive', 'masochist', 'femdom', 'bondage', 'worship', 'service'],
    expectedIntensity: 3.5,
  },

  // Journey 5: Switch
  {
    id: 'switch',
    name: 'Switch Journey',
    description: 'User who enjoys both giving and receiving equally',
    expectedArchetype: 'switch',
    bodyMapResponses: [
      { activityId: 'spanking', pass: 'give', zonesSelected: ['buttocks', 'thighs'] },
      { activityId: 'spanking', pass: 'receive', zonesSelected: ['buttocks', 'thighs'] },
      { activityId: 'biting', pass: 'give', zonesSelected: ['neck', 'shoulders'] },
      { activityId: 'biting', pass: 'receive', zonesSelected: ['neck', 'shoulders'] },
      { activityId: 'light_slapping', pass: 'give', zonesSelected: ['face', 'buttocks'] },
      { activityId: 'light_slapping', pass: 'receive', zonesSelected: ['face', 'buttocks'] },
    ],
    sceneResponses: [
      { sceneId: 'spanking_m_to_f', liked: true, rating: 4, elementsSelected: ['otk'] },
      { sceneId: 'spanking_f_to_m', liked: true, rating: 4, elementsSelected: ['otk'] },
      { sceneId: 'bondage_m_ties_f', liked: true, rating: 4, elementsSelected: ['rope'] },
      { sceneId: 'bondage_f_ties_m', liked: true, rating: 4, elementsSelected: ['rope'] },
      { sceneId: 'collar_m_owns_f', liked: true, rating: 3, elementsSelected: [] },
      { sceneId: 'collar_f_owns_m', liked: true, rating: 3, elementsSelected: [] },
    ],
    expectedTags: ['switch', 'versatile', 'spanking', 'bondage'],
    expectedIntensity: 3,
  },

  // Journey 5: Primal
  {
    id: 'primal',
    name: 'Primal Journey',
    description: 'User drawn to animalistic, raw passion',
    expectedArchetype: 'primal',
    bodyMapResponses: [
      { activityId: 'biting', pass: 'give', zonesSelected: ['neck', 'shoulders', 'back', 'chest', 'inner_thighs'] },
      { activityId: 'biting', pass: 'receive', zonesSelected: ['neck', 'shoulders', 'back', 'chest'] },
      { activityId: 'light_slapping', pass: 'give', zonesSelected: ['face', 'buttocks'] },
      { activityId: 'light_slapping', pass: 'receive', zonesSelected: ['face', 'buttocks'] },
      { activityId: 'spanking', pass: 'give', zonesSelected: ['buttocks', 'thighs', 'back'] },
      { activityId: 'spanking', pass: 'receive', zonesSelected: ['buttocks', 'thighs'] },
    ],
    sceneResponses: [
      { sceneId: 'primal', liked: true, rating: 5, elementsSelected: ['chase', 'struggle', 'growling', 'biting'] },
      { sceneId: 'cnc_m_takes_f', liked: true, rating: 4, elementsSelected: ['struggle', 'pinned', 'rough'] },
      { sceneId: 'choking_m_to_f', liked: true, rating: 4, elementsSelected: ['intense', 'during'] },
      { sceneId: 'choking_m_to_f', liked: true, rating: 5, elementsSelected: ['control', 'position'] },
      { sceneId: 'torn_clothes', liked: true, rating: 4, elementsSelected: ['ripped', 'urgent'] },
      { sceneId: 'romantic_sex', liked: false, rating: 2, elementsSelected: [] },
    ],
    expectedTags: ['primal', 'biting', 'scratching', 'rough', 'marking'],
    expectedIntensity: 4,
  },

  // Journey 6: Sensualist
  {
    id: 'sensualist',
    name: 'Sensualist Journey',
    description: 'User focused on sensory experiences',
    expectedArchetype: 'sensualist',
    bodyMapResponses: [
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['face', 'neck', 'back', 'arms', 'hands', 'feet'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['face', 'neck', 'back', 'chest', 'thighs', 'feet'] },
      { activityId: 'licking', pass: 'give', zonesSelected: ['neck', 'nipples', 'stomach'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['neck', 'chest', 'inner_thighs'] },
    ],
    sceneResponses: [
      { sceneId: 'blindfold', liked: true, rating: 5, elementsSelected: ['anticipation', 'teasing', 'textures'] },
      { sceneId: 'ice_play', liked: true, rating: 5, elementsSelected: ['contrast', 'nipples', 'trail'] },
      { sceneId: 'feather_tickle', liked: true, rating: 5, elementsSelected: ['tickle', 'erogenous'] },
      { sceneId: 'massage_m_to_f', liked: true, rating: 5, elementsSelected: ['oil', 'slow', 'whole_body'] },
      { sceneId: 'wax_play_m_to_f', liked: true, rating: 4, elementsSelected: ['temperature', 'anticipation'] },
      { sceneId: 'electrostim', liked: true, rating: 3, elementsSelected: ['mild', 'teasing'] },
    ],
    expectedTags: ['sensory', 'blindfold', 'temperature', 'touch', 'massage'],
    expectedIntensity: 2.5,
  },

  // Journey 7: Exhibitionist
  {
    id: 'exhibitionist',
    name: 'Exhibitionist Journey',
    description: 'User aroused by being watched',
    expectedArchetype: 'exhibitionist',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'neck'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'neck'] },
    ],
    sceneResponses: [
      { sceneId: 'exhibitionism', liked: true, rating: 5, elementsSelected: ['window', 'hotel', 'thrill'] },
      { sceneId: 'public_sex', liked: true, rating: 5, elementsSelected: ['car', 'outdoor', 'risk'] },
      { sceneId: 'voyeurism', liked: true, rating: 3, elementsSelected: ['watching'] },
      { sceneId: 'threesome_fmf', liked: true, rating: 4, elementsSelected: ['center', 'watched'] },
      { sceneId: 'sexting', liked: true, rating: 4, elementsSelected: ['photos', 'video'] },
    ],
    expectedTags: ['exhibitionism', 'public_risk', 'thrill', 'being_watched'],
    expectedIntensity: 3,
  },

  // Journey 8: Service Submissive
  {
    id: 'service_sub',
    name: 'Service Submissive Journey',
    description: 'User who finds meaning in serving',
    expectedArchetype: 'submissive',
    bodyMapResponses: [
      { activityId: 'licking', pass: 'give', zonesSelected: ['feet', 'genitals', 'stomach'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: [] },
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'feet', 'hands'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips'] },
    ],
    sceneResponses: [
      { sceneId: 'foot_worship_m_to_f', liked: true, rating: 5, elementsSelected: ['kissing', 'massage', 'worship'] },
      { sceneId: 'body_worship_m_to_f', liked: true, rating: 5, elementsSelected: ['adoration', 'devotion'] },
      { sceneId: 'service_roleplay', liked: true, rating: 5, elementsSelected: ['butler', 'maid', 'waiting'] },
      { sceneId: 'collar_m_owns_f', liked: true, rating: 5, elementsSelected: ['owned', 'symbol'] },
      { sceneId: 'praise_m_to_f', liked: true, rating: 5, elementsSelected: ['good_pet', 'proud'] },
    ],
    expectedTags: ['service', 'worship', 'devotion', 'submission', 'foot_fetish'],
    expectedIntensity: 3,
  },

  // Journey 10: Dominant Female
  {
    id: 'dominant_female',
    name: 'Dominant Female Journey',
    description: 'Female user who prefers being in control, giving discipline',
    expectedArchetype: 'dominant',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'neck', 'chest'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips'] },
      { activityId: 'light_slapping', pass: 'give', zonesSelected: ['face', 'buttocks', 'chest'] },
      { activityId: 'light_slapping', pass: 'receive', zonesSelected: [] },
      { activityId: 'spanking', pass: 'give', zonesSelected: ['buttocks', 'thighs'] },
      { activityId: 'spanking', pass: 'receive', zonesSelected: [] },
      { activityId: 'biting', pass: 'give', zonesSelected: ['neck', 'shoulders', 'chest'] },
      { activityId: 'biting', pass: 'receive', zonesSelected: [] },
    ],
    sceneResponses: [
      { sceneId: 'spanking_f_to_m', liked: true, rating: 5, elementsSelected: ['otk', 'hand', 'implements'] },
      { sceneId: 'bondage_f_ties_m', liked: true, rating: 5, elementsSelected: ['rope', 'cuffs', 'helpless'] },
      { sceneId: 'collar_f_owns_m', liked: true, rating: 5, elementsSelected: ['daily', 'leash', 'ownership'] },
      { sceneId: 'pegging', liked: true, rating: 4, elementsSelected: ['control', 'his_pleasure'] },
      { sceneId: 'facesitting_f_on_m', liked: true, rating: 5, elementsSelected: ['control', 'worship', 'pleasure'] },
      { sceneId: 'degradation_f_to_m', liked: true, rating: 4, elementsSelected: ['name_calling', 'humiliation'] },
      { sceneId: 'edging_f_to_m', liked: true, rating: 5, elementsSelected: ['denial', 'begging', 'control'] },
      { sceneId: 'chastity_m_locked', liked: true, rating: 4, elementsSelected: ['cage', 'denial'] },
      { sceneId: 'spanking_m_to_f', liked: false, rating: 1, elementsSelected: [] },
      { sceneId: 'collar_m_owns_f', liked: false, rating: 1, elementsSelected: [] },
    ],
    expectedTags: ['dominant', 'femdom', 'control', 'discipline', 'edging'],
    expectedIntensity: 3.5,
  },

  // Journey 11: Experimenter / Curious
  {
    id: 'experimenter',
    name: 'Experimenter Journey',
    description: 'User who is curious and open to trying many things',
    expectedArchetype: 'explorer',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'neck', 'ears', 'chest', 'stomach'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'neck', 'ears', 'chest'] },
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['face', 'neck', 'back', 'thighs'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['face', 'neck', 'back', 'thighs'] },
      { activityId: 'light_slapping', pass: 'give', zonesSelected: ['buttocks'] },
      { activityId: 'light_slapping', pass: 'receive', zonesSelected: ['buttocks'] },
      { activityId: 'spanking', pass: 'give', zonesSelected: ['buttocks'] },
      { activityId: 'spanking', pass: 'receive', zonesSelected: ['buttocks'] },
      { activityId: 'biting', pass: 'give', zonesSelected: ['neck'] },
      { activityId: 'biting', pass: 'receive', zonesSelected: ['neck'] },
    ],
    sceneResponses: [
      { sceneId: 'romantic_sex', liked: true, rating: 4, elementsSelected: ['eye_contact'] },
      { sceneId: 'spanking_m_to_f', liked: true, rating: 3, elementsSelected: ['light'] },
      { sceneId: 'bondage_m_ties_f', liked: true, rating: 3, elementsSelected: ['soft'] },
      { sceneId: 'blindfold', liked: true, rating: 4, elementsSelected: ['anticipation'] },
      { sceneId: 'stranger_roleplay', liked: true, rating: 4, elementsSelected: ['bar', 'flirting'] },
      { sceneId: 'threesome_fmf', liked: true, rating: 3, elementsSelected: ['curious'] },
      { sceneId: 'public_sex', liked: true, rating: 3, elementsSelected: ['thrill'] },
      { sceneId: 'wax_play_m_to_f', liked: true, rating: 3, elementsSelected: ['try'] },
      { sceneId: 'primal', liked: true, rating: 3, elementsSelected: ['passionate'] },
    ],
    expectedTags: ['curious', 'open_minded', 'variety', 'exploration', 'switch'],
    expectedIntensity: 2.5,
  },

  // Journey 12: Taboo Lover / Depraved
  {
    id: 'taboo_lover',
    name: 'Taboo Lover Journey',
    description: 'User drawn to forbidden, dirty, extreme experiences',
    expectedArchetype: 'hedonist',
    bodyMapResponses: [
      { activityId: 'licking', pass: 'give', zonesSelected: ['genitals', 'anus', 'feet'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['genitals', 'anus', 'nipples'] },
      { activityId: 'spanking', pass: 'give', zonesSelected: ['buttocks', 'genitals'] },
      { activityId: 'spanking', pass: 'receive', zonesSelected: ['buttocks', 'genitals'] },
      { activityId: 'light_slapping', pass: 'give', zonesSelected: ['face', 'buttocks', 'genitals'] },
      { activityId: 'light_slapping', pass: 'receive', zonesSelected: ['face', 'buttocks', 'genitals'] },
    ],
    sceneResponses: [
      { sceneId: 'degradation_m_to_f', liked: true, rating: 5, elementsSelected: ['humiliation', 'verbal', 'objectification'] },
      { sceneId: 'degradation_f_to_m', liked: true, rating: 5, elementsSelected: ['humiliation', 'verbal'] },
      { sceneId: 'golden_shower_m_to_f', liked: true, rating: 4, elementsSelected: ['taboo', 'marking'] },
      { sceneId: 'rimming_m_to_f', liked: true, rating: 5, elementsSelected: ['giving', 'receiving'] },
      { sceneId: 'gangbang', liked: true, rating: 5, elementsSelected: ['used', 'multiple'] },
      { sceneId: 'cum_where_to_finish', liked: true, rating: 4, elementsSelected: ['messy', 'degrading'] },
      { sceneId: 'deepthroat', liked: true, rating: 5, elementsSelected: ['rough', 'control'] },
      { sceneId: 'cnc_m_takes_f', liked: true, rating: 4, elementsSelected: ['fantasy', 'rough'] },
      { sceneId: 'free_use', liked: true, rating: 4, elementsSelected: ['objectification'] },
      { sceneId: 'romantic_sex', liked: false, rating: 2, elementsSelected: [] },
    ],
    expectedTags: ['degradation', 'humiliation', 'taboo', 'rough', 'dirty', 'objectification'],
    expectedIntensity: 4.5,
  },

  // Journey 13: Voyeur
  {
    id: 'voyeur',
    name: 'Voyeur Journey',
    description: 'User aroused by watching others',
    expectedArchetype: 'voyeur',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'neck'] },
    ],
    sceneResponses: [
      { sceneId: 'voyeurism', liked: true, rating: 5, elementsSelected: ['watching', 'hidden', 'couples'] },
      { sceneId: 'cuckold', liked: true, rating: 5, elementsSelected: ['watching_her', 'corner'] },
      { sceneId: 'hotwife', liked: true, rating: 4, elementsSelected: ['sharing', 'watching'] },
      { sceneId: 'threesome_fmf', liked: true, rating: 4, elementsSelected: ['watching_them'] },
      { sceneId: 'voyeurism', liked: true, rating: 4, elementsSelected: ['watching', 'inspiration'] },
      { sceneId: 'sexting', liked: true, rating: 3, elementsSelected: ['watching'] },
      { sceneId: 'exhibitionism', liked: false, rating: 2, elementsSelected: [] },
    ],
    expectedTags: ['voyeurism', 'watching', 'cuckold', 'sharing'],
    expectedIntensity: 3,
  },

  // Journey 14: Group Enthusiast
  {
    id: 'group_enthusiast',
    name: 'Group Enthusiast Journey',
    description: 'User interested in multi-partner experiences',
    expectedArchetype: 'hedonist',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'neck', 'chest'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'neck', 'chest'] },
      { activityId: 'licking', pass: 'give', zonesSelected: ['genitals', 'nipples'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['genitals', 'nipples'] },
    ],
    sceneResponses: [
      { sceneId: 'threesome_fmf', liked: true, rating: 5, elementsSelected: ['both', 'center', 'watching'] },
      { sceneId: 'threesome_mfm', liked: true, rating: 5, elementsSelected: ['center', 'filled', 'attention'] },
      { sceneId: 'gangbang', liked: true, rating: 4, elementsSelected: ['multiple', 'overwhelmed'] },
      { sceneId: 'orgy', liked: true, rating: 5, elementsSelected: ['many', 'freedom', 'variety'] },
      { sceneId: 'swinging', liked: true, rating: 5, elementsSelected: ['couples', 'swap', 'party'] },
      { sceneId: 'orgy', liked: true, rating: 4, elementsSelected: ['connected', 'giving_receiving'] },
      { sceneId: 'hotwife', liked: true, rating: 4, elementsSelected: ['sharing', 'pleasure'] },
    ],
    expectedTags: ['group', 'threesome', 'swinging', 'orgy', 'sharing', 'multiple_partners'],
    expectedIntensity: 3.5,
  },

  // Journey 15: Sadist
  {
    id: 'sadist',
    name: 'Sadist Journey',
    description: 'User who derives pleasure from inflicting consensual pain',
    expectedArchetype: 'sadist',
    bodyMapResponses: [
      { activityId: 'spanking', pass: 'give', zonesSelected: ['buttocks', 'thighs', 'back'] },
      { activityId: 'spanking', pass: 'receive', zonesSelected: [] },
      { activityId: 'light_slapping', pass: 'give', zonesSelected: ['face', 'buttocks', 'thighs', 'genitals'] },
      { activityId: 'light_slapping', pass: 'receive', zonesSelected: [] },
      { activityId: 'biting', pass: 'give', zonesSelected: ['neck', 'shoulders', 'chest', 'thighs'] },
      { activityId: 'biting', pass: 'receive', zonesSelected: [] },
    ],
    sceneResponses: [
      { sceneId: 'spanking_m_to_f', liked: true, rating: 5, elementsSelected: ['hard', 'implements', 'marks', 'tears'] },
      { sceneId: 'whipping_caning', liked: true, rating: 5, elementsSelected: ['stripes', 'control', 'tears'] },
      { sceneId: 'nipple_play_m_to_f', liked: true, rating: 4, elementsSelected: ['precision', 'marks'] },
      { sceneId: 'nipple_play_m_to_f', liked: true, rating: 5, elementsSelected: ['clamps', 'pulling', 'pain'] },
      { sceneId: 'wax_play_m_to_f', liked: true, rating: 4, elementsSelected: ['hot', 'reactions'] },
      { sceneId: 'edging_m_to_f', liked: true, rating: 4, elementsSelected: ['fear', 'control'] },
      { sceneId: 'degradation_m_to_f', liked: true, rating: 4, elementsSelected: ['breaking', 'tears'] },
      { sceneId: 'aftercare', liked: true, rating: 5, elementsSelected: ['caring', 'checking', 'praise'] },
    ],
    expectedTags: ['sadist', 'impact_play', 'pain', 'control', 'marks', 'discipline'],
    expectedIntensity: 4.5,
  },

  // Journey 16: Brat
  {
    id: 'brat',
    name: 'Brat Journey',
    description: 'User who enjoys playful defiance and "earning" punishment',
    expectedArchetype: 'brat',
    bodyMapResponses: [
      { activityId: 'spanking', pass: 'give', zonesSelected: [] },
      { activityId: 'spanking', pass: 'receive', zonesSelected: ['buttocks', 'thighs'] },
      { activityId: 'light_slapping', pass: 'give', zonesSelected: [] },
      { activityId: 'light_slapping', pass: 'receive', zonesSelected: ['face', 'buttocks'] },
      { activityId: 'biting', pass: 'give', zonesSelected: ['shoulders'] },
      { activityId: 'biting', pass: 'receive', zonesSelected: ['neck', 'shoulders'] },
    ],
    sceneResponses: [
      { sceneId: 'primal', liked: true, rating: 5, elementsSelected: ['defiance', 'chase', 'caught'] },
      { sceneId: 'spanking_m_to_f', liked: true, rating: 5, elementsSelected: ['punishment', 'earned', 'struggle'] },
      { sceneId: 'bondage_m_ties_f', liked: true, rating: 4, elementsSelected: ['escape_attempts', 'forced'] },
      { sceneId: 'primal', liked: true, rating: 5, elementsSelected: ['chase', 'struggle', 'caught'] },
      { sceneId: 'spanking_m_to_f', liked: true, rating: 5, elementsSelected: ['playful', 'teasing', 'consequences'] },
      { sceneId: 'collar_m_owns_f', liked: true, rating: 3, elementsSelected: ['reluctant'] },
      { sceneId: 'degradation_m_to_f', liked: false, rating: 2, elementsSelected: [] },
    ],
    expectedTags: ['brat', 'playful', 'defiance', 'funishment', 'primal', 'chase'],
    expectedIntensity: 3,
  },

  // Journey 17: Masochist Heavy (Pain Slut)
  {
    id: 'masochist_heavy',
    name: 'Heavy Masochist Journey',
    description: 'User who craves intense pain and being pushed to limits',
    expectedArchetype: 'masochist',
    bodyMapResponses: [
      { activityId: 'spanking', pass: 'give', zonesSelected: [] },
      { activityId: 'spanking', pass: 'receive', zonesSelected: ['buttocks', 'thighs', 'back', 'chest'] },
      { activityId: 'light_slapping', pass: 'give', zonesSelected: [] },
      { activityId: 'light_slapping', pass: 'receive', zonesSelected: ['face', 'buttocks', 'thighs', 'chest', 'genitals'] },
      { activityId: 'biting', pass: 'give', zonesSelected: [] },
      { activityId: 'biting', pass: 'receive', zonesSelected: ['neck', 'shoulders', 'chest', 'back', 'thighs'] },
    ],
    sceneResponses: [
      { sceneId: 'whipping_caning', liked: true, rating: 5, elementsSelected: ['hard', 'stripes', 'marks', 'crying'] },
      { sceneId: 'spanking_m_to_f', liked: true, rating: 5, elementsSelected: ['severe', 'precision', 'counting'] },
      { sceneId: 'spanking_m_to_f', liked: true, rating: 5, elementsSelected: ['hard', 'bruising', 'long_session'] },
      { sceneId: 'nipple_play_m_to_f', liked: true, rating: 5, elementsSelected: ['clamps', 'weights', 'pulling'] },
      { sceneId: 'wax_play_m_to_f', liked: true, rating: 5, elementsSelected: ['hot', 'close', 'layers'] },
      { sceneId: 'edging_m_to_f', liked: true, rating: 4, elementsSelected: ['fear', 'trust', 'pushing'] },
      { sceneId: 'choking_m_to_f', liked: true, rating: 4, elementsSelected: ['choking', 'edge'] },
      { sceneId: 'needle_play', liked: true, rating: 3, elementsSelected: ['curious', 'endorphins'] },
      { sceneId: 'aftercare', liked: true, rating: 5, elementsSelected: ['essential', 'holding', 'recovery'] },
    ],
    expectedTags: ['masochist', 'pain_slut', 'impact_play', 'endorphins', 'marks', 'extreme'],
    expectedIntensity: 5,
  },

  // Journey 18: Cuckold
  {
    id: 'cuckold',
    name: 'Cuckold Journey',
    description: 'Male user aroused by partner with others, humiliation element',
    expectedArchetype: 'cuckold',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips'] },
      { activityId: 'licking', pass: 'give', zonesSelected: ['genitals'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: [] },
    ],
    sceneResponses: [
      { sceneId: 'cuckold', liked: true, rating: 5, elementsSelected: ['watching', 'corner', 'humiliation', 'cleanup'] },
      { sceneId: 'hotwife', liked: true, rating: 5, elementsSelected: ['sharing_her', 'pride', 'reclaiming'] },
      { sceneId: 'chastity_m_locked', liked: true, rating: 5, elementsSelected: ['denial', 'her_pleasure'] },
      { sceneId: 'degradation_f_to_m', liked: true, rating: 4, elementsSelected: ['comparison', 'inadequacy'] },
      { sceneId: 'threesome_mfm', liked: true, rating: 5, elementsSelected: ['watching_her', 'sharing'] },
      { sceneId: 'cunnilingus', liked: true, rating: 4, elementsSelected: ['after', 'service'] },
      { sceneId: 'voyeurism', liked: true, rating: 5, elementsSelected: ['watching_her', 'hidden'] },
      { sceneId: 'collar_f_owns_m', liked: true, rating: 4, elementsSelected: ['owned', 'controlled'] },
    ],
    expectedTags: ['cuckold', 'hotwife', 'humiliation', 'voyeurism', 'chastity', 'compersion'],
    expectedIntensity: 4,
  },

  // Journey 19: Roleplay Lover
  {
    id: 'roleplay_lover',
    name: 'Roleplay Lover Journey',
    description: 'User who loves becoming different characters and scenarios',
    expectedArchetype: 'performer',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'neck', 'hands'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'neck', 'hands'] },
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['face', 'hair', 'back'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['face', 'hair', 'back'] },
    ],
    sceneResponses: [
      { sceneId: 'stranger_roleplay', liked: true, rating: 5, elementsSelected: ['bar', 'seduction', 'character'] },
      { sceneId: 'boss_secretary', liked: true, rating: 5, elementsSelected: ['power', 'office', 'tension'] },
      { sceneId: 'teacher_student', liked: true, rating: 5, elementsSelected: ['forbidden', 'authority'] },
      { sceneId: 'doctor_patient', liked: true, rating: 4, elementsSelected: ['examination', 'clinical'] },
      { sceneId: 'service_roleplay', liked: true, rating: 4, elementsSelected: ['service', 'caught'] },
      { sceneId: 'lingerie', liked: true, rating: 5, elementsSelected: ['character', 'fantasy', 'costume'] },
      { sceneId: 'ddlg', liked: true, rating: 3, elementsSelected: ['dynamic', 'care'] },
      { sceneId: 'pet_play_f_is_pet', liked: true, rating: 3, elementsSelected: ['kitten', 'playful'] },
    ],
    expectedTags: ['roleplay', 'fantasy', 'costume', 'character', 'imagination', 'scenario'],
    expectedIntensity: 2.5,
  },

  // Journey 20: Vanilla Curious
  {
    id: 'vanilla_curious',
    name: 'Vanilla Curious Journey',
    description: 'Mostly vanilla user open to gentle exploration',
    expectedArchetype: 'romantic_lover',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'neck', 'cheeks', 'forehead'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'neck', 'cheeks', 'forehead'] },
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['face', 'hair', 'back', 'arms', 'hands'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['face', 'hair', 'back', 'arms', 'hands'] },
      { activityId: 'licking', pass: 'give', zonesSelected: ['neck', 'nipples'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['neck', 'nipples'] },
      { activityId: 'light_slapping', pass: 'give', zonesSelected: [] },
      { activityId: 'light_slapping', pass: 'receive', zonesSelected: ['buttocks'] },
      { activityId: 'spanking', pass: 'give', zonesSelected: [] },
      { activityId: 'spanking', pass: 'receive', zonesSelected: [] },
    ],
    sceneResponses: [
      { sceneId: 'romantic_sex', liked: true, rating: 5, elementsSelected: ['eye_contact', 'slow', 'connection'] },
      { sceneId: 'massage_m_to_f', liked: true, rating: 5, elementsSelected: ['sensual', 'oil', 'relaxing'] },
      { sceneId: 'aftercare', liked: true, rating: 5, elementsSelected: ['cuddling', 'talking'] },
      { sceneId: 'blindfold', liked: true, rating: 4, elementsSelected: ['gentle', 'surprise'] },
      { sceneId: 'praise_m_to_f', liked: true, rating: 4, elementsSelected: ['loving', 'appreciation'] },
      { sceneId: 'bondage_m_ties_f', liked: true, rating: 3, elementsSelected: ['scarves', 'playful'] },
      { sceneId: 'spanking_m_to_f', liked: true, rating: 2, elementsSelected: ['curious'] },
      { sceneId: 'bondage_m_ties_f', liked: false, rating: 2, elementsSelected: [] },
      { sceneId: 'degradation_m_to_f', liked: false, rating: 1, elementsSelected: [] },
    ],
    expectedTags: ['romantic', 'sensual', 'gentle', 'curious', 'vanilla', 'connection'],
    expectedIntensity: 1.5,
  },

  // Journey 21: Oral Enthusiast
  {
    id: 'oral_enthusiast',
    name: 'Oral Enthusiast Journey',
    description: 'User who loves giving and receiving oral pleasure',
    expectedArchetype: 'sensualist',
    bodyMapResponses: [
      { activityId: 'licking', pass: 'give', zonesSelected: ['genitals', 'nipples', 'neck', 'inner_thighs'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['genitals', 'nipples', 'neck'] },
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'neck', 'chest', 'stomach'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'neck', 'chest'] },
    ],
    sceneResponses: [
      { sceneId: 'blowjob', liked: true, rating: 5, elementsSelected: ['technique', 'eye_contact', 'deep'] },
      { sceneId: 'cunnilingus', liked: true, rating: 5, elementsSelected: ['worship', 'technique', 'orgasm'] },
      { sceneId: 'deepthroat', liked: true, rating: 4, elementsSelected: ['skill', 'submission'] },
      { sceneId: 'sixty_nine', liked: true, rating: 5, elementsSelected: ['mutual', 'simultaneous'] },
      { sceneId: 'facesitting_f_on_m', liked: true, rating: 4, elementsSelected: ['worship', 'access'] },
      { sceneId: 'rimming_m_to_f', liked: true, rating: 4, elementsSelected: ['intimate', 'taboo'] },
      { sceneId: 'rimming_f_to_m', liked: true, rating: 4, elementsSelected: ['intimate', 'taboo'] },
    ],
    expectedTags: ['oral', 'cunnilingus', 'blowjob', 'worship', 'sensual'],
    expectedIntensity: 2.5,
  },

  // Journey 22: Anal Explorer
  {
    id: 'anal_explorer',
    name: 'Anal Explorer Journey',
    description: 'User interested in anal play experiences',
    expectedArchetype: 'explorer',
    bodyMapResponses: [
      { activityId: 'licking', pass: 'give', zonesSelected: ['anus', 'genitals'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['anus', 'genitals'] },
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['buttocks', 'inner_thighs'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['buttocks', 'inner_thighs'] },
    ],
    sceneResponses: [
      { sceneId: 'anal_play_on_her', liked: true, rating: 5, elementsSelected: ['fingers', 'plugs', 'gradual'] },
      { sceneId: 'anal_play_on_him', liked: true, rating: 4, elementsSelected: ['prostate', 'massage'] },
      { sceneId: 'pegging', liked: true, rating: 4, elementsSelected: ['trust', 'submission'] },
      { sceneId: 'rimming_m_to_f', liked: true, rating: 5, elementsSelected: ['intimate', 'worship'] },
      { sceneId: 'rimming_f_to_m', liked: true, rating: 5, elementsSelected: ['intimate', 'pleasure'] },
      { sceneId: 'double_penetration', liked: true, rating: 3, elementsSelected: ['fantasy', 'full'] },
    ],
    expectedTags: ['anal', 'prostate', 'rimming', 'taboo', 'exploration'],
    expectedIntensity: 3,
  },

  // Journey 23: Dirty Talker
  {
    id: 'dirty_talker',
    name: 'Dirty Talker Journey',
    description: 'User aroused by verbal play and dirty talk',
    expectedArchetype: 'performer',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'ears', 'neck'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'ears', 'neck'] },
    ],
    sceneResponses: [
      { sceneId: 'dirty_talk', liked: true, rating: 5, elementsSelected: ['descriptive', 'commands', 'praise'] },
      { sceneId: 'phone_sex', liked: true, rating: 5, elementsSelected: ['voice', 'imagination', 'distance'] },
      { sceneId: 'sexting', liked: true, rating: 5, elementsSelected: ['anticipation', 'words', 'building'] },
      { sceneId: 'degradation_m_to_f', liked: true, rating: 3, elementsSelected: ['verbal', 'mild'] },
      { sceneId: 'praise_m_to_f', liked: true, rating: 5, elementsSelected: ['verbal', 'affirmation'] },
      { sceneId: 'praise_f_to_m', liked: true, rating: 5, elementsSelected: ['verbal', 'encouragement'] },
    ],
    expectedTags: ['dirty_talk', 'verbal', 'phone_sex', 'sexting', 'voice'],
    expectedIntensity: 2,
  },

  // Journey 24: Pet Play Enthusiast
  {
    id: 'pet_play',
    name: 'Pet Play Journey',
    description: 'User who enjoys pet/animal roleplay dynamics',
    expectedArchetype: 'submissive',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'hands', 'feet'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['forehead', 'cheeks'] },
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['hair'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['hair', 'back', 'ears'] },
    ],
    sceneResponses: [
      { sceneId: 'pet_play_f_is_pet', liked: true, rating: 5, elementsSelected: ['kitten', 'puppy', 'headspace'] },
      { sceneId: 'pet_play_m_is_pet', liked: true, rating: 5, elementsSelected: ['dog', 'training', 'obedience'] },
      { sceneId: 'collar_m_owns_f', liked: true, rating: 5, elementsSelected: ['symbol', 'ownership', 'pet'] },
      { sceneId: 'praise_m_to_f', liked: true, rating: 5, elementsSelected: ['good_girl', 'pet_names'] },
      { sceneId: 'human_furniture', liked: true, rating: 3, elementsSelected: ['object', 'use'] },
      { sceneId: 'service_roleplay', liked: true, rating: 4, elementsSelected: ['devotion', 'obedience'] },
    ],
    expectedTags: ['pet_play', 'kitten', 'puppy', 'collar', 'obedience', 'roleplay'],
    expectedIntensity: 2.5,
  },

  // Journey 25: Tech/Toy Lover
  {
    id: 'tech_toy_lover',
    name: 'Tech & Toy Lover Journey',
    description: 'User who loves mechanical toys and devices',
    expectedArchetype: 'sensualist',
    bodyMapResponses: [
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['genitals', 'nipples'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['genitals', 'nipples', 'thighs'] },
    ],
    sceneResponses: [
      { sceneId: 'fucking_machine', liked: true, rating: 5, elementsSelected: ['relentless', 'intensity', 'control'] },
      { sceneId: 'electrostim', liked: true, rating: 5, elementsSelected: ['sensation', 'control', 'unique'] },
      { sceneId: 'vibrator_play', liked: true, rating: 5, elementsSelected: ['teasing', 'edging', 'orgasm'] },
      { sceneId: 'remote_control_toy', liked: true, rating: 5, elementsSelected: ['public', 'surprise', 'control'] },
      { sceneId: 'edging_m_to_f', liked: true, rating: 4, elementsSelected: ['toys', 'denial'] },
      { sceneId: 'forced_orgasm', liked: true, rating: 4, elementsSelected: ['overwhelming', 'helpless'] },
    ],
    expectedTags: ['toys', 'electrostim', 'vibrator', 'machine', 'technology', 'sensation'],
    expectedIntensity: 3.5,
  },

  // Journey 26: Age Play / Nurturing
  {
    id: 'age_play',
    name: 'Age Play Journey',
    description: 'User interested in nurturing/little dynamics',
    expectedArchetype: 'caregiver',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['forehead', 'cheeks', 'lips'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['forehead', 'cheeks', 'lips'] },
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['hair', 'face', 'back'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['hair', 'face', 'back'] },
    ],
    sceneResponses: [
      { sceneId: 'ddlg', liked: true, rating: 5, elementsSelected: ['nurturing', 'rules', 'care'] },
      { sceneId: 'mdlb', liked: true, rating: 5, elementsSelected: ['nurturing', 'structure', 'affection'] },
      { sceneId: 'praise_m_to_f', liked: true, rating: 5, elementsSelected: ['good_girl', 'proud'] },
      { sceneId: 'praise_f_to_m', liked: true, rating: 5, elementsSelected: ['good_boy', 'proud'] },
      { sceneId: 'aftercare', liked: true, rating: 5, elementsSelected: ['cuddles', 'blankets', 'safety'] },
      { sceneId: 'spanking_m_to_f', liked: true, rating: 3, elementsSelected: ['discipline', 'caring'] },
    ],
    expectedTags: ['ddlg', 'mdlb', 'nurturing', 'caregiver', 'little', 'praise'],
    expectedIntensity: 2,
  },

  // Journey 27: Foot Fetishist
  {
    id: 'foot_fetishist',
    name: 'Foot Fetishist Journey',
    description: 'User with strong foot attraction',
    expectedArchetype: 'fetishist',
    bodyMapResponses: [
      { activityId: 'licking', pass: 'give', zonesSelected: ['feet', 'toes'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['feet'] },
      { activityId: 'kissing', pass: 'give', zonesSelected: ['feet', 'toes', 'ankles'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['feet'] },
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['feet', 'ankles'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['feet'] },
    ],
    sceneResponses: [
      { sceneId: 'foot_worship_m_to_f', liked: true, rating: 5, elementsSelected: ['worship', 'massage', 'devotion'] },
      { sceneId: 'foot_worship_f_to_m', liked: true, rating: 4, elementsSelected: ['attention', 'teasing'] },
      { sceneId: 'footjob', liked: true, rating: 5, elementsSelected: ['skill', 'visual', 'sensation'] },
      { sceneId: 'body_worship_m_to_f', liked: true, rating: 4, elementsSelected: ['feet', 'devotion'] },
      { sceneId: 'massage_m_to_f', liked: true, rating: 5, elementsSelected: ['feet', 'relaxation'] },
      { sceneId: 'lingerie', liked: true, rating: 4, elementsSelected: ['stockings', 'heels'] },
    ],
    expectedTags: ['foot_fetish', 'worship', 'feet', 'stockings', 'devotion'],
    expectedIntensity: 2,
  },

  // Journey 28: Breath Play Enthusiast
  {
    id: 'breath_play',
    name: 'Breath Play Journey',
    description: 'User who enjoys breath control and edge play',
    expectedArchetype: 'edge_player',
    bodyMapResponses: [
      { activityId: 'light_slapping', pass: 'give', zonesSelected: ['face'] },
      { activityId: 'light_slapping', pass: 'receive', zonesSelected: ['face'] },
    ],
    sceneResponses: [
      { sceneId: 'choking_m_to_f', liked: true, rating: 5, elementsSelected: ['control', 'trust', 'intensity'] },
      { sceneId: 'choking_f_to_m', liked: true, rating: 5, elementsSelected: ['power', 'surrender'] },
      { sceneId: 'facesitting_f_on_m', liked: true, rating: 5, elementsSelected: ['breath_control', 'helpless'] },
      { sceneId: 'deepthroat', liked: true, rating: 4, elementsSelected: ['gagging', 'control'] },
      { sceneId: 'primal', liked: true, rating: 4, elementsSelected: ['intense', 'raw'] },
      { sceneId: 'cnc_m_takes_f', liked: true, rating: 4, elementsSelected: ['intensity', 'edge'] },
    ],
    expectedTags: ['breath_play', 'choking', 'edge_play', 'control', 'trust', 'intense'],
    expectedIntensity: 4.5,
  },

  // Journey 29: Bondage Rigger
  {
    id: 'bondage_rigger',
    name: 'Bondage Rigger Journey',
    description: 'User who loves rope work and restraint artistry',
    expectedArchetype: 'rigger',
    bodyMapResponses: [
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['wrists', 'ankles', 'torso', 'thighs'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['wrists', 'ankles'] },
    ],
    sceneResponses: [
      { sceneId: 'bondage_m_ties_f', liked: true, rating: 5, elementsSelected: ['rope', 'artistic', 'patterns'] },
      { sceneId: 'bondage_f_ties_m', liked: true, rating: 4, elementsSelected: ['technique', 'beauty'] },
      { sceneId: 'suspension', liked: true, rating: 5, elementsSelected: ['artistry', 'trust', 'helpless'] },
      { sceneId: 'shibari', liked: true, rating: 5, elementsSelected: ['traditional', 'beautiful', 'skill'] },
      { sceneId: 'predicament_bondage', liked: true, rating: 4, elementsSelected: ['creative', 'challenge'] },
      { sceneId: 'mummification', liked: true, rating: 3, elementsSelected: ['total', 'helpless'] },
    ],
    expectedTags: ['bondage', 'rope', 'shibari', 'rigger', 'restraint', 'artistry'],
    expectedIntensity: 3.5,
  },

  // Journey 30: Orgasm Control Fanatic
  {
    id: 'orgasm_control',
    name: 'Orgasm Control Journey',
    description: 'User obsessed with orgasm denial and control',
    expectedArchetype: 'dominant',
    bodyMapResponses: [
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['genitals', 'inner_thighs', 'nipples'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['genitals'] },
    ],
    sceneResponses: [
      { sceneId: 'edging_m_to_f', liked: true, rating: 5, elementsSelected: ['denial', 'begging', 'control'] },
      { sceneId: 'edging_f_to_m', liked: true, rating: 5, elementsSelected: ['teasing', 'ruin', 'control'] },
      { sceneId: 'forced_orgasm', liked: true, rating: 5, elementsSelected: ['overwhelming', 'multiple'] },
      { sceneId: 'ruined_orgasm', liked: true, rating: 5, elementsSelected: ['frustration', 'control'] },
      { sceneId: 'chastity_m_locked', liked: true, rating: 4, elementsSelected: ['denial', 'control'] },
      { sceneId: 'chastity_f_locked', liked: true, rating: 4, elementsSelected: ['denial', 'devotion'] },
      { sceneId: 'vibrator_play', liked: true, rating: 4, elementsSelected: ['teasing', 'denial'] },
    ],
    expectedTags: ['edging', 'denial', 'orgasm_control', 'teasing', 'chastity'],
    expectedIntensity: 3.5,
  },

  // Journey 31: Cum Play Enthusiast
  {
    id: 'cum_play',
    name: 'Cum Play Journey',
    description: 'User aroused by cum and finishing scenarios',
    expectedArchetype: 'hedonist',
    bodyMapResponses: [
      { activityId: 'licking', pass: 'give', zonesSelected: ['genitals', 'stomach', 'chest'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['genitals', 'chest', 'face'] },
    ],
    sceneResponses: [
      { sceneId: 'cum_where_to_finish', liked: true, rating: 5, elementsSelected: ['face', 'inside', 'chest'] },
      { sceneId: 'facial', liked: true, rating: 5, elementsSelected: ['messy', 'marking', 'visual'] },
      { sceneId: 'creampie', liked: true, rating: 5, elementsSelected: ['inside', 'intimate', 'claiming'] },
      { sceneId: 'cum_on_body', liked: true, rating: 5, elementsSelected: ['marking', 'visual', 'messy'] },
      { sceneId: 'deepthroat', liked: true, rating: 4, elementsSelected: ['finish', 'swallow'] },
      { sceneId: 'blowjob', liked: true, rating: 5, elementsSelected: ['finish', 'eye_contact'] },
    ],
    expectedTags: ['cum', 'facial', 'creampie', 'messy', 'marking'],
    expectedIntensity: 3,
  },

  // Journey 32: Medical Play Enthusiast
  {
    id: 'medical_play',
    name: 'Medical Play Journey',
    description: 'User aroused by medical scenarios and examinations',
    expectedArchetype: 'performer',
    bodyMapResponses: [
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['chest', 'stomach', 'thighs', 'genitals'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['chest', 'stomach', 'thighs', 'genitals'] },
    ],
    sceneResponses: [
      { sceneId: 'medical_play', liked: true, rating: 5, elementsSelected: ['examination', 'clinical', 'tools'] },
      { sceneId: 'doctor_patient', liked: true, rating: 5, elementsSelected: ['authority', 'vulnerability', 'exam'] },
      { sceneId: 'enema', liked: true, rating: 3, elementsSelected: ['clinical', 'intimate'] },
      { sceneId: 'needle_play', liked: true, rating: 3, elementsSelected: ['precision', 'medical'] },
      { sceneId: 'electrostim', liked: true, rating: 4, elementsSelected: ['medical', 'sensation'] },
      { sceneId: 'bondage_m_ties_f', liked: true, rating: 3, elementsSelected: ['restraint', 'exam'] },
    ],
    expectedTags: ['medical', 'examination', 'clinical', 'roleplay', 'doctor'],
    expectedIntensity: 3,
  },

  // Journey 33: Costume/Uniform Fetishist
  {
    id: 'costume_uniform',
    name: 'Costume & Uniform Journey',
    description: 'User aroused by specific clothing and uniforms',
    expectedArchetype: 'fetishist',
    bodyMapResponses: [
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['thighs', 'waist', 'back'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['thighs', 'waist', 'back'] },
    ],
    sceneResponses: [
      { sceneId: 'lingerie', liked: true, rating: 5, elementsSelected: ['lace', 'stockings', 'corset'] },
      { sceneId: 'uniform_kink', liked: true, rating: 5, elementsSelected: ['nurse', 'maid', 'police'] },
      { sceneId: 'boss_secretary', liked: true, rating: 4, elementsSelected: ['office', 'professional'] },
      { sceneId: 'teacher_student', liked: true, rating: 4, elementsSelected: ['uniform', 'authority'] },
      { sceneId: 'latex_leather', liked: true, rating: 5, elementsSelected: ['shiny', 'tight', 'fetish'] },
      { sceneId: 'striptease', liked: true, rating: 5, elementsSelected: ['reveal', 'tease', 'costume'] },
      { sceneId: 'boudoir', liked: true, rating: 4, elementsSelected: ['elegant', 'beautiful'] },
    ],
    expectedTags: ['lingerie', 'uniform', 'costume', 'latex', 'fetish', 'clothing'],
    expectedIntensity: 2.5,
  },

  // Journey 34: Morning/Quickie Lover
  {
    id: 'quickie_lover',
    name: 'Quickie & Spontaneous Journey',
    description: 'User who loves spontaneous, quick encounters',
    expectedArchetype: 'hedonist',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'neck'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'neck'] },
    ],
    sceneResponses: [
      { sceneId: 'morning_sex', liked: true, rating: 5, elementsSelected: ['sleepy', 'intimate', 'natural'] },
      { sceneId: 'quickie', liked: true, rating: 5, elementsSelected: ['urgent', 'spontaneous', 'thrill'] },
      { sceneId: 'public_sex', liked: true, rating: 4, elementsSelected: ['risk', 'quick', 'thrill'] },
      { sceneId: 'shower_sex', liked: true, rating: 5, elementsSelected: ['wet', 'spontaneous', 'practical'] },
      { sceneId: 'torn_clothes', liked: true, rating: 4, elementsSelected: ['urgent', 'passion'] },
      { sceneId: 'car_sex', liked: true, rating: 4, elementsSelected: ['spontaneous', 'cramped', 'thrill'] },
    ],
    expectedTags: ['spontaneous', 'quickie', 'morning', 'urgent', 'passion'],
    expectedIntensity: 2,
  },

  // Journey 35: Temperature Play Enthusiast
  {
    id: 'temperature_play',
    name: 'Temperature Play Journey',
    description: 'User who loves hot and cold sensations',
    expectedArchetype: 'sensualist',
    bodyMapResponses: [
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['nipples', 'stomach', 'inner_thighs', 'back'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['nipples', 'stomach', 'inner_thighs', 'back'] },
    ],
    sceneResponses: [
      { sceneId: 'ice_play', liked: true, rating: 5, elementsSelected: ['cold', 'contrast', 'nipples'] },
      { sceneId: 'wax_play_m_to_f', liked: true, rating: 5, elementsSelected: ['hot', 'dripping', 'anticipation'] },
      { sceneId: 'wax_play_f_to_m', liked: true, rating: 5, elementsSelected: ['heat', 'control', 'patterns'] },
      { sceneId: 'fire_play', liked: true, rating: 4, elementsSelected: ['flash', 'heat', 'intense'] },
      { sceneId: 'blindfold', liked: true, rating: 4, elementsSelected: ['anticipation', 'sensation'] },
      { sceneId: 'feather_tickle', liked: true, rating: 4, elementsSelected: ['contrast', 'light'] },
    ],
    expectedTags: ['temperature', 'wax', 'ice', 'sensation', 'sensory'],
    expectedIntensity: 3,
  },

  // Journey 36: CBT/Genital Torture Enthusiast
  {
    id: 'cbt_enthusiast',
    name: 'CBT Enthusiast Journey',
    description: 'User interested in genital torture/play',
    expectedArchetype: 'masochist',
    bodyMapResponses: [
      { activityId: 'light_slapping', pass: 'give', zonesSelected: [] },
      { activityId: 'light_slapping', pass: 'receive', zonesSelected: ['genitals'] },
      { activityId: 'spanking', pass: 'give', zonesSelected: [] },
      { activityId: 'spanking', pass: 'receive', zonesSelected: ['genitals'] },
    ],
    sceneResponses: [
      { sceneId: 'cbt', liked: true, rating: 5, elementsSelected: ['pain', 'control', 'intensity'] },
      { sceneId: 'nipple_play_m_to_f', liked: true, rating: 5, elementsSelected: ['clamps', 'pain', 'torture'] },
      { sceneId: 'nipple_play_f_to_m', liked: true, rating: 5, elementsSelected: ['pain', 'intensity'] },
      { sceneId: 'chastity_m_locked', liked: true, rating: 4, elementsSelected: ['denial', 'frustration'] },
      { sceneId: 'edging_f_to_m', liked: true, rating: 4, elementsSelected: ['torture', 'denial'] },
      { sceneId: 'electrostim', liked: true, rating: 4, elementsSelected: ['intensity', 'pain'] },
    ],
    expectedTags: ['cbt', 'pain', 'torture', 'genital', 'masochist', 'intense'],
    expectedIntensity: 4.5,
  },

  // Journey 37: Feminization/Crossdressing
  {
    id: 'feminization',
    name: 'Feminization Journey',
    description: 'Male user interested in feminization and crossdressing',
    expectedArchetype: 'submissive',
    bodyMapResponses: [
      { activityId: 'light_touch', pass: 'give', zonesSelected: [] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['face', 'hair', 'chest', 'thighs'] },
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'neck'] },
    ],
    sceneResponses: [
      { sceneId: 'feminization', liked: true, rating: 5, elementsSelected: ['makeup', 'clothes', 'transformation'] },
      { sceneId: 'lingerie', liked: true, rating: 5, elementsSelected: ['wearing', 'panties', 'stockings'] },
      { sceneId: 'collar_f_owns_m', liked: true, rating: 4, elementsSelected: ['owned', 'feminized'] },
      { sceneId: 'pegging', liked: true, rating: 4, elementsSelected: ['feminized', 'receiving'] },
      { sceneId: 'degradation_f_to_m', liked: true, rating: 4, elementsSelected: ['sissy', 'humiliation'] },
      { sceneId: 'praise_f_to_m', liked: true, rating: 4, elementsSelected: ['pretty', 'good_girl'] },
    ],
    expectedTags: ['feminization', 'crossdressing', 'sissy', 'transformation', 'submission'],
    expectedIntensity: 3,
  },

  // Journey 38: Lactation/Pregnancy Kink
  {
    id: 'lactation_preg',
    name: 'Lactation & Pregnancy Journey',
    description: 'User aroused by lactation and pregnancy',
    expectedArchetype: 'fetishist',
    bodyMapResponses: [
      { activityId: 'licking', pass: 'give', zonesSelected: ['nipples', 'chest'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['nipples', 'chest'] },
      { activityId: 'kissing', pass: 'give', zonesSelected: ['chest', 'stomach'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['chest', 'stomach'] },
    ],
    sceneResponses: [
      { sceneId: 'lactation', liked: true, rating: 5, elementsSelected: ['nursing', 'milk', 'intimate'] },
      { sceneId: 'breeding', liked: true, rating: 5, elementsSelected: ['impregnation', 'primal', 'raw'] },
      { sceneId: 'creampie', liked: true, rating: 5, elementsSelected: ['inside', 'breeding'] },
      { sceneId: 'nipple_play_m_to_f', liked: true, rating: 4, elementsSelected: ['sucking', 'sensitive'] },
      { sceneId: 'body_worship_m_to_f', liked: true, rating: 4, elementsSelected: ['curves', 'adoration'] },
      { sceneId: 'romantic_sex', liked: true, rating: 4, elementsSelected: ['intimate', 'connection'] },
    ],
    expectedTags: ['lactation', 'breeding', 'pregnancy', 'nursing', 'intimate'],
    expectedIntensity: 2.5,
  },

  // Journey 39: Human Furniture/Objectification
  {
    id: 'objectification',
    name: 'Objectification Journey',
    description: 'User who enjoys being used as furniture/object',
    expectedArchetype: 'submissive',
    bodyMapResponses: [
      { activityId: 'spanking', pass: 'give', zonesSelected: [] },
      { activityId: 'spanking', pass: 'receive', zonesSelected: ['buttocks', 'thighs'] },
      { activityId: 'light_touch', pass: 'give', zonesSelected: [] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['back', 'legs'] },
    ],
    sceneResponses: [
      { sceneId: 'human_furniture', liked: true, rating: 5, elementsSelected: ['table', 'footstool', 'used'] },
      { sceneId: 'free_use', liked: true, rating: 5, elementsSelected: ['available', 'object', 'used'] },
      { sceneId: 'degradation_m_to_f', liked: true, rating: 4, elementsSelected: ['object', 'thing'] },
      { sceneId: 'degradation_f_to_m', liked: true, rating: 4, elementsSelected: ['furniture', 'use'] },
      { sceneId: 'collar_m_owns_f', liked: true, rating: 4, elementsSelected: ['owned', 'property'] },
      { sceneId: 'service_roleplay', liked: true, rating: 4, elementsSelected: ['waiting', 'available'] },
    ],
    expectedTags: ['objectification', 'furniture', 'free_use', 'degradation', 'service'],
    expectedIntensity: 3.5,
  },

  // Journey 40: Photography/Visual Enthusiast
  {
    id: 'photography',
    name: 'Photography & Visual Journey',
    description: 'User aroused by visual documentation and photography',
    expectedArchetype: 'exhibitionist',
    bodyMapResponses: [
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['face', 'hair'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['face', 'hair'] },
    ],
    sceneResponses: [
      { sceneId: 'boudoir', liked: true, rating: 5, elementsSelected: ['artistic', 'elegant', 'posed'] },
      { sceneId: 'sexting', liked: true, rating: 5, elementsSelected: ['photos', 'nudes', 'video'] },
      { sceneId: 'exhibitionism', liked: true, rating: 4, elementsSelected: ['camera', 'watched'] },
      { sceneId: 'striptease', liked: true, rating: 5, elementsSelected: ['filmed', 'performance'] },
      { sceneId: 'lingerie', liked: true, rating: 5, elementsSelected: ['photoshoot', 'posing'] },
      { sceneId: 'voyeurism', liked: true, rating: 3, elementsSelected: ['watching', 'recording'] },
    ],
    expectedTags: ['photography', 'visual', 'boudoir', 'exhibitionism', 'artistic'],
    expectedIntensity: 2,
  },

  // Journey 41: Double Penetration Enthusiast
  {
    id: 'double_penetration',
    name: 'Double Penetration Journey',
    description: 'User who enjoys being filled completely',
    expectedArchetype: 'hedonist',
    bodyMapResponses: [
      { activityId: 'licking', pass: 'give', zonesSelected: ['genitals'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['genitals', 'anus'] },
    ],
    sceneResponses: [
      { sceneId: 'double_penetration', liked: true, rating: 5, elementsSelected: ['full', 'intense', 'overwhelmed'] },
      { sceneId: 'threesome_mfm', liked: true, rating: 5, elementsSelected: ['center', 'filled', 'attention'] },
      { sceneId: 'gangbang', liked: true, rating: 4, elementsSelected: ['multiple', 'used'] },
      { sceneId: 'anal_play_on_her', liked: true, rating: 5, elementsSelected: ['toys', 'during_sex'] },
      { sceneId: 'fucking_machine', liked: true, rating: 4, elementsSelected: ['relentless', 'multiple'] },
      { sceneId: 'free_use', liked: true, rating: 4, elementsSelected: ['available', 'used'] },
    ],
    expectedTags: ['double_penetration', 'full', 'group', 'anal', 'intense'],
    expectedIntensity: 4,
  },

  // Journey 42: Power Exchange Specialist
  {
    id: 'power_exchange',
    name: 'Power Exchange Journey',
    description: 'User focused on psychological power dynamics',
    expectedArchetype: 'dominant',
    bodyMapResponses: [
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['face', 'neck', 'hair'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['face'] },
    ],
    sceneResponses: [
      { sceneId: 'mind_control_hypno', liked: true, rating: 5, elementsSelected: ['control', 'suggestion', 'trance'] },
      { sceneId: 'orgasm_on_command', liked: true, rating: 5, elementsSelected: ['power', 'training'] },
      { sceneId: 'collar_m_owns_f', liked: true, rating: 5, elementsSelected: ['ownership', 'symbol'] },
      { sceneId: 'edging_m_to_f', liked: true, rating: 4, elementsSelected: ['control', 'permission'] },
      { sceneId: 'task_assignment', liked: true, rating: 4, elementsSelected: ['orders', 'obedience'] },
      { sceneId: 'praise_m_to_f', liked: true, rating: 5, elementsSelected: ['reinforcement', 'training'] },
    ],
    expectedTags: ['power_exchange', 'control', 'hypno', 'ownership', 'training'],
    expectedIntensity: 3,
  },

  // Journey 43: CNC Enthusiast
  {
    id: 'cnc_enthusiast',
    name: 'CNC Enthusiast Journey',
    description: 'User who enjoys consensual non-consent play',
    expectedArchetype: 'primal',
    bodyMapResponses: [
      { activityId: 'light_slapping', pass: 'give', zonesSelected: ['face', 'buttocks'] },
      { activityId: 'light_slapping', pass: 'receive', zonesSelected: ['face', 'buttocks'] },
      { activityId: 'biting', pass: 'give', zonesSelected: ['neck', 'shoulders'] },
      { activityId: 'biting', pass: 'receive', zonesSelected: ['neck', 'shoulders'] },
    ],
    sceneResponses: [
      { sceneId: 'cnc_m_takes_f', liked: true, rating: 5, elementsSelected: ['struggle', 'fantasy', 'rough'] },
      { sceneId: 'cnc_f_takes_m', liked: true, rating: 5, elementsSelected: ['forced', 'used'] },
      { sceneId: 'primal', liked: true, rating: 5, elementsSelected: ['chase', 'caught', 'struggle'] },
      { sceneId: 'free_use', liked: true, rating: 4, elementsSelected: ['taken', 'available'] },
      { sceneId: 'bondage_m_ties_f', liked: true, rating: 4, elementsSelected: ['forced', 'helpless'] },
      { sceneId: 'choking_m_to_f', liked: true, rating: 4, elementsSelected: ['rough', 'control'] },
      { sceneId: 'aftercare', liked: true, rating: 5, elementsSelected: ['essential', 'reconnection'] },
    ],
    expectedTags: ['cnc', 'primal', 'rough', 'struggle', 'fantasy'],
    expectedIntensity: 4.5,
  },

  // Journey 44: Striptease/Lap Dance Lover
  {
    id: 'striptease_lover',
    name: 'Striptease & Performance Journey',
    description: 'User who loves erotic performance and teasing',
    expectedArchetype: 'exhibitionist',
    bodyMapResponses: [
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['thighs', 'chest', 'hips'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['thighs', 'chest', 'hips'] },
    ],
    sceneResponses: [
      { sceneId: 'striptease', liked: true, rating: 5, elementsSelected: ['slow', 'tease', 'music'] },
      { sceneId: 'lap_dance', liked: true, rating: 5, elementsSelected: ['grinding', 'tease', 'no_touch'] },
      { sceneId: 'lingerie', liked: true, rating: 5, elementsSelected: ['reveal', 'sexy', 'tease'] },
      { sceneId: 'exhibitionism', liked: true, rating: 4, elementsSelected: ['performance', 'watched'] },
      { sceneId: 'boudoir', liked: true, rating: 4, elementsSelected: ['posing', 'elegant'] },
      { sceneId: 'stranger_roleplay', liked: true, rating: 4, elementsSelected: ['seduction', 'tease'] },
    ],
    expectedTags: ['striptease', 'performance', 'tease', 'lap_dance', 'exhibition'],
    expectedIntensity: 2,
  },

  // Journey 45: Swinger/Couple Play
  {
    id: 'swinger',
    name: 'Swinger Journey',
    description: 'User interested in couple swapping and swinging',
    expectedArchetype: 'hedonist',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'neck'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'neck'] },
    ],
    sceneResponses: [
      { sceneId: 'swinging', liked: true, rating: 5, elementsSelected: ['swap', 'party', 'variety'] },
      { sceneId: 'hotwife', liked: true, rating: 4, elementsSelected: ['sharing', 'watching'] },
      { sceneId: 'threesome_fmf', liked: true, rating: 5, elementsSelected: ['sharing', 'together'] },
      { sceneId: 'threesome_mfm', liked: true, rating: 5, elementsSelected: ['sharing', 'together'] },
      { sceneId: 'orgy', liked: true, rating: 4, elementsSelected: ['couples', 'variety'] },
      { sceneId: 'voyeurism', liked: true, rating: 4, elementsSelected: ['watching_couples'] },
    ],
    expectedTags: ['swinging', 'sharing', 'couples', 'group', 'variety'],
    expectedIntensity: 3,
  },

  // Journey 46: WLW (Women Loving Women)
  {
    id: 'wlw_lesbian',
    name: 'WLW Lesbian Journey',
    description: 'Female user attracted to women',
    expectedArchetype: 'romantic_lover',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'neck', 'chest', 'inner_thighs'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'neck', 'chest', 'inner_thighs'] },
      { activityId: 'licking', pass: 'give', zonesSelected: ['nipples', 'genitals', 'neck'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['nipples', 'genitals', 'neck'] },
    ],
    sceneResponses: [
      { sceneId: 'wlw', liked: true, rating: 5, elementsSelected: ['lesbian', 'intimate', 'mutual'] },
      { sceneId: 'cunnilingus', liked: true, rating: 5, elementsSelected: ['giving', 'receiving', 'mutual'] },
      { sceneId: 'sixty_nine', liked: true, rating: 5, elementsSelected: ['mutual', 'simultaneous'] },
      { sceneId: 'facesitting_f_on_m', liked: false, rating: 1, elementsSelected: [] },
      { sceneId: 'threesome_fmf', liked: true, rating: 4, elementsSelected: ['women', 'together'] },
      { sceneId: 'vibrator_play', liked: true, rating: 5, elementsSelected: ['together', 'sharing'] },
    ],
    expectedTags: ['wlw', 'lesbian', 'cunnilingus', 'mutual', 'romantic'],
    expectedIntensity: 2,
  },

  // Journey 47: MLM (Men Loving Men)
  {
    id: 'mlm_gay',
    name: 'MLM Gay Journey',
    description: 'Male user attracted to men',
    expectedArchetype: 'romantic_lover',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'neck', 'chest'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'neck', 'chest'] },
      { activityId: 'licking', pass: 'give', zonesSelected: ['nipples', 'genitals'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['nipples', 'genitals'] },
    ],
    sceneResponses: [
      { sceneId: 'mlm', liked: true, rating: 5, elementsSelected: ['gay', 'intimate', 'mutual'] },
      { sceneId: 'blowjob', liked: true, rating: 5, elementsSelected: ['giving', 'receiving'] },
      { sceneId: 'anal_play_on_him', liked: true, rating: 5, elementsSelected: ['mutual', 'penetration'] },
      { sceneId: 'rimming_f_to_m', liked: false, rating: 1, elementsSelected: [] },
      { sceneId: 'body_worship_f_to_m', liked: true, rating: 4, elementsSelected: ['muscle', 'adoration'] },
      { sceneId: 'sixty_nine', liked: true, rating: 5, elementsSelected: ['mutual'] },
    ],
    expectedTags: ['mlm', 'gay', 'anal', 'mutual', 'romantic'],
    expectedIntensity: 2.5,
  },

  // Journey 48: Watersports Enthusiast
  {
    id: 'watersports',
    name: 'Watersports Journey',
    description: 'User interested in golden shower play',
    expectedArchetype: 'fetishist',
    bodyMapResponses: [
      { activityId: 'licking', pass: 'give', zonesSelected: ['genitals', 'inner_thighs'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['genitals', 'inner_thighs'] },
    ],
    sceneResponses: [
      { sceneId: 'golden_shower_m_to_f', liked: true, rating: 5, elementsSelected: ['marking', 'taboo', 'degradation'] },
      { sceneId: 'golden_shower_f_to_m', liked: true, rating: 5, elementsSelected: ['domination', 'taboo'] },
      { sceneId: 'degradation_m_to_f', liked: true, rating: 4, elementsSelected: ['humiliation', 'dirty'] },
      { sceneId: 'degradation_f_to_m', liked: true, rating: 4, elementsSelected: ['humiliation'] },
      { sceneId: 'free_use', liked: true, rating: 3, elementsSelected: ['used'] },
      { sceneId: 'enema', liked: true, rating: 3, elementsSelected: ['intimate', 'taboo'] },
    ],
    expectedTags: ['watersports', 'golden_shower', 'taboo', 'degradation', 'marking'],
    expectedIntensity: 4,
  },

  // Journey 49: Body Worship Receiver (Male)
  {
    id: 'body_worship_receiver',
    name: 'Body Worship Receiver Journey',
    description: 'Male user who enjoys receiving worship',
    expectedArchetype: 'dominant',
    bodyMapResponses: [
      { activityId: 'licking', pass: 'give', zonesSelected: [] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['chest', 'stomach', 'genitals', 'feet'] },
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['chest', 'hands', 'feet'] },
    ],
    sceneResponses: [
      { sceneId: 'body_worship_f_to_m', liked: true, rating: 5, elementsSelected: ['adoration', 'muscle', 'worship'] },
      { sceneId: 'foot_worship_f_to_m', liked: true, rating: 5, elementsSelected: ['worship', 'devotion'] },
      { sceneId: 'massage_f_to_m', liked: true, rating: 5, elementsSelected: ['service', 'relaxation'] },
      { sceneId: 'blowjob', liked: true, rating: 5, elementsSelected: ['worship', 'service'] },
      { sceneId: 'praise_f_to_m', liked: true, rating: 4, elementsSelected: ['adoration'] },
      { sceneId: 'collar_m_owns_f', liked: true, rating: 4, elementsSelected: ['ownership'] },
    ],
    expectedTags: ['worship', 'service', 'adoration', 'dominant', 'receiving'],
    expectedIntensity: 2,
  },

  // Journey 50: Location/Environment Lover
  {
    id: 'location_lover',
    name: 'Location & Environment Journey',
    description: 'User aroused by specific locations and environments',
    expectedArchetype: 'hedonist',
    bodyMapResponses: [
      { activityId: 'kissing', pass: 'give', zonesSelected: ['lips', 'neck'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['lips', 'neck'] },
    ],
    sceneResponses: [
      { sceneId: 'locations', liked: true, rating: 5, elementsSelected: ['variety', 'adventure', 'new'] },
      { sceneId: 'kitchen_counter', liked: true, rating: 5, elementsSelected: ['spontaneous', 'domestic'] },
      { sceneId: 'positions', liked: true, rating: 4, elementsSelected: ['variety', 'exploration'] },
      { sceneId: 'shower_sex', liked: true, rating: 5, elementsSelected: ['wet', 'slippery'] },
      { sceneId: 'car_sex', liked: true, rating: 4, elementsSelected: ['cramped', 'thrill'] },
      { sceneId: 'public_sex', liked: true, rating: 4, elementsSelected: ['outdoors', 'risk'] },
    ],
    expectedTags: ['locations', 'variety', 'spontaneous', 'adventure', 'exploration'],
    expectedIntensity: 2,
  },

  // Journey 51: Morning Teasing Lover
  {
    id: 'morning_tease',
    name: 'Morning Teasing Journey',
    description: 'User who enjoys slow morning intimacy and teasing',
    expectedArchetype: 'sensualist',
    bodyMapResponses: [
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['back', 'thighs', 'stomach', 'chest'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['back', 'thighs', 'stomach', 'chest'] },
      { activityId: 'kissing', pass: 'give', zonesSelected: ['neck', 'shoulders', 'back'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['neck', 'shoulders', 'back'] },
    ],
    sceneResponses: [
      { sceneId: 'morning_teasing', liked: true, rating: 5, elementsSelected: ['slow', 'sleepy', 'buildup'] },
      { sceneId: 'morning_sex', liked: true, rating: 5, elementsSelected: ['lazy', 'intimate'] },
      { sceneId: 'casual_touch', liked: true, rating: 5, elementsSelected: ['natural', 'affection'] },
      { sceneId: 'massage_m_to_f', liked: true, rating: 4, elementsSelected: ['relaxing', 'sensual'] },
      { sceneId: 'edging_m_to_f', liked: true, rating: 4, elementsSelected: ['teasing', 'slow'] },
      { sceneId: 'feather_tickle', liked: true, rating: 4, elementsSelected: ['light', 'teasing'] },
    ],
    expectedTags: ['morning', 'teasing', 'sensual', 'slow', 'intimate'],
    expectedIntensity: 1.5,
  },

  // Journey 52: Squirting Enthusiast
  {
    id: 'squirting_fan',
    name: 'Squirting Enthusiast Journey',
    description: 'User aroused by female ejaculation',
    expectedArchetype: 'hedonist',
    bodyMapResponses: [
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['genitals', 'inner_thighs'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['genitals'] },
    ],
    sceneResponses: [
      { sceneId: 'squirting', liked: true, rating: 5, elementsSelected: ['gspot', 'intense', 'visual'] },
      { sceneId: 'forced_orgasm', liked: true, rating: 5, elementsSelected: ['multiple', 'overwhelming'] },
      { sceneId: 'edging_m_to_f', liked: true, rating: 4, elementsSelected: ['buildup', 'release'] },
      { sceneId: 'cunnilingus', liked: true, rating: 5, elementsSelected: ['skill', 'pleasure'] },
      { sceneId: 'vibrator_play', liked: true, rating: 5, elementsSelected: ['intense', 'stimulation'] },
      { sceneId: 'fucking_machine', liked: true, rating: 4, elementsSelected: ['relentless'] },
    ],
    expectedTags: ['squirting', 'orgasm', 'gspot', 'intense', 'pleasure'],
    expectedIntensity: 3,
  },

  // Journey 53: Facesitting (M on F)
  {
    id: 'facesitting_m_dom',
    name: 'Male Facesitting Journey',
    description: 'Male user who enjoys facesitting on partner',
    expectedArchetype: 'dominant',
    bodyMapResponses: [
      { activityId: 'licking', pass: 'give', zonesSelected: [] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['genitals'] },
    ],
    sceneResponses: [
      { sceneId: 'facesitting_m_on_f', liked: true, rating: 5, elementsSelected: ['control', 'worship', 'use'] },
      { sceneId: 'deepthroat', liked: true, rating: 5, elementsSelected: ['control', 'use'] },
      { sceneId: 'blowjob', liked: true, rating: 5, elementsSelected: ['service'] },
      { sceneId: 'degradation_m_to_f', liked: true, rating: 4, elementsSelected: ['use'] },
      { sceneId: 'choking_m_to_f', liked: true, rating: 4, elementsSelected: ['control'] },
      { sceneId: 'collar_m_owns_f', liked: true, rating: 4, elementsSelected: ['ownership'] },
    ],
    expectedTags: ['facesitting', 'oral', 'control', 'dominant', 'use'],
    expectedIntensity: 3.5,
  },

  // Journey 54: Spitting Enthusiast
  {
    id: 'spitting',
    name: 'Spitting Enthusiast Journey',
    description: 'User aroused by spitting play',
    expectedArchetype: 'dominant',
    bodyMapResponses: [
      { activityId: 'licking', pass: 'give', zonesSelected: ['face', 'chest'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['face'] },
    ],
    sceneResponses: [
      { sceneId: 'spitting_m_to_f', liked: true, rating: 5, elementsSelected: ['degradation', 'marking', 'dominance'] },
      { sceneId: 'spitting_f_to_m', liked: true, rating: 5, elementsSelected: ['humiliation', 'submission'] },
      { sceneId: 'degradation_m_to_f', liked: true, rating: 5, elementsSelected: ['humiliation', 'dirty'] },
      { sceneId: 'degradation_f_to_m', liked: true, rating: 5, elementsSelected: ['humiliation'] },
      { sceneId: 'deepthroat', liked: true, rating: 4, elementsSelected: ['sloppy', 'messy'] },
      { sceneId: 'free_use', liked: true, rating: 3, elementsSelected: ['use'] },
    ],
    expectedTags: ['spitting', 'degradation', 'humiliation', 'marking', 'dirty'],
    expectedIntensity: 4,
  },

  // Journey 55: Armpit Fetishist
  {
    id: 'armpit_fetish',
    name: 'Armpit Fetishist Journey',
    description: 'User with armpit attraction',
    expectedArchetype: 'fetishist',
    bodyMapResponses: [
      { activityId: 'licking', pass: 'give', zonesSelected: ['armpits'] },
      { activityId: 'licking', pass: 'receive', zonesSelected: ['armpits'] },
      { activityId: 'kissing', pass: 'give', zonesSelected: ['armpits', 'neck'] },
      { activityId: 'kissing', pass: 'receive', zonesSelected: ['armpits', 'neck'] },
    ],
    sceneResponses: [
      { sceneId: 'armpit', liked: true, rating: 5, elementsSelected: ['scent', 'worship', 'licking'] },
      { sceneId: 'body_worship_m_to_f', liked: true, rating: 4, elementsSelected: ['worship', 'scent'] },
      { sceneId: 'body_worship_f_to_m', liked: true, rating: 4, elementsSelected: ['worship'] },
      { sceneId: 'primal', liked: true, rating: 3, elementsSelected: ['scent', 'natural'] },
      { sceneId: 'massage_m_to_f', liked: true, rating: 3, elementsSelected: ['body'] },
      { sceneId: 'bondage_m_ties_f', liked: true, rating: 3, elementsSelected: ['exposure'] },
    ],
    expectedTags: ['armpit', 'scent', 'worship', 'fetish', 'body'],
    expectedIntensity: 2,
  },

  // Journey 56: Figging/Ginger Play
  {
    id: 'figging',
    name: 'Figging Journey',
    description: 'User interested in figging (ginger) play',
    expectedArchetype: 'masochist',
    bodyMapResponses: [
      { activityId: 'spanking', pass: 'give', zonesSelected: [] },
      { activityId: 'spanking', pass: 'receive', zonesSelected: ['buttocks'] },
    ],
    sceneResponses: [
      { sceneId: 'figging', liked: true, rating: 5, elementsSelected: ['burning', 'intense', 'punishment'] },
      { sceneId: 'anal_play_on_her', liked: true, rating: 4, elementsSelected: ['insertion', 'sensation'] },
      { sceneId: 'anal_play_on_him', liked: true, rating: 4, elementsSelected: ['sensation'] },
      { sceneId: 'spanking_m_to_f', liked: true, rating: 4, elementsSelected: ['punishment', 'discipline'] },
      { sceneId: 'wax_play_m_to_f', liked: true, rating: 4, elementsSelected: ['heat', 'pain'] },
      { sceneId: 'edging_m_to_f', liked: true, rating: 3, elementsSelected: ['torture'] },
    ],
    expectedTags: ['figging', 'anal', 'pain', 'punishment', 'sensation'],
    expectedIntensity: 4,
  },

  // Journey 57: Vibrator Play
  {
    id: 'vibrator_lover',
    name: 'Vibrator Enthusiast Journey',
    description: 'User who loves vibrator stimulation',
    expectedArchetype: 'sensualist',
    bodyMapResponses: [
      { activityId: 'light_touch', pass: 'give', zonesSelected: ['genitals', 'nipples'] },
      { activityId: 'light_touch', pass: 'receive', zonesSelected: ['genitals', 'nipples'] },
    ],
    sceneResponses: [
      { sceneId: 'vibrator', liked: true, rating: 5, elementsSelected: ['stimulation', 'orgasm'] },
      { sceneId: 'vibrator_play', liked: true, rating: 5, elementsSelected: ['teasing', 'intensity'] },
      { sceneId: 'remote_control_toy', liked: true, rating: 5, elementsSelected: ['surprise', 'public'] },
      { sceneId: 'edging_m_to_f', liked: true, rating: 4, elementsSelected: ['teasing', 'buildup'] },
      { sceneId: 'forced_orgasm', liked: true, rating: 4, elementsSelected: ['multiple', 'intense'] },
      { sceneId: 'blindfold', liked: true, rating: 4, elementsSelected: ['sensation', 'anticipation'] },
    ],
    expectedTags: ['vibrator', 'toys', 'stimulation', 'orgasm', 'sensation'],
    expectedIntensity: 2.5,
  },
];

// ============================================
// TEST RUNNER
// ============================================

import flowEngine, { createFlowState, FlowState } from './flow-engine';
import profileGenerator from './profile-generator';

export interface JourneyTestResult {
  journeyId: string;
  journeyName: string;
  passed: boolean;
  actualArchetype: string;
  expectedArchetype: string;
  actualIntensity: number;
  expectedIntensity: number;
  matchedTags: string[];
  missingTags: string[];
  unexpectedTags: string[];
}

/**
 * Run a single test journey
 */
export function runJourneyTest(
  journey: TestJourney,
  scenes: any[]
): JourneyTestResult {
  // Initialize state
  let state = createFlowState();

  // Process body map
  state = flowEngine.processBodyMapResponses(state, journey.bodyMapResponses);

  // Process scene responses
  for (const response of journey.sceneResponses) {
    const scene = scenes.find(s => s.id === response.sceneId);
    if (scene) {
      const fullResponse = {
        sceneId: response.sceneId,
        liked: response.liked,
        rating: response.rating,
        elementsSelected: response.elementsSelected,
        followUpAnswers: {},
      };
      state = flowEngine.processSceneResponse(state, fullResponse, scene);
    }
  }

  // Generate profile
  const profile = profileGenerator.generateProfile(
    state,
    scenes.length,
    journey.bodyMapResponses.length
  );

  // Check results
  const actualArchetype = profile.primaryArchetype.id;
  const archetypeMatch = actualArchetype === journey.expectedArchetype;

  const intensityMatch = Math.abs(
    profile.preferredIntensity - journey.expectedIntensity
  ) <= 0.5;

  const actualTopTags = profile.topTags.slice(0, 10).map(t => t.tag);
  const matchedTags = journey.expectedTags.filter(t => actualTopTags.includes(t));
  const missingTags = journey.expectedTags.filter(t => !actualTopTags.includes(t));
  const unexpectedTags = actualTopTags.filter(t => !journey.expectedTags.includes(t));

  const tagMatch = matchedTags.length >= journey.expectedTags.length * 0.6;

  return {
    journeyId: journey.id,
    journeyName: journey.name,
    passed: archetypeMatch && intensityMatch && tagMatch,
    actualArchetype,
    expectedArchetype: journey.expectedArchetype,
    actualIntensity: profile.preferredIntensity,
    expectedIntensity: journey.expectedIntensity,
    matchedTags,
    missingTags,
    unexpectedTags,
  };
}

/**
 * Run all test journeys
 */
export function runAllJourneyTests(scenes: any[]): {
  passed: number;
  failed: number;
  results: JourneyTestResult[];
} {
  const results = testJourneys.map(j => runJourneyTest(j, scenes));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  return { passed, failed, results };
}

/**
 * Print test results
 */
export function printTestResults(results: JourneyTestResult[]): void {
  console.log('\n=== Test Journey Results ===\n');

  for (const r of results) {
    const status = r.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`${status}: ${r.journeyName}`);
    console.log(`  Archetype: ${r.actualArchetype} (expected: ${r.expectedArchetype})`);
    console.log(`  Intensity: ${r.actualIntensity.toFixed(1)} (expected: ${r.expectedIntensity})`);
    console.log(`  Matched tags: ${r.matchedTags.join(', ')}`);
    if (r.missingTags.length > 0) {
      console.log(`  Missing tags: ${r.missingTags.join(', ')}`);
    }
    console.log('');
  }

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log(`\nTotal: ${passed}/${total} passed\n`);
}

export default {
  testJourneys,
  runJourneyTest,
  runAllJourneyTests,
  printTestResults,
};
