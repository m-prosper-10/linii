import { MessagesView } from '@/app/components/views/MessagesView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Messages | Linii',
  description: 'Your conversations on Linii',
};

export default function MessagesPage() {
  return <MessagesView />;
}
