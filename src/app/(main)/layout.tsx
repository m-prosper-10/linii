'use client';

import { DiscoverySidebar } from '@/app/components/layout/DiscoverySidebar';
import { FloatingActionButton } from '@/app/components/layout/FloatingActionBar';
import { MobileBottomNav } from '@/app/components/layout/MobileBottomNav';
import { MobileHeader } from '@/app/components/layout/MobileHeader';
import { NavigationSidebar } from '@/app/components/layout/NavigationSidebar';
import { useApp } from '@/context/AppContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/app/components/ui/utils';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isSidebarCollapsed } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const showThreeColumnLayout =
    pathname &&
    ['home', 'explore', 'profile', 'post/create', 'notifications'].some(route =>
      pathname.includes(route)
    );
  const showMessagesLayout = pathname?.includes('messages');
  const hideFloatingButton =
    pathname?.includes('post/create') || pathname?.includes('edit-profile');

  return (
    <div className={cn('bg-background flex min-h-screen', showMessagesLayout && 'h-screen overflow-hidden')}>
      <div
        className={cn(
          'hidden shrink-0 transition-all duration-300 ease-in-out md:block',
          isSidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <NavigationSidebar />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex flex-1 flex-col ${showMessagesLayout ? '' : 'md:border-border md:border-r'}`}
      >
        {/* Mobile Header */}
        <MobileHeader />

        {/* Main Content */}
        <div className={cn('flex-1 md:pb-1', showMessagesLayout && 'overflow-hidden')}>{children}</div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>

      {/* Right Sidebar - Discovery (Desktop only, certain views) */}
      {showThreeColumnLayout && (
        <div className="hidden w-80 shrink-0 lg:block">
          <DiscoverySidebar />
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      {!hideFloatingButton && <FloatingActionButton />}
    </div>
  );
}
