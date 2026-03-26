'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
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
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import AIService from '@/services/ai';
import { PostService } from '@/services/post';
import { toast } from 'sonner';

export function PostCreationView() {
  const router = useRouter();
  const { currentUser, loading } = useApp();
  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'IMAGE' | 'VIDEO' } | null>(null);
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
    if (isPollMode && (!pollQuestion.trim() || pollOptions.some(opt => !opt.trim()))) {
      toast.error('Please fill in the poll question and all options');
      return;
    }

    setIsPosting(true);

    try {
      const tags = content.match(/#[\w\u0080-\uFFFF]+/g)?.map(t => t.slice(1)) || [];
      
      const postType = isPollMode ? 'POLL' 
        : selectedMediaFiles.length > 0 
          ? selectedMediaFiles[0].type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
          : 'TEXT';

      await PostService.createPost({
        content: content.trim() || (isPollMode ? pollQuestion : ''),
        postType,
        mediaFiles: selectedMediaFiles,
        poll: isPollMode ? {
          question: pollQuestion.trim(),
          options: pollOptions.filter(opt => opt.trim()),
          allowMultiple: false
        } : undefined,
        location: locationName ? { name: locationName, coordinates: [0, 0] } : undefined,
        scheduledFor: scheduledDate ? new Date(scheduledDate) : undefined,
        tags
      });

      toast.success('Post created successfully!');
      setContent('');
      setSelectedMedia(null);
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
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
      setSelectedMediaFiles([file]);
      
      const reader = new FileReader();
      reader.onload = e => {
        setSelectedMedia({
          url: e.target?.result as string,
          type
        });
      };
      reader.readAsDataURL(file);

      if (type === 'IMAGE') {
        handleImageAnalysis(file);
      }
    }
  };

  const removeMedia = () => {
    setSelectedMedia(null);
    setSelectedMediaFiles([]);
  };

  const handleAddOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const characterCount = content.length;
  const maxCharacters = 280;
  const isOverLimit = characterCount > maxCharacters;
  const canPost = (content.trim().length > 0 || selectedMediaFiles.length > 0 || (isPollMode && pollQuestion.trim().length > 0 && pollOptions.every(opt => opt.trim().length > 0))) && !isOverLimit && !isPosting;

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
          <Button onClick={handlePost} disabled={!canPost} className="px-6 rounded-full font-bold">
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
                <div className="bg-accent/20 space-y-3 rounded-2xl p-4 border border-border/50">
                  <Input
                    placeholder="Ask a question..."
                    value={pollQuestion}
                    onChange={e => setPollQuestion(e.target.value)}
                    className="bg-background border-border/50 font-bold"
                  />
                  <div className="space-y-2">
                    {pollOptions.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={e => handleOptionChange(index, e.target.value)}
                          className="bg-background border-border/50"
                        />
                        {pollOptions.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOption(index)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {pollOptions.length < 4 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                      className="w-full border-dashed border-border/50 hover:bg-accent/50 text-xs font-bold uppercase tracking-widest"
                    >
                      + Add Option
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPollMode(false)}
                    className="w-full text-muted-foreground text-xs font-bold"
                  >
                    Remove Poll
                  </Button>
                </div>
              )}

              {locationName && (
                <div className="flex items-center gap-2 px-1">
                  <Badge variant="secondary" className="bg-primary/10 text-primary gap-1 pl-1 pr-2">
                    <MapPin className="h-3 w-3" />
                    {locationName}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => setLocationName('')}
                    />
                  </Badge>
                </div>
              )}

              {scheduledDate && (
                <div className="flex items-center gap-2 px-1">
                  <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 gap-1 pl-1 pr-2">
                    <Calendar className="h-3 w-3" />
                    Scheduled for {new Date(scheduledDate).toLocaleString()}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => setScheduledDate(null)}
                    />
                  </Badge>
                </div>
              )}

              {selectedMedia && (
                <div className="relative group">
                  {selectedMedia.type === 'IMAGE' ? (
                    <img
                      src={selectedMedia.url}
                      alt="Upload preview"
                      className="border-border max-h-96 w-full rounded-2xl border object-cover shadow-lg transition-all group-hover:brightness-90"
                    />
                  ) : (
                    <video
                      src={selectedMedia.url}
                      controls
                      className="border-border max-h-96 w-full rounded-2xl border object-cover shadow-lg transition-all group-hover:brightness-90"
                    />
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute right-3 top-3 h-8 w-8 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100 shadow-xl"
                    onClick={removeMedia}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

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
                    <span className="cursor-pointer text-primary hover:bg-primary/10">
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
                  className="gap-2 hover:bg-accent/50"
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
                  className="gap-2 hover:bg-accent/50"
                  onClick={() => {
                    const date = prompt('Enter schedule date (YYYY-MM-DD HH:MM):');
                    if (date) setScheduledDate(date);
                  }}
                >
                  <Calendar className="h-4 w-4 text-orange-500" />
                  Schedule
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary gap-2 hover:bg-primary/10"
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
