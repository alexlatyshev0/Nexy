'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Crown, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  rightContent?: React.ReactNode;
}

export function Header({ title, showBack, backHref, rightContent }: HeaderProps) {
  const pathname = usePathname();

  // Determine title from pathname if not provided
  const getTitle = () => {
    if (title) return title;
    if (pathname.startsWith('/discover')) return 'Discover';
    if (pathname.startsWith('/partners')) return 'Partners';
    if (pathname.startsWith('/date')) return 'Date';
    if (pathname.startsWith('/chat')) return 'Chat';
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/settings')) return 'Settings';
    if (pathname.startsWith('/premium')) return 'Premium';
    return 'Intimate Discovery';
  };

  return (
    <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b z-40">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button variant="ghost" size="icon" asChild>
              <Link href={backHref || '/'}>
                <ChevronLeft className="w-5 h-5" />
              </Link>
            </Button>
          )}
          <h1 className="font-semibold text-lg">{getTitle()}</h1>
        </div>

        <div className="flex items-center gap-2">
          {rightContent}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/premium">
              <Crown className="w-5 h-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <Settings className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
