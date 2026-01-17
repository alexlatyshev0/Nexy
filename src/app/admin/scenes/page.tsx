'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Scene, SceneV3 } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { STYLE_VARIANTS } from '@/lib/civitai-config';
import {
  Trash2,
  RefreshCw,
  Play,
  ImageIcon,
  Loader2,
  Check,
  X,
  Settings,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  RotateCcw,
  ShieldCheck,
  ShieldX,
  ShieldQuestion,
  Languages,
} from 'lucide-react';

type GenerationStatus = 'idle' | 'pending' | 'generating' | 'completed' | 'error';
type QAStatus = 'passed' | 'failed' | null;

// V3 fields that extend Scene
interface SceneWithStatus extends Scene {
  selected: boolean;
  status: GenerationStatus;
  error?: string;
  expanded?: boolean;
  // V3 fields
  slug?: string;
  priority?: number;
  user_description?: { en: string; ru: string };
  ai_context?: SceneV3['ai_context'];
  question_type?: string;
  follow_up?: SceneV3['follow_up'];
  // QA fields
  original_prompt?: string;
  final_prompt?: string;
  qa_status?: QAStatus;
  qa_attempts?: number;
  qa_last_assessment?: Record<string, unknown>;
  prompt_instructions?: string; // User notes for AI on how to modify prompt
  // UI state
  showOriginalPrompt?: boolean;
  showPromptInstructions?: boolean;
}

type ServiceType = 'civitai' | 'replicate';

// Resolution presets
const RESOLUTION_PRESETS = [
  { id: '3:2', name: '3:2 Landscape', width: 1024, height: 682 },
  { id: '2:3', name: '2:3 Portrait', width: 682, height: 1024 },
  { id: '1:1', name: '1:1 Square', width: 1024, height: 1024 },
  { id: '16:9', name: '16:9 Widescreen', width: 1344, height: 768 },
  { id: '9:16', name: '9:16 Vertical', width: 768, height: 1344 },
  { id: '4:3', name: '4:3 Standard', width: 1024, height: 768 },
  { id: '3:4', name: '3:4 Portrait', width: 768, height: 1024 },
];

interface GlobalSettings {
  service: ServiceType;
  styleVariant: keyof typeof STYLE_VARIANTS | 'default';
  stylePrefix: string;
  negativePrompt: string;
  modelId: string;
  aspectRatio: string;
  enableQA: boolean;
}

// Civitai models
const CIVITAI_MODELS = [
  { id: '2173364', name: 'CoMix v1.0 (Illustrious)' },
  { id: '4201', name: 'Realistic Vision v5.1' },
  { id: '139562', name: 'RealVisXL V5.0 Lightning' },
  { id: '312530', name: 'CyberRealistic XL v8.0' },
  { id: '277058', name: 'epiCRealism XL' },
  { id: '299933', name: 'Halcyon SDXL v1.9' },
  { id: '133005', name: 'Juggernaut XL' },
  { id: '101055', name: 'DreamShaper XL' },
  { id: '257749', name: 'Pony Diffusion XL (stylized)' },
  { id: '128713', name: 'SDXL Base 1.0' },
];

// Replicate models
const REPLICATE_MODELS = [
  { id: 'z-image-turbo', name: 'Z Image Turbo (super fast)' },
  { id: 'flux-schnell', name: 'FLUX Schnell (fast)' },
  { id: 'flux-dev', name: 'FLUX Dev' },
  { id: 'flux-pro', name: 'FLUX Pro' },
  { id: 'sdxl-lightning', name: 'SDXL Lightning (fast)' },
  { id: 'sdxl', name: 'SDXL' },
  { id: 'realistic-vision', name: 'Realistic Vision v5.1' },
  { id: 'juggernaut', name: 'Juggernaut XL' },
];

const SETTINGS_KEY = 'admin-scenes-settings';

const DEFAULT_SETTINGS: GlobalSettings = {
  service: 'civitai',
  styleVariant: 'default',
  stylePrefix: '',
  negativePrompt: '',
  modelId: '4201',
  aspectRatio: '3:2',
  enableQA: false,
};

function loadSettings(): GlobalSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: GlobalSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

