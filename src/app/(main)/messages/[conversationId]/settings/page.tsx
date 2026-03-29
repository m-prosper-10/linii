import { ConversationSettingsView } from '@/app/components/views/ConversationSettingsView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat Settings | Linii',
};

export default function ConversationSettingsPage() {
  return <ConversationSettingsView />;
}
