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
    } else if (submitMode === 'ctrl-enter' && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <Avatar className="mb-1 h-8 w-8 shrink-0">
        <AvatarImage src={currentUser?.avatar} alt={currentUser?.fullnames} />
        <AvatarFallback>{currentUser?.fullnames?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-1 gap-2">
        <Textarea
          placeholder={placeholder}
          value={value}
          onChange={e => setValue(e.target.value)}
          className="bg-accent/20 border-border focus-visible:ring-primary/20 min-h-[44px] max-h-[120px] resize-none text-sm"
          onKeyDown={handleKeyDown}
        />
        <Button
          size="sm"
          disabled={!value.trim() || loading}
          onClick={handleSubmit}
          className="self-end h-9 rounded-lg"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
