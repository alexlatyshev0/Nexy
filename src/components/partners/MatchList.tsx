'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MatchResult } from '@/lib/types';

interface MatchListProps {
  matches: MatchResult[];
  partnerName?: string;
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

export function MatchList({ matches, partnerName = 'Партнёр' }: MatchListProps) {
  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Пока нет совпадений.</p>
          <p className="text-sm mt-2">
            Отвечайте на вопросы, чтобы найти общие интересы.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match, index) => {
        const label = dimensionLabels[match.dimension] || match.dimension;

        return (
          <motion.div
            key={match.dimension}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    <span className="font-medium capitalize">{label}</span>
                  </div>
                  <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                    Совпадение!
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Ты</div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${match.myValue}%` }}
                      />
                    </div>
                    <div className="text-xs text-right mt-1">{match.myValue}%</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {partnerName}
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-400 rounded-full"
                        style={{ width: `${match.partnerValue}%` }}
                      />
                    </div>
                    <div className="text-xs text-right mt-1">{match.partnerValue}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
