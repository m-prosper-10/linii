"use client";

import { ProfileView } from '@/app/components/views/ProfileView';
import { useApp } from '@/context/AppContext';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function UserProfilePage() {
  const params = useParams();
  const { setSelectedUserId } = useApp();
  const userId = params.userId as string;

  useEffect(() => {
    if (userId) {
      setSelectedUserId(userId);
    }
    return () => setSelectedUserId(null);
  }, [userId, setSelectedUserId]);

  return <ProfileView />;
}
