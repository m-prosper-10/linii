'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Copy, Flag, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { PostApiType } from '@/services/post';

interface PostHeaderProps {
  post: PostApiType;
  currentUserId?: string;
  /** Compact variant used inside modal (no avatar on the left, smaller) */
  variant?: 'feed' | 'modal';
  onUserClick?: (userId: string) => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function PostHeader({
  post,
  currentUserId,
  variant = 'feed',
  onUserClick,
  onDelete,
  isDeleting = false,
}: PostHeaderProps) {
  const isOwner = currentUserId === post.author._id;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Left: Avatar + Author info */}
      <div
        className="flex cursor-pointer items-center gap-3 min-w-0"
        onClick={e => {
          e.stopPropagation();
          onUserClick?.(post.author._id);
        }}
      >
        <Avatar className={variant === 'feed' ? 'h-11 w-11 shrink-0' : 'h-10 w-10 shrink-0'}>
          <AvatarImage src={post.author.avatar} alt={post.author.fullnames} />
          <AvatarFallback>{post.author.fullnames[0]}</AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm hover:underline truncate">
              {post.author.fullnames}
            </span>
            {post.author.verified && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] shrink-0">✓</Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <span>@{post.author.username}</span>
            {variant === 'feed' && (
              <>
                <span>·</span>
                <span>{timeAgo}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Options menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" className="h-8 w-8 shrink-0 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
          <DropdownMenuItem onSelect={() => {
            navigator.clipboard.writeText(window.location.origin + '/post/' + post._id);
          }}>
            <Copy className="mr-2 h-4 w-4" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Flag className="mr-2 h-4 w-4" />
            Report
          </DropdownMenuItem>
          {isOwner && onDelete && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={onDelete}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete post
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
