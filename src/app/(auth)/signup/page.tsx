import { SignupView } from '@/app/components/views/SignupView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | Linii',
  description: 'Create your Linii account',
};

export default function SignupPage() {
  return <SignupView />;
}
