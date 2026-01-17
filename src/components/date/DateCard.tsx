'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, ChevronRight } from 'lucide-react';

interface DateCardProps {
  id: string;
  partnerName: string;
  mood: string | null;
  status: string;
  scheduledFor: string | null;
  index: number;
}

const moodLabels: Record<string, { label: string; emoji: string }> = {
  passionate: { label: 'Страстное', emoji: '🔥' },
  tender: { label: 'Нежное', emoji: '💕' },
  playful: { label: 'Игривое', emoji: '😏' },
  intense: { label: 'Интенсивное', emoji: '⚡' },
  surprise: { label: 'Сюрприз', emoji: '🎁' },
};

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  pending: { label: 'Ожидание', variant: 'secondary' },
  ready: { label: 'Готово', variant: 'default' },
  completed: { label: 'Завершено', variant: 'outline' },
  canceled: { label: 'Отменено', variant: 'outline' },
};

export function DateCard({ id, partnerName, mood, status, index }: DateCardProps) {
  const moodInfo = mood ? moodLabels[mood] : null;
  const statusInfo = statusLabels[status] || statusLabels.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={status === 'completed' ? `/date/${id}/results` : `/date/${id}`}>
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
              <Heart className="w-6 h-6 text-rose-500" />
            </div>

            <div className="flex-1">
              <h3 className="font-medium">Свидание с {partnerName}</h3>
              <div className="flex gap-2 mt-1">
                <Badge variant={statusInfo.variant} className="text-xs">
                  {statusInfo.label}
                </Badge>
                {moodInfo && (
                  <Badge variant="outline" className="text-xs">
                    {moodInfo.emoji} {moodInfo.label}
                  </Badge>
                )}
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
