'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Check, Image as ImageIcon, Link2, Search, X, ChevronLeft, ChevronRight, SkipForward, Grid, Layers, Sparkles, Eye, EyeOff, Zap, StopCircle } from 'lucide-react';

interface StorageFile {
  name: string;
  url: string;
  created_at: string;
}

interface ImageVariant {
  url: string;
  prompt: string;
  created_at: string;
  qa_status?: 'passed' | 'failed' | null;
}

interface SceneData {
  id: string;
  slug: string;
  title: { ru: string; en: string };
  category: string;
  tags?: string[];
  ai_description?: { ru: string; en: string };
  image_prompt?: string;
  image_url?: string;
  image_variants?: ImageVariant[];
  generation_prompt?: string;
}

interface SceneSearchResult extends SceneData {
  searchScore: number;
  matchedFields: string[];
}

interface SceneSuggestion {
  id: string;
  slug: string;
  title: { ru: string; en: string };
  category: string;
  score: number;
  matchReasons: string[];
}

interface ImageAnalysis {
  participants: { count: number; genders: string[] };
  activity: string;
  keywords: string[];
  mood: string;
  setting: string;
  elements: string[];
}

type ViewMode = 'grid' | 'gallery';

export default function LinkImagesPage() {
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
  const [scenes, setScenes] = useState<SceneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Gallery mode state
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sceneSearch, setSceneSearch] = useState('');
  const [linkedCount, setLinkedCount] = useState(0);
  const [skippedFiles, setSkippedFiles] = useState<Set<string>>(new Set());

  // AI suggestion state
  const [aiSuggestions, setAiSuggestions] = useState<SceneSuggestion[]>([]);
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showLinked, setShowLinked] = useState(false);

  // Batch analysis state
  const [batchAnalyzing, setBatchAnalyzing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ total: 0, analyzed: 0, remaining: 0 });
  const [imageAnalysisMap, setImageAnalysisMap] = useState<Record<string, ImageAnalysis>>({});
  const [stopBatch, setStopBatch] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadData();
    loadImageAnalysis();
  }, []);

  // Load existing image analysis from database
  async function loadImageAnalysis() {
    try {
      const res = await fetch('/api/admin/batch-analyze');
      const { data } = await res.json();
      const map: Record<string, ImageAnalysis> = {};
      for (const item of data || []) {
        map[item.file_name] = item.analysis;
      }
      setImageAnalysisMap(map);
    } catch (e) {
      console.error('Failed to load image analysis:', e);
    }
  }

  // Batch analyze all images
  async function handleBatchAnalyze() {
    setBatchAnalyzing(true);
    setStopBatch(false);

    while (!stopBatch) {
      try {
        const res = await fetch('/api/admin/batch-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batchSize: 3 })
        });

        if (!res.ok) {
          const err = await res.json();
          setMessage({ type: 'error', text: err.error || 'Batch analyze failed' });
          break;
        }

        const data = await res.json();
        setBatchProgress({
          total: data.total,
          analyzed: data.analyzed,
          remaining: data.remaining
        });

        // Update local map with new results
        for (const result of data.results || []) {
          if (result.success && result.analysis) {
            setImageAnalysisMap(prev => ({
              ...prev,
              [result.file_name]: result.analysis
            }));
          }
        }

        if (data.done || data.remaining === 0) {
          setMessage({ type: 'success', text: `Batch complete! Analyzed ${data.analyzed} images.` });
          break;
        }
      } catch (e) {
        console.error('Batch analyze error:', e);
        setMessage({ type: 'error', text: `Batch error: ${(e as Error).message}` });
        break;
      }
    }

    setBatchAnalyzing(false);
    setStopBatch(false);
  }

  function handleStopBatch() {
    setStopBatch(true);
    setMessage({ type: 'success', text: 'Stopping batch analysis...' });
  }

  async function loadData() {
    setLoading(true);
    try {
      // Load storage files
      const { data: files, error: storageError } = await supabase.storage
        .from('scenes')
        .list('', { limit: 2000, sortBy: { column: 'created_at', order: 'desc' } });

      if (storageError) throw storageError;

      const storageFilesWithUrls: StorageFile[] = (files || [])
        .filter(f => !f.name.startsWith('.')) // Skip system files like .emptyFolderPlaceholder
        .map(f => ({
          name: f.name,
          url: supabase.storage.from('scenes').getPublicUrl(f.name).data.publicUrl,
          created_at: f.created_at || '',
        }));

      setStorageFiles(storageFilesWithUrls);

      // Load ALL scenes with tags and ai_description for better search
      const { data: scenesData, error: scenesError } = await supabase
        .from('scenes')
        .select('id, slug, title, category, tags, ai_description, image_prompt, image_url, image_variants, generation_prompt')
        .gte('version', 2)
        .order('category')
        .order('slug');

      if (scenesError) throw scenesError;

      setScenes(scenesData || []);

      // Load batch analysis progress
      const analysisRes = await fetch('/api/admin/batch-analyze');
      if (analysisRes.ok) {
        const analysisData = await analysisRes.json();
        const analyzedCount = (analysisData.data || []).length;
        setBatchProgress({
          total: storageFilesWithUrls.length,
          analyzed: analyzedCount,
          remaining: storageFilesWithUrls.length - analyzedCount
        });

        // Load analysis map
        const analysisMap: Record<string, ImageAnalysis> = {};
        for (const item of analysisData.data || []) {
          analysisMap[item.file_name] = item.analysis;
        }
        setImageAnalysisMap(analysisMap);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  }

  async function linkImageToScene(fileUrl: string, sceneId: string, autoAdvance = false) {
    setLinking(sceneId);
    try {
      const { data: scene, error: selectError } = await supabase
        .from('scenes')
        .select('image_variants, generation_prompt')
        .eq('id', sceneId)
        .single();

      if (selectError) throw selectError;

      const currentVariants: ImageVariant[] = scene?.image_variants || [];
      const getBaseUrl = (url: string) => url.split('?')[0];
      const baseImageUrl = getBaseUrl(fileUrl);

      if (currentVariants.some(v => getBaseUrl(v.url) === baseImageUrl)) {
        setMessage({ type: 'success', text: 'Already linked!' });
        if (autoAdvance) goToNextImage();
        return;
      }

      const newVariant: ImageVariant = {
        url: fileUrl,
        prompt: scene?.generation_prompt || 'Linked from storage',
        created_at: new Date().toISOString(),
        qa_status: null,
      };
      const updatedVariants = [...currentVariants, newVariant];

      const { error } = await supabase
        .from('scenes')
        .update({
          image_url: fileUrl,
          image_variants: updatedVariants,
        })
        .eq('id', sceneId);

      if (error) throw error;

      setLinkedCount(prev => prev + 1);
      setMessage({ type: 'success', text: `Linked! (${linkedCount + 1} total)` });
      setSceneSearch('');

      if (autoAdvance) {
        goToNextImage();
      }

      // Update local scenes state
      setScenes(prev => prev.map(s =>
        s.id === sceneId
          ? { ...s, image_url: fileUrl, image_variants: updatedVariants }
          : s
      ));
    } catch (error) {
      console.error('Error linking image:', error);
      setMessage({ type: 'error', text: 'Failed to link image' });
    } finally {
      setLinking(null);
    }
  }

  // Calculate file lists (must be before useCallback hooks that use them)
  const allLinkedUrls = new Set(
    scenes.flatMap(s => (s.image_variants || []).map(v => v.url.split('?')[0]))
  );

  const unlinkedFiles = storageFiles.filter(f => {
    const baseUrl = f.url.split('?')[0];
    return !allLinkedUrls.has(baseUrl) && !skippedFiles.has(f.name);
  });

  const linkedFiles = storageFiles.filter(f => {
    const baseUrl = f.url.split('?')[0];
    return allLinkedUrls.has(baseUrl);
  });

  // Display files: unlinked first, then linked (if showLinked is true)
  const displayFiles = showLinked
    ? [...unlinkedFiles, ...linkedFiles]
    : unlinkedFiles;

  const goToNextImage = useCallback(() => {
    setCurrentImageIndex(prev => {
      const maxIndex = displayFiles.length;
      const next = prev + 1;
      return next >= maxIndex ? 0 : next;
    });
    setSceneSearch('');
  }, [displayFiles.length]);

  const goToPrevImage = useCallback(() => {
    setCurrentImageIndex(prev => {
      const maxIndex = displayFiles.length;
      const next = prev - 1;
      return next < 0 ? maxIndex - 1 : next;
    });
    setSceneSearch('');
  }, [displayFiles.length]);

  const skipImage = useCallback(() => {
    const currentFile = storageFiles[currentImageIndex];
    if (currentFile) {
      setSkippedFiles(prev => new Set([...prev, currentFile.name]));
    }
    goToNextImage();
  }, [currentImageIndex, storageFiles, goToNextImage]);

  // AI suggestion handler
  async function handleAiSuggest() {
    const file = displayFiles[currentImageIndex];
    if (!file) return;

    setAnalyzing(true);
    setAiSuggestions([]);
    setImageAnalysis(null);

    try {
      const res = await fetch('/api/admin/suggest-scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: file.url })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to analyze image');
      }

      const data = await res.json();
      setAiSuggestions(data.suggestions || []);
      setImageAnalysis(data.analysis || null);
      setMessage({ type: 'success', text: `Found ${data.suggestions?.length || 0} matching scenes` });
    } catch (e) {
      console.error('AI suggestion error:', e);
      setMessage({ type: 'error', text: `AI analysis failed: ${(e as Error).message}` });
    } finally {
      setAnalyzing(false);
    }
  }

  // Clear AI suggestions when image changes
  useEffect(() => {
    setAiSuggestions([]);
    setImageAnalysis(null);
  }, [currentImageIndex]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (viewMode !== 'gallery') return;
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === 'ArrowRight' || e.key === 'd') {
        goToNextImage();
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        goToPrevImage();
      } else if (e.key === 's' || e.key === 'Escape') {
        skipImage();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, goToNextImage, goToPrevImage, skipImage]);

  // Advanced search with scoring and field matching
  const searchScenes = (query: string): SceneSearchResult[] => {
    if (!query.trim()) {
      return scenes.map(s => ({ ...s, searchScore: 0, matchedFields: [] }));
    }

    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);

    return scenes
      .map(scene => {
        let score = 0;
        const matchedFields: string[] = [];

        const slugLower = scene.slug.toLowerCase();
        const titleEn = (scene.title?.en || '').toLowerCase();
        const titleRu = (scene.title?.ru || '').toLowerCase();
        const category = (scene.category || '').toLowerCase();
        const tags = (scene.tags || []).map(t => t.toLowerCase());
        const aiDescEn = (scene.ai_description?.en || '').toLowerCase();
        const aiDescRu = (scene.ai_description?.ru || '').toLowerCase();
        const imagePrompt = (scene.image_prompt || '').toLowerCase();

        for (const term of terms) {
          // Exact slug match (+50)
          if (slugLower === term) {
            score += 50;
            if (!matchedFields.includes('slug')) matchedFields.push('slug');
          }
          // Slug contains (+20)
          else if (slugLower.includes(term)) {
            score += 20;
            if (!matchedFields.includes('slug')) matchedFields.push('slug');
          }

          // Category exact (+30)
          if (category === term) {
            score += 30;
            if (!matchedFields.includes('category')) matchedFields.push('category');
          }
          // Category contains (+15)
          else if (category.includes(term)) {
            score += 15;
            if (!matchedFields.includes('category')) matchedFields.push('category');
          }

          // Tag exact match (+25)
          if (tags.includes(term)) {
            score += 25;
            if (!matchedFields.includes('tags')) matchedFields.push('tags');
          }
          // Tag partial match (+10)
          else if (tags.some(tag => tag.includes(term) || term.includes(tag))) {
            score += 10;
            if (!matchedFields.includes('tags')) matchedFields.push('tags');
          }

          // Title match (+15)
          if (titleEn.includes(term) || titleRu.includes(term)) {
            score += 15;
            if (!matchedFields.includes('title')) matchedFields.push('title');
          }

          // AI description match (+8)
          if (aiDescEn.includes(term) || aiDescRu.includes(term)) {
            score += 8;
            if (!matchedFields.includes('description')) matchedFields.push('description');
          }

          // Image prompt match (+5)
          if (imagePrompt.includes(term)) {
            score += 5;
            if (!matchedFields.includes('prompt')) matchedFields.push('prompt');
          }
        }

        return { ...scene, searchScore: score, matchedFields };
      })
      .filter(s => s.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore);
  };

  const filteredScenes = searchScenes(sceneSearch);

  // Current file for gallery mode
  const currentFile = viewMode === 'gallery' ? displayFiles[currentImageIndex] : null;
  const isCurrentFileLinked = currentFile ? allLinkedUrls.has(currentFile.url.split('?')[0]) : false;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Link Storage Images to Scenes</h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'gallery' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('gallery')}
          >
            <Layers className="h-4 w-4 mr-1" />
            Gallery
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4 mr-1" />
            Grid
          </Button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2">
            <X className="h-4 w-4 inline" />
          </button>
        </div>
      )}

      {/* Stats bar */}
      <div className="mb-4 p-3 bg-gray-100 rounded-lg flex items-center gap-6 text-sm">
        <span>Total images: <strong>{storageFiles.length}</strong></span>
        <span>Unlinked: <strong>{unlinkedFiles.length}</strong></span>
        <span className="text-green-600">Linked: <strong>{linkedFiles.length}</strong></span>
        <span className="text-purple-600">Analyzed: <strong>{Object.keys(imageAnalysisMap).length}</strong></span>
        <span>This session: <strong>{linkedCount}</strong></span>
        <div className="ml-auto flex gap-2">
          {batchAnalyzing ? (
            <Button size="sm" variant="destructive" onClick={handleStopBatch}>
              <StopCircle className="h-4 w-4 mr-1" />
              Stop
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={handleBatchAnalyze}>
              <Zap className="h-4 w-4 mr-1" />
              Analyze All
            </Button>
          )}
          <Button
            size="sm"
            variant={showLinked ? 'default' : 'outline'}
            onClick={() => {
              setShowLinked(!showLinked);
              setCurrentImageIndex(0);
            }}
          >
            {showLinked ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
            {showLinked ? 'Showing Linked' : 'Show Linked'}
          </Button>
        </div>
      </div>

      {/* Batch progress bar */}
      {batchAnalyzing && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-purple-700">
              <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
              Analyzing images with AI...
            </span>
            <span className="text-purple-600">
              {batchProgress.analyzed} / {batchProgress.total} ({batchProgress.remaining} remaining)
            </span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: batchProgress.total > 0 ? `${(batchProgress.analyzed / batchProgress.total) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {viewMode === 'gallery' ? (
        /* GALLERY MODE */
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Current Image */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">
                  Image {currentImageIndex + 1} / {displayFiles.length}
                </h2>
                {isCurrentFileLinked && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                    Already Linked
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={goToPrevImage}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={skipImage}>
                  <SkipForward className="h-4 w-4" />
                  Skip
                </Button>
                <Button size="sm" variant="outline" onClick={goToNextImage}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {currentFile ? (
              <div>
                <img
                  src={currentFile.url}
                  alt={currentFile.name}
                  className="w-full h-[400px] object-contain bg-gray-50 rounded-lg"
                />
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-gray-500 truncate flex-1">
                    {currentFile.name}
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAiSuggest}
                    disabled={analyzing}
                    className="ml-2"
                  >
                    {analyzing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-1" />
                    )}
                    AI Suggest
                  </Button>
                </div>

                {/* Stored Analysis Tags (from batch) */}
                {currentFile && imageAnalysisMap[currentFile.name] && !imageAnalysis && (
                  <div className="mt-3 p-2 bg-gray-50 border rounded-lg text-xs">
                    <div className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      Previously Analyzed:
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {imageAnalysisMap[currentFile.name].keywords?.map((kw: string) => (
                        <span key={kw} className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                          {kw}
                        </span>
                      ))}
                    </div>
                    <div className="text-gray-500 mt-1">
                      {imageAnalysisMap[currentFile.name].activity}
                    </div>
                  </div>
                )}

                {/* AI Analysis result (from current suggestion) */}
                {imageAnalysis && (
                  <div className="mt-3 p-2 bg-purple-50 rounded-lg text-xs">
                    <div className="font-semibold text-purple-800 mb-1">AI Analysis:</div>
                    <div className="text-purple-700 space-y-0.5">
                      <div><strong>Activity:</strong> {imageAnalysis.activity}</div>
                      <div><strong>Keywords:</strong> {imageAnalysis.keywords.join(', ')}</div>
                      <div><strong>Mood:</strong> {imageAnalysis.mood}</div>
                      <div><strong>Participants:</strong> {imageAnalysis.participants.count} ({imageAnalysis.participants.genders.join(', ')})</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <Check className="h-12 w-12 mx-auto mb-2" />
                  <div>All images processed!</div>
                </div>
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500">
              <strong>Hotkeys:</strong> ← → or A/D to navigate, S or Esc to skip
            </div>
          </div>

          {/* Right: Scene Search & List */}
          <div className="border rounded-lg p-4">
            {/* AI Suggestions Section */}
            {aiSuggestions.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  AI Suggestions
                </h2>
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {aiSuggestions.map((suggestion, idx) => {
                    const scene = scenes.find(s => s.id === suggestion.id);
                    const variantCount = scene?.image_variants?.length || 0;

                    return (
                      <div
                        key={suggestion.id}
                        className={`p-2 border rounded cursor-pointer transition-colors flex items-center justify-between ${
                          idx < 3 ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' : 'hover:bg-blue-50 hover:border-blue-300'
                        }`}
                        onClick={() => {
                          if (currentFile) {
                            linkImageToScene(currentFile.url, suggestion.id, true);
                          }
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate flex items-center gap-2">
                            {suggestion.slug}
                            <span className="text-xs font-normal text-purple-600">
                              ({suggestion.score} pts)
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {suggestion.category} • {suggestion.matchReasons.slice(0, 2).join(' • ')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {variantCount > 0 && (
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {variantCount} img
                            </span>
                          )}
                          {linking === suggestion.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Link2 className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-b my-4" />
              </div>
            )}

            <h2 className="text-lg font-semibold mb-4">
              {aiSuggestions.length > 0 ? 'All Scenes' : 'Select Scene to Link'}
            </h2>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Type keywords: bondage, oral, roleplay, massage..."
                value={sceneSearch}
                onChange={(e) => setSceneSearch(e.target.value)}
                className="pl-10"
                autoFocus
              />
              {sceneSearch && (
                <button
                  onClick={() => setSceneSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search results info */}
            {sceneSearch && (
              <div className="text-xs text-gray-500 mb-2">
                Found {filteredScenes.length} scenes matching "{sceneSearch}"
              </div>
            )}

            <div className="space-y-1 max-h-[350px] overflow-y-auto">
              {filteredScenes.slice(0, 50).map((scene) => {
                const variantCount = scene.image_variants?.length || 0;
                const isSuggested = aiSuggestions.some(s => s.id === scene.id);
                const hasScore = scene.searchScore > 0;

                return (
                  <div
                    key={scene.id}
                    className={`p-2 border rounded cursor-pointer transition-colors flex items-center justify-between ${
                      isSuggested ? 'opacity-50' :
                      hasScore ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' :
                      'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      if (currentFile && !isSuggested) {
                        linkImageToScene(currentFile.url, scene.id, true);
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate flex items-center gap-2">
                        {scene.slug}
                        {hasScore && (
                          <span className="text-xs font-normal text-blue-600">
                            ({scene.searchScore} pts)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {scene.category} • {scene.title?.en || scene.title?.ru}
                      </div>
                      {/* Show matched fields */}
                      {scene.matchedFields.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {scene.matchedFields.map(field => (
                            <span key={field} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                              {field}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Show tags preview if searching */}
                      {sceneSearch && scene.tags && scene.tags.length > 0 && (
                        <div className="text-xs text-gray-400 mt-1 truncate">
                          Tags: {scene.tags.slice(0, 5).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {variantCount > 0 && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {variantCount} img
                        </span>
                      )}
                      {linking === scene.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Link2 className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredScenes.length > 50 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  +{filteredScenes.length - 50} more (refine search)
                </div>
              )}
              {sceneSearch && filteredScenes.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-4">
                  No scenes found for "{sceneSearch}"
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* GRID MODE (original) */
        <div>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by slug, title, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showAll ? 'default' : 'outline'}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Showing All' : 'Without Images Only'}
            </Button>
            <Button variant="outline" onClick={loadData}>
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left: Scenes */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">
                Scenes ({scenes.filter(s =>
                  showAll || !s.image_url
                ).filter(s =>
                  s.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.title?.ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.category?.toLowerCase().includes(searchTerm.toLowerCase())
                ).length})
              </h2>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {scenes
                  .filter(s => showAll || !s.image_url)
                  .filter(s =>
                    s.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.title?.ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((scene) => {
                    const isSelected = selectedScene === scene.id;

                    return (
                      <div
                        key={scene.id}
                        className={`p-3 border rounded cursor-pointer transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedScene(isSelected ? null : scene.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{scene.slug}</div>
                            <div className="text-sm text-gray-500">
                              {scene.category} • {scene.title?.en || scene.title?.ru}
                            </div>
                          </div>
                          {(scene.image_variants?.length || 0) > 0 && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {scene.image_variants?.length} img
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Right: Storage Files */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">
                Storage Images ({storageFiles.filter(f =>
                  f.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).length})
              </h2>
              <div className="grid grid-cols-3 gap-2 max-h-[70vh] overflow-y-auto">
                {storageFiles
                  .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((file) => (
                    <div
                      key={file.name}
                      className={`relative group cursor-pointer ${
                        selectedScene ? 'hover:ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => {
                        if (selectedScene) {
                          linkImageToScene(file.url, selectedScene);
                        }
                      }}
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-24 object-cover rounded"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {file.name}
                      </div>
                      {selectedScene && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link2 className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <strong>Gallery mode (fast):</strong>
        <ol className="list-decimal ml-5 mt-2 space-y-1">
          <li>See large image on the left</li>
          <li><strong>Search by keywords</strong>: slug, category, tags, title, description, prompt</li>
          <li><strong>AI Suggest</strong>: analyzes image and finds matching scenes</li>
          <li>Click scene to link and auto-advance</li>
          <li>Use Skip or hotkeys (←→ AD S) to navigate</li>
        </ol>
        <div className="mt-3 text-xs text-gray-500">
          <strong>Search tips:</strong> Type multiple words (e.g. "bondage rope" or "oral blowjob").
          Results are sorted by relevance score. Matching fields are highlighted.
        </div>
      </div>
    </div>
  );
}
