'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw, Sparkles, Check, AlertCircle } from 'lucide-react';

interface ScenePrompt {
  id: string;
  slug: string;
  current_prompt: string;
  tags: string[];
  role_direction: string;
  detected_participants: string;
}

interface EnrichResult {
  id: string;
  slug: string;
  participants: string;
  original_prompt: string;
  suggested_tags: string[];
  enriched_prompt: string;
  updated: boolean;
}

export default function PromptsAdminPage() {
  const [scenes, setScenes] = useState<ScenePrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrichResults, setEnrichResults] = useState<EnrichResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load scenes on mount
  useEffect(() => {
    loadScenes();
  }, []);

  const loadScenes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/enrich-prompts');
      const data = await res.json();
      if (data.scenes) {
        setScenes(data.scenes);
      }
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const exportPrompts = async () => {
    window.open('/api/admin/export-prompts', '_blank');
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === scenes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(scenes.map(s => s.id)));
    }
  };

  const selectByParticipants = (type: string) => {
    const matching = scenes.filter(s => s.detected_participants === type);
    setSelectedIds(new Set(matching.map(s => s.id)));
  };

  const previewEnrichment = async () => {
    if (selectedIds.size === 0) {
      setMessage({ type: 'error', text: 'Select scenes to enrich' });
      return;
    }

    setProcessing(true);
    setMessage(null);
    setEnrichResults([]);

    try {
      const res = await fetch('/api/admin/enrich-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneIds: Array.from(selectedIds),
          dryRun: true,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage({ type: 'error', text: data.error });
      } else {
        setEnrichResults(data.results || []);
        setMessage({ type: 'success', text: `Preview ready for ${data.total} scenes` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setProcessing(false);
    }
  };

  const applyEnrichment = async () => {
    if (selectedIds.size === 0) {
      setMessage({ type: 'error', text: 'Select scenes to update' });
      return;
    }

    if (!confirm(`Update ${selectedIds.size} scene prompts? Make sure you exported a backup first!`)) {
      return;
    }

    setProcessing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/enrich-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneIds: Array.from(selectedIds),
          dryRun: false,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage({ type: 'error', text: data.error });
      } else {
        setEnrichResults(data.results || []);
        setMessage({ type: 'success', text: `Updated ${data.updated}/${data.total} scenes` });
        // Reload scenes
        loadScenes();
      }
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setProcessing(false);
    }
  };

  const participantCounts = scenes.reduce((acc, s) => {
    acc[s.detected_participants] = (acc[s.detected_participants] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Prompt Enrichment</h1>

        {/* Actions */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={exportPrompts}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <Download size={18} />
              Export Backup
            </button>

            <button
              onClick={loadScenes}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>

            <div className="border-l border-gray-600 pl-4 ml-2">
              <span className="text-gray-400 text-sm mr-2">Select by type:</span>
              {Object.entries(participantCounts).map(([type, count]) => (
                <button
                  key={type}
                  onClick={() => selectByParticipants(type)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm mr-2"
                >
                  {type} ({count})
                </button>
              ))}
            </div>

            <div className="flex-1" />

            <button
              onClick={previewEnrichment}
              disabled={processing || selectedIds.size === 0}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50"
            >
              <Sparkles size={18} />
              Preview ({selectedIds.size})
            </button>

            <button
              onClick={applyEnrichment}
              disabled={processing || selectedIds.size === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
            >
              <Check size={18} />
              Apply ({selectedIds.size})
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
            }`}>
              {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </div>
          )}
        </div>

        {/* Preview Results */}
        {enrichResults.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Enrichment Preview</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {enrichResults.map(result => (
                <div key={result.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{result.slug}</span>
                    <span className="text-sm px-2 py-1 bg-gray-600 rounded">{result.participants}</span>
                  </div>
                  <div className="text-sm mb-2">
                    <span className="text-gray-400">Suggested tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.suggested_tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">Original:</span>
                    <p className="text-gray-300 mt-1 line-clamp-2">{result.original_prompt}</p>
                  </div>
                  <div className="text-sm mt-2">
                    <span className="text-green-400">Enriched:</span>
                    <p className="text-green-300 mt-1 line-clamp-3">{result.enriched_prompt}</p>
                  </div>
                  {result.updated && (
                    <div className="mt-2 text-green-400 text-sm flex items-center gap-1">
                      <Check size={14} /> Updated in DB
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scenes List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Scenes ({scenes.length})</h2>
            <button
              onClick={selectAll}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {selectedIds.size === scenes.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-700 sticky top-0">
                <tr>
                  <th className="p-3 text-left w-12"></th>
                  <th className="p-3 text-left">Slug</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Tags</th>
                  <th className="p-3 text-left">Current Prompt</th>
                </tr>
              </thead>
              <tbody>
                {scenes.map(scene => (
                  <tr
                    key={scene.id}
                    className={`border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer ${
                      selectedIds.has(scene.id) ? 'bg-blue-900/30' : ''
                    }`}
                    onClick={() => toggleSelect(scene.id)}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(scene.id)}
                        onChange={() => toggleSelect(scene.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="p-3 font-medium">{scene.slug}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        scene.detected_participants === 'm+m' ? 'bg-blue-900 text-blue-300' :
                        scene.detected_participants === 'f+f' ? 'bg-pink-900 text-pink-300' :
                        scene.detected_participants === 'solo_m' ? 'bg-cyan-900 text-cyan-300' :
                        scene.detected_participants === 'solo_f' ? 'bg-purple-900 text-purple-300' :
                        'bg-gray-600 text-gray-300'
                      }`}>
                        {scene.detected_participants}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {scene.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-gray-600 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {scene.tags.length > 3 && (
                          <span className="text-gray-400 text-xs">+{scene.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-300 max-w-md truncate">
                      {scene.current_prompt || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
