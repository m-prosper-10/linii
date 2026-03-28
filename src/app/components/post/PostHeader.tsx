'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Copy, Flag, Loader2, MoreHorizontal, Trash2, CheckCircle2, Globe, Users, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <span 
              className="font-semibold text-sm hover:underline truncate underline-offset-2"
              onClick={(e) => {
                e.stopPropagation();
                onUserClick?.(post.author._id);
              }}
            >
              {post.author.fullnames}
            </span>
            {post.author.verified && (
              <CheckCircle2 className="h-3.5 w-3.5 fill-primary text-background shrink-0" />
            )}
            
            {post.mentions && post.mentions.length > 0 && (
              <>
                <span className="text-muted-foreground text-xs font-normal">and</span>
                {post.mentions.length === 1 ? (
                  <span 
                    className="font-semibold text-sm hover:underline truncate underline-offset-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      const mention = post.mentions![0];
                      if (typeof mention !== 'string') {
                        onUserClick?.(mention._id);
                      }
                    }}
                  >
                    {typeof post.mentions[0] !== 'string' ? post.mentions[0].fullnames : ''}
                  </span>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-semibold text-sm hover:underline truncate underline-offset-2 cursor-pointer">
                          {post.mentions.length} others
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="p-2 space-y-1 rounded-xl shadow-xl border-border/50">
                        {post.mentions.filter((m): m is Exclude<typeof m, string> => typeof m !== 'string').map((mention) => (
                          <div key={mention._id} className="flex items-center gap-2 px-1 py-0.5">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={mention.avatar} />
                              <AvatarFallback className="text-[8px]">{mention.fullnames[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] font-bold">{mention.fullnames}</span>
                          </div>
                        ))}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium opacity-70">
            <span>@{post.author.username}</span>
            <span>·</span>
            <span>{timeAgo}</span>
            <span>·</span>
            {post.visibility === 'PUBLIC' && <Globe className="h-3 w-3" />}
            {post.visibility === 'FRIENDS' && <Users className="h-3 w-3" />}
            {(post.visibility === 'PRIVATE' || post.visibility === 'CUSTOM') && <Lock className="h-3 w-3" />}
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
