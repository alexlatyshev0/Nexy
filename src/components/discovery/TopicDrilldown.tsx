'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ChevronRight, Check } from 'lucide-react';
import { t } from '@/lib/locale';
import type { Locale } from '@/lib/types';

interface LocalizedString {
  en?: string;
  ru?: string;
}

interface DrilldownOption {
  id: string;
  label: LocalizedString;
  examples?: LocalizedString;
  drilldown?: {
    question: LocalizedString;
    type: 'multi_choice' | 'single_choice' | 'scale';
    options?: DrilldownOption[];
    allow_custom?: boolean;
    min?: LocalizedString;
    max?: LocalizedString;
  } | null;
}

interface TopicQuestion {
  question: LocalizedString;
  type: 'multi_choice' | 'multi_choice_drilldown' | 'single_choice' | 'scale' | 'yes_maybe_no';
  options?: DrilldownOption[];
  min?: LocalizedString;
  max?: LocalizedString;
  show_if?: string[];
}

interface TopicData {
  id: string;
  name: LocalizedString;
  questions: Record<string, TopicQuestion>;
  experience?: {
    show?: boolean;
    show_if?: string[];
    question?: LocalizedString;
    options?: Array<{ id: string; label: LocalizedString }>;
  };
}

interface DrilldownResponses {
  [questionKey: string]: string | string[] | number | {
    selected: string[];
    drilldowns: Record<string, string[]>;
  };
}

interface TopicDrilldownProps {
  topic: TopicData;
  initialInterest: number; // 0-100 from the scale answer
  locale: Locale;
  onComplete: (responses: DrilldownResponses) => void;
  onSkip: () => void;
}

