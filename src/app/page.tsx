'use client';

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
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="flex animate-pulse flex-col items-center gap-4">
        <div className="bg-primary/20 h-12 w-12 rounded-full" />
        <div className="bg-primary/10 h-4 w-32 rounded" />
      </div>
    </div>
  );
}
