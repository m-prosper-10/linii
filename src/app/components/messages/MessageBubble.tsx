'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { cn } from '@/app/components/ui/utils';
import { User } from '@/services/auth';
import { Check, CheckCheck } from 'lucide-react';
import { FileDisplay } from './FileDisplay';
import { ReactionPicker } from './ReactionPicker';
import { Reply, Forward, Smile } from 'lucide-react';

import { format } from 'date-fns';

interface MessageBubbleProps {
  content: string;
  createdAt: string;
  sender: User;
  isCurrentUser: boolean;
  isRead: boolean;
  showAvatar?: boolean;
  isGrouped?: boolean;
  files?: string[];
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
  onReply?: (message: MessageData) => void;
  onForward?: (message: MessageData) => void;
  onReact?: (messageId: string, emoji: string, type: string) => void;
  reactions?: Array<{ userId: string; emoji: string; type: string }>;
}

interface MessageData {
  content: string;
  sender: User;
  createdAt: string;
  files?: string[];
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
}

export function MessageBubble({
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
  const [reactionPickerPosition, setReactionPickerPosition] = useState({
    top: 0,
    left: 0,
  });
  const messageRef = useRef<HTMLDivElement>(null);

  const handleReaction = (emoji: string, type: string) => {
    onReact?.(sender._id, emoji, type);
  };

  const handleReactionButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setReactionPickerPosition({
      top: rect.top,
      left: rect.left + rect.width / 2,
    });
    setShowReactionPicker(!showReactionPicker);
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReply?.({
      content,
      sender,
      createdAt,
      files,
      messageType,
    });
  };

  const handleForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    onForward?.({
      content,
      sender,
      createdAt,
      files,
      messageType,
    });
  };

  // Close reaction picker when clicking outside
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

  // Group reactions by type
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
  return (
    <div
      ref={messageRef}
      className={cn(
        'animate-in slide-in-from-bottom-2 group flex gap-3 duration-300',
        isCurrentUser && 'flex-row-reverse',
        isGrouped && 'mt-0'
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        setShowControls(false);
        setShowReactionPicker(false);
      }}
    >
      {/* Avatar - only show if not grouped */}
      {showAvatar ? (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={sender.avatar} />
          <AvatarFallback>{sender.fullnames?.[0]}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8 shrink-0" />
      )}

      {/* Message Content */}
      <div
        className={cn(
          'relative flex max-w-[70%] flex-col gap-0',
          isCurrentUser && 'items-end'
        )}
      >
        <div
          className={cn(
            'rounded-md px-2 py-2 shadow-sm transition-all duration-200',
            'hover:shadow-md',
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-tr-md'
              : 'bg-accent rounded-tl-md'
          )}
        >
          {/* Message text content */}
          {content && content !== 'Shared files' && (
            <p className="wrap-break-word text-[15px] leading-relaxed">
              {content}
            </p>
          )}

          {/* File attachments */}
          <FileDisplay
            files={files || []}
            messageType={messageType}
            isCurrentUser={isCurrentUser}
          />
        </div>

        {/* Reactions */}
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
                className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors',
                  'bg-muted hover:bg-muted/80 border-border/50 border'
                )}
                onClick={() => onReact?.(sender._id, reaction.emoji, type)}
              >
                <span>{reaction.emoji}</span>
                <span className="text-muted-foreground">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Message Controls */}
        <div
          className={cn(
            'absolute -top-2 flex gap-1 transition-opacity duration-200',
            showControls ? 'opacity-100' : 'pointer-events-none opacity-0',
            isCurrentUser ? '-left-20' : '-right-20'
          )}
        >
          <button
            onClick={handleReactionButtonClick}
            className={cn(
              'h-6 w-6 rounded-full p-0 transition-all duration-200',
              'bg-background border-border border shadow-sm hover:shadow-md',
              'flex items-center justify-center hover:scale-110'
            )}
            title="React"
          >
            <Smile className="text-muted-foreground h-3 w-3" />
          </button>

          <button
            onClick={handleReply}
            className={cn(
              'h-6 w-6 rounded-full p-0 transition-all duration-200',
              'bg-background border-border border shadow-sm hover:shadow-md',
              'flex items-center justify-center hover:scale-110'
            )}
            title="Reply"
          >
            <Reply className="text-muted-foreground h-3 w-3" />
          </button>

          <button
            onClick={handleForward}
            className={cn(
              'h-6 w-6 rounded-full p-0 transition-all duration-200',
              'bg-background border-border border shadow-sm hover:shadow-md',
              'flex items-center justify-center hover:scale-110'
            )}
            title="Forward"
          >
            <Forward className="text-muted-foreground h-3 w-3" />
          </button>
        </div>

        {/* Reaction Picker */}
        {showReactionPicker && (
          <ReactionPicker
            onSelect={handleReaction}
            onClose={() => setShowReactionPicker(false)}
            position={reactionPickerPosition}
          />
        )}

        {/* Timestamp and Status */}
        <div
          className={cn(
            'text-muted-foreground flex items-center gap-1 px-2 text-[10px]',
            'opacity-0 transition-opacity duration-200 group-hover:opacity-100'
          )}
        >
          <span>{format(new Date(createdAt), 'HH:mm')}</span>
          {isCurrentUser && (
            <span className="flex items-center">
              {isRead ? (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
