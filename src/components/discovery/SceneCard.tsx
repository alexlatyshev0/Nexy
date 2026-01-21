'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Scene } from '@/lib/types';

interface SceneCardProps {
  scene: Scene;
}

// Map intensity to visual indicator
const intensityLabels = ['', 'Мягко', 'Легко', 'Средне', 'Интенсивно', 'Экстрим'];
const intensityColors = ['', 'bg-green-100', 'bg-blue-100', 'bg-yellow-100', 'bg-orange-100', 'bg-red-100'];

export function SceneCard({ scene }: SceneCardProps) {
  // Placeholder emoji based on category/tags
  const getPlaceholderEmoji = () => {
    const tag = scene.tags?.[0] || scene.category || '';
    if (tag.includes('bondage')) return '🔗';
    if (tag.includes('blindfold')) return '🙈';
    if (tag.includes('dominan') || tag.includes('submiss')) return '👑';
    if (tag.includes('pain') || tag.includes('spank') || tag.includes('impact')) return '🔥';
    if (tag.includes('romanti') || tag.includes('tender')) return '💕';
    if (tag.includes('oral')) return '💋';
    if (tag.includes('roleplay')) return '🎭';
    if (tag.includes('exhibi') || tag.includes('voyeur')) return '👀';
    if (tag.includes('group')) return '👥';
    return '✨';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Placeholder image area */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center">
            {scene.image_url && scene.image_url !== '/placeholder' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={scene.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <span className="text-6xl">{getPlaceholderEmoji()}</span>
                <p className="mt-2 text-sm text-rose-600/70 px-4 line-clamp-2">
                  {(scene.user_description?.ru || scene.ai_description?.ru || '').slice(0, 80)}...
                </p>
              </div>
            )}

            {/* Intensity badge */}
            <Badge
              className={`absolute top-2 right-2 ${intensityColors[scene.intensity]}`}
              variant="secondary"
            >
              {intensityLabels[scene.intensity]}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
