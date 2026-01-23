"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/app/components/ui/utils';
import { Message, User } from '@/data/mockData';

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
  onClick
}: ConversationListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 cursor-pointer transition-all duration-200 border-b border-border',
        'hover:bg-accent/70 active:scale-[0.99]',
        isSelected && 'bg-accent/50 border-l-4 border-l-primary'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar with Online Status */}
        <div className="relative shrink-0">
          <Avatar className="w-12 h-12 ring-2 ring-transparent transition-all duration-200 hover:ring-primary/20">
            <AvatarImage src={otherUser.avatar} />
            <AvatarFallback>{otherUser.displayName[0]}</AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          )}
        </div>

        {/* Conversation Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                'font-medium truncate transition-colors',
                unreadCount > 0 && 'text-foreground font-semibold'
              )}>
                {otherUser.displayName}
              </span>
              {otherUser.verified && (
                <svg className="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <span className="text-xs text-muted-foreground shrink-0 ml-2">
              {lastMessage.timestamp}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <p className={cn(
              'text-sm truncate flex-1',
              unreadCount > 0 
                ? 'text-foreground font-medium' 
                : 'text-muted-foreground'
            )}>
              {lastMessage.content}
            </p>
            {unreadCount > 0 && (
              <Badge className="h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground shrink-0 animate-in zoom-in-50">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
