import { ForgotPasswordView } from '@/app/components/views/ForgotPasswordView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | Linii',
  description: 'Reset your Linii account password',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
