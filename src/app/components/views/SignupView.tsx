'use client';

import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Separator } from '@/app/components/ui/separator';
import { useApp } from '@/context/AppContext';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignupView() {
  const { register } = useApp();
  const router = useRouter();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    username: '',
    password: '',
    agreedToTerms: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
      });
      router.push('/home');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="mb-2 text-3xl font-semibold">Create your account</h1>
          <p className="text-muted-foreground">Join the conversation today</p>
        </div>

        <div className="bg-card border-border space-y-6 rounded-xl border p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg p-3 text-sm">
                <span className="flex-1">{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Alex Morgan"
                value={formData.displayName}
                onChange={e =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                required
                disabled={isLoading}
                className="bg-accent/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={isLoading}
                className="bg-accent/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="alexmorgan"
                value={formData.username}
                onChange={e =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                disabled={isLoading}
                className="bg-accent/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={e =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                disabled={isLoading}
                className="bg-accent/50"
              />
              <p className="text-muted-foreground text-xs">
                Must be at least 8 characters
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreedToTerms}
                onCheckedChange={checked =>
                  setFormData({
                    ...formData,
                    agreedToTerms: checked as boolean,
                  })
                }
                disabled={isLoading}
                required
              />
              <label
                htmlFor="terms"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{' '}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <div className="relative">
            <Separator />
            <span className="bg-card text-muted-foreground absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-sm">
              Or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="gap-2">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            <Button variant="outline" className="gap-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Apple
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{' '}
            </span>
            <button
              onClick={() => router.push('/login')}
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
