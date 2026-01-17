'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DimensionCard } from './DimensionCard';

interface PreferenceMapProps {
  preferences: Record<string, unknown>;
}

interface DimensionValue {
  name: string;
  value: number;
}

function extractDimensions(obj: Record<string, unknown>, prefix = ''): DimensionValue[] {
  const dimensions: DimensionValue[] = [];

  for (const [key, val] of Object.entries(obj)) {
    const name = prefix ? `${prefix}.${key}` : key;

    if (val && typeof val === 'object') {
      if ('value' in val && typeof (val as Record<string, unknown>).value === 'number') {
        dimensions.push({
          name: key,
          value: (val as Record<string, unknown>).value as number,
        });
      } else {
        dimensions.push(...extractDimensions(val as Record<string, unknown>, name));
      }
    }
  }

  return dimensions;
}

export function PreferenceMap({ preferences }: PreferenceMapProps) {
  const dimensions = extractDimensions(preferences);

  // Sort by value descending
  const sortedDimensions = dimensions.sort((a, b) => b.value - a.value);

  // Group by interest level
  const highInterest = sortedDimensions.filter((d) => d.value >= 70);
  const mediumInterest = sortedDimensions.filter((d) => d.value >= 40 && d.value < 70);
  const lowInterest = sortedDimensions.filter((d) => d.value < 40);

  if (dimensions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Пока нет данных о предпочтениях.</p>
          <p className="text-sm mt-2">Отвечайте на вопросы в Discover, чтобы построить свой профиль.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {highInterest.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <span>Высокий интерес</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {highInterest.map((dim, index) => (
                <DimensionCard
                  key={dim.name}
                  name={dim.name}
                  value={dim.value}
                  index={index}
                />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {mediumInterest.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Средний интерес</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mediumInterest.map((dim, index) => (
                <DimensionCard
                  key={dim.name}
                  name={dim.name}
                  value={dim.value}
                  index={index}
                />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {lowInterest.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-muted-foreground">Низкий интерес</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowInterest.map((dim, index) => (
                <DimensionCard
                  key={dim.name}
                  name={dim.name}
                  value={dim.value}
                  index={index}
                />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
