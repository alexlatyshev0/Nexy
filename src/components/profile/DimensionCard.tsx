'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface DimensionCardProps {
  name: string;
  value: number;
  index: number;
}

const dimensionLabels: Record<string, string> = {
  bondage: 'Бондаж',
  blindfold: 'Повязка на глаза',
  submission: 'Подчинение',
  dominance: 'Доминирование',
  pain: 'Боль',
  spanking: 'Шлепки',
  roleplay: 'Ролевые игры',
  exhibition: 'Эксгибиционизм',
  voyeurism: 'Вуайеризм',
  oral: 'Оральный секс',
  romantic: 'Романтика',
  tender: 'Нежность',
  group: 'Групповой секс',
  trust: 'Доверие',
  anticipation: 'Предвкушение',
  sensory: 'Сенсорная игра',
};

export function DimensionCard({ name, value, index }: DimensionCardProps) {
  const label = dimensionLabels[name] || name;

  const getColorClass = () => {
    if (value >= 80) return 'bg-rose-500';
    if (value >= 60) return 'bg-orange-400';
    if (value >= 40) return 'bg-yellow-400';
    return 'bg-blue-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium capitalize">{label}</span>
            <span className="text-sm text-muted-foreground">{value}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${getColorClass()} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