export function TopicDrilldown({
  topic,
  initialInterest,
  locale,
  onComplete,
  onSkip,
}: TopicDrilldownProps) {
  const [responses, setResponses] = useState<DrilldownResponses>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeDrilldown, setActiveDrilldown] = useState<{
    questionKey: string;
    optionId: string;
    drilldown: DrilldownOption['drilldown'];
  } | null>(null);

  // Get questions to show based on interest level
  const questionsToShow = Object.entries(topic.questions).filter(([key, q]) => {
    if (!q.show_if) return true;
    // Check if interest level qualifies
    if (initialInterest >= 60) return q.show_if.includes('yes') || q.show_if.includes('maybe');
    if (initialInterest >= 30) return q.show_if.includes('maybe');
    return false;
  });

  const currentQuestion = questionsToShow[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex >= questionsToShow.length - 1;

  const getText = useCallback((text: LocalizedString | undefined): string => {
    if (!text) return '';
    return text[locale] || text.ru || text.en || '';
  }, [locale]);

  const handleMultiChoiceSelect = (questionKey: string, optionId: string, hasdrilldown: boolean) => {
    setResponses(prev => {
      const current = prev[questionKey] as { selected: string[]; drilldowns: Record<string, string[]> } | undefined;
      const selected = current?.selected || [];
      const drilldowns = current?.drilldowns || {};

      if (selected.includes(optionId)) {
        // Deselect
        return {
          ...prev,
          [questionKey]: {
            selected: selected.filter(id => id !== optionId),
            drilldowns: { ...drilldowns, [optionId]: [] },
          },
        };
      } else {
        // Select
        return {
          ...prev,
          [questionKey]: {
            selected: [...selected, optionId],
            drilldowns,
          },
        };
      }
    });
  };

  const handleDrilldownSelect = (questionKey: string, parentOptionId: string, drilldownOptionId: string) => {
    setResponses(prev => {
      const current = prev[questionKey] as { selected: string[]; drilldowns: Record<string, string[]> } | undefined;
      const drilldowns = current?.drilldowns || {};
      const parentDrilldown = drilldowns[parentOptionId] || [];

      if (parentDrilldown.includes(drilldownOptionId)) {
        return {
          ...prev,
          [questionKey]: {
            ...current,
            selected: current?.selected || [],
            drilldowns: {
              ...drilldowns,
              [parentOptionId]: parentDrilldown.filter(id => id !== drilldownOptionId),
            },
          },
        };
      } else {
        return {
          ...prev,
          [questionKey]: {
            ...current,
            selected: current?.selected || [],
            drilldowns: {
              ...drilldowns,
              [parentOptionId]: [...parentDrilldown, drilldownOptionId],
            },
          },
        };
      }
    });
  };

  const handleSingleChoiceSelect = (questionKey: string, optionId: string) => {
    setResponses(prev => ({
      ...prev,
      [questionKey]: optionId,
    }));
  };

  const handleScaleChange = (questionKey: string, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionKey]: value,
    }));
  };

  const handleNext = () => {
    if (activeDrilldown) {
      setActiveDrilldown(null);
      return;
    }

    if (isLastQuestion) {
      onComplete(responses);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const openDrilldown = (questionKey: string, option: DrilldownOption) => {
    if (option.drilldown) {
      setActiveDrilldown({
        questionKey,
        optionId: option.id,
        drilldown: option.drilldown,
      });
    }
  };

  // Render active drilldown
  if (activeDrilldown) {
    const { questionKey, optionId, drilldown } = activeDrilldown;
    const current = responses[questionKey] as { selected: string[]; drilldowns: Record<string, string[]> } | undefined;
    const selectedInDrilldown = current?.drilldowns?.[optionId] || [];

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground mb-2">
            {getText(drilldown?.question)}
          </h3>
          <p className="text-sm text-muted-foreground">Выбери всё подходящее</p>
        </div>

        <div className="space-y-3">
          {drilldown?.options?.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleDrilldownSelect(questionKey, optionId, opt.id)}
              className={`w-full p-4 rounded-lg border text-left transition-all ${
                selectedInDrilldown.includes(opt.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{getText(opt.label)}</span>
                {selectedInDrilldown.includes(opt.id) && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
              {opt.examples && (
                <p className="text-sm text-muted-foreground mt-1">
                  {getText(opt.examples)}
                </p>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setActiveDrilldown(null)}
            className="flex-1"
          >
            Назад
          </Button>
          <Button onClick={handleNext} className="flex-1">
            Готово
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const [questionKey, question] = currentQuestion;
  const currentResponse = responses[questionKey];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="text-center">
        <div className="text-xs text-muted-foreground mb-2">
          {currentQuestionIndex + 1} / {questionsToShow.length}
        </div>
        <h3 className="text-lg font-medium text-foreground">
          {getText(question.question)}
        </h3>
      </div>

      {/* Multi-choice with drilldown */}
      {(question.type === 'multi_choice' || question.type === 'multi_choice_drilldown') && (
        <div className="space-y-3">
          {question.options?.map(opt => {
            const current = currentResponse as { selected: string[]; drilldowns: Record<string, string[]> } | undefined;
            const isSelected = current?.selected?.includes(opt.id) || false;
            const hasDrilldown = !!opt.drilldown;
            const drilldownCount = current?.drilldowns?.[opt.id]?.length || 0;

            return (
              <div key={opt.id} className="space-y-2">
                <button
                  onClick={() => handleMultiChoiceSelect(questionKey, opt.id, hasDrilldown)}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isSelected} />
                      <span className="font-medium">{getText(opt.label)}</span>
                    </div>
                    {hasDrilldown && isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDrilldown(questionKey, opt);
                        }}
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        {drilldownCount > 0 ? `${drilldownCount} выбрано` : 'Уточнить'}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {opt.examples && (
                    <p className="text-sm text-muted-foreground mt-1 ml-7">
                      {getText(opt.examples)}
                    </p>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Single choice */}
      {question.type === 'single_choice' && (
        <RadioGroup
          value={currentResponse as string || ''}
          onValueChange={(value) => handleSingleChoiceSelect(questionKey, value)}
          className="space-y-3"
        >
          {question.options?.map(opt => (
            <div key={opt.id} className="flex items-center space-x-3">
              <RadioGroupItem value={opt.id} id={opt.id} />
              <Label htmlFor={opt.id} className="cursor-pointer">
                {getText(opt.label)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {/* Scale */}
      {question.type === 'scale' && (
        <div className="space-y-4 px-2">
          <Slider
            value={[(currentResponse as number) || 50]}
            onValueChange={([value]) => handleScaleChange(questionKey, value)}
            min={0}
            max={100}
            step={1}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{getText(question.min)}</span>
            <span>{getText(question.max)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onSkip} className="flex-1">
          {t('skip', locale || 'en')}
        </Button>
        <Button onClick={handleNext} className="flex-1">
          {isLastQuestion ? 'Готово' : 'Далее'}
        </Button>
      </div>
    </div>
  );
}
