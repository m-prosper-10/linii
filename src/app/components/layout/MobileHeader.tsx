"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/app/components/ui/sheet';
import { useApp } from '@/context/AppContext';
import { BarChart3, Menu, PenSquare, Settings } from 'lucide-react';
import Link from 'next/link';

export function MobileHeader() {
  const { currentUser } = useApp();

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-between h-14 px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">S</span>
                </div>
                Social
              </SheetTitle>
            </SheetHeader>
            <div className="mt-8 space-y-6">
              {currentUser ? (
                <div className="flex items-center gap-3 p-2">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
                    <AvatarFallback>{currentUser.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{currentUser.displayName}</div>
                    <div className="text-sm text-muted-foreground truncate">@{currentUser.username}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-2 animate-pulse">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-28" />
                    <div className="h-3 bg-muted rounded w-20" />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-3" asChild>
                  <Link href="/analytics">
                    <BarChart3 className="h-5 w-5" />
                    Analytics
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3" asChild>
                  <Link href="/settings">
                    <Settings className="h-5 w-5" />
                    Settings
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">S</span>
          </div>
          <span className="font-semibold text-lg">Social</span>
        </Link>

        <Button variant="ghost" size="sm" asChild>
          <Link href="/post/create">
            <PenSquare className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
