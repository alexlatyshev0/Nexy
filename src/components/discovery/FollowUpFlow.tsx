'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { t } from '@/lib/locale';
import type { V2FollowUp, V2Element, Locale } from '@/lib/types';
import { shouldShowFollowUp, getDrilldownsForSelectedOptions, type ShowIfContext } from '@/lib/show-if';
import { ImageSelectAnswer } from './ImageSelectAnswer';
import { TextInputAnswer } from './TextInputAnswer';
import { TextWithSuggestionsAnswer } from './TextWithSuggestionsAnswer';
import { IntensityAnswer } from './IntensityAnswer';
import { RoleAnswer } from './RoleAnswer';
import { ExperienceAnswer } from './ExperienceAnswer';
import { MultipleChoiceAnswer } from './MultipleChoiceAnswer';
import { ScaleAnswer } from './ScaleAnswer';
import { BodyMapAnswer } from './BodyMapAnswer/BodyMapAnswer';

interface FollowUpFlowProps {
  followUps: Array<{ element: V2Element; followUps: V2FollowUp[] }>;
  onComplete: (responses: Record<string, Record<string, unknown>>) => void;
  onSkip?: () => void;
  locale?: Locale;
  loading?: boolean;
  // For body map
  partnerGender?: 'male' | 'female';
  userGender?: 'male' | 'female';
  // For show_if conditions
  selectedElements?: string[];
  interestLevel?: number;
}

interface QueueItem {
  elementId: string;
  element: V2Element;
  followUp: V2FollowUp;
  index: number;
  depth: number; // 1 = Level 1, 2 = Level 2, 3 = Level 3
  parentFollowUpId?: string; // For drilldowns
}

