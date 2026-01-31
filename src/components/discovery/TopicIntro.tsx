'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Topic } from '@/lib/topic-flow';

interface TopicIntroProps {
  topic: Topic;
  locale?: 'ru' | 'en';
  scenesCount: number;
  onContinue: () => void;
}

export function TopicIntro({ topic, locale = 'ru', scenesCount, onContinue }: TopicIntroProps) {
  const title = topic.title[locale];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
    >
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-white mb-4"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-400 mb-8"
      >
        {locale === 'ru'
          ? `${scenesCount} ${getSceneWord(scenesCount, 'ru')}`
          : `${scenesCount} ${getSceneWord(scenesCount, 'en')}`}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={onContinue}
          size="lg"
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium px-8"
        >
          <span>{locale === 'ru' ? 'Продолжить' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

function getSceneWord(count: number, locale: 'ru' | 'en'): string {
  if (locale === 'en') {
    return count === 1 ? 'question' : 'questions';
  }

  // Russian pluralization
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return 'вопрос';
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return 'вопроса';
  }
  return 'вопросов';
}
