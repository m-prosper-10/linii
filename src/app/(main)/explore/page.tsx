import { ExploreView } from '@/app/components/views/ExploreView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore | Linii',
  description: 'Discover trending topics and new content',
};

export default function ExplorePage() {
  return <ExploreView />;
}
