'use client';

import { motion } from 'framer-motion';
import type { GeneratedQuestion } from '@/lib/types';

interface QuestionDisplayProps {
  question: GeneratedQuestion;
}

export function QuestionDisplay({ question }: QuestionDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-center py-4"
    >
      <p className="text-lg font-medium leading-relaxed">
        {question.question}
      </p>
    </motion.div>
  );
}
