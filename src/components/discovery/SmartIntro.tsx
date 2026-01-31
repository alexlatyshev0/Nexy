'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { SmartIntroData } from '@/lib/smart-intro';

interface SmartIntroProps {
  data: SmartIntroData;
  onContinue: () => void;
}

export function SmartIntro({ data, onContinue }: SmartIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-gray-900 to-black"
    >
      {/* Decorative icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mb-6"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-pink-400" />
        </div>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-white mb-2"
      >
        {data.headline}
      </motion.h1>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-400 mb-8 max-w-sm"
      >
        {data.subtext}
      </motion.p>

      {/* Top interests pills */}
      {data.topInterests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-6 max-w-md"
        >
          {data.topInterests.map((interest, index) => (
            <motion.span
              key={interest.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium
                ${interest.level === 'very'
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                  : 'bg-gray-700/50 text-gray-300 border border-gray-600/30'
                }
              `}
            >
              {interest.label}
            </motion.span>
          ))}
        </motion.div>
      )}

      {/* Personalized message */}
      {data.personalizedMessage && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-300 text-sm mb-8 max-w-sm"
        >
          {data.personalizedMessage}
        </motion.p>
      )}

      {/* Continue button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          onClick={onContinue}
          size="lg"
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium px-8"
        >
          <span>Продолжить</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
