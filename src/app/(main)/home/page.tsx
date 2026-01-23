import { HomeView } from '@/app/components/views/HomeView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | Linii',
  description: 'Your personalized feed on Linii',
};

export default function HomePage() {
  return <HomeView />;
}
