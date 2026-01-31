'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import { LocalizedString } from '@/lib/types';
import { LocalizedTextInput } from './LocalizedTextInput';

interface Option {
  id: string;
  label: LocalizedString;
  image_url?: string;
}

interface OptionEditorProps {
  options: Option[];
  onChange: (options: Option[]) => void;
}

export function OptionEditor({ options, onChange }: OptionEditorProps) {
  const addOption = () => {
    const newId = `opt_${Date.now()}`;
    onChange([...options, { id: newId, label: { ru: '', en: '' } }]);
  };

  const updateOption = (index: number, updates: Partial<Option>) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    onChange(newOptions);
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const moveOption = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= options.length) return;
    const newOptions = [...options];
    const [moved] = newOptions.splice(fromIndex, 1);
    newOptions.splice(toIndex, 0, moved);
    onChange(newOptions);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">Options</span>
        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-green-700 hover:bg-green-600 text-white rounded"
        >
          <Plus className="size-3" />
          Add
        </button>
      </div>

      <div className="space-y-2">
        {options.map((option, index) => (
          <div
            key={option.id}
            className="flex items-start gap-2 p-2 bg-gray-800/50 rounded border border-gray-700"
          >
            {/* Drag handle and reorder buttons */}
            <div className="flex flex-col gap-0.5 pt-1">
              <button
                type="button"
                onClick={() => moveOption(index, index - 1)}
                disabled={index === 0}
                className="p-0.5 text-gray-500 hover:text-gray-300 disabled:opacity-30"
                title="Move up"
              >
                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <GripVertical className="size-3 text-gray-600" />
              <button
                type="button"
                onClick={() => moveOption(index, index + 1)}
                disabled={index === options.length - 1}
                className="p-0.5 text-gray-500 hover:text-gray-300 disabled:opacity-30"
                title="Move down"
              >
                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Option content */}
            <div className="flex-1 space-y-2">
              {/* ID */}
              <input
                type="text"
                value={option.id}
                onChange={(e) => updateOption(index, { id: e.target.value })}
                placeholder="option_id"
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 font-mono"
              />

              {/* Label */}
              <LocalizedTextInput
                value={option.label}
                onChange={(label) => updateOption(index, { label })}
                placeholder={{ ru: 'Название (RU)', en: 'Label (EN)' }}
              />
            </div>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => removeOption(index)}
              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
              title="Delete option"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}

        {options.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No options yet. Click &quot;Add&quot; to create one.
          </div>
        )}
      </div>
    </div>
  );
}
