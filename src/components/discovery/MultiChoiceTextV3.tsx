'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import type { LocalizedString, Locale, SceneV2Extended } from '@/lib/types';

interface TextOption {
  id: string;
  label: LocalizedString;
  topic_ref?: string;
}

interface MultiChoiceTextV3Props {
  scene: SceneV2Extended;
  locale?: Locale;
  onSubmit: (selected: string[], customValue?: string) => void;
  loading?: boolean;
}

/**
 * Multi-choice text component for V3 scene architecture.
 *
 * Displays:
 * - Scene image
 * - Text options that can be selected (multi-select)
 * - Optional "Other" input for custom values
 *
 * Options can have topic_ref for routing to specific preference topics.
 */
export function MultiChoiceTextV3({
  scene,
  locale = 'ru',
  onSubmit,
  loading = false,
}: MultiChoiceTextV3Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [showOther, setShowOther] = useState(false);
  const [otherValue, setOtherValue] = useState('');

  const options = scene.text_options || [];
  const questionText = scene.question?.text?.[locale] || scene.question?.text?.ru || '';
  const title = scene.title[locale] || scene.title.ru;

  const handleToggle = (optionId: string) => {
    setSelected((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSubmit = () => {
    const finalSelected = [...selected];
    const finalCustom = showOther && otherValue.trim() ? otherValue.trim() : undefined;
    onSubmit(finalSelected, finalCustom);
  };

  const canSubmit = selected.length > 0 || (showOther && otherValue.trim().length > 0);

  const placeholderText =
    scene.other_placeholder?.[locale] ||
    scene.other_placeholder?.ru ||
    (locale === 'ru' ? 'Ваш вариант...' : 'Your option...');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black"
    >
      {/* Image section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative aspect-[4/3] max-h-[40vh]"
      >
        {scene.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={scene.image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-200/20 to-pink-300/20 flex items-center justify-center">
            <span className="text-4xl">✨</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Title overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
      </motion.div>

      {/* Question and options section */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white text-lg font-medium mb-4 text-center"
        >
          {questionText}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-400 text-center mb-4"
        >
          {locale === 'ru' ? '(выбери всё, что подходит)' : '(select all that apply)'}
        </motion.p>

        <div className="space-y-2">
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index + 0.3 }}
            >
              <button
                onClick={() => handleToggle(option.id)}
                disabled={loading}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  selected.includes(option.id)
                    ? 'border-pink-500 bg-pink-500/10'
                    : 'border-gray-700 hover:border-pink-500/50 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selected.includes(option.id)}
                    onCheckedChange={() => handleToggle(option.id)}
                    disabled={loading}
                    className="border-gray-600 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                  />
                  <span className="flex-1 text-white">
                    {option.label[locale] || option.label.ru}
                  </span>
                </div>
              </button>
            </motion.div>
          ))}

          {/* "Other" option */}
          {scene.allow_other && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * options.length + 0.3 }}
            >
              {!showOther ? (
                <button
                  onClick={() => setShowOther(true)}
                  disabled={loading}
                  className="w-full p-4 rounded-lg border border-dashed border-gray-700 hover:border-pink-500/50 text-left transition-all bg-gray-800/30"
                >
                  <div className="flex items-center gap-3 text-gray-400">
                    <Plus className="w-5 h-5" />
                    <span>{locale === 'ru' ? 'Другое...' : 'Other...'}</span>
                  </div>
                </button>
              ) : (
                <div className="p-4 rounded-lg border border-pink-500/50 bg-gray-800/50">
                  <div className="flex items-center gap-3 mb-3">
                    <Checkbox
                      checked={true}
                      onCheckedChange={() => {
                        setShowOther(false);
                        setOtherValue('');
                      }}
                      className="border-pink-500 bg-pink-500"
                    />
                    <span className="text-white">
                      {locale === 'ru' ? 'Своё' : 'Custom'}
                    </span>
                  </div>
                  <Input
                    type="text"
                    value={otherValue}
                    onChange={(e) => setOtherValue(e.target.value)}
                    placeholder={placeholderText}
                    disabled={loading}
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-pink-500"
                    autoFocus
                  />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Submit button */}
      <div className="p-4 border-t border-gray-800">
        <Button
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium"
          size="lg"
        >
          {loading
            ? locale === 'ru'
              ? 'Сохранение...'
              : 'Saving...'
            : locale === 'ru'
            ? 'Готово'
            : 'Done'}
        </Button>
      </div>
    </motion.div>
  );
}
