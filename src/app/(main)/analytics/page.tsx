'use client';

import { AnalyticsView } from '@/app/components/views/AnalyticsView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics | Linii',
  description: 'Track your performance and audience growth',
};

export default function AnalyticsPage() {
  return <AnalyticsView />;
}
