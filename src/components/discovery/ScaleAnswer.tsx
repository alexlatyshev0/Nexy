'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface ScaleAnswerProps {
  labels: { min: string; max: string };
  onSubmit: (value: number) => void;
  loading?: boolean;
}

export function ScaleAnswer({ labels, onSubmit, loading }: ScaleAnswerProps) {
  const [value, setValue] = useState(50);

  const getValueColor = () => {
    if (value < 30) return 'text-blue-500';
    if (value < 70) return 'text-yellow-500';
    return 'text-rose-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-6 py-4"
    >
      {/* Value display */}
      <div className="text-center">
        <span className={`text-4xl font-bold ${getValueColor()}`}>
          {value}%
        </span>
      </div>

      {/* Slider */}
      <div className="px-2">
        <Slider
          value={[value]}
          onValueChange={(vals) => setValue(vals[0])}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-sm text-muted-foreground px-2">
        <span>{labels.min}</span>
        <span>{labels.max}</span>
      </div>

      {/* Submit button */}
      <Button
        onClick={() => onSubmit(value)}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? 'Сохранение...' : 'Сохранить'}
      </Button>
    </motion.div>
  );
}
