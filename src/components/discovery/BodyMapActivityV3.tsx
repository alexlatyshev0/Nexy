'use client';

import { motion } from 'framer-motion';
import { BodyMapAnswer } from './BodyMapAnswer/BodyMapAnswer';
import type {
  Locale,
  SceneV2Extended,
  BodyGender,
  BodyMapAnswer as BodyMapAnswerType,
  BodyMapSceneConfig,
} from '@/lib/types';

interface BodyMapActivityV3Props {
  scene: SceneV2Extended;
  userGender: BodyGender;
  partnerGender: BodyGender;
  locale?: Locale;
  onSubmit: (answer: BodyMapAnswerType) => void;
  loading?: boolean;
}

/**
 * Body map activity component for V3 scene architecture.
 *
 * Used for activity-specific body mapping questions like:
 * - "Where do you like being spanked?"
 * - "Where do you like being kissed?"
 *
 * Wraps the existing BodyMapAnswer component with activity-specific configuration.
 */
export function BodyMapActivityV3({
  scene,
  userGender,
  partnerGender,
  locale = 'ru',
  onSubmit,
  loading = false,
}: BodyMapActivityV3Props) {
  const config = scene.body_map_activity_config;
  const title = scene.title[locale] || scene.title.ru;

  if (!config) {
    console.error('[BodyMapActivityV3] No body_map_activity_config provided');
    return null;
  }

  // Build BodyMapSceneConfig from activity config
  const bodyMapConfig: BodyMapSceneConfig = {
    action: config.activity as BodyMapSceneConfig['action'],
    passes: [
      {
        subject: 'receive',
        question: config.question,
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black"
    >
      {/* Header */}
      <div className="px-4 py-4 text-center border-b border-gray-800">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-semibold text-white"
        >
          {title}
        </motion.h1>
      </div>

      {/* Body map */}
      <div className="flex-1">
        <BodyMapAnswer
          config={bodyMapConfig}
          userGender={userGender}
          partnerGender={partnerGender}
          locale={locale}
          onSubmit={onSubmit}
          loading={loading}
          zoneFirstMode={true}
          mainQuestion={config.question}
        />
      </div>
    </motion.div>
  );
}
