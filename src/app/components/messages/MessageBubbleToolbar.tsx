'use client';

import { useEffect } from 'react';
import { cn } from '@/app/components/ui/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  Copy,
  Forward,
  Flag,
  MoreHorizontal,
  Reply,
  Smile,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ReactionPickerStrip } from './ReactionPicker';
import type { MessageActionContext } from './types';

const controlButtonClass =
  'h-8 w-8 shrink-0 rounded-full border border-border/80 bg-background/95 text-muted-foreground shadow-sm backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105 hover:bg-accent hover:text-foreground hover:shadow-md';

export interface MessageBubbleToolbarProps {
  messageId: string;
  isCurrentUser: boolean;
  copyText: string;
  actionContext: MessageActionContext;
  messageRootRef: React.RefObject<HTMLElement | null>;
  reactionPickerOpen: boolean;
  onReactionPickerOpenChange: (open: boolean) => void;
  onReply?: (message: MessageActionContext) => void;
  onForward?: (message: MessageActionContext) => void;
  onReact?: (messageId: string, emoji: string, type: string) => void;
  onDelete?: (messageId: string) => void | Promise<void>;
  onReport?: (messageId: string) => void | Promise<void>;
}

export function MessageBubbleToolbar({
  messageId,
  isCurrentUser,
  copyText,
  actionContext,
  messageRootRef,
  reactionPickerOpen,
  onReactionPickerOpenChange,
  onReply,
  onForward,
  onReact,
  onDelete,
  onReport,
}: MessageBubbleToolbarProps) {
  useEffect(() => {
    if (!reactionPickerOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const root = messageRootRef.current;
      const target = event.target as Node;
      if (root && !root.contains(target)) {
        onReactionPickerOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [reactionPickerOpen, messageRootRef, onReactionPickerOpenChange]);

  const handleReaction = (emoji: string, type: string) => {
    onReact?.(messageId, emoji, type);
  };

  const handleCopy = async () => {
    const text = copyText.trim();
    if (!text) {
      toast.error('Nothing to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Could not copy');
    }
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReply?.(actionContext);
  };

  const handleForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    onForward?.(actionContext);
  };

  const toggleReactionPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReactionPickerOpenChange(!reactionPickerOpen);
  };

  const runDelete = async () => {
    try {
      await onDelete?.(messageId);
    } catch {
      toast.error('Could not delete message');
    }
  };

  const runReport = async () => {
    try {
      await onReport?.(messageId);
    } catch {
      toast.error('Could not submit report');
    }
  };

  const canCopy = copyText.trim().length > 0;

  return (
    <div
      className={cn(
        'flex max-w-[min(100vw-3rem,18rem)] shrink-0 flex-wrap items-center gap-1',
        'opacity-100 max-md:opacity-100 max-md:pointer-events-auto',
        'md:pointer-events-none md:opacity-0 md:transition-opacity md:duration-200',
        'group-hover:pointer-events-auto group-hover:opacity-100'
      )}
      onClick={e => e.stopPropagation()}
    >
      {reactionPickerOpen && (
        <ReactionPickerStrip
          onSelect={handleReaction}
          onClose={() => onReactionPickerOpenChange(false)}
          className="animate-in fade-in zoom-in-95 duration-150"
        />
      )}

      <button
        type="button"
        onClick={toggleReactionPicker}
        className={cn(
          controlButtonClass,
          reactionPickerOpen && 'bg-accent text-foreground ring-1 ring-primary/30'
        )}
        title="React"
        aria-expanded={reactionPickerOpen}
        aria-haspopup="listbox"
      >
        <Smile className="h-3.5 w-3.5" />
      </button>

      {onReply && (
        <button type="button" onClick={handleReply} className={controlButtonClass} title="Reply">
          <Reply className="h-3.5 w-3.5" />
        </button>
      )}

      {onForward && (
        <button type="button" onClick={handleForward} className={controlButtonClass} title="Forward">
          <Forward className="h-3.5 w-3.5" />
        </button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={controlButtonClass} title="More" aria-label="More actions">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={isCurrentUser ? 'end' : 'start'}
          side="bottom"
          className="w-48"
        >
          {canCopy && (
            <DropdownMenuItem onSelect={() => void handleCopy()}>
              <Copy className="mr-2 h-4 w-4" />
              Copy text
            </DropdownMenuItem>
          )}
          {onReply && (
            <DropdownMenuItem onSelect={() => onReply(actionContext)}>
              <Reply className="mr-2 h-4 w-4" />
              Reply
            </DropdownMenuItem>
          )}
          {onForward && (
            <DropdownMenuItem onSelect={() => onForward(actionContext)}>
              <Forward className="mr-2 h-4 w-4" />
              Forward
            </DropdownMenuItem>
          )}

          {(canCopy || onReply || onForward) &&
            (onDelete || onReport) && <DropdownMenuSeparator />}

          {isCurrentUser && onDelete && (
            <DropdownMenuItem variant="destructive" onSelect={() => void runDelete()}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete for you
            </DropdownMenuItem>
          )}

          {!isCurrentUser && onReport && (
            <DropdownMenuItem onSelect={() => void runReport()}>
              <Flag className="mr-2 h-4 w-4" />
              Report
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
