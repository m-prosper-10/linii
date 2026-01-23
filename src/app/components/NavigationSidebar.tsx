"use client";

import { Home, Compass, Mail, Bell, User, Settings, BarChart3, PenSquare } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { useApp, type View } from '@/context/AppContext';

type NavView = Extract<View, 'home' | 'explore' | 'messages' | 'notifications' | 'profile' | 'settings' | 'analytics'>;

const navigationItems: { view: NavView; icon: typeof Home; label: string }[] = [
  { view: 'home', icon: Home, label: 'Home' },
  { view: 'explore', icon: Compass, label: 'Explore' },
  { view: 'messages', icon: Mail, label: 'Messages' },
  { view: 'notifications', icon: Bell, label: 'Notifications' },
  { view: 'profile', icon: User, label: 'Profile' },
  { view: 'analytics', icon: BarChart3, label: 'Analytics' },
  { view: 'settings', icon: Settings, label: 'Settings' },
];

export function NavigationSidebar() {
  const { currentView, setCurrentView, currentUser } = useApp();

  return (
    <div className="sticky top-0 h-screen flex flex-col border-r border-border p-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 px-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">S</span>
          </div>
          <span className="font-semibold text-lg">Social</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          
          return (
            <Button
              key={item.view}
              variant={isActive ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-3 px-3"
              onClick={() => setCurrentView(item.view)}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </nav>

      <Button 
        className="w-full mb-4 gap-2"
        onClick={() => setCurrentView('post-creation')}
      >
        <PenSquare className="h-5 w-5" />
        Post
      </Button>

      <div className="pt-4 border-t border-border">
        <div 
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
          onClick={() => setCurrentView('profile')}
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
            <AvatarFallback>{currentUser.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{currentUser.displayName}</div>
            <div className="text-sm text-muted-foreground truncate">@{currentUser.username}</div>
          </div>
        </div>
      </div>
    </div>
  );
}