'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SceneV2, Locale } from '@/lib/types';

interface CompositeSceneViewProps {
  scene: SceneV2;
  locale?: Locale;
}

// Map intensity to visual indicator
const intensityLabels: Record<number, { ru: string; en: string }> = {
  1: { ru: 'Мягко', en: 'Soft' },
  2: { ru: 'Легко', en: 'Light' },
  3: { ru: 'Средне', en: 'Medium' },
  4: { ru: 'Интенсивно', en: 'Intense' },
  5: { ru: 'Экстрим', en: 'Extreme' },
};

const intensityColors = ['', 'bg-green-100', 'bg-blue-100', 'bg-yellow-100', 'bg-orange-100', 'bg-red-100'];

export function CompositeSceneView({ scene, locale = 'ru' }: CompositeSceneViewProps) {
  const title = scene.title[locale] || scene.title.en || scene.title.ru || '';
  const subtitle = scene.subtitle?.[locale] || scene.subtitle?.en || scene.subtitle?.ru;
  const description = scene.user_description?.[locale] || scene.user_description?.en || scene.user_description?.ru || 
                      scene.ai_description?.[locale] || scene.ai_description?.en || scene.ai_description?.ru || '';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Scene image */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center overflow-hidden">
            {scene.image_url && scene.image_url !== '/placeholder' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={scene.image_url}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-8">
                <span className="text-6xl">✨</span>
                <p className="mt-2 text-sm text-rose-600/70 px-4 line-clamp-2">
                  {description.slice(0, 100)}...
                </p>
              </div>
            )}

            {/* Intensity badge */}
            {scene.intensity && (
              <Badge
                className={`absolute top-2 right-2 ${intensityColors[scene.intensity] || ''}`}
                variant="secondary"
              >
                {intensityLabels[scene.intensity]?.[locale] || intensityLabels[scene.intensity]?.en || ''}
              </Badge>
            )}

            {/* Category badge */}
            {scene.category && (
              <Badge
                className="absolute top-2 left-2"
                variant="outline"
              >
                {scene.category}
              </Badge>
            )}
          </div>

          {/* Title and subtitle */}
          <div className="p-4 space-y-2">
            <h2 className="text-xl font-semibold">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            )}
          </div>

          {/* Tags */}
          {scene.tags && scene.tags.length > 0 && (
            <div className="px-4 pb-4 flex flex-wrap gap-1">
              {scene.tags.slice(0, 5).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
