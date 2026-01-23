import type { Metadata } from 'next';
import { SignupView } from '../components/views/SignupView';

export const metadata: Metadata = {
  title: 'Sign up | Linii',
  description: 'Sign up to your Linii account',
};

export default function SignupPage() {
  return <SignupView />;
}