interface LogEntry {
  time: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

// Build QA context from scene ai_context
function buildQAContext(scene: SceneWithStatus) {
  if (!scene.ai_context) {
    return null;
  }

  const aiContext = scene.ai_context;

  // Default key elements based on scene tests
  const keyElements = [];

  if (aiContext.tests?.primary_kink) {
    keyElements.push({
      element: aiContext.tests.primary_kink,
      critical: true,
      in_action: true,
    });
  }

  if (aiContext.tests?.secondary_kinks) {
    for (const kink of aiContext.tests.secondary_kinks.slice(0, 2)) {
      keyElements.push({
        element: kink,
        critical: false,
        in_action: false,
      });
    }
  }

  // Determine participants from scene
  const participants = scene.participants || [];
  const genders = participants.map((p) => p.gender === 'male' ? 'M' : p.gender === 'female' ? 'F' : 'any');

  return {
    essence: aiContext.description || scene.description,
    key_elements: keyElements.length > 0 ? keyElements : [
      { element: 'main subject visible', critical: true, in_action: false },
    ],
    mood: aiContext.emotional_range?.positive?.join(', ') || 'sensual',
    participants: {
      count: participants.length || 1,
      genders: genders.length > 0 ? genders : ['any'],
    },
  };
}

export default function AdminScenesPage() {
  const [scenes, setScenes] = useState<SceneWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(true);
  const [filter, setFilter] = useState<'all' | 'no_image' | 'has_image' | 'qa_failed'>('all');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [qaDetailScene, setQaDetailScene] = useState<SceneWithStatus | null>(null);

  // Ref to access current scenes in callbacks (avoids stale closure)
  const scenesRef = useRef<SceneWithStatus[]>([]);
  scenesRef.current = scenes;

  const supabase = createClient();

  // Load settings from localStorage on mount
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // Save settings when they change
  const updateSettings = (newSettings: GlobalSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-50), { time, message, type }]);
  };

  const loadScenes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('scenes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading scenes:', error);
      return;
    }

    // Debug: log scenes with QA status
    const qaScenes = (data || []).filter(s => s.qa_status);
    if (qaScenes.length > 0) {
      console.log('[LoadScenes] Scenes with QA status:', qaScenes.map(s => ({
        slug: s.slug,
        qa_status: s.qa_status,
        image_url: s.image_url,
        has_assessment: !!s.qa_last_assessment,
      })));
    }

    setScenes(
      (data || []).map((scene) => ({
        ...scene,
        selected: false,
        status: 'idle' as GenerationStatus,
      }))
    );
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadScenes();
  }, [loadScenes]);

  const filteredScenes = scenes.filter((scene) => {
    if (filter === 'no_image') return !scene.image_url;
    if (filter === 'has_image') return !!scene.image_url;
    if (filter === 'qa_failed') return scene.qa_status === 'failed';
    return true;
  });

  const selectedCount = scenes.filter((s) => s.selected).length;

  const toggleSelect = (id: string) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const selectAll = () => {
    const allSelected = filteredScenes.every((s) => s.selected);
    const filteredIds = new Set(filteredScenes.map((s) => s.id));
    setScenes((prev) =>
      prev.map((s) =>
        filteredIds.has(s.id) ? { ...s, selected: !allSelected } : s
      )
    );
  };

  const deselectAll = () => {
    setScenes((prev) => prev.map((s) => ({ ...s, selected: false })));
  };

  const selectNext10WithoutImage = () => {
    // Find first 10 scenes without image from filtered list
    const withoutImage = filteredScenes
      .filter((s) => !s.image_url)
      .slice(0, 10)
      .map((s) => s.id);

    if (withoutImage.length === 0) {
      addLog('No scenes without images found', 'info');
      return;
    }

    const idsToSelect = new Set(withoutImage);
    setScenes((prev) =>
      prev.map((s) => ({
        ...s,
        selected: idsToSelect.has(s.id) ? true : s.selected,
      }))
    );
    addLog(`Selected ${withoutImage.length} scenes without images`, 'success');
  };

  const updatePrompt = (id: string, prompt: string) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, generation_prompt: prompt } : s))
    );
  };

  const savePrompt = async (id: string, newPrompt: string) => {
    const scene = scenes.find((s) => s.id === id);
    if (!scene) return;

    const oldPrompt = scene.generation_prompt;

    // Если промпт не изменился - ничего не делаем
    if (oldPrompt === newPrompt) return;

    // Если original_prompt ещё не установлен и был старый промпт - сохраняем его как оригинал
    const shouldSaveOriginal = !scene.original_prompt && oldPrompt && oldPrompt.trim();

    const updateData: Record<string, unknown> = {
      generation_prompt: newPrompt,
    };

    if (shouldSaveOriginal) {
      updateData.original_prompt = oldPrompt;
    }

    await supabase.from('scenes').update(updateData).eq('id', id);

    // Обновляем локальное состояние
    if (shouldSaveOriginal) {
      setScenes((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, original_prompt: oldPrompt } : s
        )
      );
      addLog(`Saved original prompt for scene`, 'info');
    }
  };

  // V3: Toggle expand row
  const toggleExpand = (id: string) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, expanded: !s.expanded } : s))
    );
  };

  // V3: Update priority
  const updatePriority = (id: string, priority: number) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, priority } : s))
    );
  };

  const savePriority = async (id: string, priority: number) => {
    await supabase.from('scenes').update({ priority }).eq('id', id);
    addLog(`Priority updated for scene`, 'success');
  };

  // V3: Save user_description (uncontrolled inputs - no onChange needed)
  const saveUserDescription = async (id: string, locale: 'en' | 'ru', value: string) => {
    const scene = scenesRef.current.find(s => s.id === id);
    const user_description = {
      ...(scene?.user_description || { en: '', ru: '' }),
      [locale]: value,
    };

    // Update local state
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, user_description } : s))
    );

    try {
      const response = await fetch('/api/admin/update-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: id,
          field: 'user_description',
          value: user_description,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        addLog(`Error saving: ${result.error}`, 'error');
      } else {
        addLog(`User description updated`, 'success');
      }
    } catch (error) {
      addLog(`Error: ${(error as Error).message}`, 'error');
    }
  };

  // Translate RU description to EN using AI
  const translateDescription = async (id: string) => {
    const scene = scenes.find(s => s.id === id);
    const ruText = scene?.user_description?.ru;

    if (!ruText) {
      addLog('No Russian text to translate', 'error');
      return;
    }

    addLog('Translating...', 'info');

    try {
      const response = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ruText, targetLang: 'en' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Translation failed');
      }

      const newDescription = {
        ru: ruText,
        en: result.translation,
      };

      // Update local state
      setScenes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, user_description: newDescription } : s))
      );

      // Save to DB via API (bypasses RLS)
      const saveResponse = await fetch('/api/admin/update-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: id,
          field: 'user_description',
          value: newDescription,
        }),
      });

      if (!saveResponse.ok) {
        const saveResult = await saveResponse.json();
        throw new Error(saveResult.error || 'Save failed');
      }

      addLog('Translation complete', 'success');
    } catch (error) {
      addLog(`Translation error: ${(error as Error).message}`, 'error');
    }
  };

  // V3: Update ai_context (JSON)
  const saveAiContext = async (id: string, jsonString: string) => {
    try {
      const ai_context = JSON.parse(jsonString);
      await supabase.from('scenes').update({ ai_context }).eq('id', id);
      setScenes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ai_context } : s))
      );
      addLog(`AI Context updated`, 'success');
    } catch (e) {
      addLog(`Invalid JSON: ${(e as Error).message}`, 'error');
    }
  };

  // V3: Update follow_up (JSON)
  const saveFollowUp = async (id: string, jsonString: string) => {
    try {
      const follow_up = jsonString.trim() ? JSON.parse(jsonString) : null;
      await supabase.from('scenes').update({ follow_up }).eq('id', id);
      setScenes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, follow_up } : s))
      );
      addLog(`Follow-up updated`, 'success');
    } catch (e) {
      addLog(`Invalid JSON: ${(e as Error).message}`, 'error');
    }
  };

  // Toggle original prompt visibility
  const toggleShowOriginalPrompt = (id: string) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, showOriginalPrompt: !s.showOriginalPrompt } : s))
    );
  };

  // Restore original prompt
  const restoreOriginalPrompt = async (id: string) => {
    const scene = scenes.find((s) => s.id === id);
    if (!scene?.original_prompt) return;

    await supabase
      .from('scenes')
      .update({
        generation_prompt: scene.original_prompt,
        final_prompt: null,
        qa_status: null,
        qa_attempts: null,
        qa_last_assessment: null,
      })
      .eq('id', id);

    setScenes((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              generation_prompt: s.original_prompt,
              final_prompt: undefined,
              qa_status: null,
              qa_attempts: undefined,
              qa_last_assessment: undefined,
            }
          : s
      )
    );
    addLog(`Restored original prompt for scene`, 'success');
  };

  // Toggle prompt instructions visibility
  const toggleShowPromptInstructions = (id: string) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, showPromptInstructions: !s.showPromptInstructions } : s))
    );
  };

  // Update prompt instructions locally
  const updatePromptInstructions = (id: string, instructions: string) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, prompt_instructions: instructions } : s))
    );
  };

  // Save prompt instructions and apply them to the prompt immediately
  const savePromptInstructions = async (id: string, instructions: string) => {
    if (!instructions?.trim()) {
      // If empty, just clear instructions
      await supabase
        .from('scenes')
        .update({ prompt_instructions: null })
        .eq('id', id);
      addLog(`Cleared prompt instructions`, 'success');
      return;
    }

    addLog(`Applying instructions to prompt...`, 'info');

    try {
      const response = await fetch('/api/admin/apply-instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId: id, instructions }),
      });

      const result = await response.json();

      if (!response.ok) {
        addLog(`Error: ${result.error}`, 'error');
        return;
      }

      // Update local state with new prompt
      setScenes((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, generation_prompt: result.newPrompt, prompt_instructions: instructions }
            : s
        )
      );

      addLog(`Instructions applied. Changes: ${result.changes?.join(', ') || 'updated'}`, 'success');
    } catch (error) {
      addLog(`Error: ${(error as Error).message}`, 'error');
    }
  };

  const deleteScene = async (id: string) => {
    if (!confirm('Delete this scene?')) return;

    await supabase.from('scenes').delete().eq('id', id);
    setScenes((prev) => prev.filter((s) => s.id !== id));
  };

  const deleteSelected = async () => {
    const selected = scenes.filter((s) => s.selected);
    if (!confirm(`Delete ${selected.length} scenes?`)) return;

    for (const scene of selected) {
      await supabase.from('scenes').delete().eq('id', scene.id);
    }
    setScenes((prev) => prev.filter((s) => !s.selected));
  };

  const generateScene = async (scene: SceneWithStatus) => {
    const sceneSlug = scene.slug || scene.id.substring(0, 8);
    const qaEnabled = settings.enableQA;

    addLog(`Starting generation: ${sceneSlug}${qaEnabled ? ' (QA enabled)' : ''}`, 'info');

    setScenes((prev) =>
      prev.map((s) => (s.id === scene.id ? { ...s, status: 'generating' } : s))
    );

    try {
      // Don't mix stylePrefix with prompt - send separately
      const prompt = scene.generation_prompt;

      const models = settings.service === 'replicate' ? REPLICATE_MODELS : CIVITAI_MODELS;
      const modelName = models.find(m => m.id === settings.modelId)?.name || settings.modelId;
      const resolution = RESOLUTION_PRESETS.find(p => p.id === settings.aspectRatio) || RESOLUTION_PRESETS[0];
      addLog(`Service: ${settings.service}, Model: ${modelName}, ${resolution.name}`, 'info');

      // Build QA context if QA is enabled
      const qaContext = qaEnabled ? buildQAContext(scene) : null;

      if (qaEnabled && !qaContext) {
        addLog(`Warning: QA enabled but no ai_context found, using basic context`, 'info');
      }

      const response = await fetch('/api/admin/generate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: scene.id,
          prompt,
          // promptInstructions removed - now applied immediately via Apply button
          stylePrefix: settings.stylePrefix || undefined, // Send separately
          styleVariant: settings.styleVariant,
          negativePrompt: settings.negativePrompt || undefined,
          modelId: settings.service === 'civitai' ? parseInt(settings.modelId) : settings.modelId,
          service: settings.service,
          width: resolution.width,
          height: resolution.height,
          aspectRatio: settings.aspectRatio,
          enableQA: qaEnabled,
          qaContext: qaContext || (qaEnabled ? {
            essence: scene.description,
            key_elements: [{ element: 'main subject', critical: true, in_action: false }],
            mood: 'sensual',
            participants: { count: 1, genders: ['any'] },
          } : undefined),
        }),
      });

      const result = await response.json();
      console.log('[Admin] API Response:', result);

      // Debug info for database update
      if (result.debug) {
        console.log('=== DB UPDATE DEBUG ===');
        console.log('Scene ID:', result.debug.sceneId);
        console.log('Scene Found:', result.debug.sceneFound);
        console.log('Scene Slug:', result.debug.sceneSlug);
        console.log('Storage URL:', result.debug.storageUrl);
        console.log('Update Error:', result.debug.updateError);
        console.log('Rows Updated:', result.debug.rowsUpdated);
        console.log('Updated image_url:', result.debug.updatedImageUrl);
        console.log('Has Assessment:', result.debug.hasAssessment);
        console.log('Essence Score:', result.debug.essenceScore);
        console.log('Successful Generations:', result.debug.successfulGenerations);
        console.log('Successful Evaluations:', result.debug.successfulEvaluations);
        console.log('Evaluation Errors Count:', result.debug.evaluationErrorsCount);
        console.log('======================');
      }

      // Log evaluation errors if any
      if (result.evaluationErrors && result.evaluationErrors.length > 0) {
        console.log('=== EVALUATION ERRORS ===');
        result.evaluationErrors.forEach((err: string) => console.log(err));
        console.log('=========================');
      }

      if (!response.ok) {
        throw new Error(result.error || 'Generation failed');
      }

      if (!result.imageUrl) {
        addLog(`Warning: No imageUrl in response`, 'error');
      }

      if (qaEnabled) {
        const gens = result.debug?.successfulGenerations || 0;
        const evals = result.debug?.successfulEvaluations || 0;
        const evalErrors = result.evaluationErrors?.length || 0;

        if (result.qaStatus === 'passed') {
          addLog(`Completed: ${sceneSlug} - QA PASSED (${result.totalAttempts} attempts, ${gens} gens, ${evals} evals)`, 'success');
        } else {
          addLog(`Completed: ${sceneSlug} - QA FAILED (${result.totalAttempts} attempts, ${gens} gens, ${evals} evals)`, 'error');
          if (evalErrors > 0) {
            result.evaluationErrors.slice(0, 3).forEach((err: string) => {
              addLog(`  Eval error: ${err}`, 'error');
            });
            if (evalErrors > 3) {
              addLog(`  ... and ${evalErrors - 3} more errors`, 'error');
            }
          }
          if (gens > 0 && evals === 0) {
            addLog(`  WARNING: Images generated but evaluations failed!`, 'error');
          }
        }
      } else {
        addLog(`Completed: ${sceneSlug}`, 'success');
      }

      console.log('[Admin] Updating scene with imageUrl:', result.imageUrl);
      setScenes((prev) => {
        const updated = prev.map((s) =>
          s.id === scene.id
            ? {
                ...s,
                status: 'completed' as GenerationStatus,
                image_url: result.imageUrl || s.image_url,
                qa_status: result.qaStatus || null,
                qa_attempts: result.totalAttempts,
                original_prompt: result.originalPrompt || s.original_prompt,
                final_prompt: result.finalPrompt,
                qa_last_assessment: result.assessment,
              }
            : s
        );
        console.log('[Admin] Updated scene:', updated.find(s => s.id === scene.id));
        return updated;
      });
    } catch (error) {
      const errorMsg = (error as Error).message;
      addLog(`Error: ${sceneSlug} - ${errorMsg}`, 'error');

      setScenes((prev) =>
        prev.map((s) =>
          s.id === scene.id
            ? { ...s, status: 'error', error: errorMsg }
            : s
        )
      );
    }
  };

  const generateSelected = async () => {
    const selected = scenes.filter((s) => s.selected && s.generation_prompt);
    if (selected.length === 0) return;

    setGenerating(true);

    // Mark all as pending
    setScenes((prev) =>
      prev.map((s) => (s.selected ? { ...s, status: 'pending' } : s))
    );

    // Generate strictly one by one - wait for each to fully complete
    for (const scene of selected) {
      try {
        await generateScene(scene);
      } catch (e) {
        console.error('Generation error:', e);
      }
      // Longer delay between scenes to avoid rate limits
      await new Promise((r) => setTimeout(r, 2000));
    }

    setGenerating(false);
  };

  const StatusIcon = ({ status }: { status: GenerationStatus }) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="size-4 text-yellow-500 animate-pulse" />;
      case 'generating':
        return <Loader2 className="size-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <Check className="size-4 text-green-500" />;
      case 'error':
        return <X className="size-4 text-red-500" />;
      default:
        return null;
    }
  };

  const QAStatusIcon = ({ status, onClick }: { status: QAStatus; onClick?: () => void }) => {
    const baseClass = onClick ? 'cursor-pointer hover:scale-110 transition-transform' : '';
    switch (status) {
      case 'passed':
        return <span title="QA Passed - Click for details" onClick={onClick} className={baseClass}><ShieldCheck className="size-5 text-green-500" /></span>;
      case 'failed':
        return <span title="QA Failed - Click for details" onClick={onClick} className={baseClass}><ShieldX className="size-5 text-red-500" /></span>;
      default:
        return <span title="Not checked"><ShieldQuestion className="size-5 text-gray-400" /></span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  const qaFailedCount = scenes.filter((s) => s.qa_status === 'failed').length;

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      {/* Sticky Header Panel */}
      <div className="sticky top-0 z-40 bg-background pt-8 pb-4">
        <h1 className="text-2xl font-bold mb-4">Scene Generation Manager</h1>

        {/* Global Settings */}
        <div className="mb-4 border rounded-lg bg-background">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <Settings className="size-5" />
            <span className="font-medium">Global Style Settings</span>
            {settings.enableQA && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                QA Enabled
              </span>
            )}
          </div>
          {showSettings ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
        </button>

        {showSettings && (
          <div className="p-4 border-t space-y-4">
            {/* QA Toggle */}
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
              <Checkbox
                id="enableQA"
                checked={settings.enableQA}
                onCheckedChange={(checked) =>
                  updateSettings({ ...settings, enableQA: checked as boolean })
                }
              />
              <label htmlFor="enableQA" className="flex-1 cursor-pointer">
                <div className="font-medium">Enable QA Validation</div>
                <div className="text-sm text-muted-foreground">
                  AI will evaluate generated images and retry up to 12 times (3 rounds x 4 attempts)
                </div>
              </label>
              <ShieldCheck className={`size-6 ${settings.enableQA ? 'text-green-500' : 'text-gray-300'}`} />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Service</label>
                <select
                  value={settings.service}
                  onChange={(e) => {
                    const newService = e.target.value as ServiceType;
                    const defaultModel = newService === 'replicate' ? 'flux-schnell' : '4201';
                    updateSettings({ ...settings, service: newService, modelId: defaultModel });
                  }}
                  className="w-full h-9 rounded-md border px-3 text-sm"
                >
                  <option value="civitai">Civitai</option>
                  <option value="replicate">Replicate</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Model</label>
                <select
                  value={settings.modelId}
                  onChange={(e) =>
                    updateSettings({ ...settings, modelId: e.target.value })
                  }
                  className="w-full h-9 rounded-md border px-3 text-sm"
                >
                  {(settings.service === 'replicate' ? REPLICATE_MODELS : CIVITAI_MODELS).map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Aspect Ratio</label>
                <select
                  value={settings.aspectRatio}
                  onChange={(e) =>
                    updateSettings({ ...settings, aspectRatio: e.target.value })
                  }
                  className="w-full h-9 rounded-md border px-3 text-sm"
                >
                  {RESOLUTION_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Style Variant</label>
                <select
                  value={settings.styleVariant}
                  onChange={(e) =>
                    updateSettings({ ...settings, styleVariant: e.target.value as GlobalSettings['styleVariant'] })
                  }
                  className="w-full h-9 rounded-md border px-3 text-sm"
                >
                  <option value="none">None (raw prompt only)</option>
                  <option value="default">Default (Photorealistic)</option>
                  <option value="artistic">Artistic</option>
                  <option value="noir">Noir</option>
                  <option value="soft">Soft/Dreamy</option>
                  <option value="editorial">Editorial</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Additional Style Prefix</label>
              <Input
                placeholder="e.g., warm lighting, cozy bedroom..."
                value={settings.stylePrefix}
                onChange={(e) => updateSettings({ ...settings, stylePrefix: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Added to the beginning of every prompt
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Additional Negative Prompt</label>
              <Input
                placeholder="e.g., harsh shadows, overexposed..."
                value={settings.negativePrompt}
                onChange={(e) => updateSettings({ ...settings, negativePrompt: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div className="mb-6 border rounded-lg">
        <div className="p-3 border-b bg-muted/50 flex items-center justify-between">
          <span className="font-medium text-sm">Activity Log</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLogs([])}
          >
            Clear
          </Button>
        </div>
        <div className="h-32 overflow-y-auto p-3 font-mono text-xs space-y-1 bg-black/5">
          {logs.length === 0 ? (
            <p className="text-muted-foreground">No activity yet. Select scenes and click Generate.</p>
          ) : (
            logs.map((log, i) => (
              <div
                key={i}
                className={
                  log.type === 'error'
                    ? 'text-red-600'
                    : log.type === 'success'
                    ? 'text-green-600'
                    : 'text-foreground'
                }
              >
                <span className="text-muted-foreground">[{log.time}]</span> {log.message}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="h-9 rounded-md border px-3 text-sm"
          >
            <option value="all">All scenes ({scenes.length})</option>
            <option value="no_image">Without images ({scenes.filter((s) => !s.image_url).length})</option>
            <option value="has_image">With images ({scenes.filter((s) => s.image_url).length})</option>
            <option value="qa_failed">QA Failed ({qaFailedCount})</option>
          </select>
        </div>

        <div className="flex-1" />

        <span className="text-sm text-muted-foreground">
          {selectedCount} selected
        </span>

        <Button variant="outline" size="sm" onClick={selectAll}>
          Select All
        </Button>

        <Button variant="outline" size="sm" onClick={deselectAll} disabled={selectedCount === 0}>
          Deselect All
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={selectNext10WithoutImage}
          title="Select first 10 scenes without images"
        >
          +10 ✕img
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={generateSelected}
          disabled={selectedCount === 0 || generating}
        >
          {generating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
          Generate Selected
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={deleteSelected}
          disabled={selectedCount === 0}
        >
          <Trash2 className="size-4" />
          Delete Selected
        </Button>
        </div>
      </div>

      {/* Scenes Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full table-fixed">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-10 p-3" />
              <th className="w-24 p-3 text-left text-sm font-medium">Preview</th>
              <th className="p-3 text-left text-sm font-medium">Prompt</th>
              <th className="w-20 p-3 text-left text-sm font-medium">Status</th>
              <th className="w-24 p-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredScenes.map((scene) => (
              <React.Fragment key={scene.id}>
              <tr className="border-t hover:bg-muted/30">
                <td className="p-3">
                  <Checkbox
                    checked={scene.selected}
                    onCheckedChange={() => toggleSelect(scene.id)}
                  />
                </td>
                <td className="p-3">
                  <div className="relative">
                    {scene.image_url ? (
                      <>
                        <img
                          src={scene.image_url}
                          alt={scene.description}
                          className="w-20 h-14 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setLightboxImage(scene.image_url)}
                        />
                        {/* QA Status Badge */}
                        {scene.qa_status && (
                          <div className="absolute -top-2 -right-2">
                            <QAStatusIcon
                              status={scene.qa_status}
                              onClick={() => setQaDetailScene(scene)}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-20 h-14 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="size-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-3 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">Priority:</span>
                    <Input
                      type="number"
                      value={scene.priority ?? 50}
                      onChange={(e) => updatePriority(scene.id, parseInt(e.target.value) || 50)}
                      onBlur={(e) => savePriority(scene.id, parseInt(e.target.value) || 50)}
                      className="w-16 h-6 text-xs"
                    />
                    {/* Original prompt indicator */}
                    {scene.original_prompt && scene.original_prompt !== scene.generation_prompt && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => toggleShowOriginalPrompt(scene.id)}
                          title="View original prompt"
                        >
                          <Eye className="size-3 mr-1" />
                          Original
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-orange-600"
                          onClick={() => restoreOriginalPrompt(scene.id)}
                          title="Restore original prompt"
                        >
                          <RotateCcw className="size-3 mr-1" />
                          Restore
                        </Button>
                      </div>
                    )}
                    {/* Prompt instructions button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 px-2 text-xs ${scene.prompt_instructions ? 'text-blue-600' : ''}`}
                      onClick={() => toggleShowPromptInstructions(scene.id)}
                      title="Edit prompt instructions for AI"
                    >
                      <Edit3 className="size-3 mr-1" />
                      {scene.prompt_instructions ? 'Instructions ✓' : 'Instructions'}
                    </Button>
                  </div>

                  {/* Show original prompt if toggled */}
                  {scene.showOriginalPrompt && scene.original_prompt && (
                    <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <div className="font-medium text-yellow-700 mb-1">Original Prompt:</div>
                      <div className="text-yellow-900">{scene.original_prompt}</div>
                    </div>
                  )}

                  {/* Prompt instructions editor */}
                  {scene.showPromptInstructions && (
                    <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
                      <div className="font-medium text-blue-700 mb-1 text-xs">
                        Инструкции для AI (что изменить в промпте):
                      </div>
                      <textarea
                        value={scene.prompt_instructions || ''}
                        onChange={(e) => updatePromptInstructions(scene.id, e.target.value)}
                        placeholder="Например: убрать масло, оставить только лёд..."
                        className="w-full min-h-[50px] text-xs p-2 rounded border resize-none bg-white"
                      />
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-blue-600">
                          Нажми Apply чтобы применить к промпту
                        </p>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => savePromptInstructions(scene.id, scene.prompt_instructions || '')}
                          disabled={!scene.prompt_instructions?.trim()}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  )}

                  <textarea
                    value={scene.generation_prompt || ''}
                    onChange={(e) => updatePrompt(scene.id, e.target.value)}
                    onBlur={(e) => savePrompt(scene.id, e.target.value)}
                    placeholder="Enter generation prompt..."
                    className="w-full min-h-[60px] text-sm p-2 rounded border resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />

                  {/* AI Description (read-only info) */}
                  <p className="text-xs text-muted-foreground mt-1 truncate" title={scene.description}>
                    {scene.description}
                  </p>

                  {/* User Description RU/EN */}
                  <div className="mt-2 space-y-1 max-w-full overflow-hidden">
                    <div className="flex gap-2 items-start">
                      <span className="text-xs text-muted-foreground font-medium w-6 shrink-0 pt-1">RU:</span>
                      <textarea
                        key={`ru-${scene.id}`}
                        defaultValue={scene.user_description?.ru || ''}
                        onBlur={(e) => saveUserDescription(scene.id, 'ru', e.target.value)}
                        className="flex-1 min-w-0 text-xs p-1 rounded border bg-muted/30 resize-none min-h-[40px]"
                        placeholder="Описание для пользователя (RU)..."
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2 items-start">
                      <span className="text-xs text-muted-foreground font-medium w-6 shrink-0 pt-1">EN:</span>
                      <textarea
                        key={`en-${scene.id}-${scene.user_description?.en || ''}`}
                        defaultValue={scene.user_description?.en || ''}
                        onBlur={(e) => saveUserDescription(scene.id, 'en', e.target.value)}
                        className="flex-1 min-w-0 text-xs p-1 rounded border bg-muted/30 resize-none min-h-[40px]"
                        placeholder="User description (EN)..."
                        rows={2}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs shrink-0"
                        onClick={() => translateDescription(scene.id)}
                        disabled={!scene.user_description?.ru}
                        title="Translate RU → EN"
                      >
                        <Languages className="size-3" />
                      </Button>
                    </div>
                  </div>

                  {/* QA Info */}
                  {scene.qa_attempts && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      QA: {scene.qa_attempts} attempts
                      {scene.qa_last_assessment && (
                        <span className="ml-2">
                          (Score: {(scene.qa_last_assessment as { essenceScore?: number }).essenceScore}/10)
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={scene.status} />
                    <span className="text-xs capitalize">{scene.status}</span>
                  </div>
                  {scene.error && (
                    <p className="text-xs text-red-500 mt-1">{scene.error}</p>
                  )}
                  {scene.ai_context && (
                    <span className="text-xs text-green-600 block mt-1">V3</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => toggleExpand(scene.id)}
                      title="Edit V3 Fields"
                    >
                      <Edit3 className={`size-4 ${scene.expanded ? 'text-primary' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => generateScene(scene)}
                      disabled={!scene.generation_prompt || generating}
                      title="Generate"
                    >
                      {scene.status === 'generating' ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Play className="size-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => generateScene(scene)}
                      disabled={!scene.image_url || generating}
                      title="Regenerate"
                    >
                      <RefreshCw className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteScene(scene.id)}
                      title="Delete"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
              {/* V3 Expanded Row */}
              {scene.expanded && (
                <tr className="border-t bg-muted/20">
                  <td colSpan={5} className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* User Description */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">User Description (RU)</label>
                        <textarea
                          key={`exp-ru-${scene.id}`}
                          defaultValue={scene.user_description?.ru || ''}
                          onBlur={(e) => saveUserDescription(scene.id, 'ru', e.target.value)}
                          placeholder="Описание для пользователя (RU)..."
                          className="w-full min-h-[80px] text-sm p-2 rounded border resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">User Description (EN)</label>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => translateDescription(scene.id)}
                            title="Translate from Russian"
                          >
                            <Languages className="size-3 mr-1" />
                            Translate
                          </Button>
                        </div>
                        <textarea
                          key={`exp-en-${scene.id}-${scene.user_description?.en || ''}`}
                          defaultValue={scene.user_description?.en || ''}
                          onBlur={(e) => saveUserDescription(scene.id, 'en', e.target.value)}
                          placeholder="User description (EN)... Click Translate to auto-translate from RU"
                          className="w-full min-h-[80px] text-sm p-2 rounded border resize-none"
                        />
                      </div>
                      {/* AI Context */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">AI Context (JSON)</label>
                        <textarea
                          defaultValue={scene.ai_context ? JSON.stringify(scene.ai_context, null, 2) : '{}'}
                          onBlur={(e) => saveAiContext(scene.id, e.target.value)}
                          placeholder='{"tests": {...}, "question_angles": {...}}'
                          className="w-full min-h-[200px] text-xs p-2 rounded border resize-none font-mono"
                        />
                      </div>
                      {/* Follow Up */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Follow Up (JSON)</label>
                        <textarea
                          defaultValue={scene.follow_up ? JSON.stringify(scene.follow_up, null, 2) : ''}
                          onBlur={(e) => saveFollowUp(scene.id, e.target.value)}
                          placeholder='{"trigger": "if_positive", "question": {...}}'
                          className="w-full min-h-[200px] text-xs p-2 rounded border resize-none font-mono"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {filteredScenes.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No scenes found
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setLightboxImage(null)}
          >
            <X className="size-8" />
          </button>
          <img
            src={lightboxImage}
            alt="Full size preview"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* QA Details Dialog */}
      <Dialog open={!!qaDetailScene} onOpenChange={(open) => !open && setQaDetailScene(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {qaDetailScene?.qa_status === 'passed' ? (
                <ShieldCheck className="size-5 text-green-500" />
              ) : (
                <ShieldX className="size-5 text-red-500" />
              )}
              QA Assessment - {qaDetailScene?.slug || qaDetailScene?.id?.slice(0, 8)}
            </DialogTitle>
          </DialogHeader>

          {qaDetailScene?.qa_last_assessment && (() => {
            const assessment = qaDetailScene.qa_last_assessment as {
              essenceScore?: number;
              essenceComment?: string;
              failReason?: string;
              regenerationHints?: { emphasize?: string; add?: string[]; remove?: string[] };
              keyElementsCheck?: Array<{ element: string; present: boolean; critical: boolean; comment?: string }>;
              technicalQuality?: { score: number; fatalFlaws?: string[] };
            };
            return (
            <div className="space-y-4 text-sm">
              {/* Essence Score */}
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Essence Score</span>
                  <span className={`text-lg font-bold ${
                    (assessment.essenceScore ?? 0) >= 7
                      ? 'text-green-600'
                      : (assessment.essenceScore ?? 0) >= 5
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}>
                    {assessment.essenceScore ?? 0}/10
                  </span>
                </div>
                {assessment.essenceComment && (
                  <p className="text-muted-foreground">
                    {assessment.essenceComment}
                  </p>
                )}
              </div>

              {/* Fail Reason */}
              {assessment.failReason && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                  <span className="font-medium text-red-700 dark:text-red-400">Причина отклонения:</span>
                  <p className="mt-1 text-red-600 dark:text-red-300">
                    {assessment.failReason}
                  </p>
                </div>
              )}

              {/* Regeneration Hints */}
              {assessment.regenerationHints && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                  <span className="font-medium text-blue-700 dark:text-blue-400">Рекомендации для улучшения:</span>
                  <div className="mt-2 space-y-1">
                    {assessment.regenerationHints.emphasize && (
                      <p><strong>Усилить:</strong> {assessment.regenerationHints.emphasize}</p>
                    )}
                    {assessment.regenerationHints.add && assessment.regenerationHints.add.length > 0 && (
                      <p><strong>Добавить:</strong> {assessment.regenerationHints.add.join(', ')}</p>
                    )}
                    {assessment.regenerationHints.remove && assessment.regenerationHints.remove.length > 0 && (
                      <p><strong>Убрать:</strong> {assessment.regenerationHints.remove.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Key Elements Check */}
              {assessment.keyElementsCheck && assessment.keyElementsCheck.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">Ключевые элементы:</span>
                  <div className="mt-2 space-y-1">
                    {assessment.keyElementsCheck.map((el, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {el.present ? (
                          <Check className="size-4 text-green-500" />
                        ) : (
                          <X className="size-4 text-red-500" />
                        )}
                        <span className={el.critical ? 'font-medium' : ''}>
                          {el.element}
                          {el.critical && <span className="text-xs text-red-500 ml-1">(критично)</span>}
                        </span>
                        {el.comment && <span className="text-muted-foreground text-xs">- {el.comment}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Quality */}
              {assessment.technicalQuality && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">Техническое качество: </span>
                  <span className="font-bold">{assessment.technicalQuality.score}/10</span>
                  {assessment.technicalQuality.fatalFlaws && assessment.technicalQuality.fatalFlaws.length > 0 && (
                    <div className="mt-2">
                      <span className="text-red-600 text-xs font-medium">Критические дефекты:</span>
                      <ul className="list-disc list-inside text-xs text-red-500">
                        {assessment.technicalQuality.fatalFlaws.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Attempts Info */}
              <div className="text-xs text-muted-foreground border-t pt-3">
                <span>Всего попыток: {qaDetailScene.qa_attempts || 0}</span>
                {qaDetailScene.original_prompt && qaDetailScene.final_prompt &&
                 qaDetailScene.original_prompt !== qaDetailScene.final_prompt && (
                  <span className="ml-4">• Промпт был изменён AI</span>
                )}
              </div>
            </div>
            );
          })()}

          {!qaDetailScene?.qa_last_assessment && (
            <p className="text-muted-foreground">Нет данных об оценке</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
