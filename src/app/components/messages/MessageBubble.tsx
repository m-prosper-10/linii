"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { cn } from '@/app/components/ui/utils';
import { User } from '@/data/mockData';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  sender: User;
  isCurrentUser: boolean;
  isRead: boolean;
  showAvatar?: boolean;
  isGrouped?: boolean;
}

export function MessageBubble({
  content,
  timestamp,
  sender,
  isCurrentUser,
  isRead,
  showAvatar = true,
  isGrouped = false
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex gap-3 group animate-in slide-in-from-bottom-2 duration-300',
        isCurrentUser && 'flex-row-reverse',
        isGrouped && 'mt-1'
      )}
    >
      {/* Avatar - only show if not grouped */}
      {showAvatar ? (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={sender.avatar} />
          <AvatarFallback>{sender.displayName[0]}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8 flex-shrink-0" />
      )}

      {/* Message Content */}
      <div className={cn('flex flex-col gap-1 max-w-[70%]', isCurrentUser && 'items-end')}>
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200',
            'hover:shadow-md',
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-tr-md'
              : 'bg-accent rounded-tl-md'
          )}
        >
          <p className="text-[15px] leading-relaxed break-words">{content}</p>
        </div>

        {/* Timestamp and Status */}
        <div className={cn(
          'flex items-center gap-1 px-2 text-xs text-muted-foreground',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
        )}>
          <span>{timestamp}</span>
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