export function FollowUpFlow({
  followUps,
  onComplete,
  onSkip,
  locale = 'ru',
  loading = false,
  partnerGender,
  userGender,
  selectedElements = [],
  interestLevel,
}: FollowUpFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, Record<string, unknown>>>({});
  // Track pending drilldowns to add to queue
  const [pendingDrilldowns, setPendingDrilldowns] = useState<QueueItem[]>([]);

  // Build show_if context from current state
  const showIfContext: ShowIfContext = useMemo(() => ({
    selectedElements,
    responses,
    interestLevel,
  }), [selectedElements, responses, interestLevel]);

  // Build and filter queue based on show_if conditions
  // Re-evaluate when responses change (for answer_contains support)
  const followUpQueue = useMemo(() => {
    const queue: QueueItem[] = [];

    for (const { element, followUps: elementFollowUps } of followUps) {
      const context: ShowIfContext = {
        ...showIfContext,
        currentElementId: element.id,
      };

      // Process Level 1 follow-ups
      for (let i = 0; i < elementFollowUps.length; i++) {
        const followUp = elementFollowUps[i];

        // Check show_if condition
        if (!shouldShowFollowUp(followUp, context)) {
          continue;
        }

        queue.push({
          elementId: element.id,
          element,
          followUp,
          index: i,
          depth: 1,
        });

        // Process Level 2 nested follow-ups
        if (followUp.follow_ups && followUp.follow_ups.length > 0) {
          for (let j = 0; j < followUp.follow_ups.length; j++) {
            const nestedFollowUp = followUp.follow_ups[j];

            if (!shouldShowFollowUp(nestedFollowUp, context)) {
              continue;
            }

            queue.push({
              elementId: element.id,
              element,
              followUp: nestedFollowUp,
              index: j,
              depth: 2,
              parentFollowUpId: followUp.id,
            });

            // Process Level 3 nested follow-ups
            if (nestedFollowUp.follow_ups && nestedFollowUp.follow_ups.length > 0) {
              for (let k = 0; k < nestedFollowUp.follow_ups.length; k++) {
                const level3FollowUp = nestedFollowUp.follow_ups[k];

                if (!shouldShowFollowUp(level3FollowUp, context)) {
                  continue;
                }

                queue.push({
                  elementId: element.id,
                  element,
                  followUp: level3FollowUp,
                  index: k,
                  depth: 3,
                  parentFollowUpId: nestedFollowUp.id,
                });
              }
            }
          }
        }
      }
    }

    // Add any pending drilldowns from option selections
    return [...queue, ...pendingDrilldowns];
  }, [followUps, showIfContext, pendingDrilldowns]);

  const currentItem = followUpQueue[currentIndex];
  const isLast = currentIndex === followUpQueue.length - 1;
  const isFirst = currentIndex === 0;

  const handleAnswer = (answer: unknown) => {
    if (!currentItem) return;

    const { elementId, element, followUp, depth } = currentItem;

    // Store response
    const updatedResponses = {
      ...responses,
      [elementId]: {
        ...responses[elementId],
        [followUp.id]: answer,
      },
    };

    setResponses(updatedResponses);

    // Check if selected options have drilldowns (Level 2/3 support)
    if (followUp.type === 'multi_select' || followUp.type === 'single_select') {
      const selectedIds = Array.isArray(answer) ? answer : [answer];
      const drilldowns = getDrilldownsForSelectedOptions(followUp, selectedIds as string[]);

      if (drilldowns.length > 0 && depth < 3) {
        // Add drilldowns to pending queue
        const newDrilldowns: QueueItem[] = drilldowns.map((drilldown, idx) => ({
          elementId,
          element,
          followUp: drilldown,
          index: idx,
          depth: depth + 1,
          parentFollowUpId: followUp.id,
        }));

        setPendingDrilldowns((prev) => [...prev, ...newDrilldowns]);
      }
    }

    // Move to next or complete
    if (isLast) {
      // Use updated responses, not stale state
      onComplete(updatedResponses);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else if (isLast) {
      onComplete(responses);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (!currentItem) {
    return null;
  }

  const { element, followUp, depth } = currentItem;
  const questionText = followUp.question[locale] || followUp.question.en || followUp.question.ru || '';
  const elementLabel = element.label[locale] || element.label.en || element.label.ru || element.id;

  // Depth indicator labels
  const depthLabels = {
    1: locale === 'ru' ? 'Основной вопрос' : 'Main question',
    2: locale === 'ru' ? 'Уточнение' : 'Follow-up',
    3: locale === 'ru' ? 'Детали' : 'Details',
  };

  // Render appropriate component based on follow-up type
  const renderFollowUpComponent = () => {
    switch (followUp.type) {
      case 'multi_select':
      case 'single_select':
        return (
          <MultipleChoiceAnswer
            options={(followUp.config.options || []).map((opt) => ({
              id: opt.id,
              text: opt.label[locale] || opt.label.en || opt.label.ru || opt.id,
              dimension: opt.id,
            }))}
            allowMultiple={followUp.type === 'multi_select'}
            onSubmit={(selected) => handleAnswer(selected)}
            loading={loading}
          />
        );

      case 'scale':
        return (
          <ScaleAnswer
            labels={{
              min: followUp.config.labels?.min?.[locale] || followUp.config.labels?.min?.en || 'Min',
              max: followUp.config.labels?.max?.[locale] || followUp.config.labels?.max?.en || 'Max',
            }}
            onSubmit={(value) => handleAnswer(value)}
            loading={loading}
          />
        );

      case 'image_select':
        return (
          <ImageSelectAnswer
            options={(followUp.config.options || []).map((opt) => ({
              id: opt.id,
              label: opt.label,
              image_url: opt.image_url,
            }))}
            allowMultiple={followUp.config.max !== 1}
            onSubmit={(selected) => handleAnswer(selected)}
            onSkip={handleSkip}
            locale={locale}
            loading={loading}
            minSelections={followUp.config.min || 0}
            maxSelections={followUp.config.max}
          />
        );

      case 'text_input':
        return (
          <TextInputAnswer
            placeholder={followUp.config.placeholder}
            onSubmit={(value) => handleAnswer(value)}
            onSkip={handleSkip}
            locale={locale}
            loading={loading}
            required={!!followUp.config.min}
          />
        );

      case 'text_with_suggestions':
        return (
          <TextWithSuggestionsAnswer
            suggestions={followUp.config.suggestions || []}
            placeholder={followUp.config.placeholder}
            onSubmit={(selected, customText) => handleAnswer({ selected, customText })}
            onSkip={handleSkip}
            locale={locale}
            loading={loading}
            allowMultiple={true}
          />
        );

      case 'intensity':
        return (
          <IntensityAnswer
            labels={followUp.config.labels}
            onSubmit={(value) => handleAnswer(value)}
            onSkip={handleSkip}
            locale={locale}
            loading={loading}
          />
        );

      case 'role':
        return (
          <RoleAnswer
            options={followUp.config.role_options}
            onSubmit={(value) => handleAnswer(value)}
            onSkip={handleSkip}
            locale={locale}
            loading={loading}
          />
        );

      case 'experience':
        return (
          <ExperienceAnswer
            options={followUp.config.experience_options}
            onSubmit={(value) => handleAnswer(value)}
            onSkip={handleSkip}
            locale={locale}
            loading={loading}
          />
        );

      case 'body_map':
        // Body map requires special handling - would need config from scene
        return (
          <div className="text-center py-8 text-muted-foreground">
            {locale === 'ru' 
              ? 'Body map follow-up требует специальной конфигурации'
              : 'Body map follow-up requires special configuration'}
          </div>
        );

      case 'text':
        // Fallback to text input
        return (
          <TextInputAnswer
            placeholder={followUp.config.placeholder}
            onSubmit={(value) => handleAnswer(value)}
            onSkip={handleSkip}
            locale={locale}
            loading={loading}
          />
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            {locale === 'ru' 
              ? `Тип вопроса "${followUp.type}" не поддерживается`
              : `Question type "${followUp.type}" is not supported`}
          </div>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full"
      >
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-medium">
                  {locale === 'ru' ? 'Уточняющие вопросы' : 'Follow-up questions'}
                </CardTitle>
                {depth > 1 && (
                  <span className="text-xs px-2 py-0.5 bg-primary/20 rounded-full">
                    {depthLabels[depth as keyof typeof depthLabels]}
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {currentIndex + 1} / {followUpQueue.length}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {locale === 'ru' ? 'Элемент:' : 'Element:'} <span className="font-medium">{elementLabel}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center font-medium">{questionText}</p>
            
            {renderFollowUpComponent()}

            {/* Navigation */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isFirst || loading}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {locale === 'ru' ? 'Назад' : 'Back'}
              </Button>
              {onSkip && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={loading}
                  className="flex-1"
                >
                  {t('skip', locale || 'en')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
