'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { ArrowRight } from 'lucide-react';
import type { IntroSlide, Locale } from '@/lib/types';

interface IntroSlideV3Props {
  introSlide: IntroSlide;
  locale?: Locale;
  onContinue: () => void;
}

/**
 * Intro slide shown before clarification scenes in discovery flow (V3 architecture).
 *
 * Displays the main_question image with text like:
 * "Тебе нравится [тема]. Давай узнаем больше."
 *
 * Shown once per topic when entering clarification scenes.
 */
export function IntroSlideV3({ introSlide, locale = 'ru', onContinue }: IntroSlideV3Props) {
  const title = introSlide.main_question_title[locale] || introSlide.main_question_title.ru;
  const introText = introSlide.intro_text[locale] || introSlide.intro_text.ru;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black"
    >
      {/* Image section with carousel */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative flex-1 max-h-[60vh]"
      >
        <ImageCarousel
          mainImage={introSlide.image_url}
          variants={introSlide.image_variants}
          alt={title}
          className="w-full h-full"
          autoRotateInterval={5000}
          dotsPosition="bottom"
          placeholder={
            <div className="w-full h-full bg-gradient-to-br from-rose-200/20 to-pink-300/20 flex items-center justify-center">
              <span className="text-6xl">✨</span>
            </div>
          }
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
      </motion.div>

      {/* Content section */}
      <div className="flex flex-col items-center justify-center px-6 py-8 text-center relative z-10 -mt-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-2xl font-bold text-white mb-4"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-gray-300 text-lg mb-2"
        >
          {introText}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-500 text-sm mb-8"
        >
          {locale === 'ru'
            ? `${introSlide.clarification_count} ${getQuestionWord(introSlide.clarification_count, 'ru')}`
            : `${introSlide.clarification_count} ${getQuestionWord(introSlide.clarification_count, 'en')}`}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={onContinue}
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium px-8"
          >
            <span>{locale === 'ru' ? 'Узнать больше' : 'Learn more'}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function getQuestionWord(count: number, locale: 'ru' | 'en'): string {
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
