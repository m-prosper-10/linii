"use client";

import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
  const { isAuthenticated } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20" />
        <div className="h-4 w-32 bg-primary/10 rounded" />
      </div>
    </div>
  );
}