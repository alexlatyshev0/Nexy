'use client';

import { useState } from 'react';
import { BodyMapAnswer } from '@/components/discovery/BodyMapAnswer';
import type { BodyMapSceneConfig, BodyMapAnswer as BodyMapAnswerType } from '@/lib/types';

const TEST_CONFIG: BodyMapSceneConfig = {
  action: 'kiss',
  passes: [
    {
      subject: 'give',
      question: {
        ru: 'Куда ты любишь целовать партнёра?',
        en: 'Where do you like to kiss your partner?',
      },
    },
    {
      subject: 'receive',
      question: {
        ru: 'Куда тебе нравится, когда тебя целуют?',
        en: 'Where do you like being kissed?',
      },
    },
  ],
};

export default function TestBodyMapPage() {
  const [result, setResult] = useState<BodyMapAnswerType | null>(null);
  const [partnerGender, setPartnerGender] = useState<'male' | 'female'>('female');
  const [userGender, setUserGender] = useState<'male' | 'female'>('male');

  const handleSubmit = (answer: BodyMapAnswerType) => {
    setResult(answer);
    console.log('Body map answer:', JSON.stringify(answer, null, 2));
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Body Map Test</h1>

      {/* Gender selectors */}
      <div className="flex justify-center gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Partner</label>
          <select
            value={partnerGender}
            onChange={(e) => setPartnerGender(e.target.value as 'male' | 'female')}
            className="border rounded px-3 py-1"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">User</label>
          <select
            value={userGender}
            onChange={(e) => setUserGender(e.target.value as 'male' | 'female')}
            className="border rounded px-3 py-1"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      {/* Body map component */}
      {!result ? (
        <BodyMapAnswer
          config={TEST_CONFIG}
          partnerGender={partnerGender}
          userGender={userGender}
          onSubmit={handleSubmit}
          loading={false}
          locale="ru"
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-green-100 border border-green-300 rounded p-4">
            <h2 className="font-bold text-green-800 mb-2">Ответ сохранён!</h2>
            <pre className="text-xs overflow-auto max-h-[300px]">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
          <button
            onClick={() => setResult(null)}
            className="w-full py-2 bg-primary text-primary-foreground rounded"
          >
            Попробовать снова
          </button>
        </div>
      )}
    </div>
  );
}
