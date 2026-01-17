'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Gender = 'male' | 'female' | 'other';
type InterestedIn = 'male' | 'female' | 'both';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<Gender | null>(null);
  const [interestedIn, setInterestedIn] = useState<InterestedIn | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleGenderSelect = (selected: Gender) => {
    setGender(selected);
    setStep(2);
  };

  const handleInterestedInSelect = async (selected: InterestedIn) => {
    setInterestedIn(selected);
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Пользователь не авторизован');
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          gender,
          interested_in: selected,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.push('/discover');
    } catch {
      setError('Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = [
    { value: 'male' as Gender, label: 'Мужчина', emoji: '👨' },
    { value: 'female' as Gender, label: 'Женщина', emoji: '👩' },
    { value: 'other' as Gender, label: 'Другое', emoji: '🌈' },
  ];

  const interestedOptions = [
    { value: 'male' as InterestedIn, label: 'Мужчины', emoji: '👨' },
    { value: 'female' as InterestedIn, label: 'Женщины', emoji: '👩' },
    { value: 'both' as InterestedIn, label: 'Оба', emoji: '💕' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Intimate Discovery</CardTitle>
          <CardDescription>
            {step === 1 ? 'Расскажите немного о себе' : 'Кто вас привлекает?'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <p className="text-center text-muted-foreground mb-4">Я:</p>
                {genderOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={gender === option.value ? 'default' : 'outline'}
                    className="w-full h-14 text-lg justify-start gap-3"
                    onClick={() => handleGenderSelect(option.value)}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    {option.label}
                  </Button>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <p className="text-center text-muted-foreground mb-4">Меня привлекают:</p>
                {interestedOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={interestedIn === option.value ? 'default' : 'outline'}
                    className="w-full h-14 text-lg justify-start gap-3"
                    onClick={() => handleInterestedInSelect(option.value)}
                    disabled={loading}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    {option.label}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="w-full mt-4"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Назад
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading && (
            <div className="text-center mt-4 text-muted-foreground">
              Сохранение...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
