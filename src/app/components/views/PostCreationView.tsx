'use client';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { Calendar as CalendarUI } from '@/app/components/ui/calendar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/components/ui/tooltip';
import { Input } from '@/app/components/ui/input';
import {
  ArrowLeft,
  Calendar,
  Image as ImageIcon,
  MapPin,
  X,
  Sparkles,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/app/components/ui/utils';
import AIService from '@/services/ai';
import { PostService } from '@/services/post';
import { toast } from 'sonner';

// New Components
import { PostPollCreator } from '@/app/components/post/create/PostPollCreator';
import { PostMediaPreview } from '@/app/components/post/create/PostMediaPreview';
import { EmojiPicker } from '@/app/components/post/EmojiPicker';
import { PostCreationHeader } from '@/app/components/post/create/PostCreationHeader';
import { PostCreationTextInput } from '@/app/components/post/create/PostCreationTextInput';
import { PostPreCreationPreview } from '@/app/components/post/create/PostPreCreationPreview';

export function PostCreationView() {
  const router = useRouter();
  const { currentUser, loading } = useApp();

  // State
  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<
    Array<{ url: string; type: string }>
  >([]);
  const [isPosting, setIsPosting] = useState(false);
  const [selectedMediaFiles, setSelectedMediaFiles] = useState<File[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isFullPreview, setIsFullPreview] = useState(false);

  // Poll state
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollAllowMultiple, setPollAllowMultiple] = useState(false);
  const [pollExpiresAt, setPollExpiresAt] = useState('1d');

  // Additional features
  const [locationName, setLocationName] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    undefined
  );
  const [visibility, setVisibility] = useState<
    'PUBLIC' | 'FRIENDS' | 'PRIVATE'
  >('PUBLIC');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [mentions, setMentions] = useState<
    Array<{ id: string; name: string; avatar?: string }>
  >([]);
  /** Remount markdown textarea after submit/clear so value and DOM stay in sync. */
  const [editorResetNonce, setEditorResetNonce] = useState(0);
  const draftSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const toggleMention = (user: {
    id: string;
    name: string;
    avatar?: string;
  }) => {
    setMentions(prev => {
      const exists = prev.some(m => m.id === user.id);
      if (exists) {
        return prev.filter(m => m.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const removeMention = (userId: string) => {
    setMentions(prev => prev.filter(m => m.id !== userId));
  };

  // Constants
  const maxCharacters = 280;

  // Helper functions
  const getExpirationDate = (durationStr: string) => {
    const date = new Date();
    switch (durationStr) {
      case '1h':
        date.setHours(date.getHours() + 1);
        break;
      case '1d':
        date.setDate(date.getDate() + 1);
        break;
      case '3d':
        date.setDate(date.getDate() + 3);
        break;
      case '7d':
        date.setDate(date.getDate() + 7);
        break;
      default:
        date.setDate(date.getDate() + 1);
    }
    return date;
  };

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('linii_post_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.content) setContent(draft.content);
        if (draft.visibility) setVisibility(draft.visibility);
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  }, []);

  // Save draft on content/visibility change (cancelled on successful post to avoid re-saving old text mid-request)
  useEffect(() => {
    if (draftSaveTimeoutRef.current) {
      clearTimeout(draftSaveTimeoutRef.current);
    }
    draftSaveTimeoutRef.current = setTimeout(() => {
      draftSaveTimeoutRef.current = null;
      if (content.trim()) {
        localStorage.setItem(
          'linii_post_draft',
          JSON.stringify({ content, visibility })
        );
      } else {
        localStorage.removeItem('linii_post_draft');
      }
    }, 1000);
    return () => {
      if (draftSaveTimeoutRef.current) {
        clearTimeout(draftSaveTimeoutRef.current);
        draftSaveTimeoutRef.current = null;
      }
    };
  }, [content, visibility]);

  const removeMedia = useCallback((index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
    setSelectedMediaFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearPendingDraftSave = useCallback(() => {
    if (draftSaveTimeoutRef.current) {
      clearTimeout(draftSaveTimeoutRef.current);
      draftSaveTimeoutRef.current = null;
    }
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
      toast.error(message);
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
      (!content.trim() || pollOptions.some(opt => !opt.trim()))
    ) {
      toast.error('Please fill in the poll question and all options');
      return;
    }

    // Stop debounced draft writes during the request (avoids saving old text while posting)
    clearPendingDraftSave();

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
        content: content.trim(),
        postType,
        visibility,
        mentions: mentions.map(m => m.id),
        mediaFiles: selectedMediaFiles,
        poll: isPollMode
          ? {
              question: content.trim(),
              options: pollOptions.filter(opt => opt.trim()),
              allowMultiple: pollAllowMultiple,
              expiresAt: getExpirationDate(pollExpiresAt),
            }
          : undefined,
        location: locationName
          ? { name: locationName, coordinates: [0, 0] }
          : undefined,
        scheduledFor: scheduledDate ? scheduledDate : undefined,
        tags,
      });

      toast.success('Post created successfully!');
      setContent('');
      setSelectedMedia([]);
      setSelectedMediaFiles([]);
      setIsPollMode(false);
      setPollOptions(['', '']);
      setPollAllowMultiple(false);
      setPollExpiresAt('1d');
      setLocationName('');
      setScheduledDate(undefined);
      setVisibility('PUBLIC');
      setMentions([]);
      setIsPreviewMode(false);
      setIsFullPreview(false);
      localStorage.removeItem('linii_post_draft');
      setEditorResetNonce(n => n + 1);
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
    e.target.value = '';
  };

  const onEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > maxCharacters;
  const canPost =
    (content.trim().length > 0 ||
      selectedMediaFiles.length > 0 ||
      (isPollMode &&
        content.trim().length > 0 &&
        pollOptions.every(opt => opt.trim().length > 0))) &&
    !isPosting;

  return (
    <div className="bg-background border-border/10 mx-auto min-h-screen max-w-2xl border-x sm:min-h-0">
      <div className="bg-background/80 border-border sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold">
              {isFullPreview ? 'Review Post' : 'Create Post'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!isFullPreview &&
              (content.trim() ||
                selectedMediaFiles.length > 0 ||
                isPollMode) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear this post?')) {
                      clearPendingDraftSave();
                      localStorage.removeItem('linii_post_draft');
                      setContent('');
                      setSelectedMedia([]);
                      setSelectedMediaFiles([]);
                      setIsPollMode(false);
                      setPollOptions(['', '']);
                      setLocationName('');
                      setScheduledDate(undefined);
                      setIsPreviewMode(false);
                      setIsFullPreview(false);
                      setEditorResetNonce(n => n + 1);
                    }
                  }}
                  className="text-muted-foreground hover:text-destructive hidden h-9 rounded-full px-4 sm:flex"
                >
                  Clear
                </Button>
              )}

            <Button
              variant={isFullPreview ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => setIsFullPreview(!isFullPreview)}
              className="border-primary/20 hover:bg-primary/5 h-9 rounded-full px-4 font-bold transition-all"
            >
              {isFullPreview ? 'Edit' : 'Preview'}
            </Button>

            <Button
              onClick={handlePost}
              disabled={!canPost}
              className="shadow-primary/20 h-9 rounded-full px-6 font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
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
      </div>

      <div className="p-4 sm:p-6">
        {isFullPreview ? (
          <PostPreCreationPreview
            user={{
              displayName: currentUser.displayName,
              username:
                currentUser.username ||
                currentUser.displayName.toLowerCase().replace(/\s+/g, '_'),
              avatar: currentUser.avatar,
            }}
            content={content}
            media={selectedMedia}
            poll={
              isPollMode
                ? {
                    question: content,
                    options: pollOptions.filter(o => o.trim()),
                    expiresAt: getExpirationDate(pollExpiresAt),
                  }
                : undefined
            }
            visibility={visibility}
            mentions={mentions}
          />
        ) : (
          <div className="flex gap-4">
            <div className="flex-1 space-y-6">
              <PostCreationHeader
                user={{
                  displayName: currentUser.displayName,
                  avatar: currentUser.avatar,
                }}
                visibility={visibility}
                onVisibilityChange={setVisibility}
                mentions={mentions}
                onSelectMention={toggleMention}
                onRemoveMention={removeMention}
              />

              {isPollMode ? (
                <PostPollCreator
                  question={content}
                  setQuestion={setContent}
                  options={pollOptions}
                  setOptions={setPollOptions}
                  allowMultiple={pollAllowMultiple}
                  setAllowMultiple={setPollAllowMultiple}
                  expiresAt={pollExpiresAt}
                  setExpiresAt={setPollExpiresAt}
                  onRemove={() => setIsPollMode(false)}
                />
              ) : (
                <PostCreationTextInput
                  content={content}
                  setContent={setContent}
                  isPreviewMode={isPreviewMode}
                  setIsPreviewMode={setIsPreviewMode}
                  maxCharacters={maxCharacters}
                  resetNonce={editorResetNonce}
                />
              )}

              <div className="flex flex-wrap gap-2 px-1">
                {locationName && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 gap-1.5 rounded-full border py-1.5 pl-2 pr-3"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="text-xs font-bold uppercase tracking-tight">
                      {locationName}
                    </span>
                    <X
                      className="hover:text-destructive ml-1 h-3.5 w-3.5 cursor-pointer transition-colors"
                      onClick={() => setLocationName('')}
                    />
                  </Badge>
                )}

                {scheduledDate && (
                  <Badge
                    variant="secondary"
                    className="gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 py-1.5 pl-2 pr-3 text-orange-500"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs font-bold uppercase tracking-tight">
                      {new Date(scheduledDate).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                    <X
                      className="hover:text-destructive ml-1 h-3.5 w-3.5 cursor-pointer transition-colors"
                      onClick={() => setScheduledDate(undefined)}
                    />
                  </Badge>
                )}
              </div>

              <PostMediaPreview media={selectedMedia} onRemove={removeMedia} />

              <div className="border-border mt-4 flex items-center justify-between border-t pt-5">
                <TooltipProvider delayDuration={400}>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                      id="media-upload"
                      multiple
                    />

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <label htmlFor="media-upload">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-primary hover:bg-primary/10 h-10 w-10 shrink-0 cursor-pointer rounded-full transition-all hover:scale-110"
                              asChild
                            >
                              <span>
                                <ImageIcon className="h-5 w-5" />
                              </span>
                            </Button>
                          </label>
                        </TooltipTrigger>
                        <TooltipContent>Add Media</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-10 w-10 shrink-0 rounded-full',
                              isPollMode
                                ? 'text-primary bg-primary/10'
                                : 'text-primary hover:bg-primary/10'
                            )}
                            onClick={() => setIsPollMode(!isPollMode)}
                          >
                            <TrendingUp className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Create Poll</TooltipContent>
                      </Tooltip>

                      <Popover>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 shrink-0 rounded-full text-rose-500 hover:bg-rose-500/10"
                              >
                                <MapPin className="h-5 w-5" />
                              </Button>
                            </PopoverTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Add Location</TooltipContent>
                        </Tooltip>
                        <PopoverContent
                          className="w-80 rounded-2xl p-4 shadow-2xl"
                          align="start"
                        >
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500">
                              Location
                            </h4>
                            <Input
                              value={locationName}
                              onChange={e => setLocationName(e.target.value)}
                              placeholder="Where are you?"
                              className="bg-accent/50 rounded-xl"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  'h-10 w-10 shrink-0 rounded-full',
                                  scheduledDate
                                    ? 'bg-orange-500/10 text-orange-500'
                                    : 'text-orange-500 hover:bg-orange-500/10'
                                )}
                              >
                                <Calendar className="h-5 w-5" />
                              </Button>
                            </PopoverTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Schedule</TooltipContent>
                        </Tooltip>
                        <PopoverContent
                          className="w-auto rounded-2xl p-0"
                          align="start"
                        >
                          <CalendarUI
                            mode="single"
                            selected={scheduledDate}
                            onSelect={setScheduledDate}
                            initialFocus
                          />
                          {scheduledDate && (
                            <div className="bg-accent/5 flex justify-end border-t p-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setScheduledDate(undefined)}
                                className="rounded-full text-xs"
                              >
                                Clear
                              </Button>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>

                      <EmojiPicker onEmojiSelect={onEmojiSelect} />

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary hover:bg-primary/10 h-10 w-10 shrink-0 rounded-full"
                            onClick={handleAiEnhance}
                            disabled={isAiLoading || !content.trim()}
                          >
                            {isAiLoading ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Sparkles className="h-5 w-5" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>AI Enhance</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TooltipProvider>

                <div className="flex items-center gap-3">
                  {content.trim() && (
                    <span className="text-muted-foreground/50 hidden animate-pulse text-[10px] font-bold uppercase tracking-widest md:inline-block">
                      Draft saved
                    </span>
                  )}
                  {isOverLimit && (
                    <Badge
                      variant="destructive"
                      className="h-5 rounded-full px-2 text-[9px] font-black uppercase"
                    >
                      Over
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-border bg-accent/2 mt-4 border-t p-6">
        <div className="text-muted-foreground/70 max-w-lg space-y-3 text-xs leading-relaxed">
          <p className="text-foreground/80 mb-2 flex items-center gap-2 font-semibold">
            <Sparkles className="text-primary h-3.5 w-3.5" />
            Tips for your next masterpiece:
          </p>
          <ul className="grid list-none grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            <li className="flex gap-2">
              <span className="text-primary opacity-50">•</span>Keep it engaging
              and authentic
            </li>
            <li className="flex gap-2">
              <span className="text-primary opacity-50">•</span>Use relevant
              hashtags
            </li>
            <li className="flex gap-2">
              <span className="text-primary opacity-50">•</span>Add high-quality
              media
            </li>
            <li className="flex gap-2">
              <span className="text-primary opacity-50">•</span>Ask questions to
              spark debate
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
