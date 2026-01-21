'use client';

import { useMemo } from 'react';
import type { BodyView, BodyGender, ZonePreference, Locale } from '@/lib/types';
import type { MarkerData } from './BodySilhouette';
import { detectZone } from './zone-detection';
import { PREFERENCE_COLORS } from './body-zones';

interface DebugPanelProps {
  markers: MarkerData[];
  gender: BodyGender;
  view: BodyView;
  locale?: Locale;
}

const PREFERENCE_LABELS: Record<ZonePreference, { ru: string; en: string }> = {
  love: { ru: 'Обожаю', en: 'Love it' },
  sometimes: { ru: 'Иногда', en: 'Sometimes' },
  no: { ru: 'Не хочу', en: 'No' },
};

export function DebugPanel({ markers, gender, view, locale = 'ru' }: DebugPanelProps) {
  const detectedZones = useMemo(() => {
    return markers
      .filter((m) => m.view === view)
      .map((marker) => {
        const zone = detectZone(marker.x, marker.y, gender, view);
        return {
          marker,
          zone,
        };
      });
  }, [markers, gender, view]);

  // Group by preference and deduplicate with count
  const grouped = useMemo(() => {
    const result: Record<ZonePreference, Array<{ name: string; count: number; confidence: string }>> = {
      love: [],
      sometimes: [],
      no: [],
    };

    detectedZones.forEach(({ marker, zone }) => {
      if (zone) {
        const name = locale === 'ru' ? zone.name.ru : zone.name.en;
        const confidenceLabel =
          zone.confidence === 'high' ? '✓' : zone.confidence === 'medium' ? '~' : '?';

        // Find existing entry with same name
        const existing = result[marker.color].find((z) => z.name === name);
        if (existing) {
          existing.count++;
          // Keep best confidence
          if (zone.confidence === 'high') existing.confidence = '✓';
          else if (zone.confidence === 'medium' && existing.confidence === '?') existing.confidence = '~';
        } else {
          result[marker.color].push({ name, count: 1, confidence: confidenceLabel });
        }
      }
    });

    return result;
  }, [detectedZones, locale]);

  if (markers.filter((m) => m.view === view).length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-muted/50 rounded-lg border text-sm">
      <div className="font-medium mb-2 text-xs uppercase tracking-wider text-muted-foreground">
        {locale === 'ru' ? 'AI определил:' : 'AI detected:'}
      </div>
      <div className="space-y-2">
        {(['love', 'sometimes', 'no'] as ZonePreference[]).map((pref) => {
          if (grouped[pref].length === 0) return null;
          return (
            <div key={pref} className="flex items-start gap-2">
              <div
                className="w-4 h-4 rounded-full border shrink-0 mt-0.5"
                style={{
                  backgroundColor: PREFERENCE_COLORS[pref].fill,
                  borderColor: PREFERENCE_COLORS[pref].stroke,
                }}
              />
              <div>
                <span className="font-medium">{PREFERENCE_LABELS[pref][locale]}:</span>{' '}
                <span className="text-muted-foreground">
                  {grouped[pref]
                    .map((z) => `${z.name}${z.count > 1 ? ` (${z.count})` : ''} ${z.confidence}`)
                    .join(', ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {locale === 'ru'
          ? '✓ = точно, ~ = вероятно, ? = неуверен'
          : '✓ = certain, ~ = likely, ? = uncertain'}
      </div>

      {/* Raw coordinates for debugging */}
      <details className="mt-2">
        <summary className="text-xs text-muted-foreground cursor-pointer">
          {locale === 'ru' ? 'Координаты' : 'Coordinates'}
        </summary>
        <div className="mt-1 text-xs font-mono bg-black/10 p-2 rounded">
          {detectedZones.map(({ marker, zone }) => (
            <div key={marker.id}>
              ({marker.x.toFixed(1)}, {marker.y.toFixed(1)}) → {zone?.name[locale] || '?'}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
