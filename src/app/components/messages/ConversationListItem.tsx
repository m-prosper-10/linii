'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/app/components/ui/utils';
import { Message } from '@/services/chat';
import { User } from '@/services/auth';
import { Verified } from 'lucide-react';
import { format } from 'date-fns';

interface ConversationListItemProps {
  otherUser: User;
  lastMessage: Message;
  unreadCount: number;
  isSelected: boolean;
  isOnline?: boolean;
  onClick: () => void;
}

export function ConversationListItem({
  otherUser,
  lastMessage,
  unreadCount,
  isSelected,
  isOnline = true,
  onClick,
}: ConversationListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'border-border cursor-pointer border-b p-4 transition-all duration-200',
        'hover:bg-accent/70 active:scale-[0.99]',
        isSelected && 'bg-accent/50 border-l-primary border-l-4'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar with Online Status */}
        <div className="relative shrink-0">
          <Avatar className="hover:ring-primary/20 h-12 w-12 ring-2 ring-transparent transition-all duration-200">
            <AvatarImage src={otherUser.avatar} />
            <AvatarFallback>{otherUser.fullnames?.[0]}</AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className="border-background absolute bottom-0 right-0 h-3.5 w-3.5 animate-pulse rounded-full border-2 bg-green-500" />
          )}
        </div>

        {/* Conversation Info */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'truncate font-medium transition-colors',
                  unreadCount > 0 && 'text-foreground font-semibold'
                )}
              >
                {otherUser.fullnames}
              </span>
              {otherUser.verified && (
                <Verified className="h-4 w-4 fill-blue-600" />
              )}
            </div>
            <span className="text-muted-foreground ml-2 shrink-0 text-xs">
              {format(new Date(lastMessage.createdAt), 'HH:mm')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <p
              className={cn(
                'flex-1 truncate text-sm',
                unreadCount > 0
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground'
              )}
            >
              {unreadCount > 0
                ? `${unreadCount} new messages`
                : lastMessage.content}
            </p>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground animate-in zoom-in-50 h-5 min-w-5 shrink-0 rounded-full px-1.5">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
