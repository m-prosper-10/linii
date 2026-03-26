"use client";

import { DiscoverySidebar } from '@/app/components/DiscoverySidebar';
import { FloatingActionButton } from '@/app/components/FloatingActionBar';
import { MobileBottomNav } from '@/app/components/MobileBottomNav';
import { MobileHeader } from '@/app/components/MobileHeader';
import { NavigationSidebar } from '@/app/components/NavigationSidebar';
import { useApp } from '@/context/AppContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useApp();
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

  // Determine if we should show the three-column layout
  const showThreeColumnLayout = pathname && ['home', 'explore', 'profile'].some(route => pathname.includes(route));
  const showMessagesLayout = pathname?.includes('messages');
  const hideFloatingButton = pathname?.includes('post/create') || pathname?.includes('edit-profile');

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar - Navigation (Desktop only) */}
      <div className="w-64 shrink-0 hidden md:block">
        <NavigationSidebar />
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 border flex flex-col ${showMessagesLayout ? '' : 'md:border-r md:border-border'}`}>
        {/* Mobile Header */}
        <MobileHeader />
        
        {/* Main Content */}
        <div className="flex-1 pb-8 md:pb-8">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>

      {/* Right Sidebar - Discovery (Desktop only, certain views) */}
      {showThreeColumnLayout && (
        <div className="w-80 shrink-0 hidden lg:block">
          <DiscoverySidebar />
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      {!hideFloatingButton && <FloatingActionButton />}
    </div>
  );
}
