'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Visual onboarding has been integrated into /discover.
 * This page now redirects to /discover which handles the onboarding flow
 * automatically if visual_onboarding_completed is false.
 */
export default function VisualOnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/discover');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-muted-foreground">Redirecting...</div>
    </div>
  );
}
