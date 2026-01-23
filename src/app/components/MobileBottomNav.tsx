import { Home, Compass, Mail, Bell, User } from 'lucide-react';
import { useApp, type View } from '@/context/AppContext';
import { cn } from '@/app/components/ui/utils';

type NavView = Extract<View, 'home' | 'explore' | 'messages' | 'notifications' | 'profile'>;

const navigationItems: { view: NavView; icon: typeof Home; label: string }[] = [
  { view: 'home', icon: Home, label: 'Home' },
  { view: 'explore', icon: Compass, label: 'Explore' },
  { view: 'messages', icon: Mail, label: 'Messages' },
  { view: 'notifications', icon: Bell, label: 'Notifications' },
  { view: 'profile', icon: User, label: 'Profile' },
];

export function MobileBottomNav() {
  const { currentView, setCurrentView } = useApp();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          
          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-6 w-6', isActive && 'fill-current')} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}