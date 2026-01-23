import { ProfileView } from '@/app/components/views/ProfileView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | Linii',
  description: 'Your profile on Linii',
};

export default function ProfilePage() {
  return <ProfileView />;
}
