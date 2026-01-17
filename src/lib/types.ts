// User & Profile Types
export interface Profile {
  id: string;
  gender: 'male' | 'female' | 'other' | 'undisclosed';
  interested_in: 'male' | 'female' | 'both';
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PreferenceProfile {
  id: string;
  user_id: string;
  preferences: Record<string, unknown>;
  updated_at: string;
}

// Scene Types
export interface SceneParticipant {
  role: 'dominant' | 'submissive' | 'active' | 'passive' | 'equal';
  gender: 'male' | 'female' | 'any';
  action: string;
}

export interface Scene {
  id: string;
  slug?: string;
  image_url: string | null;
  description: string;
  generation_prompt?: string;
  participants: SceneParticipant[];
  dimensions: string[];
  tags: string[];
  intensity: number;
  relevant_for: {
    gender: 'male' | 'female' | 'any';
    interested_in: 'male' | 'female' | 'both' | 'any';
  };
  created_at: string;
  // QA fields
  original_prompt?: string;
  final_prompt?: string;
  qa_status?: 'passed' | 'failed' | null;
  qa_attempts?: number;
  qa_last_assessment?: Record<string, unknown>;
}

// Question Types
export type AnswerType = 'scale' | 'multiple_choice' | 'yes_no' | 'trinary' | 'body_map';

export interface QuestionOption {
  id: string;
  text: string;
  dimension: string;
}

export interface GeneratedQuestion {
  question: string;
  answerType: AnswerType;
  scaleLabels?: { min: string; max: string };
  options?: QuestionOption[];
  allowMultiple?: boolean;
  targetDimensions: string[];
}

// Answer Types
export interface ScaleAnswer {
  value: number;
}

export interface MultipleChoiceAnswer {
  selected: string[];
}

export interface YesNoAnswer {
  value: boolean;
}

export interface TrinaryAnswer {
  value: 'yes' | 'maybe' | 'no';
}

// ============================================
// BODY MAP TYPES
// ============================================

// Actions that can be performed on body zones
export type BodyAction =
  | 'kiss'           // Целовать
  | 'lick_suck'      // Лизать/сосать
  | 'light_slap'     // Легонько шлёпать
  | 'spank'          // Пороть
  | 'bite_scratch'   // Кусать/царапать
  | 'squeeze_twist'; // Сжимать/крутить

// User preference for a body zone
export type ZonePreference = 'love' | 'sometimes' | 'no';

// Body zone identifiers
export type BodyZoneId =
  // Face
  | 'lips'
  | 'cheeks'
  | 'ears'
  | 'hair'
  | 'nape'
  // Neck
  | 'neck'
  // Chest/torso
  | 'nipples'
  | 'chest'
  | 'belly'
  // Arms
  | 'shoulders'
  | 'hands'
  | 'fingers'
  // Back
  | 'upper_back'
  | 'lower_back'
  // Buttocks
  | 'buttocks'
  // Male genitals
  | 'penis'
  | 'testicles'
  // Female genitals
  | 'vulva'
  | 'clitoris'
  // Anus
  | 'anus'
  // Legs
  | 'inner_thighs'
  | 'feet';

// Body view (front or back)
export type BodyView = 'front' | 'back';

// Gender for silhouette display
export type BodyGender = 'male' | 'female';

// Single zone marking
export interface BodyZoneMarking {
  zoneId: BodyZoneId;
  preference: ZonePreference;
}

// One pass answer (for one action, one subject)
export interface BodyMapPassAnswer {
  action: BodyAction;
  subject: 'give' | 'receive';
  markings: BodyZoneMarking[];
}

// Full body map answer
export interface BodyMapAnswer {
  passes: BodyMapPassAnswer[];
}

// Body map scene configuration
export interface BodyMapSceneConfig {
  action: BodyAction;
  passes: Array<{
    subject: 'give' | 'receive';
    question: LocalizedString;
  }>;
  availableZones?: BodyZoneId[];
}

export type Answer = ScaleAnswer | MultipleChoiceAnswer | YesNoAnswer | TrinaryAnswer | BodyMapAnswer;

// Response Types
export interface SceneResponse {
  id: string;
  user_id: string;
  scene_id: string;
  question_asked: string;
  question_type: AnswerType;
  answer: Answer;
  profile_updates: Record<string, unknown> | null;
  created_at: string;
}

// Partnership Types
export interface Partnership {
  id: string;
  user_id: string;
  partner_id: string;
  inviter_id: string;
  invite_code: string | null;
  nickname: string | null;
  status: 'pending' | 'active' | 'declined';
  created_at: string;
}

// Proposal Types
export interface Proposal {
  id: string;
  from_user_id: string;
  to_user_id: string;
  scene_id: string | null;
  dimension: string | null;
  status: 'pending' | 'shown' | 'answered';
  created_at: string;
}

// Date Types
export type DateMood = 'passionate' | 'tender' | 'playful' | 'intense' | 'surprise';

export interface DateSession {
  id: string;
  partnership_id: string;
  initiator_id: string;
  scheduled_for: string | null;
  mood: DateMood | null;
  status: 'pending' | 'ready' | 'completed' | 'canceled';
  created_at: string;
}

export interface DateResponse {
  id: string;
  date_id: string;
  user_id: string;
  scene_id: string;
  answer: 'yes' | 'maybe' | 'no';
  created_at: string;
}

// Subscription Types
export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'free' | 'monthly' | 'yearly' | 'lifetime';
  status: 'active' | 'canceled' | 'past_due';
  current_period_end: string | null;
  created_at: string;
}

