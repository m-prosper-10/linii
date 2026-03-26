"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { useApp } from '@/context/AppContext';
import { authService } from '@/services/auth';
import AIService from '@/services/ai';
import { toast } from 'sonner';

export function EditProfileView() {
  const { currentUser, loading, setCurrentUser, setCurrentView } = useApp();
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    website: '',
    location: '',
    avatar: '',
    coverImage: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName,
        username: currentUser.username,
        bio: currentUser.bio,
        website: currentUser.website || '',
        location: currentUser.location || '',
        avatar: currentUser.avatar,
        coverImage: currentUser.coverImage,
      });
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    // router.push('/login'); // We don't have router here, using window.location or just return null
    return null;
  }

  const handleAiBioSuggest = async () => {
    setIsAiLoading(true);
    try {
      const suggestion = await AIService.suggestBio(
        formData.displayName,
        formData.username,
        formData.bio
      );
      setFormData(prev => ({ ...prev, bio: suggestion }));
      toast.success("Bio updated by AI!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to generate bio";
      toast.error(message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (field: 'avatar' | 'coverImage', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (field === 'avatar') {
          setAvatarPreview(result);
          setFormData(prev => ({ ...prev, avatar: result }));
        } else {
          setCoverPreview(result);
          setFormData(prev => ({ ...prev, coverImage: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedUser = await authService.updateProfile({
        displayName: formData.displayName,
        bio: formData.bio,
        website: formData.website,
        location: formData.location,
        avatar: formData.avatar,
        coverImage: formData.coverImage
      });
      setCurrentUser(updatedUser);
      toast.success("Profile updated successfully!");
      setCurrentView('profile');
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setCurrentView('profile');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleCancel}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="font-semibold text-xl">Edit Profile</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Cover Image */}
        <div className="relative h-48 bg-accent rounded-lg overflow-hidden group">
          <img 
            src={coverPreview || formData.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('coverImage', e)}
                className="hidden"
              />
              <Button variant="secondary" size="sm" className="gap-2" asChild>
                <span>
                  <Camera className="h-4 w-4" />
                  Change cover
                </span>
              </Button>
            </label>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 -mt-20 ml-4">
          <div className="relative group">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={avatarPreview || formData.avatar} alt={formData.displayName} />
              <AvatarFallback className="text-3xl">{formData.displayName[0]}</AvatarFallback>
            </Avatar>
            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('avatar', e)}
                className="hidden"
              />
              <Camera className="h-6 w-6 text-white" />
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="Your display name"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              {formData.displayName.length}/50 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">@</span>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="username"
                maxLength={30}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {formData.username.length}/30 characters
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio">Bio</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 gap-2 text-primary"
                onClick={handleAiBioSuggest}
                disabled={isAiLoading}
              >
                {isAiLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                AI Suggest
              </Button>
            </div>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself"
              className="min-h-[100px]"
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              {formData.bio.length}/160 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="example.com"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="City, Country"
              maxLength={50}
            />
          </div>
        </div>

        {/* Additional Settings */}
        <div className="pt-4 border-t border-border">
          <h3 className="font-semibold mb-4">Additional Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Private Account</p>
                <p className="text-sm text-muted-foreground">
                  Only approved followers can see your posts
                </p>
              </div>
              <Button variant="outline" size="sm">
                Coming soon
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Verified Badge</p>
                <p className="text-sm text-muted-foreground">
                  Apply for verification
                </p>
              </div>
              <Button variant="outline" size="sm">
                Coming soon
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
