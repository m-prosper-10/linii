import { Menu, PenSquare, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/app/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { useApp } from '@/context/AppContext';

export function MobileHeader() {
  const { currentUser, setCurrentView } = useApp();

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

              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => setCurrentView('analytics')}
                >
                  <BarChart3 className="h-5 w-5" />
                  Analytics
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => setCurrentView('settings')}
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">S</span>
          </div>
          <span className="font-semibold text-lg">Social</span>
        </div>

        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentView('post-creation')}
        >
          <PenSquare className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