// AI Message Types
export interface AIMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Match Result Types
export interface MatchResult {
  dimension: string;
  myValue: number;
  partnerValue: number;
  visibility: 'match' | 'partner_no' | 'hidden';
}

// Scene Source Types
export interface SceneSource {
  type: 'organic' | 'proposal' | 'partner_interest' | 'deepening';
  weight: number;
  scene: Scene;
}

// User Context for AI
export interface UserContext {
  gender: string;
  interestedIn: string;
  knownPreferences: Record<string, unknown>;
  recentResponses: SceneResponse[];
}

// ============================================
// V3 SCENE TYPES - Psychological Profiling
// ============================================

export type Locale = 'en' | 'ru';

export interface LocalizedString {
  en: string;
  ru: string;
}

// What psychological aspects this scene tests
export interface SceneTest {
  primary_kink: string;
  secondary_kinks: string[];
  power_dynamic: string;
  gender_role_aspect: string;
}

// Emotional responses expected from this scene
export interface EmotionalRange {
  positive: string[];
  negative: string[];
  curious: string[];
}

// Signals to track based on user response
export interface ProfileSignals {
  if_positive: string[];
  if_negative: string[];
  if_curious: string[];
}

// Correlation patterns
export interface Correlations {
  positive: string[];
  negative: string[];
}

// Taboo/sensitive topic handling
export interface TabooContext {
  level: 1 | 2 | 3 | 4 | 5;
  common_concerns: string[] | null;
  normalization: string | null;
}

// Full AI context for psychological profiling
export interface AIContext {
  description: string;
  tests: SceneTest;
  question_angles: Record<string, string>;
  emotional_range: EmotionalRange;
  profile_signals: ProfileSignals;
  correlations: Correlations;
  taboo_context: TabooContext;
}

// Follow-up question option
export interface FollowUpOption {
  id: string;
  label: LocalizedString;
  signal: string;
}

// Conditional follow-up question
export interface FollowUp {
  trigger: 'if_positive' | 'if_negative' | 'if_curious';
  detail_type: string;
  question: LocalizedString;
  options: FollowUpOption[];
}

// V3 Scene with full psychological profiling support
export interface SceneV3 extends Scene {
  slug: string;
  priority: number;
  generation_prompt?: string;
  user_description: LocalizedString;
  ai_context: AIContext;
  question_type: string;
  follow_up?: FollowUp | null;
  body_map_config?: BodyMapSceneConfig | null;
}

// Psychological profile for user
export interface PsychologicalProfile {
  id: string;
  user_id: string;
  test_scores: Record<string, number>;
  profile_signals: Record<string, number>;
  correlations_detected: string[];
  updated_at: string;
}

