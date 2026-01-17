'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Trash2, User, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Вы уверены, что хотите удалить аккаунт? Это действие необратимо.'
    );

    if (confirmed) {
      // In production, this would call a server action to delete the user
      alert('Для удаления аккаунта обратитесь в поддержку.');
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Аккаунт
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start"
            disabled={loading}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти из аккаунта
          </Button>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Приватность
          </CardTitle>
          <CardDescription>
            Ваши данные защищены и никогда не передаются третьим лицам
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Что мы храним:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Email для авторизации</li>
              <li>Ваши ответы на вопросы</li>
              <li>Профиль предпочтений (анонимизированный)</li>
            </ul>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Партнёры видят только:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Совпадения (то, что хотите оба)</li>
              <li>То, что вы НЕ хотите (если партнёр хочет)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Опасная зона
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleDeleteAccount}
            variant="destructive"
            className="w-full"
          >
            Удалить аккаунт
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Это действие удалит все ваши данные без возможности восстановления
          </p>
        </CardContent>
      </Card>

      {/* App info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Intimate Discovery v2.0</p>
        <p>Made with care</p>
      </div>
    </div>
  );
}
