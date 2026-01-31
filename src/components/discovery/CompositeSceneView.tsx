'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import type { SceneV2, Locale } from '@/lib/types';

interface CompositeSceneViewProps {
  scene: SceneV2;
  locale?: Locale;
}

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
          {/* Scene image carousel */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-rose-200 to-pink-300 overflow-hidden">
            <ImageCarousel
              mainImage={scene.image_url}
              variants={scene.image_variants}
              alt={title}
              className="w-full h-full"
              autoRotateInterval={5000}
              dotsPosition="bottom"
              placeholder={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <span className="text-6xl">✨</span>
                    <p className="mt-2 text-sm text-rose-600/70 px-4 line-clamp-2">
                      {description.slice(0, 100)}...
                    </p>
                  </div>
                </div>
              }
            />
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

        </CardContent>
      </Card>
    </motion.div>
  );
}
