"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { useApp } from '@/context/AppContext';
import { BarChart3, Bell, Compass, Home, Mail, PenSquare, Settings, User, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/app/components/ui/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';

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
  const { currentUser, isSidebarCollapsed, setIsSidebarCollapsed } = useApp();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith('/messages')) {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  }, [pathname, setIsSidebarCollapsed]);

  const toggleCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn(
        "sticky top-0 h-screen flex flex-col border-r border-border p-4 transition-all duration-300 ease-in-out group",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}>
        <div className="mb-8 flex items-center justify-between">
          <Link href="/home" className={cn(
            "flex items-center gap-2 px-1 transition-all duration-300",
            isSidebarCollapsed && "justify-center w-full"
          )}>
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 border border-primary/20">
              <span className="text-xl font-black">L</span>
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold text-xl tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Linii
              </span>
            )}
          </Link>
          {!isSidebarCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleCollapse}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {isSidebarCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleCollapse}
              className="absolute -right-4 top-10 h-8 w-8 bg-background border border-border rounded-full shadow-md z-50 text-muted-foreground hover:text-foreground hover:scale-110 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);
            
            const content = (
              <Button
                key={item.href}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start gap-4 h-10 rounded-lg px-3 font-medium transition-all duration-200",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/20 font-semibold",
                  isSidebarCollapsed && "justify-center px-0"
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className={cn("h-6 w-6 shrink-0", isActive && "text-primary")} />
                  {!isSidebarCollapsed && <span className="text-base">{item.label}</span>}
                </Link>
              </Button>
            );

            if (isSidebarCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    {content}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-semibold px-4 py-2 bg-primary text-primary-foreground">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return content;
          })}
        </nav>

        <div className="mt-auto space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                className={cn(
                  "w-full h-12 rounded-xl font-semibold transition-all",
                  isSidebarCollapsed ? "px-0" : "gap-3"
                )}
                asChild
              >
                <Link href="/post/create">
                  <PenSquare className="h-6 w-6" />
                  {!isSidebarCollapsed && <span>Post content</span>}
                </Link>
              </Button>
            </TooltipTrigger>
            {isSidebarCollapsed && (
              <TooltipContent side="right" className="font-semibold bg-primary text-primary-foreground border-none">
                Post content
              </TooltipContent>
            )}
          </Tooltip>

          <div className={cn(
            "pt-6 border-t border-border/50",
            isSidebarCollapsed && "flex justify-center"
          )}>
            {currentUser ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link 
                    href="/profile"
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-xl hover:bg-accent/50 group transition-all duration-300",
                      isSidebarCollapsed && "p-0"
                    )}
                  >
                    <Avatar className={cn(
                      "h-12 w-12 border-2 border-transparent group-hover:border-primary/20 transition-all",
                      isSidebarCollapsed && "h-14 w-14"
                    )}>
                      <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {currentUser.displayName?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {!isSidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate text-sm">{currentUser.displayName}</div>
                        <div className="text-xs text-muted-foreground truncate font-medium">@{currentUser.username}</div>
                      </div>
                    )}
                  </Link>
                </TooltipTrigger>
                {isSidebarCollapsed && (
                  <TooltipContent side="right" className="p-3 bg-primary text-primary-foreground border-none">
                    <div className="font-semibold text-md">{currentUser.displayName}</div>
                    <div className="text-sm text-muted-foreground">@{currentUser.username}</div>
                  </TooltipContent>
                )}
              </Tooltip>
            ) : (
              <div className="flex items-center gap-3 p-2 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-full" />
                {!isSidebarCollapsed && (
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-28" />
                    <div className="h-3 bg-muted rounded w-20" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}