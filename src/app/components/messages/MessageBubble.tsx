'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { cn } from '@/app/components/ui/utils';
import { User } from '@/services/auth';
import {
  Check,
  CheckCheck,
  Reply,
  Forward,
  Smile,
  MoreHorizontal,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { FileDisplay } from './FileDisplay';
import { ReactionPicker } from './ReactionPicker';
import type { MessageActionContext } from './types';

interface MessageBubbleProps {
  messageId: string;
  content: string;
  createdAt: string;
  sender: User;
  isCurrentUser: boolean;
  isRead: boolean;
  showAvatar?: boolean;
  isGrouped?: boolean;
  files?: string[];
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
  onReply?: (message: MessageActionContext) => void;
  onForward?: (message: MessageActionContext) => void;
  onReact?: (messageId: string, emoji: string, type: string) => void;
  reactions?: Array<{ userId: string; emoji: string; type: string }>;
}

export function MessageBubble({
  messageId,
  content,
  createdAt,
  sender,
  isCurrentUser,
  isRead,
  showAvatar = true,
  isGrouped = false,
  files,
  messageType = 'TEXT',
  onReply,
  onForward,
  onReact,
  reactions = [],
}: MessageBubbleProps) {
  const [showControls, setShowControls] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionPickerPlacement, setReactionPickerPlacement] = useState<
    'above-trigger' | 'center'
  >('above-trigger');
  const [reactionPickerPosition, setReactionPickerPosition] = useState({
    top: 0,
    left: 0,
  });
  const messageRef = useRef<HTMLDivElement>(null);

  const actionContext: MessageActionContext = {
    content,
    sender,
    createdAt,
    files,
    messageType,
  };

  const handleReaction = (emoji: string, type: string) => {
    onReact?.(messageId, emoji, type);
  };

  const handleReactionButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReactionPickerPlacement('above-trigger');
    const rect = e.currentTarget.getBoundingClientRect();
    setReactionPickerPosition({
      top: rect.top,
      left: rect.left + rect.width / 2,
    });
    setShowReactionPicker(!showReactionPicker);
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReply?.(actionContext);
  };

  const handleForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    onForward?.(actionContext);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showReactionPicker &&
        !messageRef.current?.contains(event.target as Node)
      ) {
        setShowReactionPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showReactionPicker]);

  const groupedReactions = reactions.reduce(
    (acc, reaction) => {
      const key = reaction.type;
      if (!acc[key]) {
        acc[key] = { emoji: reaction.emoji, count: 0, users: [] };
      }
      acc[key].count++;
      acc[key].users.push(reaction.userId);
      return acc;
    },
    {} as Record<string, { emoji: string; count: number; users: string[] }>
  );

  const controlButtonClass =
    'h-7 w-7 rounded-full border border-border bg-background shadow-sm flex items-center justify-center text-muted-foreground transition-all hover:scale-105 hover:shadow-md';

  return (
    <div
      ref={messageRef}
      className={cn(
        'animate-in slide-in-from-bottom-2 group flex gap-2.5 duration-300 sm:gap-3',
        isCurrentUser && 'flex-row-reverse',
        isGrouped ? 'mt-0.5' : 'mt-1'
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        setShowControls(false);
        setShowReactionPicker(false);
      }}
    >
      {showAvatar ? (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={sender.avatar} />
          <AvatarFallback>{sender.fullnames?.[0]}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8 shrink-0" aria-hidden />
      )}

      <div
        className={cn(
          'relative flex min-w-0 max-w-[min(85vw,28rem)] flex-col gap-0 sm:max-w-[min(72%,32rem)]',
          isCurrentUser && 'items-end'
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-3 py-2 shadow-sm transition-shadow duration-200',
            'hover:shadow-md',
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-tr-md'
              : 'bg-accent rounded-tl-md'
          )}
        >
          {content && content !== 'Shared files' && (
            <p className="wrap-break-word text-[15px] leading-relaxed">
              {content}
            </p>
          )}

          <FileDisplay
            files={files || []}
            messageType={messageType}
            isCurrentUser={isCurrentUser}
          />
        </div>

        {Object.keys(groupedReactions).length > 0 && (
          <div
            className={cn(
              'mt-1 flex flex-wrap gap-1',
              isCurrentUser && 'justify-end'
            )}
          >
            {Object.entries(groupedReactions).map(([type, reaction]) => (
              <button
                key={type}
                type="button"
                className="border-border/50 bg-muted hover:bg-muted/80 flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition-colors"
                onClick={() => onReact?.(messageId, reaction.emoji, type)}
              >
                <span>{reaction.emoji}</span>
                <span className="text-muted-foreground">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Desktop: hover toolbar */}
        <div
          className={cn(
            'absolute -top-1 z-10 hidden gap-1 md:flex',
            showControls ? 'opacity-100' : 'pointer-events-none opacity-0',
            isCurrentUser ? '-left-22' : '-right-22'
          )}
        >
          <button
            type="button"
            onClick={handleReactionButtonClick}
            className={controlButtonClass}
            title="React"
          >
            <Smile className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleReply}
            className={controlButtonClass}
            title="Reply"
          >
            <Reply className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleForward}
            className={controlButtonClass}
            title="Forward"
          >
            <Forward className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mobile / touch: actions menu */}
        <div
          className={cn(
            'mt-1 flex justify-end md:hidden',
            isCurrentUser ? '' : 'justify-start'
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground rounded-full p-1"
                aria-label="Message actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isCurrentUser ? 'end' : 'start'}
              className="w-44"
            >
              <DropdownMenuItem
                onSelect={() => {
                  setReactionPickerPlacement('center');
                  setReactionPickerPosition({
                    top: window.innerHeight / 2,
                    left: window.innerWidth / 2,
                  });
                  setShowReactionPicker(true);
                }}
              >
                <Smile className="mr-2 h-4 w-4" />
                React
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onReply?.(actionContext)}>
                <Reply className="mr-2 h-4 w-4" />
                Reply
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onForward?.(actionContext)}>
                <Forward className="mr-2 h-4 w-4" />
                Forward
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {showReactionPicker && (
          <ReactionPicker
            onSelect={handleReaction}
            onClose={() => setShowReactionPicker(false)}
            position={reactionPickerPosition}
            placement={reactionPickerPlacement}
          />
        )}

        <div
          className={cn(
            'text-muted-foreground flex items-center gap-1 px-1 text-[10px]',
            'opacity-70 md:opacity-0 md:transition-opacity md:duration-200 md:group-hover:opacity-100'
          )}
        >
          <span>{format(new Date(createdAt), 'HH:mm')}</span>
          {isCurrentUser && (
            <span
              className="flex items-center"
              aria-label={isRead ? 'Read' : 'Sent'}
            >
              {isRead ? (
                <CheckCheck className="h-3 w-3 text-blue-400" />
              ) : (
                <Check className="h-3 w-3 opacity-80" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
