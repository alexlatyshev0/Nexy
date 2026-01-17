'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';

interface PricingCardsProps {
  onSelectPlan: (plan: 'monthly' | 'yearly') => void;
  loading?: boolean;
}

const features = [
  'Неограниченные партнёры',
  'Система предложений',
  'Безлимитный AI ассистент',
  'Детальная аналитика',
  'Приоритетные новые сцены',
  'История свиданий',
  'Экспорт данных',
];

export function PricingCards({ onSelectPlan, loading }: PricingCardsProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <div className="space-y-6">
      {/* Plan selector */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setSelectedPlan('monthly')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            selectedPlan === 'monthly'
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground'
          }`}
        >
          Месячная
        </button>
        <button
          onClick={() => setSelectedPlan('yearly')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            selectedPlan === 'yearly'
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground'
          }`}
        >
          Годовая
        </button>
      </div>

      {/* Pricing card */}
      <motion.div
        key={selectedPlan}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Premium</CardTitle>
            <CardDescription>
              Разблокируйте все возможности
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price */}
            <div className="text-center">
              <div className="text-4xl font-bold">
                {selectedPlan === 'monthly' ? '$6.99' : '$49.99'}
              </div>
              <div className="text-muted-foreground">
                {selectedPlan === 'monthly' ? 'в месяц' : 'в год'}
              </div>
              {selectedPlan === 'yearly' && (
                <Badge className="mt-2 bg-green-100 text-green-700">
                  Экономия 40%
                </Badge>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              onClick={() => onSelectPlan(selectedPlan)}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Оформить подписку
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Отмена в любое время. Безопасная оплата через Stripe.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
