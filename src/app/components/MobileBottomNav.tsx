'use client';

import { cn } from '@/app/components/ui/utils';
import { Bell, Compass, Home, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/messages', icon: Mail, label: 'Messages' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="border-border bg-background/95 fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-sm md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navigationItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-6 w-6', isActive && 'fill-current')} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
