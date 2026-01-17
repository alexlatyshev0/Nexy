'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface TrinaryAnswerProps {
  onSubmit: (value: 'yes' | 'maybe' | 'no') => void;
  loading?: boolean;
}

export function TrinaryAnswer({ onSubmit, loading }: TrinaryAnswerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex gap-3 py-4"
    >
      <Button
        onClick={() => onSubmit('yes')}
        disabled={loading}
        className="flex-1 h-14 bg-rose-500 hover:bg-rose-600"
        size="lg"
      >
        Да
      </Button>
      <Button
        onClick={() => onSubmit('maybe')}
        disabled={loading}
        variant="outline"
        className="flex-1 h-14"
        size="lg"
      >
        Может
      </Button>
      <Button
        onClick={() => onSubmit('no')}
        disabled={loading}
        variant="secondary"
        className="flex-1 h-14"
        size="lg"
      >
        Нет
      </Button>
    </motion.div>
  );
}
