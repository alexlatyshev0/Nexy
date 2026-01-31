'use client';

import { Plus, FileJson } from 'lucide-react';
import { V2Element, LocalizedString, V2Question } from '@/lib/types';
import { ElementEditor } from './ElementEditor';
import { LocalizedTextInput } from './LocalizedTextInput';

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

interface SceneTreeViewProps {
  scene: SceneData;
  onChange: (scene: SceneData) => void;
  onExport?: () => void;
}

export function SceneTreeView({ scene, onChange, onExport }: SceneTreeViewProps) {
  const updateElements = (elements: V2Element[]) => {
    onChange({ ...scene, elements });
  };

  const addElement = () => {
    const newElement: V2Element = {
      id: `el_${Date.now()}`,
      label: { ru: '', en: '' },
      tag_ref: '',
      follow_ups: [],
    };
    updateElements([...scene.elements, newElement]);
  };

  const updateElement = (index: number, updated: V2Element) => {
    const newElements = [...scene.elements];
    newElements[index] = updated;
    updateElements(newElements);
  };

  const deleteElement = (index: number) => {
    updateElements(scene.elements.filter((_, i) => i !== index));
  };

  const updateQuestion = (updates: Partial<V2Question>) => {
    onChange({
      ...scene,
      question: scene.question ? { ...scene.question, ...updates } : undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Scene header info */}
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-100">
              {scene.title.ru || scene.title.en}
            </h2>
            <p className="text-sm text-gray-400 font-mono">{scene.slug}</p>
          </div>

          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded"
            >
              <FileJson className="size-4" />
              Export JSON
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-gray-700 rounded">
            Category: {scene.category}
          </span>
          <span className="px-2 py-1 bg-gray-700 rounded">
            Intensity: {scene.intensity}
          </span>
          {scene.role_direction && (
            <span className="px-2 py-1 bg-gray-700 rounded">
              Direction: {scene.role_direction}
            </span>
          )}
          <span
            className={`px-2 py-1 rounded ${
              scene.is_active ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
            }`}
          >
            {scene.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Scene question */}
      {scene.question && (
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Scene Question</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Type</label>
              <select
                value={scene.question.type}
                onChange={(e) => updateQuestion({ type: e.target.value as V2Question['type'] })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-300"
              >
                <option value="multi_select">Multi Select</option>
                <option value="single_select">Single Select</option>
                <option value="scale">Scale</option>
                <option value="yes_no">Yes/No</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Min Selections</label>
              <input
                type="number"
                value={scene.question.min_selections || 0}
                onChange={(e) => updateQuestion({ min_selections: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-300"
              />
            </div>
          </div>
          <div className="mt-3">
            <LocalizedTextInput
              label="Question Text"
              value={scene.question.text}
              onChange={(text) => updateQuestion({ text })}
              placeholder={{ ru: 'Текст вопроса', en: 'Question text' }}
            />
          </div>
        </div>
      )}

      {/* Elements section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-200">
            Elements ({scene.elements.length})
          </h3>
          <button
            type="button"
            onClick={addElement}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-700 hover:bg-green-600 text-white rounded"
          >
            <Plus className="size-4" />
            Add Element
          </button>
        </div>

        {scene.elements.length > 0 ? (
          <div className="space-y-3">
            {scene.elements.map((element, index) => (
              <ElementEditor
                key={element.id}
                element={element}
                onChange={(updated) => updateElement(index, updated)}
                onDelete={() => deleteElement(index)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 border border-dashed border-gray-700 rounded-lg">
            No elements in this scene. Click &quot;Add Element&quot; to create one.
          </div>
        )}
      </div>
    </div>
  );
}
