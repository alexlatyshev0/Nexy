'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const moods = [
  { id: 'passionate', label: 'Страстное', emoji: '🔥', description: 'Горячая и интенсивная ночь' },
  { id: 'tender', label: 'Нежное', emoji: '💕', description: 'Романтика и близость' },
  { id: 'playful', label: 'Игривое', emoji: '😏', description: 'Эксперименты и веселье' },
  { id: 'intense', label: 'Интенсивное', emoji: '⚡', description: 'Глубокие переживания' },
  { id: 'surprise', label: 'Сюрприз', emoji: '🎁', description: 'Пусть приложение решит' },
];

export default function NewDatePage({ params }: { params: Promise<{ partnerId: string }> }) {
  const { partnerId } = use(params);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async () => {
    if (!selectedMood) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: newDate, error } = await supabase
        .from('dates')
        .insert({
          partnership_id: partnerId,
          initiator_id: user.id,
          mood: selectedMood,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating date:', error);
        return;
      }

      router.push(`/date/${newDate.id}`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Новое свидание</CardTitle>
          <CardDescription>
            Выберите настроение для вечера. Оба партнёра ответят на несколько
            быстрых вопросов, и вы увидите общие желания.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  selectedMood === mood.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{mood.emoji}</span>
                  <div>
                    <h3 className="font-medium">{mood.label}</h3>
                    <p className="text-sm text-muted-foreground">{mood.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Button
            onClick={handleCreate}
            disabled={!selectedMood || loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Создать свидание
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
