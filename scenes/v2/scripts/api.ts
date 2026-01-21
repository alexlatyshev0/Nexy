/**
 * API Endpoints for Discovery 2
 *
 * Express/Hono compatible endpoint handlers
 * Can be adapted to any Node.js framework
 */

import flowEngine, {
  FlowState,
  Scene,
  UserResponse,
  BodyMapResponse,
  createFlowState,
} from './flow-engine';
import profileGenerator, { UserProfile } from './profile-generator';
import coupleMatcher, { CoupleCompatibility } from './couple-matcher';

// Types for API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SessionData {
  userId: string;
  flowState: FlowState;
  responses: UserResponse[];
  bodyMapResponses: BodyMapResponse[];
  startedAt: Date;
  updatedAt: Date;
}

// In-memory session store (replace with Redis/DB in production)
const sessions = new Map<string, SessionData>();

// Scene cache (load from JSON files)
let scenesCache: Scene[] | null = null;

/**
 * Load all scenes (cached)
 */
async function loadScenes(): Promise<Scene[]> {
  if (scenesCache) return scenesCache;

  // In production, load from filesystem or DB
  // For now, return empty - scenes should be loaded by the app
  scenesCache = [];
  return scenesCache;
}

/**
 * Set scenes cache externally
 */
export function setScenesCache(scenes: Scene[]): void {
  scenesCache = scenes;
}

// ============================================
// SESSION ENDPOINTS
// ============================================

/**
 * POST /api/discovery/start
 * Start a new discovery session
 */
export async function startSession(userId: string): Promise<ApiResponse<{ sessionId: string }>> {
  const sessionId = `sess_${userId}_${Date.now()}`;

  const session: SessionData = {
    userId,
    flowState: createFlowState(),
    responses: [],
    bodyMapResponses: [],
    startedAt: new Date(),
    updatedAt: new Date(),
  };

  sessions.set(sessionId, session);

  return {
    success: true,
    data: { sessionId },
  };
}

/**
 * GET /api/discovery/:sessionId
 * Get session status
 */
export async function getSession(sessionId: string): Promise<ApiResponse<{
  flowState: FlowState;
  responsesCount: number;
  progress: number;
}>> {
  const session = sessions.get(sessionId);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  const scenes = await loadScenes();
  const progress = scenes.length > 0
    ? Math.round((session.flowState.seenScenes.size / scenes.length) * 100)
    : 0;

  return {
    success: true,
    data: {
      flowState: session.flowState,
      responsesCount: session.responses.length,
      progress,
    },
  };
}

// ============================================
// BODY MAP ENDPOINTS
// ============================================

/**
 * POST /api/discovery/:sessionId/bodymap
 * Submit body map responses
 */
export async function submitBodyMap(
  sessionId: string,
  responses: BodyMapResponse[]
): Promise<ApiResponse<{ tagScores: Record<string, number> }>> {
  const session = sessions.get(sessionId);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  // Process body map responses
  session.flowState = flowEngine.processBodyMapResponses(session.flowState, responses);
  session.bodyMapResponses.push(...responses);
  session.updatedAt = new Date();

  return {
    success: true,
    data: {
      tagScores: session.flowState.tagScores,
    },
  };
}

// ============================================
// SCENE FLOW ENDPOINTS
// ============================================

/**
 * GET /api/discovery/:sessionId/next-scene
 * Get the next scene to show
 */
export async function getNextScene(sessionId: string): Promise<ApiResponse<{
  scene: Scene | null;
  remainingCount: number;
  calibrationComplete: boolean;
}>> {
  const session = sessions.get(sessionId);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  const scenes = await loadScenes();
  const nextScene = flowEngine.getNextScene(scenes, session.flowState);

  const remainingScenes = scenes.filter(
    s => !session.flowState.seenScenes.has(s.id)
  );

  return {
    success: true,
    data: {
      scene: nextScene,
      remainingCount: remainingScenes.length,
      calibrationComplete: session.flowState.calibrationComplete,
    },
  };
}

/**
 * GET /api/discovery/:sessionId/scenes
 * Get ordered list of all remaining scenes
 */
export async function getOrderedScenes(sessionId: string): Promise<ApiResponse<{
  scenes: Scene[];
  total: number;
  completed: number;
}>> {
  const session = sessions.get(sessionId);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  const scenes = await loadScenes();
  const orderedScenes = flowEngine.getOrderedScenes(scenes, session.flowState);

  return {
    success: true,
    data: {
      scenes: orderedScenes,
      total: scenes.length,
      completed: session.flowState.seenScenes.size,
    },
  };
}

/**
 * POST /api/discovery/:sessionId/response
 * Submit response to a scene
 */
export async function submitSceneResponse(
  sessionId: string,
  response: UserResponse
): Promise<ApiResponse<{
  tagScores: Record<string, number>;
  nextScene: Scene | null;
}>> {
  const session = sessions.get(sessionId);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  const scenes = await loadScenes();
  const scene = scenes.find(s => s.id === response.sceneId);

  if (!scene) {
    return { success: false, error: 'Scene not found' };
  }

  // Process response
  session.flowState = flowEngine.processSceneResponse(
    session.flowState,
    response,
    scene
  );
  session.responses.push(response);
  session.updatedAt = new Date();

  // Trigger runtime AI in background (if enabled)
  if (session.flowState.runtimeAiEnabled) {
    const remainingScenes = scenes.filter(
      s => !session.flowState.seenScenes.has(s.id)
    );

    flowEngine.triggerRuntimeAI(
      session.flowState,
      remainingScenes,
      session.responses
    ).then(predictions => {
      if (Object.keys(predictions).length > 0) {
        session.flowState.aiPredictions = predictions;
      }
    });
  }

  // Get next scene
  const nextScene = flowEngine.getNextScene(scenes, session.flowState);

  return {
    success: true,
    data: {
      tagScores: session.flowState.tagScores,
      nextScene,
    },
  };
}

