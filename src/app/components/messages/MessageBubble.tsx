'use client';

import { useState, useRef } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { cn } from '@/app/components/ui/utils';
import { User } from '@/services/auth';
import { Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import type { QuotedMessagePreview } from '@/services/chat';
import { FileDisplay } from './FileDisplay';
import { MessageBubbleToolbar } from './MessageBubbleToolbar';
import { MessageReplyQuote } from './MessageReplyQuote';
import type { MessageActionContext } from './types';
import { getUserInitial } from '@/lib/user';

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
  replyTo?: QuotedMessagePreview;
  onJumpToQuotedMessage?: (messageId: string) => void;
  onReply?: (message: MessageActionContext) => void;
  onForward?: (message: MessageActionContext) => void;
  onReact?: (messageId: string, emoji: string, type: string) => void;
  onDelete?: (messageId: string) => void | Promise<void>;
  onReport?: (messageId: string) => void | Promise<void>;
  reactions?: Array<{
    userId: string;
    emoji: string;
    createdAt: string;
    user?: {
      _id: string;
      fullnames: string;
      username: string;
      email: string;
    };
  }>;
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
  replyTo,
  onJumpToQuotedMessage,
  onReply,
  onForward,
  onReact,
  onDelete,
  onReport,
  reactions = [],
}: MessageBubbleProps) {
  const [reactionPickerOpen, setReactionPickerOpen] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  const actionContext: MessageActionContext = {
    messageId,
    content,
    sender,
    createdAt,
    files,
    messageType,
  };

  const groupedReactions = reactions.reduce(
    (acc, reaction) => {
      const key = reaction.emoji;
      if (!acc[key]) {
        acc[key] = { emoji: reaction.emoji, count: 0, users: [] };
      }
      acc[key].count++;
      acc[key].users.push(reaction.userId);
      return acc;
    },
    {} as Record<string, { emoji: string; count: number; users: string[] }>
  );

  const copyText =
    content && content !== 'Shared files' ? content : '';

  return (
    <div
      ref={messageRef}
      data-message-id={messageId}
      className={cn(
        'animate-in slide-in-from-bottom-2 flex gap-2.5 duration-300 sm:gap-3',
        isCurrentUser && 'flex-row-reverse',
        isGrouped ? 'mt-0.5' : 'mt-1'
      )}
      onMouseLeave={() => setReactionPickerOpen(false)}
    >
      {showAvatar ? (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={sender.avatar} />
          <AvatarFallback>{getUserInitial(sender)}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8 shrink-0" aria-hidden />
      )}

      <div
        className={cn(
          'group flex min-w-0 max-w-[min(85vw,28rem)] flex-col gap-0 sm:max-w-[min(72%,32rem)]',
          isCurrentUser && 'items-end'
        )}
      >
        {/* Row: bubble + toolbar on one line, vertically centered (Messenger / IG style) */}
        <div
          className={cn(
            'flex w-fit max-w-full items-center gap-1.5 sm:gap-2',
            isCurrentUser && 'flex-row-reverse'
          )}
        >
          <div
            className={cn(
              'min-w-0 rounded-2xl px-3 py-2 shadow-sm transition-shadow duration-200',
              'hover:shadow-md',
              isCurrentUser
                ? 'rounded-tr-md bg-primary text-primary-foreground'
                : 'rounded-tl-md bg-accent'
            )}
          >
            {replyTo && (
              <MessageReplyQuote
                quote={replyTo}
                isCurrentUser={isCurrentUser}
                onJumpToOriginal={onJumpToQuotedMessage}
              />
            )}
            {content && content !== 'Shared files' && (
              <p className="wrap-break-word text-[15px] leading-relaxed">{content}</p>
            )}

            <FileDisplay
              files={files || []}
              messageType={messageType}
              isCurrentUser={isCurrentUser}
            />
          </div>

          <MessageBubbleToolbar
            messageId={messageId}
            isCurrentUser={isCurrentUser}
            copyText={copyText}
            actionContext={actionContext}
            messageRootRef={messageRef}
            reactionPickerOpen={reactionPickerOpen}
            onReactionPickerOpenChange={setReactionPickerOpen}
            onReply={onReply}
            onForward={onForward}
            onReact={onReact}
            onDelete={onDelete}
            onReport={onReport}
          />
        </div>

        {Object.keys(groupedReactions).length > 0 && (
          <div
            className={cn(
              'mt-1 flex flex-wrap gap-1',
              isCurrentUser && 'justify-end'
            )}
          >
            {Object.entries(groupedReactions).map(([emoji, reaction]) => (
              <button
                key={emoji}
                type="button"
                className="border-border/50 bg-muted hover:bg-muted/80 flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition-colors"
                onClick={() => onReact?.(messageId, emoji, 'happy')}
              >
                <span>{emoji}</span>
                <span className="text-muted-foreground">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        <div
          className={cn(
            'text-muted-foreground flex items-center gap-1 px-1 text-[10px]',
            'opacity-70 md:opacity-0 md:transition-opacity md:duration-200 md:group-hover:opacity-100'
          )}
        >
          <span>{format(new Date(createdAt), 'HH:mm')}</span>
          {isCurrentUser && (
            <span className="flex items-center" aria-label={isRead ? 'Read' : 'Sent'}>
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
