import React, { createContext, useContext, useState, ReactNode } from 'react';
import { currentUser } from '@/data/mockData';
import type { User } from '@/data/mockData';

export type View = 
  | 'login' 
  | 'signup' 
  | 'forgot-password' 
  | 'home' 
  | 'explore' 
  | 'messages' 
  | 'notifications' 
  | 'profile' 
  | 'settings' 
  | 'analytics'
  | 'post-creation'
  | 'edit-profile';

interface AppContextType {
  currentView: View;
  setCurrentView: (view: View) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  currentUser: User;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<View>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        theme,
        toggleTheme,
        selectedUserId,
        setSelectedUserId
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}