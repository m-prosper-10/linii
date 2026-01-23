import { EditProfileView } from '@/app/components/views/EditProfileView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Profile | Linii',
  description: 'Edit your Linii profile',
};

export default function EditProfilePage() {
  return <EditProfileView />;
}