// Follow-up response record
export interface FollowUpResponse {
  id: string;
  user_id: string;
  scene_id: string;
  parent_response_id: string;
  option_id: string;
  profile_signal: string;
  created_at: string;
}

// ============================================
// V4 SCENE TYPES - Question Config System
// ============================================

// Question config types
export type QuestionConfigType = 'scale' | 'yes_maybe_no' | 'topic_drilldown' | 'what_appeals' | 'body_map';

// Context option for what_appeals type
export interface ContextOption {
  id: string;
  label: LocalizedString;
}

// Base question config
export interface QuestionConfigBase {
  type: QuestionConfigType;
  question: LocalizedString;
  topic_ref?: string;
  show_experience?: boolean;
}

// Scale question (0-100)
export interface ScaleQuestionConfig extends QuestionConfigBase {
  type: 'scale';
}

// Yes/Maybe/No question
export interface YesMaybeNoQuestionConfig extends QuestionConfigBase {
  type: 'yes_maybe_no';
}

// Topic drilldown question (links to preference-topics.json)
export interface TopicDrilldownQuestionConfig extends QuestionConfigBase {
  type: 'topic_drilldown';
  topic_ref: string; // Required for this type
}

// What appeals question (multi-choice with scene-specific options)
export interface WhatAppealsQuestionConfig extends QuestionConfigBase {
  type: 'what_appeals';
  context_options: ContextOption[];
}

// Body map question (interactive body zone selection)
export interface BodyMapQuestionConfig extends Omit<QuestionConfigBase, 'question'> {
  type: 'body_map';
  action: BodyAction;
  passes: Array<{
    subject: 'give' | 'receive';
    question: LocalizedString;
  }>;
}

// Union type for all question configs
export type QuestionConfig =
  | ScaleQuestionConfig
  | YesMaybeNoQuestionConfig
  | TopicDrilldownQuestionConfig
  | WhatAppealsQuestionConfig
  | BodyMapQuestionConfig;

// V4 AI Context (simplified - no question_angles)
export interface AIContextV4 {
  description: string;
  tests: SceneTest;
  emotional_range?: EmotionalRange;
  profile_signals?: ProfileSignals;
  taboo_context?: TabooContext;
}

// V4 Scene with question_config
export interface SceneV4 extends Omit<Scene, 'participants'> {
  slug: string;
  priority: number;
  schema_version: 4;
  generation_prompt?: string;
  user_description: LocalizedString;
  question_config: QuestionConfig;
  ai_context: AIContextV4;
  participants: string[]; // Simplified to string array in V4
  follow_up?: FollowUp | null;
  body_map_config?: BodyMapSceneConfig | null;
}

// Topic response record
export interface TopicResponse {
  id: string;
  user_id: string;
  topic_ref: string;
  interest_level: number;
  drilldown_responses: Record<string, unknown>;
  experience: {
    tried?: boolean;
    frequency?: string;
    want_to_try?: boolean;
  } | null;
  first_scene_id: string | null;
  created_at: string;
  updated_at: string;
}

// Experience response record
export interface ExperienceResponse {
  id: string;
  user_id: string;
  scene_id: string;
  has_tried: boolean;
  experience_rating: 'loved' | 'liked' | 'neutral' | 'disliked' | null;
  want_to_try: boolean | null;
  created_at: string;
}

// V4 Question response
export interface V4QuestionResponse {
  question: GeneratedQuestion;
  questionConfig: QuestionConfig;
  tabooContext?: TabooContext | null;
  followUp?: FollowUp | null;
  topicAlreadyAnswered?: boolean;
  existingTopicResponse?: TopicResponse | null;
  isV4: boolean;
}

// Signal update for psychological profiling
export interface SignalUpdate {
  signal: string;
  weight: number;
}

// V3 Question response with taboo and follow-up data
export interface V3QuestionResponse {
  question: GeneratedQuestion;
  tabooContext?: TabooContext | null;
  followUp?: FollowUp | null;
  isV3: boolean;
}
