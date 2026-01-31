'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Package } from 'lucide-react';
import { V2Element, V2FollowUp } from '@/lib/types';
import { LocalizedTextInput } from './LocalizedTextInput';
import { FollowUpEditor } from './FollowUpEditor';

interface ElementEditorProps {
  element: V2Element;
  onChange: (element: V2Element) => void;
  onDelete: () => void;
}

export function ElementEditor({ element, onChange, onDelete }: ElementEditorProps) {
  const [expanded, setExpanded] = useState(false);

  const updateField = <K extends keyof V2Element>(key: K, value: V2Element[K]) => {
    onChange({ ...element, [key]: value });
  };

  const addFollowUp = () => {
    const newFollowUp: V2FollowUp = {
      id: `fu_${Date.now()}`,
      type: 'multi_select',
      question: { ru: '', en: '' },
      config: { options: [] },
    };
    onChange({
      ...element,
      follow_ups: [...(element.follow_ups || []), newFollowUp],
    });
    setExpanded(true);
  };

  const updateFollowUp = (index: number, updated: V2FollowUp) => {
    const newFollowUps = [...(element.follow_ups || [])];
    newFollowUps[index] = updated;
    onChange({ ...element, follow_ups: newFollowUps });
  };

  const deleteFollowUp = (index: number) => {
    onChange({
      ...element,
      follow_ups: (element.follow_ups || []).filter((_, i) => i !== index),
    });
  };

  const followUpCount = element.follow_ups?.length || 0;

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-800/50 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-2 p-3 bg-gray-800 cursor-pointer hover:bg-gray-700/50"
        onClick={() => setExpanded(!expanded)}
      >
        <button type="button" className="p-0.5 text-gray-400">
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>

        <Package className="size-4 text-blue-400" />

        <span className="font-medium text-gray-200 flex-1">
          {element.label.ru || element.label.en || 'Untitled Element'}
        </span>

        <span className="text-xs text-gray-500 font-mono">{element.id}</span>

        {followUpCount > 0 && (
          <span className="px-1.5 py-0.5 text-xs bg-purple-900/50 text-purple-300 rounded">
            {followUpCount} follow-up{followUpCount > 1 ? 's' : ''}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
          title="Delete element"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-3 space-y-4 border-t border-gray-700">
          {/* Basic fields */}
          <div className="grid grid-cols-2 gap-3">
            {/* ID */}
            <div>
              <label className="text-xs text-gray-500">Element ID</label>
              <input
                type="text"
                value={element.id}
                onChange={(e) => updateField('id', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-sm font-mono text-gray-300"
              />
            </div>

            {/* Tag Ref */}
            <div>
              <label className="text-xs text-gray-500">Tag Ref</label>
              <input
                type="text"
                value={element.tag_ref}
                onChange={(e) => updateField('tag_ref', e.target.value)}
                placeholder="spanking_implement"
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-sm font-mono text-gray-300"
              />
            </div>
          </div>

          {/* Label */}
          <LocalizedTextInput
            label="Label"
            value={element.label}
            onChange={(label) => updateField('label', label)}
            placeholder={{ ru: 'Название элемента', en: 'Element label' }}
          />

          {/* Follow-ups section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-400">Follow-ups</span>
              <button
                type="button"
                onClick={addFollowUp}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-700 hover:bg-blue-600 text-white rounded"
              >
                <Plus className="size-3" />
                Add Follow-up
              </button>
            </div>

            {(element.follow_ups || []).length > 0 ? (
              <div className="space-y-3">
                {(element.follow_ups || []).map((followUp, index) => (
                  <FollowUpEditor
                    key={followUp.id}
                    followUp={followUp}
                    onChange={(updated) => updateFollowUp(index, updated)}
                    onDelete={() => deleteFollowUp(index)}
                    depth={1}
                    maxDepth={3}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm border border-dashed border-gray-700 rounded">
                No follow-ups yet. Click &quot;Add Follow-up&quot; to create one.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
