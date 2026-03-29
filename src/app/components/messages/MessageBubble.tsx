'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { cn } from '@/app/components/ui/utils';
import { User } from '@/services/auth';
import { Check, CheckCheck } from 'lucide-react';

import { format } from 'date-fns';

interface MessageBubbleProps {
  content: string;
  createdAt: string;
  sender: User;
  isCurrentUser: boolean;
  isRead: boolean;
  showAvatar?: boolean;
  isGrouped?: boolean;
}

export function MessageBubble({
  content,
  createdAt,
  sender,
  isCurrentUser,
  isRead,
  showAvatar = true,
  isGrouped = false,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'animate-in slide-in-from-bottom-2 group flex gap-3 duration-300',
        isCurrentUser && 'flex-row-reverse',
        isGrouped && 'mt-0'
      )}
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
          'flex max-w-[70%] flex-col gap-0',
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
          <p className="wrap-break-word text-[15px] leading-relaxed">
            {content}
          </p>
        </div>

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
