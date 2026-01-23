"use client";

import { useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Toaster } from '@/app/components/ui/sonner';

// Authentication Views
import { LoginView } from '@/app/components/views/LoginView';
import { SignupView } from '@/app/components/views/SignupView';
import { ForgotPasswordView } from '@/app/components/views/ForgotPasswordView';

// Main Views
import { HomeView } from '@/app/components/views/HomeView';
import { ExploreView } from '@/app/components/views/ExploreView';
import { MessagesView } from '@/app/components/views/MessagesView';
import { NotificationsView } from '@/app/components/views/NotificationView';
import { ProfileView } from '@/app/components/views/ProfileView';
import { SettingsView } from '@/app/components/views/SettingsView';
import { AnalyticsView } from '@/app/components/views/AnalyticsView';
import { PostCreationView } from '@/app/components/views/PostCreationView';
import { EditProfileView } from '@/app/components/views/EditProfileView';

// Layout Components
import { NavigationSidebar } from '@/app/components/NavigationSidebar';
import { DiscoverySidebar } from '@/app/components/DiscoverySidebar';
import { MobileBottomNav } from '@/app/components/MobileBottomNav';
import { MobileHeader } from '@/app/components/MobileHeader';
import { FloatingActionButton } from '@/app/components/FloatingActionBar';

function AppContent() {
  const { currentView, isAuthenticated, theme } = useApp();

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Render authentication views
  if (!isAuthenticated) {
    switch (currentView) {
      case 'login':
        return <LoginView />;
      case 'signup':
        return <SignupView />;
      case 'forgot-password':
        return <ForgotPasswordView />;
      default:
        return <LoginView />;
    }
  }

  // Determine if we should show the three-column layout
  const showThreeColumnLayout = ['home', 'explore', 'profile'].includes(currentView);
  const showMessagesLayout = currentView === 'messages';

  // Render main authenticated views
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'explore':
        return <ExploreView />;
      case 'messages':
        return <MessagesView />;
      case 'notifications':
        return <NotificationsView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'post-creation':
        return <PostCreationView />;
      case 'edit-profile':
        return <EditProfileView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar - Navigation (Desktop only) */}
      <div className="w-64 flex-shrink-0 hidden md:block">
        <NavigationSidebar />
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${showMessagesLayout ? '' : 'md:border-r md:border-border'}`}>
        {/* Mobile Header (authenticated only) */}
        {isAuthenticated && <MobileHeader />}
        
        {/* Main Content */}
        <div className="flex-1 pb-16 md:pb-0">
          {renderView()}
        </div>

        {/* Mobile Bottom Navigation (authenticated only) */}
        {isAuthenticated && <MobileBottomNav />}
      </div>

      {/* Right Sidebar - Discovery (Desktop only, certain views) */}
      {showThreeColumnLayout && (
        <div className="w-80 flex-shrink-0 hidden lg:block">
          <DiscoverySidebar />
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      {isAuthenticated && currentView !== 'post-creation' && currentView !== 'edit-profile' && <FloatingActionButton />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster position="bottom-right" />
    </AppProvider>
  );
}