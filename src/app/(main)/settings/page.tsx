import { SettingsView } from '@/app/components/views/SettingsView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Linii',
  description: 'Manage your Linii account settings',
};

export default function SettingsPage() {
  return <SettingsView />;
}
