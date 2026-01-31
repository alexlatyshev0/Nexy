'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  GripVertical,
  AlertCircle,
} from 'lucide-react';

interface SceneRef {
  id: string;
  requires?: string[];
}

interface Topic {
  id: string;
  title: { ru: string; en: string };
  intensity: number;
  gate_key: string;
  require_very?: boolean;
  skip_if_body_map?: {
    zones: string[];
    actions: string[];
    condition: string;
  };
  scenes: SceneRef[];
}

interface TopicsData {
  version: number;
  description: string;
  topics: Topic[];
  body_map_to_topic: Record<string, string[]>;
  gate_to_topics: Record<string, string[]>;
}

export default function TopicsAdminPage() {
  const [data, setData] = useState<TopicsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/admin/topics');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const saveTopics = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/topics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save');
      setHasChanges(false);
    } catch (err) {
      setError('Failed to save topics');
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = (topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const updateTopic = (index: number, updates: Partial<Topic>) => {
    if (!data) return;
    const newTopics = [...data.topics];
    newTopics[index] = { ...newTopics[index], ...updates };
    setData({ ...data, topics: newTopics });
    setHasChanges(true);
  };

  const updateTopicTitle = (index: number, lang: 'ru' | 'en', value: string) => {
    if (!data) return;
    const newTopics = [...data.topics];
    newTopics[index] = {
      ...newTopics[index],
      title: { ...newTopics[index].title, [lang]: value },
    };
    setData({ ...data, topics: newTopics });
    setHasChanges(true);
  };

  const addScene = (topicIndex: number, sceneSlug: string) => {
    if (!data || !sceneSlug.trim()) return;
    const newTopics = [...data.topics];
    newTopics[topicIndex] = {
      ...newTopics[topicIndex],
      scenes: [...newTopics[topicIndex].scenes, { id: sceneSlug.trim() }],
    };
    setData({ ...data, topics: newTopics });
    setHasChanges(true);
  };

  const removeScene = (topicIndex: number, sceneIndex: number) => {
    if (!data) return;
    const newTopics = [...data.topics];
    newTopics[topicIndex] = {
      ...newTopics[topicIndex],
      scenes: newTopics[topicIndex].scenes.filter((_, i) => i !== sceneIndex),
    };
    setData({ ...data, topics: newTopics });
    setHasChanges(true);
  };

  const updateSceneRequires = (topicIndex: number, sceneIndex: number, requires: string[]) => {
    if (!data) return;
    const newTopics = [...data.topics];
    const newScenes = [...newTopics[topicIndex].scenes];
    newScenes[sceneIndex] = {
      ...newScenes[sceneIndex],
      requires: requires.length > 0 ? requires : undefined,
    };
    newTopics[topicIndex] = { ...newTopics[topicIndex], scenes: newScenes };
    setData({ ...data, topics: newTopics });
    setHasChanges(true);
  };

  const moveTopic = (fromIndex: number, direction: 'up' | 'down') => {
    if (!data) return;
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= data.topics.length) return;

    const newTopics = [...data.topics];
    [newTopics[fromIndex], newTopics[toIndex]] = [newTopics[toIndex], newTopics[fromIndex]];
    setData({ ...data, topics: newTopics });
    setHasChanges(true);
  };

  const addTopic = () => {
    if (!data) return;
    const newTopic: Topic = {
      id: `new-topic-${Date.now()}`,
      title: { ru: 'Новая тема', en: 'New topic' },
      intensity: 2,
      gate_key: '',
      scenes: [],
    };
    setData({ ...data, topics: [...data.topics, newTopic] });
    setHasChanges(true);
    setExpandedTopics((prev) => new Set(prev).add(newTopic.id));
  };

  const removeTopic = (index: number) => {
    if (!data) return;
    if (!confirm('Удалить тему?')) return;
    const newTopics = data.topics.filter((_, i) => i !== index);
    setData({ ...data, topics: newTopics });
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Loading topics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Topics Editor</h1>
        <div className="flex gap-2">
          <Button onClick={addTopic} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Topic
          </Button>
          <Button onClick={saveTopics} disabled={!hasChanges || saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4 text-yellow-500 text-sm">
          Есть несохранённые изменения
        </div>
      )}

      <div className="space-y-2">
        {data.topics.map((topic, topicIndex) => {
          const isExpanded = expandedTopics.has(topic.id);

          return (
            <div
              key={topic.id}
              className="border border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Topic Header */}
              <div
                className="flex items-center gap-2 p-3 bg-gray-800 cursor-pointer hover:bg-gray-750"
                onClick={() => toggleExpand(topic.id)}
              >
                <GripVertical className="w-4 h-4 text-gray-500" />

                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}

                <span className="font-medium flex-1">
                  {topic.title.ru}
                  <span className="text-gray-500 ml-2 text-sm">({topic.id})</span>
                </span>

                <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                  int: {topic.intensity}
                </span>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  {topic.scenes.length} scenes
                </span>

                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveTopic(topicIndex, 'up')}
                    disabled={topicIndex === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveTopic(topicIndex, 'down')}
                    disabled={topicIndex === data.topics.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => removeTopic(topicIndex)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Topic Content */}
              {isExpanded && (
                <div className="p-4 space-y-4 bg-gray-900">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        ID
                      </label>
                      <Input
                        value={topic.id}
                        onChange={(e) =>
                          updateTopic(topicIndex, { id: e.target.value })
                        }
                        className="bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Gate Key
                      </label>
                      <Input
                        value={topic.gate_key}
                        onChange={(e) =>
                          updateTopic(topicIndex, { gate_key: e.target.value })
                        }
                        className="bg-gray-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Title (RU)
                      </label>
                      <Input
                        value={topic.title.ru}
                        onChange={(e) =>
                          updateTopicTitle(topicIndex, 'ru', e.target.value)
                        }
                        className="bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Title (EN)
                      </label>
                      <Input
                        value={topic.title.en}
                        onChange={(e) =>
                          updateTopicTitle(topicIndex, 'en', e.target.value)
                        }
                        className="bg-gray-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Intensity (1-5)
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={topic.intensity}
                        onChange={(e) =>
                          updateTopic(topicIndex, {
                            intensity: parseInt(e.target.value) || 1,
                          })
                        }
                        className="bg-gray-800 w-20"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`require-very-${topic.id}`}
                        checked={topic.require_very || false}
                        onChange={(e) =>
                          updateTopic(topicIndex, {
                            require_very: e.target.checked,
                          })
                        }
                      />
                      <label
                        htmlFor={`require-very-${topic.id}`}
                        className="text-sm"
                      >
                        Require VERY interest
                      </label>
                    </div>
                  </div>

                  {/* Scenes */}
                  <div>
                    <label className="text-xs text-gray-500 block mb-2">
                      Scenes ({topic.scenes.length})
                    </label>
                    <div className="space-y-1">
                      {topic.scenes.map((scene, sceneIndex) => (
                        <div
                          key={sceneIndex}
                          className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2"
                        >
                          <span className="flex-1 text-sm font-mono">
                            {scene.id}
                            {scene.requires && scene.requires.length > 0 && (
                              <span className="text-yellow-500 ml-2 text-xs">
                                requires: {scene.requires.join(', ')}
                              </span>
                            )}
                          </span>
                          <Input
                            placeholder="requires (comma-separated)"
                            className="bg-gray-700 text-xs w-40 h-6"
                            defaultValue={scene.requires?.join(', ') || ''}
                            onBlur={(e) => {
                              const requires = e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean);
                              updateSceneRequires(topicIndex, sceneIndex, requires);
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-red-400"
                            onClick={() => removeScene(topicIndex, sceneIndex)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Add Scene */}
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="scene-slug"
                        className="bg-gray-800 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addScene(topicIndex, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          const input = (e.target as HTMLElement)
                            .parentElement?.querySelector('input');
                          if (input) {
                            addScene(topicIndex, input.value);
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Body Map Skip Condition */}
                  {topic.skip_if_body_map && (
                    <div className="bg-gray-800 rounded p-3">
                      <label className="text-xs text-gray-500 block mb-2">
                        Skip if Body Map
                      </label>
                      <div className="text-sm text-gray-400">
                        Zones: {topic.skip_if_body_map.zones.join(', ')}
                        <br />
                        Actions: {topic.skip_if_body_map.actions.join(', ')}
                        <br />
                        Condition: {topic.skip_if_body_map.condition}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
