'use client';

import { cn } from '@/lib/utils';

export type ExperienceLevel = 0 | 1 | 2 | null;

interface ExperienceSelectorProps {
  value: ExperienceLevel;
  onChange: (value: ExperienceLevel) => void;
  locale?: 'ru' | 'en';
}

const options = [
  { value: 0 as const, label: { ru: 'Не пробовал', en: 'Never tried' } },
  { value: 1 as const, label: { ru: 'Редко', en: 'Rarely' } },
  { value: 2 as const, label: { ru: 'Часто', en: 'Often' } },
];

export function ExperienceSelector({ value, onChange, locale = 'ru' }: ExperienceSelectorProps) {
  return (
    <div className="flex gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(value === opt.value ? null : opt.value)}
          className={cn(
            "flex-1 py-2 px-3 rounded-full text-sm font-medium transition-colors",
            value === opt.value
              ? "bg-rose-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {opt.label[locale]}
        </button>
      ))}
    </div>
  );
}
