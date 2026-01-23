"use client";

import { Moon, Sun, Bell, Lock, Eye, Shield, Smartphone, LogOut } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import { Separator } from '@/app/components/ui/separator';
import { useApp } from '@/context/AppContext';

export function SettingsView() {
  const { theme, toggleTheme, setCurrentView, setIsAuthenticated } = useApp();

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('login');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <h2 className="font-semibold text-xl">Settings</h2>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Appearance */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Appearance</h3>
            <p className="text-sm text-muted-foreground">
              Customize how the app looks and feels
            </p>
          </div>

          <div className="space-y-4 bg-accent/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                <div>
                  <Label htmlFor="theme">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
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
            <h3 className="font-medium mb-1 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </h3>
            <p className="text-sm text-muted-foreground">
              Manage how you receive notifications
            </p>
          </div>

          <div className="space-y-4 bg-accent/30 rounded-lg p-4">
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
            <h3 className="font-medium mb-1 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Privacy & Safety
            </h3>
            <p className="text-sm text-muted-foreground">
              Control who can see your content and interact with you
            </p>
          </div>

          <div className="space-y-4 bg-accent/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="private">Private Account</Label>
                <p className="text-sm text-muted-foreground">
                  Only followers can see your posts
                </p>
              </div>
              <Switch id="private" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="activity">Activity Status</Label>
                <p className="text-sm text-muted-foreground">
                  Show when you're active
                </p>
              </div>
              <Switch id="activity" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dm">Direct Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Allow messages from everyone
                </p>
              </div>
              <Switch id="dm" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="tagging">Photo Tagging</Label>
                <p className="text-sm text-muted-foreground">
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
            <h3 className="font-medium mb-1 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Content Preferences
            </h3>
            <p className="text-sm text-muted-foreground">
              Customize your content feed
            </p>
          </div>

          <div className="space-y-4 bg-accent/30 rounded-lg p-4">
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
            <h3 className="font-medium mb-1 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </h3>
            <p className="text-sm text-muted-foreground">
              Manage your account security
            </p>
          </div>

          <div className="space-y-3 bg-accent/30 rounded-lg p-4">
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
            <Button variant="outline" className="w-full text-destructive hover:text-destructive">
              Delete Account
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
