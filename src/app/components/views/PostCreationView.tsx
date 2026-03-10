'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { apiClient } from "@/lib/api";
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { currentUser } from '@/data/mockData';
import {
  ArrowLeft,
  Calendar,
  Image as ImageIcon,
  MapPin,
  Smile,
  Video,
  X,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AIService from '@/services/ai';
import { toast } from 'sonner'; // Assuming sonner is used for toasts based on modern stack, or I'll use native alert if not.

export function PostCreationView() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiEnhance = async () => {
    if (!content.trim()) return;
    setIsAiLoading(true);
    try {
      const enhanced = await AIService.suggestPostEnhancement(content);
      setContent(enhanced);
      toast.success("Post enhanced by AI!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "AI enhancement failed";
      alert(message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleImageAnalysis = async (file: File) => {
    setIsAiLoading(true);
    try {
      const description = await AIService.analyzeImage(file);
      if (!content.trim()) {
        setContent(description);
      } else {
        // Ask or just append? Let's just append or suggest.
        // For simplicity, if content is empty, fill it. Else, append.
        setContent(prev => `${prev}\n\n[AI Description: ${description}]`);
      }
      toast.success("Image analyzed by AI!");
    } catch (error: unknown) {
      console.error("Image analysis failed:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;

    setIsPosting(true);

    // Simulate posting delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Reset form
    setContent('');
    setSelectedImage(null);
    setIsPosting(false);

    // Navigate back to home
    router.push('/home');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Trigger AI analysis
      handleImageAnalysis(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const characterCount = content.length;
  const maxCharacters = 280;
  const isOverLimit = characterCount > maxCharacters;
  const canPost = content.trim().length > 0 && !isOverLimit && !isPosting;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="bg-background/80 border-border sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/home')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold">Create Post</h2>
          </div>
          <Button onClick={handlePost} disabled={!canPost} className="px-6">
            {isPosting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage
              src={currentUser.avatar}
              alt={currentUser.displayName}
            />
            <AvatarFallback>{currentUser.displayName[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="min-h-[120px] resize-none border-none bg-transparent p-0 text-lg focus-visible:ring-0"
              maxLength={maxCharacters + 50} // Allow typing over limit to show warning
            />

            {selectedImage && (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage}
                  alt="Upload preview"
                  className="border-border max-h-96 w-full rounded-lg border object-cover"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 p-0"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="border-border flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button variant="ghost" size="sm" className="gap-2" asChild>
                    <span className="cursor-pointer">
                      <ImageIcon className="h-4 w-4" />
                      Photo
                    </span>
                  </Button>
                </label>

                <Button variant="ghost" size="sm" className="gap-2" disabled>
                  <Video className="h-4 w-4" />
                  Video
                </Button>

                <Button variant="ghost" size="sm" className="gap-2" disabled>
                  <MapPin className="h-4 w-4" />
                  Location
                </Button>

                <Button variant="ghost" size="sm" className="gap-2" disabled>
                  <Smile className="h-4 w-4" />
                  Emoji
                </Button>

                <Button variant="ghost" size="sm" className="gap-2" disabled>
                  <Calendar className="h-4 w-4" />
                  Schedule
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-primary"
                  onClick={handleAiEnhance}
                  disabled={isAiLoading || !content.trim()}
                >
                  {isAiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  AI Enhance
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`text-sm ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}
                >
                  {characterCount}/{maxCharacters}
                </div>

                {isOverLimit && (
                  <Badge variant="destructive" className="text-xs">
                    Over limit
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-border border-t p-4">
        <div className="text-muted-foreground space-y-2 text-sm">
          <p>
            💡 <strong>Tips for great posts:</strong>
          </p>
          <ul className="ml-4 list-inside list-disc space-y-1">
            <li>Keep it engaging and authentic</li>
            <li>Use relevant hashtags to reach more people</li>
            <li>Add images or videos to increase engagement</li>
            <li>Ask questions to encourage interaction</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
