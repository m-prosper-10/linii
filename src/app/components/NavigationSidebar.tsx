"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { useApp } from '@/context/AppContext';
import { BarChart3, Bell, Compass, Home, Mail, PenSquare, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/messages', icon: Mail, label: 'Messages' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function NavigationSidebar() {
  const { currentUser } = useApp();
  const pathname = usePathname();

  return (
    <div className="sticky top-0 h-screen flex flex-col border-r border-border p-4">
      <div className="mb-8">
        <Link href="/home" className="flex items-center gap-2 px-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">S</span>
          </div>
          <span className="font-semibold text-lg">Social</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);
          
          return (
            <Button
              key={item.href}
              variant={isActive ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-3 px-3"
              asChild
            >
              <Link href={item.href}>
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      <Button 
        className="w-full mb-4 gap-2"
        asChild
      >
        <Link href="/post/create">
          <PenSquare className="h-5 w-5" />
          Post
        </Link>
      </Button>

      <div className="pt-4 border-t border-border">
        {currentUser ? (
          <Link 
            href="/profile"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
          >
            <Avatar className="w-12 h-12">
              <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
              <AvatarFallback>{currentUser.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{currentUser.displayName}</div>
              <div className="text-sm text-muted-foreground truncate">@{currentUser.username}</div>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3 p-2 animate-pulse">
            <div className="w-12 h-12 bg-muted rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-28" />
              <div className="h-3 bg-muted rounded w-20" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}