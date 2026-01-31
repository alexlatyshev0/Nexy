'use client';

import { useState } from 'react';
import { LocalizedString } from '@/lib/types';

interface LocalizedTextInputProps {
  value: LocalizedString;
  onChange: (value: LocalizedString) => void;
  label?: string;
  placeholder?: { ru?: string; en?: string };
  multiline?: boolean;
  className?: string;
}

export function LocalizedTextInput({
  value,
  onChange,
  label,
  placeholder,
  multiline = false,
  className = '',
}: LocalizedTextInputProps) {
  const [activeLang, setActiveLang] = useState<'ru' | 'en'>('ru');

  const handleChange = (lang: 'ru' | 'en', text: string) => {
    onChange({
      ...value,
      [lang]: text,
    });
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-gray-400">{label}</label>
      )}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setActiveLang('ru')}
          className={`px-2 py-0.5 text-xs rounded ${
            activeLang === 'ru'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          RU
        </button>
        <button
          type="button"
          onClick={() => setActiveLang('en')}
          className={`px-2 py-0.5 text-xs rounded ${
            activeLang === 'en'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          EN
        </button>
      </div>
      <InputComponent
        value={value[activeLang] || ''}
        onChange={(e) => handleChange(activeLang, e.target.value)}
        placeholder={placeholder?.[activeLang] || ''}
        className={`w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-100
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          ${multiline ? 'min-h-[60px] resize-y' : ''}`}
      />
      {/* Show other language preview */}
      {value[activeLang === 'ru' ? 'en' : 'ru'] && (
        <div className="text-xs text-gray-500 truncate">
          {activeLang === 'ru' ? 'EN' : 'RU'}: {value[activeLang === 'ru' ? 'en' : 'ru']}
        </div>
      )}
    </div>
  );
}
