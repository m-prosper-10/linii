import { LoginView } from '@/app/components/views/LoginView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Linii',
  description: 'Sign in to your Linii account',
};

export default function LoginPage() {
  return <LoginView />;
}
