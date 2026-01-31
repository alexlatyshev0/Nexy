'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { V2FollowUp, LocalizedString } from '@/lib/types';
import { LocalizedTextInput } from './LocalizedTextInput';
import { OptionEditor } from './OptionEditor';

const FOLLOW_UP_TYPES = [
  { value: 'multi_select', label: 'Multi Select' },
  { value: 'single_select', label: 'Single Select' },
  { value: 'scale', label: 'Scale' },
  { value: 'text_input', label: 'Text Input' },
  { value: 'intensity', label: 'Intensity' },
] as const;

interface FollowUpEditorProps {
  followUp: V2FollowUp;
  onChange: (followUp: V2FollowUp) => void;
  onDelete: () => void;
  depth?: number;
  maxDepth?: number;
}

export function FollowUpEditor({
  followUp,
  onChange,
  onDelete,
  depth = 1,
  maxDepth = 3,
}: FollowUpEditorProps) {
  const [expanded, setExpanded] = useState(true);
  const [showConfig, setShowConfig] = useState(false);

  const updateField = <K extends keyof V2FollowUp>(key: K, value: V2FollowUp[K]) => {
    onChange({ ...followUp, [key]: value });
  };

  const updateConfig = (updates: Partial<V2FollowUp['config']>) => {
    onChange({
      ...followUp,
      config: { ...followUp.config, ...updates },
    });
  };

  const addNestedFollowUp = () => {
    const newFollowUp: V2FollowUp = {
      id: `fu_${Date.now()}`,
      type: 'multi_select',
      question: { ru: '', en: '' },
      config: { options: [] },
    };
    onChange({
      ...followUp,
      follow_ups: [...(followUp.follow_ups || []), newFollowUp],
    });
  };

  const updateNestedFollowUp = (index: number, updated: V2FollowUp) => {
    const newFollowUps = [...(followUp.follow_ups || [])];
    newFollowUps[index] = updated;
    onChange({ ...followUp, follow_ups: newFollowUps });
  };

  const deleteNestedFollowUp = (index: number) => {
    onChange({
      ...followUp,
      follow_ups: (followUp.follow_ups || []).filter((_, i) => i !== index),
    });
  };

  const typeIcon = {
    multi_select: '☑',
    single_select: '◉',
    scale: '⟷',
    text_input: '✎',
    intensity: '🔥',
    text: '✎',
    image_select: '🖼',
    text_with_suggestions: '💡',
    role: '👤',
    experience: '⭐',
    body_map: '🗺',
  }[followUp.type] || '?';

  const depthColors = [
    'border-blue-600',
    'border-purple-600',
    'border-pink-600',
  ];

  return (
    <div className={`border-l-2 ${depthColors[depth - 1] || 'border-gray-600'} pl-3 space-y-2`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="p-0.5 text-gray-400 hover:text-gray-200"
        >
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>

        <span className="text-lg" title={followUp.type}>{typeIcon}</span>

        <span className="text-sm text-gray-300 flex-1 truncate">
          {followUp.question.ru || followUp.question.en || 'Untitled'}
        </span>

        <span className="text-xs text-gray-500 font-mono">{followUp.id}</span>

        <button
          type="button"
          onClick={onDelete}
          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
          title="Delete follow-up"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* Content */}
      {expanded && (
        <div className="space-y-3 pl-6">
          {/* Basic fields */}
          <div className="grid grid-cols-2 gap-3">
            {/* ID */}
            <div>
              <label className="text-xs text-gray-500">ID</label>
              <input
                type="text"
                value={followUp.id}
                onChange={(e) => updateField('id', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm font-mono text-gray-300"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-xs text-gray-500">Type</label>
              <select
                value={followUp.type}
                onChange={(e) => updateField('type', e.target.value as V2FollowUp['type'])}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300"
              >
                {FOLLOW_UP_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Question */}
          <LocalizedTextInput
            label="Question"
            value={followUp.question}
            onChange={(q) => updateField('question', q)}
            placeholder={{ ru: 'Вопрос (RU)', en: 'Question (EN)' }}
          />

          {/* Config toggle */}
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {showConfig ? '▾ Hide Config' : '▸ Show Config'}
          </button>

          {/* Config based on type */}
          {showConfig && (
            <div className="space-y-3 p-3 bg-gray-800/30 rounded border border-gray-700">
              {/* Options for multi_select / single_select */}
              {(followUp.type === 'multi_select' || followUp.type === 'single_select') && (
                <OptionEditor
                  options={followUp.config.options || []}
                  onChange={(options) => updateConfig({ options })}
                />
              )}

              {/* Labels for scale / intensity */}
              {(followUp.type === 'scale' || followUp.type === 'intensity') && (
                <div className="space-y-2">
                  <LocalizedTextInput
                    label="Min Label"
                    value={followUp.config.labels?.min || { ru: '', en: '' }}
                    onChange={(min) =>
                      updateConfig({
                        labels: { ...followUp.config.labels, min },
                      })
                    }
                    placeholder={{ ru: 'Минимум', en: 'Minimum' }}
                  />
                  <LocalizedTextInput
                    label="Max Label"
                    value={followUp.config.labels?.max || { ru: '', en: '' }}
                    onChange={(max) =>
                      updateConfig({
                        labels: { ...followUp.config.labels, max },
                      })
                    }
                    placeholder={{ ru: 'Максимум', en: 'Maximum' }}
                  />
                </div>
              )}

              {/* Placeholder for text_input */}
              {followUp.type === 'text_input' && (
                <LocalizedTextInput
                  label="Placeholder"
                  value={followUp.config.placeholder || { ru: '', en: '' }}
                  onChange={(placeholder) => updateConfig({ placeholder })}
                  placeholder={{ ru: 'Подсказка', en: 'Placeholder' }}
                />
              )}
            </div>
          )}

          {/* Nested follow-ups */}
          {depth < maxDepth && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Nested Follow-ups ({(followUp.follow_ups || []).length})
                </span>
                <button
                  type="button"
                  onClick={addNestedFollowUp}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-700 hover:bg-purple-600 text-white rounded"
                >
                  <Plus className="size-3" />
                  Add Nested
                </button>
              </div>

              {(followUp.follow_ups || []).map((nested, index) => (
                <FollowUpEditor
                  key={nested.id}
                  followUp={nested}
                  onChange={(updated) => updateNestedFollowUp(index, updated)}
                  onDelete={() => deleteNestedFollowUp(index)}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
