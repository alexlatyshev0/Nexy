'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateInviteCode } from '@/lib/matching';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Copy, Check, Link as LinkIcon } from 'lucide-react';

export default function InvitePage() {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function getOrCreateInvite() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check for existing pending invite
        const { data: existing } = await supabase
          .from('partnerships')
          .select('invite_code')
          .eq('inviter_id', user.id)
          .eq('status', 'pending')
          .is('partner_id', null)
          .single();

        if (existing?.invite_code) {
          setInviteCode(existing.invite_code);
        } else {
          // Create new invite
          const code = generateInviteCode();

          const { error } = await supabase.from('partnerships').insert({
            user_id: user.id,
            inviter_id: user.id,
            invite_code: code,
            status: 'pending',
          });

          if (!error) {
            setInviteCode(code);
          }
        }
      } catch (error) {
        console.error('Error getting invite:', error);
      } finally {
        setLoading(false);
      }
    }

    getOrCreateInvite();
  }, [supabase]);

  const copyToClipboard = async () => {
    if (!inviteCode) return;

    const inviteUrl = `${window.location.origin}/partners/join/${inviteCode}`;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inviteUrl = inviteCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/partners/join/${inviteCode}`
    : '';

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Пригласить партнёра</CardTitle>
          <CardDescription>
            Отправьте эту ссылку партнёру, чтобы начать сравнивать предпочтения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          ) : (
            <>
              {/* Invite code */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Код приглашения</label>
                <div className="flex gap-2">
                  <Input
                    value={inviteCode || ''}
                    readOnly
                    className="font-mono text-lg tracking-wider"
                  />
                </div>
              </div>

              {/* Full URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Ссылка</label>
                <div className="flex gap-2">
                  <Input
                    value={inviteUrl}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="icon"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Share button */}
              <Button onClick={copyToClipboard} className="w-full">
                <LinkIcon className="w-4 h-4 mr-2" />
                {copied ? 'Скопировано!' : 'Скопировать ссылку'}
              </Button>
            </>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Ссылка действительна до принятия приглашения.
            После этого ваши предпочтения будут безопасно сравнены.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
