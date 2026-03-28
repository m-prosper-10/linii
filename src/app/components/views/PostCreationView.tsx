'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Calendar as CalendarUI } from '@/app/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';
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
  Link2,
  Code,
  List,
  Globe,
  Users,
  Lock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/app/components/ui/utils';
import AIService from '@/services/ai';
import { PostService } from '@/services/post';
import { toast } from 'sonner';

// New Components
import { PostPollCreator } from '@/app/components/post/create/PostPollCreator';
import { PostMediaPreview } from '@/app/components/post/create/PostMediaPreview';
import { PostEmojiPicker } from '@/app/components/post/create/PostEmojiPicker';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function PostCreationView() {
  const router = useRouter();
  const { currentUser, loading } = useApp();
  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Array<{ url: string; type: string }>>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [selectedMediaFiles, setSelectedMediaFiles] = useState<File[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Poll state
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollAllowMultiple, setPollAllowMultiple] = useState(false);
  const [pollExpiresAt, setPollExpiresAt] = useState('1d');

  // Additional features
  const [locationName, setLocationName] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'FRIENDS' | 'PRIVATE'>('PUBLIC');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

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

  // Save draft on content/visibility change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (content.trim()) {
        localStorage.setItem('linii_post_draft', JSON.stringify({ content, visibility }));
      } else {
        localStorage.removeItem('linii_post_draft');
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [content, visibility]);

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

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + prefix + (selectedText || (suffix ? 'text' : '')) + suffix + content.substring(end);
    setContent(newText);
    
    // Set cursor position back inside the wrapping
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText || (suffix ? 'text' : '')).length
      );
    }, 0);
  };

  const getExpirationDate = (durationStr: string) => {
    const date = new Date();
    switch (durationStr) {
      case '1h': date.setHours(date.getHours() + 1); break;
      case '1d': date.setDate(date.getDate() + 1); break;
      case '3d': date.setDate(date.getDate() + 3); break;
      case '7d': date.setDate(date.getDate() + 7); break;
      default: date.setDate(date.getDate() + 1);
    }
    return date;
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
        visibility,
        mediaFiles: selectedMediaFiles,
        poll: isPollMode
          ? {
              question: pollQuestion.trim(),
              options: pollOptions.filter(opt => opt.trim()),
              allowMultiple: pollAllowMultiple,
              expiresAt: getExpirationDate(pollExpiresAt)
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
      setPollQuestion('');
      setPollOptions(['', '']);
      setPollAllowMultiple(false);
      setPollExpiresAt('1d');
      setLocationName('');
      setScheduledDate(undefined);
      setVisibility('PUBLIC');
      localStorage.removeItem('linii_post_draft');
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
    <div className="">
      <div className="bg-background/80 border-border sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold">Create Post</h2>
          </div>
          <div className="flex items-center gap-2">
            {(content.trim() || selectedMediaFiles.length > 0 || isPollMode) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to clear this post?')) {
                    setContent('');
                    setSelectedMedia([]);
                    setSelectedMediaFiles([]);
                    setIsPollMode(false);
                    setLocationName('');
                    setScheduledDate(undefined);
                  }
                }}
                className="text-muted-foreground hover:text-destructive hidden sm:flex"
              >
                Clear
              </Button>
            )}
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
            {/* User Info & Visibility Selector */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 w-full">
                <span className="">{currentUser.displayName}</span>
              </div>
              <Select value={visibility} onValueChange={(v: 'PUBLIC' | 'FRIENDS' | 'PRIVATE') => setVisibility(v)}>
                <SelectTrigger className="h-6 gap-1 rounded-md border-border/50 bg-transparent px-2 text-xs font-medium focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">
                    <div className="flex items-center gap-2"><Globe className="h-3 w-3"/> Public</div>
                  </SelectItem>
                  <SelectItem value="FRIENDS">
                    <div className="flex items-center gap-2"><Users className="h-3 w-3"/> Friends</div>
                  </SelectItem>
                  <SelectItem value="PRIVATE">
                    <div className="flex items-center gap-2"><Lock className="h-3 w-3"/> Only me</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isPollMode && (
              <div className="flex flex-col rounded-xl border border-border/40 bg-accent/5 overflow-hidden focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                {/* Markdown Toolbar */}
                <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border/40 bg-accent/10">
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm text-foreground/70 hover:text-foreground hover:bg-accent/40" onClick={() => insertMarkdown('**', '**')}>
                          <span className="font-bold text-[14px]">B</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">Bold</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm text-foreground/70 hover:text-foreground hover:bg-accent/40" onClick={() => insertMarkdown('*', '*')}>
                          <span className="italic font-serif text-[14px]">I</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">Italic</TooltipContent>
                    </Tooltip>

                    <div className="w-px h-4 bg-border/40 mx-1" />

                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm text-foreground/70 hover:text-foreground hover:bg-accent/40" onClick={() => insertMarkdown('[', '](url)')}>
                          <Link2 className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">Link</TooltipContent>
                    </Tooltip>

                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm text-foreground/70 hover:text-foreground hover:bg-accent/40" onClick={() => insertMarkdown('`', '`')}>
                          <Code className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">Code</TooltipContent>
                    </Tooltip>

                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm text-foreground/70 hover:text-foreground hover:bg-accent/40" onClick={() => insertMarkdown('- ')}>
                          <List className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">List</TooltipContent>
                    </Tooltip>

                    <div className="w-px h-4 bg-border/40 mx-1" />

                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={isPreviewMode ? "secondary" : "ghost"}
                          size="sm" 
                          className={cn(
                            "h-7 px-2 text-[10px] font-bold uppercase tracking-wider rounded-sm",
                            isPreviewMode ? "text-primary bg-primary/10" : "text-foreground/70 hover:text-foreground hover:bg-accent/40"
                          )}
                          onClick={() => setIsPreviewMode(!isPreviewMode)}
                        >
                          {isPreviewMode ? "Edit" : "Preview"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">Toggle Markdown Preview</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {isPreviewMode ? (
                  <div className="min-h-[160px] max-h-[400px] overflow-y-auto px-5 py-4 prose prose-invert max-w-none text-[15px] leading-relaxed bg-accent/5 backdrop-blur-sm">
                    {content ? (
                      <div className="opacity-90">
                        <div className="text-muted-foreground/50 italic text-[11px] mb-3 uppercase tracking-widest font-bold">
                          Markdown Preview
                        </div>
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({...props}) => <p className="mb-2 last:mb-0 whitespace-pre-wrap wrap-break-word" {...props} />,
                            a: ({...props}) => <a className="text-primary hover:underline wrap-break-word" target="_blank" rel="noopener noreferrer" {...props} />,
                            ul: ({...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                            ol: ({...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                          }}
                        >
                          {content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 space-y-2 py-8">
                        <Sparkles className="h-6 w-6 opacity-20" />
                        <span className="text-xs italic">Nothing to preview yet</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <Textarea
                    ref={textareaRef}
                    placeholder="What's on your mind? (Markdown supported)"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="min-h-[120px] resize-none border-none bg-transparent px-4 py-3 text-[16px] leading-relaxed focus-visible:ring-0 shadow-none"
                    maxLength={maxCharacters + 50}
                  />
                )}
              </div>
            )}

            {isPollMode && (
              <PostPollCreator
                question={pollQuestion}
                setQuestion={setPollQuestion}
                options={pollOptions}
                setOptions={setPollOptions}
                allowMultiple={pollAllowMultiple}
                setAllowMultiple={setPollAllowMultiple}
                expiresAt={pollExpiresAt}
                setExpiresAt={setPollExpiresAt}
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
                    onClick={() => setScheduledDate(undefined)}
                  />
                </Badge>
              </div>
            )}

            <PostMediaPreview media={selectedMedia} onRemove={removeMedia} />

            <div className="border-border flex items-center justify-between border-t pt-4 mt-2">
              <TooltipProvider delayDuration={300}>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                    id="media-upload"
                    multiple
                  />
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label htmlFor="media-upload">
                        <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full h-9 w-9 shrink-0 cursor-pointer" asChild>
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
                        className={`rounded-full h-9 w-9 shrink-0 ${isPollMode ? 'text-primary bg-primary/10' : 'text-primary hover:bg-primary/10'}`}
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
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-full h-9 w-9 shrink-0"
                          >
                            <MapPin className="h-5 w-5" />
                          </Button>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Add Location</TooltipContent>
                    </Tooltip>
                    <PopoverContent className="w-80 p-3" align="start">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Location Name</h4>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={locationName} 
                            onChange={(e) => setLocationName(e.target.value)} 
                            placeholder="Where are you?" 
                            className="bg-accent/50"
                          />
                        </div>
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
                            className={`rounded-full h-9 w-9 shrink-0 ${scheduledDate ? 'text-orange-500 bg-orange-500/10' : 'text-orange-500 hover:text-orange-600 hover:bg-orange-500/10'}`}
                          >
                            <Calendar className="h-5 w-5" />
                          </Button>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Schedule Post</TooltipContent>
                    </Tooltip>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarUI
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        initialFocus
                      />
                      {scheduledDate && (
                        <div className="p-3 border-t border-border flex justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setScheduledDate(undefined)}>
                            Clear
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>

                  <PostEmojiPicker onEmojiSelect={onEmojiSelect} />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:bg-primary/10 rounded-full h-9 w-9 shrink-0"
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
                    <TooltipContent>AI Enhance Text</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>

              <div className="flex items-center gap-3">
                {content.trim() && (
                  <span className="text-[11px] text-muted-foreground/60 animate-pulse hidden sm:inline">
                    Draft saved
                  </span>
                )}
                <div className="relative flex items-center justify-center">
                  <svg className="h-9 w-9 -rotate-90 transform">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="transparent"
                      className="text-border/30"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 14}
                      strokeDashoffset={(1 - Math.min(characterCount / maxCharacters, 1.25)) * (2 * Math.PI * 14)}
                      className={cn(
                        "transition-all duration-300",
                        characterCount > maxCharacters 
                          ? "text-destructive" 
                          : characterCount > maxCharacters - 20 
                            ? "text-orange-500" 
                            : "text-primary"
                      )}
                      strokeLinecap="round"
                    />
                  </svg>
                  {characterCount > maxCharacters - 20 && (
                    <span className={cn(
                      "absolute text-[10px] font-bold",
                      isOverLimit ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {maxCharacters - characterCount}
                    </span>
                  )}
                </div>

                {isOverLimit && (
                  <Badge variant="destructive" className="text-[10px] h-5 px-1.5 uppercase font-bold tracking-tight">
                    Limit Exceeded
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