// ============================================
// PROFILE ENDPOINTS
// ============================================

/**
 * GET /api/discovery/:sessionId/profile
 * Generate user profile from responses
 */
export async function getProfile(sessionId: string): Promise<ApiResponse<UserProfile>> {
  const session = sessions.get(sessionId);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  const scenes = await loadScenes();
  const profile = profileGenerator.generateProfile(
    session.flowState,
    scenes.length,
    session.bodyMapResponses.length
  );

  return {
    success: true,
    data: profile,
  };
}

/**
 * GET /api/discovery/:sessionId/profile/summary
 * Get profile summary text
 */
export async function getProfileSummary(
  sessionId: string,
  language: 'ru' | 'en' = 'ru'
): Promise<ApiResponse<{ summary: string }>> {
  const session = sessions.get(sessionId);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  const scenes = await loadScenes();
  const profile = profileGenerator.generateProfile(
    session.flowState,
    scenes.length,
    session.bodyMapResponses.length
  );

  const summary = profileGenerator.generateProfileSummary(profile, language);

  return {
    success: true,
    data: { summary },
  };
}

// ============================================
// COUPLE COMPATIBILITY ENDPOINTS
// ============================================

/**
 * POST /api/compatibility
 * Analyze compatibility between two profiles
 */
export async function analyzeCompatibility(
  sessionIdA: string,
  sessionIdB: string
): Promise<ApiResponse<CoupleCompatibility>> {
  const sessionA = sessions.get(sessionIdA);
  const sessionB = sessions.get(sessionIdB);

  if (!sessionA || !sessionB) {
    return { success: false, error: 'One or both sessions not found' };
  }

  const scenes = await loadScenes();

  const profileA = profileGenerator.generateProfile(
    sessionA.flowState,
    scenes.length,
    sessionA.bodyMapResponses.length
  );

  const profileB = profileGenerator.generateProfile(
    sessionB.flowState,
    scenes.length,
    sessionB.bodyMapResponses.length
  );

  const compatibility = coupleMatcher.analyzeCompatibility(profileA, profileB);

  return {
    success: true,
    data: compatibility,
  };
}

// ============================================
// IMAGE ENDPOINTS
// ============================================

/**
 * POST /api/images/upload
 * Upload an image for a scene or clothing item
 */
export async function uploadImage(
  id: string,
  type: 'scene' | 'clothing',
  file: Buffer
): Promise<ApiResponse<{ path: string }>> {
  // In production, save to S3/storage
  // Update image-manifest.json with ready: true

  const basePath = type === 'scene' ? 'images/scenes/' : 'images/clothing/';
  const path = `${basePath}${id}.jpg`;

  // Placeholder - implement actual storage
  console.log(`[ImageUpload] Would save ${type} image for ${id} to ${path}`);

  return {
    success: true,
    data: { path },
  };
}

/**
 * GET /api/images/manifest
 * Get image manifest with status
 */
export async function getImageManifest(): Promise<ApiResponse<{
  total: number;
  ready: number;
  pending: string[];
}>> {
  // Load from image-manifest.json
  // Return summary

  return {
    success: true,
    data: {
      total: 129,
      ready: 0,
      pending: ['all'],
    },
  };
}

// ============================================
// RUNTIME AI CONFIG
// ============================================

/**
 * POST /api/discovery/:sessionId/enable-ai
 * Enable runtime AI for premium users
 */
export async function enableRuntimeAI(sessionId: string): Promise<ApiResponse<{ enabled: boolean }>> {
  const session = sessions.get(sessionId);
  if (!session) {
    return { success: false, error: 'Session not found' };
  }

  session.flowState.runtimeAiEnabled = true;

  return {
    success: true,
    data: { enabled: true },
  };
}

// ============================================
// EXPRESS ROUTER EXAMPLE
// ============================================

/**
 * Example Express router setup
 *
 * import express from 'express';
 * import * as api from './api';
 *
 * const router = express.Router();
 *
 * router.post('/discovery/start', async (req, res) => {
 *   const result = await api.startSession(req.body.userId);
 *   res.json(result);
 * });
 *
 * router.get('/discovery/:sessionId', async (req, res) => {
 *   const result = await api.getSession(req.params.sessionId);
 *   res.json(result);
 * });
 *
 * // ... etc
 *
 * export default router;
 */

export default {
  // Session
  startSession,
  getSession,

  // Body Map
  submitBodyMap,

  // Scene Flow
  getNextScene,
  getOrderedScenes,
  submitSceneResponse,

  // Profile
  getProfile,
  getProfileSummary,

  // Compatibility
  analyzeCompatibility,

  // Images
  uploadImage,
  getImageManifest,

  // Config
  enableRuntimeAI,
  setScenesCache,
};
