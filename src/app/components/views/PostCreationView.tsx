'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
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
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import AIService from '@/services/ai';
import { PostService } from '@/services/post';
import { toast } from 'sonner';

// New Components
import { PostPollCreator } from '@/app/components/post/PostPollCreator';
import { PostMediaPreview } from '@/app/components/post/PostMediaPreview';
import { PostEmojiPicker } from '@/app/components/post/PostEmojiPicker';

export function PostCreationView() {
  const router = useRouter();
  const { currentUser, loading } = useApp();
  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Array<{ url: string; type: string }>>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [selectedMediaFiles, setSelectedMediaFiles] = useState<File[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Poll state
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // Additional features
  const [locationName, setLocationName] = useState('');
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const removeMedia = useCallback((index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
    setSelectedMediaFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  const handleAiEnhance = async () => {
    if (!content.trim()) return;
    setIsAiLoading(true);
    try {
      const enhanced = await AIService.suggestPostEnhancement(content);
      setContent(enhanced);
      toast.success('Post enhanced by AI!');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'AI enhancement failed';
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
      toast.success('Image analyzed by AI!');
    } catch (error: unknown) {
      console.error('Image analysis failed:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !selectedMediaFiles.length && !isPollMode) return;
    if (
      isPollMode &&
      (!pollQuestion.trim() || pollOptions.some(opt => !opt.trim()))
    ) {
      toast.error('Please fill in the poll question and all options');
      return;
    }

    setIsPosting(true);

    try {
      const tags =
        content.match(/#[\w\u0080-\uFFFF]+/g)?.map(t => t.slice(1)) || [];

      const postType = isPollMode
        ? 'POLL'
        : selectedMediaFiles.length > 0
          ? selectedMediaFiles[0].type.startsWith('video/')
            ? 'VIDEO'
            : 'IMAGE'
          : 'TEXT';

      await PostService.createPost({
        content: content.trim() || (isPollMode ? pollQuestion : ''),
        postType,
        mediaFiles: selectedMediaFiles,
        poll: isPollMode
          ? {
              question: pollQuestion.trim(),
              options: pollOptions.filter(opt => opt.trim()),
              allowMultiple: false,
            }
          : undefined,
        location: locationName
          ? { name: locationName, coordinates: [0, 0] }
          : undefined,
        scheduledFor: scheduledDate ? new Date(scheduledDate) : undefined,
        tags,
      });

      toast.success('Post created successfully!');
      setContent('');
      setSelectedMedia([]);
      setSelectedMediaFiles([]);
      setIsPollMode(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      setLocationName('');
      setScheduledDate(null);
      router.push('/home');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to create post');
      console.error(error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 4 total items
    const remainingSlots = 4 - selectedMediaFiles.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast.info('Maximum 4 media items allowed');
    }

    filesToAdd.forEach(file => {
      const type = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
      setSelectedMediaFiles(prev => [...prev, file]);

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        setSelectedMedia(prev => [
          ...prev,
          {
            url: e.target?.result as string,
            type,
          },
        ]);
      };
      reader.readAsDataURL(file);

      if (type === 'IMAGE') {
        handleImageAnalysis(file);
      }
    });

    // Reset input
    e.target.value = '';
  };

  const onEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  const characterCount = content.length;
  const maxCharacters = 280;
  const isOverLimit = characterCount > maxCharacters;
  const canPost =
    (content.trim().length > 0 ||
      selectedMediaFiles.length > 0 ||
      (isPollMode &&
        pollQuestion.trim().length > 0 &&
        pollOptions.every(opt => opt.trim().length > 0))) &&
    !isOverLimit &&
    !isPosting;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="bg-background/80 border-border sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold">Create Post</h2>
          </div>
          <Button
            onClick={handlePost}
            disabled={!canPost}
            className="rounded-full px-6 font-bold"
          >
            {isPosting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              'Post'
            )}
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
              className="min-h-[120px] resize-none border-none bg-transparent py-4 text-lg focus-visible:ring-0"
              maxLength={maxCharacters + 50}
            />

            {isPollMode && (
              <PostPollCreator
                question={pollQuestion}
                setQuestion={setPollQuestion}
                options={pollOptions}
                setOptions={setPollOptions}
                onRemove={() => setIsPollMode(false)}
              />
            )}

            {locationName && (
              <div className="animate-in slide-in-from-left flex items-center gap-2 px-1 duration-300">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary gap-1 rounded-lg py-1 pl-1 pr-2"
                >
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs font-bold">{locationName}</span>
                  <X
                    className="hover:text-destructive ml-1 h-3 w-3 cursor-pointer transition-colors"
                    onClick={() => setLocationName('')}
                  />
                </Badge>
              </div>
            )}

            {scheduledDate && (
              <div className="animate-in slide-in-from-left flex items-center gap-2 px-1 duration-300">
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-lg bg-orange-500/10 py-1 pl-1 pr-2 text-orange-500"
                >
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs font-bold">
                    Scheduled for {new Date(scheduledDate).toLocaleString()}
                  </span>
                  <X
                    className="hover:text-destructive ml-1 h-3 w-3 cursor-pointer transition-colors"
                    onClick={() => setScheduledDate(null)}
                  />
                </Badge>
              </div>
            )}

            <PostMediaPreview media={selectedMedia} onRemove={removeMedia} />

            <div className="border-border flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                  id="media-upload"
                />
                <label htmlFor="media-upload">
                  <Button variant="ghost" size="sm" className="gap-2" asChild>
                    <span className="text-primary hover:bg-primary/10 cursor-pointer">
                      <ImageIcon className="h-4 w-4" />
                      Media
                    </span>
                  </Button>
                </label>

                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 ${isPollMode ? 'text-primary bg-primary/10' : ''}`}
                  onClick={() => setIsPollMode(!isPollMode)}
                >
                  <TrendingUp className="h-4 w-4" />
                  Poll
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-accent/50 gap-2"
                  onClick={() => {
                    const loc = prompt('Enter location name:');
                    if (loc) setLocationName(loc);
                  }}
                >
                  <MapPin className="h-4 w-4 text-rose-500" />
                  Location
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-accent/50 gap-2"
                  onClick={() => {
                    const date = prompt(
                      'Enter schedule date (YYYY-MM-DD HH:MM):'
                    );
                    if (date) setScheduledDate(date);
                  }}
                >
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="hidden sm:inline">Schedule</span>
                </Button>

                <PostEmojiPicker onEmojiSelect={onEmojiSelect} />

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary/10 gap-2"
                  onClick={handleAiEnhance}
                  disabled={isAiLoading || !content.trim()}
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      AI
                    </>
                  )}
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
