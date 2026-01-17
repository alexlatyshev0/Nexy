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
  // For placeholder, we'll show a gradient background with emoji based on dimensions
  const getPlaceholderEmoji = () => {
    const dim = scene.dimensions[0] || '';
    if (dim.includes('bondage')) return '🔗';
    if (dim.includes('blindfold')) return '🙈';
    if (dim.includes('dominance') || dim.includes('submission')) return '👑';
    if (dim.includes('pain') || dim.includes('spanking')) return '🔥';
    if (dim.includes('romantic') || dim.includes('tender')) return '💕';
    if (dim.includes('oral')) return '💋';
    if (dim.includes('roleplay')) return '🎭';
    if (dim.includes('exhibition')) return '👀';
    if (dim.includes('group')) return '👥';
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
                  {scene.description.slice(0, 80)}...
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

          {/* Tags */}
          <div className="p-3 flex flex-wrap gap-1">
            {scene.dimensions.slice(0, 3).map((dim) => (
              <Badge key={dim} variant="outline" className="text-xs">
                {dim}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
