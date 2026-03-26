'use client';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ForgotPasswordView() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="bg-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
            <span className="text-primary-foreground text-2xl font-bold">
              S
            </span>
          </div>
          <h1 className="mb-2 text-3xl font-semibold">Reset your password</h1>
          <p className="text-muted-foreground">
            {submitted
              ? 'Check your email for a password reset link'
              : 'Enter your email to receive a password reset link'}
          </p>
        </div>

        <div className="bg-card border-border space-y-6 rounded-xl border p-8">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="bg-accent/50"
                />
              </div>
              {!isSubmitting ? (
                <Button type="submit" className="w-full">
                  Send reset link
                </Button>
              ) : (
                <Button type="submit" className="w-full" disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </Button>
              )}
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
              {!isSubmitting ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSubmitted(false)}
                >
                  Resend link
                </Button>
              ) : (
                <Button type="submit" className="w-full" disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </Button>
              )}
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full gap-2"
            onClick={() => router.push('/login')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
