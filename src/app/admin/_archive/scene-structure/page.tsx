'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Save, Loader2, RefreshCw, AlertCircle, Link2, Image as ImageIcon, GitBranch } from 'lucide-react';
import Link from 'next/link';
import { SceneTreeView } from '@/components/admin/SceneTreeView';
import { V2Element, LocalizedString, V2Question } from '@/lib/types';
import Image from 'next/image';

interface ImageVariant {
  url: string;
  prompt?: string;
}

interface SceneListItem {
  id: string;
  slug: string;
  title: LocalizedString;
  category: string;
  is_active: boolean;
  elements: V2Element[];
  image_url?: string;
  image_variants?: ImageVariant[];
  paired_with?: string;
  paired_slug?: string;
  shared_images_with?: string;
  shared_images_slug?: string;
  role_direction?: string;
}

interface SceneData {
  id: string;
  slug: string;
  title: LocalizedString;
  subtitle?: LocalizedString;
  category: string;
  intensity: number;
  elements: V2Element[];
  question?: V2Question;
  role_direction?: string;
  is_active?: boolean;
}

export default function SceneStructurePage() {
  const [scenes, setScenes] = useState<SceneListItem[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [sceneData, setSceneData] = useState<SceneData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);

  // Load scene list from new API
  useEffect(() => {
    async function loadScenes() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/scene-tree');
        const data = await res.json();
        if (data.scenes) {
          setScenes(data.scenes.map((s: SceneListItem) => ({
            ...s,
            elements: s.elements || [],
          })));
        }
      } catch (e) {
        setError('Failed to load scenes');
      } finally {
        setLoading(false);
      }
    }
    loadScenes();
  }, []);

  // Load selected scene data
  const loadSceneData = useCallback(async (sceneId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/scene-elements?sceneId=${sceneId}`);
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setSceneData(data);
      setHasChanges(false);
    } catch (e) {
      setError((e as Error).message);
      setSceneData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle scene selection
  const handleSelectScene = (sceneId: string) => {
    if (hasChanges) {
      const confirm = window.confirm('You have unsaved changes. Discard them?');
      if (!confirm) return;
    }
    setSelectedSceneId(sceneId);
    loadSceneData(sceneId);
  };

  // Handle scene data change
  const handleSceneChange = (updated: SceneData) => {
    setSceneData(updated);
    setHasChanges(true);
  };

  // Save changes
  const handleSave = async () => {
    if (!sceneData) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/scene-elements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: sceneData.id,
          elements: sceneData.elements,
          question: sceneData.question,
        }),
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setHasChanges(false);
      setScenes((prev) =>
        prev.map((s) =>
          s.id === sceneData.id ? { ...s, elements: sceneData.elements } : s
        )
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Export to JSON
  const handleExport = async () => {
    if (!sceneData) return;

    const exportData = {
      id: sceneData.slug.replace(/-/g, '_'),
      slug: sceneData.slug,
      version: 2,
      title: sceneData.title,
      subtitle: sceneData.subtitle,
      category: sceneData.category,
      intensity: sceneData.intensity,
      role_direction: sceneData.role_direction,
      elements: sceneData.elements,
      question: sceneData.question,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sceneData.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get scene image
  const getSceneImage = (scene: SceneListItem): string | null => {
    if (scene.image_url) return scene.image_url;
    if (scene.image_variants && scene.image_variants.length > 0) {
      return scene.image_variants[0].url;
    }
    return null;
  };

  // Filter scenes
  const filteredScenes = scenes.filter((scene) => {
    if (!showInactive && !scene.is_active) return false;

    const matchesSearch =
      !searchQuery ||
      scene.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scene.title?.ru?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scene.title?.en?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'all' || scene.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Get unique categories (filter out null/undefined)
  const categories = [...new Set(scenes.map((s) => s.category).filter(Boolean))].sort();

  // Get selected scene's full data for showing relationships
  const selectedScene = scenes.find(s => s.id === selectedSceneId);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="flex h-screen">
        {/* Sidebar - Scene List */}
        <div className="w-96 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold">Scene Structure</h1>
              <Link
                href="/admin/gate-hierarchy"
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                <GitBranch className="size-3" />
                Gates
              </Link>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scenes..."
                className="w-full bg-gray-800 border border-gray-700 rounded pl-8 pr-3 py-1.5 text-sm"
              />
            </div>

            {/* Category filter */}
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded"
                />
                Inactive
              </label>
            </div>
          </div>

          {/* Scene list */}
          <div className="flex-1 overflow-y-auto">
            {loading && scenes.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-gray-500" />
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {filteredScenes.map((scene) => {
                  const imageUrl = getSceneImage(scene);
                  return (
                    <button
                      key={scene.id}
                      onClick={() => handleSelectScene(scene.id)}
                      className={`w-full text-left p-3 hover:bg-gray-800/50 transition-colors ${
                        selectedSceneId === scene.id ? 'bg-gray-800' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded overflow-hidden bg-gray-800 flex-shrink-0">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={scene.slug}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              <ImageIcon className="size-6" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`size-2 rounded-full flex-shrink-0 ${
                                scene.is_active ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            />
                            <span className="font-medium text-sm truncate">
                              {scene.title?.ru || scene.title?.en || scene.slug}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {scene.slug}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded">
                              {scene.category}
                            </span>
                            {scene.role_direction && (
                              <span className="text-xs px-1.5 py-0.5 bg-blue-900/50 text-blue-300 rounded">
                                {scene.role_direction}
                              </span>
                            )}
                            {scene.elements.length > 0 && (
                              <span className="text-xs px-1.5 py-0.5 bg-purple-900/50 text-purple-300 rounded">
                                {scene.elements.length} el
                              </span>
                            )}
                            {scene.paired_slug && (
                              <span className="text-xs px-1.5 py-0.5 bg-pink-900/50 text-pink-300 rounded flex items-center gap-1">
                                <Link2 className="size-3" />
                                paired
                              </span>
                            )}
                            {scene.shared_images_slug && (
                              <span className="text-xs px-1.5 py-0.5 bg-cyan-900/50 text-cyan-300 rounded flex items-center gap-1">
                                <ImageIcon className="size-3" />
                                shared
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filteredScenes.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No scenes found
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-800 text-xs text-gray-500">
            {filteredScenes.length} scenes ({filteredScenes.filter(s => s.elements.length > 0).length} with elements)
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {sceneData && (
                <>
                  <button
                    onClick={() => loadSceneData(sceneData.id)}
                    className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded"
                    title="Reload"
                  >
                    <RefreshCw className="size-4" />
                  </button>
                  {hasChanges && (
                    <span className="text-xs text-amber-400">Unsaved changes</span>
                  )}
                </>
              )}

              {/* Show relationships */}
              {selectedScene && (selectedScene.paired_slug || selectedScene.shared_images_slug) && (
                <div className="flex items-center gap-3 text-xs">
                  {selectedScene.paired_slug && (
                    <span className="text-pink-400">
                      Paired: <span className="text-pink-300">{selectedScene.paired_slug}</span>
                    </span>
                  )}
                  {selectedScene.shared_images_slug && (
                    <span className="text-cyan-400">
                      Shared images: <span className="text-cyan-300">{selectedScene.shared_images_slug}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {error && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="size-4" />
                  {error}
                </div>
              )}

              {sceneData && (
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save
                </button>
              )}
            </div>
          </div>

          {/* Scene editor */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && selectedSceneId ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-8 animate-spin text-gray-500" />
              </div>
            ) : sceneData ? (
              <SceneTreeView
                scene={sceneData}
                onChange={handleSceneChange}
                onExport={handleExport}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <div className="text-6xl mb-4">🌳</div>
                <p className="text-lg">Select a scene to edit its structure</p>
                <p className="text-sm mt-2">
                  Choose from the list on the left to view and edit elements and follow-ups
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
