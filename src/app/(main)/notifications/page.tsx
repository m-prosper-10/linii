import { NotificationsView } from '@/app/components/views/NotificationView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications | Linii',
  description: 'Your notifications on Linii',
};

export default function NotificationsPage() {
  return <NotificationsView />;
}
