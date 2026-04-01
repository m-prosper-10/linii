'use client';

import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Separator } from '@/app/components/ui/separator';
import { Switch } from '@/app/components/ui/switch';
import { useApp } from '@/context/AppContext';
import {
  Bell,
  Eye,
  Lock,
  LogOut,
  Moon,
  Shield,
  Smartphone,
  Sun,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SettingsView() {
  const { theme, toggleTheme, setIsAuthenticated } = useApp();
  const router = useRouter();

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="bg-background/80 border-border sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="p-4">
          <h2 className="text-xl font-semibold">Settings</h2>
        </div>
      </div>

      <div className="space-y-6 p-4">
        {/* Appearance */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-1 font-medium">Appearance</h3>
            <p className="text-muted-foreground text-sm">
              Customize how the app looks and feels
            </p>
          </div>

          <div className="bg-accent/30 space-y-4 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                <div>
                  <Label htmlFor="theme">Dark Mode</Label>
                  <p className="text-muted-foreground text-sm">
                    Switch between light and dark themes
                  </p>
                </div>
              </div>
              <Switch
                id="theme"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Notifications */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-1 flex items-center gap-2 font-medium">
              <Bell className="h-5 w-5" />
              Notifications
            </h3>
            <p className="text-muted-foreground text-sm">
              Manage how you receive notifications
            </p>
          </div>

          <div className="bg-accent/30 space-y-4 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push">Push Notifications</Label>
              <Switch id="push" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email">Email Notifications</Label>
              <Switch id="email" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="likes">Likes</Label>
              <Switch id="likes" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="comments">Comments</Label>
              <Switch id="comments" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="follows">New Followers</Label>
              <Switch id="follows" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="mentions">Mentions</Label>
              <Switch id="mentions" defaultChecked />
            </div>
          </div>
        </div>

        <Separator />

        {/* Privacy */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-1 flex items-center gap-2 font-medium">
              <Lock className="h-5 w-5" />
              Privacy & Safety
            </h3>
            <p className="text-muted-foreground text-sm">
              Control who can see your content and interact with you
            </p>
          </div>

          <div className="bg-accent/30 space-y-4 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="private">Private Account</Label>
                <p className="text-muted-foreground text-sm">
                  Only followers can see your posts
                </p>
              </div>
              <Switch id="private" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="activity">Activity Status</Label>
                <p className="text-muted-foreground text-sm">
                  Show when you&apos;re active
                </p>
              </div>
              <Switch id="activity" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dm">Direct Messages</Label>
                <p className="text-muted-foreground text-sm">
                  Allow messages from everyone
                </p>
              </div>
              <Switch id="dm" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="tagging">Photo Tagging</Label>
                <p className="text-muted-foreground text-sm">
                  Allow others to tag you
                </p>
              </div>
              <Switch id="tagging" defaultChecked />
            </div>
          </div>
        </div>

        <Separator />

        {/* Content Preferences */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-1 flex items-center gap-2 font-medium">
              <Eye className="h-5 w-5" />
              Content Preferences
            </h3>
            <p className="text-muted-foreground text-sm">
              Customize your content feed
            </p>
          </div>

          <div className="bg-accent/30 space-y-4 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-content">Show AI-Generated Content</Label>
              <Switch id="ai-content" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sensitive">Show Sensitive Content</Label>
              <Switch id="sensitive" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="autoplay">Autoplay Videos</Label>
              <Switch id="autoplay" defaultChecked />
            </div>
          </div>
        </div>

        <Separator />

        {/* Security */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-1 flex items-center gap-2 font-medium">
              <Shield className="h-5 w-5" />
              Security
            </h3>
            <p className="text-muted-foreground text-sm">
              Manage your account security
            </p>
          </div>

          <div className="bg-accent/30 space-y-3 rounded-lg p-4">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Smartphone className="h-4 w-4" />
              Active Sessions
            </Button>
          </div>
        </div>

        <Separator />

        {/* Account Actions */}
        <div className="space-y-4">
          <div className="space-y-3">
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive w-full"
            >
              Delete Account
            </Button>
          </div>
        </div>

        <div className="text-muted-foreground pt-4 text-center text-sm">
          <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
