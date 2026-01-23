"use client";

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ForgotPasswordView() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <span className="text-primary-foreground font-bold text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-semibold mb-2">Reset your password</h1>
          <p className="text-muted-foreground">
            {submitted 
              ? 'Check your email for a password reset link'
              : 'Enter your email to receive a password reset link'
            }
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-accent/50"
                />
              </div>

              <Button type="submit" className="w-full">
                Send reset link
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-muted-foreground">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setSubmitted(false)}
              >
                Resend link
              </Button>
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
