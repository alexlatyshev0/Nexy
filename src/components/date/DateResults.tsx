'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Scene } from '@/lib/types';

interface DateResultsProps {
  bothYes: Scene[];
  bothMaybe: Scene[];
  partnerName: string;
}

export function DateResults({ bothYes, bothMaybe, partnerName }: DateResultsProps) {
  const getPlaceholderEmoji = (scene: Scene) => {
    const dim = scene.dimensions[0] || '';
    if (dim.includes('bondage')) return '🔗';
    if (dim.includes('blindfold')) return '🙈';
    if (dim.includes('dominance') || dim.includes('submission')) return '👑';
    if (dim.includes('pain') || dim.includes('spanking')) return '🔥';
    if (dim.includes('romantic') || dim.includes('tender')) return '💕';
    if (dim.includes('oral')) return '💋';
    if (dim.includes('roleplay')) return '🎭';
    return '✨';
  };

  if (bothYes.length === 0 && bothMaybe.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Пока нет общих ответов. Дождитесь, пока {partnerName} тоже ответит!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {bothYes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-rose-200 bg-rose-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-700">
                <span className="text-2xl">🔥</span>
                Оба хотят!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bothYes.map((scene, index) => (
                <motion.div
                  key={scene.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg"
                >
                  <span className="text-2xl">{getPlaceholderEmoji(scene)}</span>
                  <div className="flex-1">
                    <p className="text-sm line-clamp-1">{(scene.user_description?.ru || scene.ai_description?.ru || '').slice(0, 50)}...</p>
                    <div className="flex gap-1 mt-1">
                      {scene.dimensions.slice(0, 2).map((dim) => (
                        <Badge key={dim} variant="outline" className="text-xs">
                          {dim}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {bothMaybe.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <span className="text-2xl">🤔</span>
                Можно попробовать
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bothMaybe.map((scene, index) => (
                <motion.div
                  key={scene.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <span className="text-2xl">{getPlaceholderEmoji(scene)}</span>
                  <div className="flex-1">
                    <p className="text-sm line-clamp-1">{(scene.user_description?.ru || scene.ai_description?.ru || '').slice(0, 50)}...</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
