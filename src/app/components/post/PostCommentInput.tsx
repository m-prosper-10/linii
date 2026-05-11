'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { PostService } from '@/services/post';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { EmojiPicker } from '@/app/components/post/EmojiPicker';
import { cn } from '@/app/components/ui/utils';
import { getUserDisplayName, getUserInitial } from '@/lib/user';

interface PostCommentInputProps {
  postId: string;
  onCommentAdded?: () => void;
  submitMode?: 'ctrl-enter' | 'enter';
  placeholder?: string;
  className?: string;
}

export function PostCommentInput({
  postId,
  onCommentAdded,
  submitMode = 'ctrl-enter',
  placeholder = 'Write a comment…',
  className,
}: PostCommentInputProps) {
  const { currentUser } = useApp();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const handleEmojiSelect = (emoji: string) => {
    setValue(v => v + emoji);
    textareaRef.current?.focus();
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
    } catch {
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
    } else if (submitMode === 'ctrl-enter' && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const canSubmit = !!value.trim() && !loading;
  const currentUserName = getUserDisplayName(currentUser);

  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <Avatar className="h-12 w-12 shrink-0 mt-1">
        <AvatarImage src={currentUser?.avatar} alt={currentUserName} />
        <AvatarFallback className="text-xs">{getUserInitial(currentUser)}</AvatarFallback>
      </Avatar>

      <div className={cn(
        'flex flex-1 items-end gap-1.5 rounded-md border px-3 py-2 transition-all duration-200',
        focused
          ? 'border-primary/30 bg-primary/5 shadow-sm shadow-primary/5'
          : 'border-border/40 bg-muted/30 hover:border-border/60'
      )}>
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={placeholder}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 resize-none bg-transparent text-sm leading-relaxed placeholder:text-muted-foreground/40 focus:outline-none h-7 min-h-8 max-h-[120px] mb-0.5"
        />

        <div className="flex items-center gap-1 shrink-0 pb-0.5">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          <button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200',
              canSubmit
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-100'
                : 'text-muted-foreground/30 cursor-not-allowed'
            )}
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Send className="h-4 w-4" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}
