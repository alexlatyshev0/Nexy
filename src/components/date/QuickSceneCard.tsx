'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Scene } from '@/lib/types';

interface QuickSceneCardProps {
  scene: Scene;
  onAnswer: (answer: 'yes' | 'maybe' | 'no') => void;
  loading?: boolean;
}

export function QuickSceneCard({ scene, onAnswer, loading }: QuickSceneCardProps) {
  const getPlaceholderEmoji = () => {
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-4"
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="aspect-[4/3] bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center">
            {scene.image_url && scene.image_url !== '/placeholder' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={scene.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <span className="text-6xl">{getPlaceholderEmoji()}</span>
                <p className="mt-3 text-sm text-rose-600/70 line-clamp-2">
                  {(scene.user_description?.ru || scene.ai_description?.ru || '').slice(0, 100)}...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-lg font-medium text-center">
        Хочешь такое сегодня?
      </p>

      <div className="flex gap-3">
        <Button
          onClick={() => onAnswer('yes')}
          disabled={loading}
          className="flex-1 h-14 bg-rose-500 hover:bg-rose-600 text-lg"
        >
          Да 🔥
        </Button>
        <Button
          onClick={() => onAnswer('maybe')}
          disabled={loading}
          variant="outline"
          className="flex-1 h-14 text-lg"
        >
          Может
        </Button>
        <Button
          onClick={() => onAnswer('no')}
          disabled={loading}
          variant="secondary"
          className="flex-1 h-14 text-lg"
        >
          Нет
        </Button>
      </div>
    </motion.div>
  );
}
