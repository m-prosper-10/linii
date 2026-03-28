'use client';

import { useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { PostService } from '@/services/post';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { EmojiPicker } from '@/app/components/post/EmojiPicker';

interface PostCommentInputProps {
  postId: string;
  onCommentAdded?: () => void;
  /** Keyboard shortcut: 'ctrl+enter' (feed) | 'enter' (modal) */
  submitMode?: 'ctrl-enter' | 'enter';
  placeholder?: string;
  /** Additional class for the wrapper */
  className?: string;
}

export function PostCommentInput({
  postId,
  onCommentAdded,
  submitMode = 'ctrl-enter',
  placeholder = 'Write a comment…',
  className = '',
}: PostCommentInputProps) {
  const { currentUser } = useApp();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmojiSelect = (emoji: string) => {
    setValue(value + emoji);
  };

  const handleSubmit = async () => {
    const content = value.trim();
    if (!content) return;
    setValue('');
    try {
      setLoading(true);
      await PostService.addComment({ postId, content });
      toast.success('Comment added');
      onCommentAdded?.();
    } catch (_err) {
      setValue(content);
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (submitMode === 'enter' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (
      submitMode === 'ctrl-enter' &&
      e.key === 'Enter' &&
      (e.metaKey || e.ctrlKey)
    ) {
      handleSubmit();
    }
  };

  return (
    <div
      className={`flex items-center justify-between gap-2 ${className}`}
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={currentUser?.avatar} alt={currentUser?.fullnames} />
        <AvatarFallback>{currentUser?.fullnames?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-1 items-center justify-between gap-2">
        <div className="flex w-full items-center gap-2">
          <input
            placeholder={placeholder}
            value={value}
            onChange={e => setValue(e.target.value)}
            className="bg-accent/20 focus-visible:ring-primary/20 max-h-[120px] min-h-[44px] w-full max-w-100 text-sm pl-2 border-border"
            onKeyDown={handleKeyDown}
          />
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
        <Button
          size="sm"
          disabled={!value.trim() || loading}
          onClick={handleSubmit}
          className="h-10 self-end rounded-lg border"
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Send className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  );
}
