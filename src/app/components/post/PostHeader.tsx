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
import {
  Copy,
  Flag,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Globe,
  Users,
  Lock,
  CheckCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/components/ui/tooltip';
import { cn } from '@/app/components/ui/utils';
import type { PostApiType } from '@/services/post';
import { useRouter } from 'next/navigation';
import { getUserDisplayName, getUserInitial, isUserVerified } from '@/lib/user';

interface PostHeaderProps {
  post: PostApiType;
  currentUserId?: string;
  /** Compact variant used inside modal (no avatar on the left, smaller) */
  variant?: 'feed' | 'modal';
  onUserClick?: (userId: string) => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  onEdit?: () => void;
}

export function PostHeader({
  post,
  currentUserId,
  variant = 'feed',
  onUserClick,
  onDelete,
  isDeleting = false,
  onEdit,
}: PostHeaderProps) {
  const isOwner = currentUserId === post.author._id;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });
  const router = useRouter();
  const authorName = getUserDisplayName(post.author);
  const authorVerified = isUserVerified(post.author);
  return (
    <div className="flex items-center justify-between gap-3">
      <div
        className="flex min-w-0 cursor-pointer items-center gap-3"
        onClick={e => {
          e.stopPropagation();
          onUserClick?.(post.author._id);
        }}
      >
        <div className="border-background flex items-center rounded-full border-2">
          <Avatar
            className={cn(
              variant === 'feed' ? 'h-11 w-11' : 'h-10 w-10',
              'ring-background z-20 shrink-0 ring-2'
            )}
          >
            <AvatarImage src={post.author.avatar} alt={authorName} />
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
              {getUserInitial(post.author)}
            </AvatarFallback>
          </Avatar>

          {post.mentions && post.mentions.length > 0 && (
            <div className="z-10 -ml-4 flex">
              {post.mentions
                .slice(0, 2)
                .filter(
                  (m): m is Exclude<typeof m, string> => typeof m !== 'string'
                )
                .map((mention, i) => (
                  (() => {
                    const mentionName = getUserDisplayName(mention);
                    return (
                  <Avatar
                    key={mention._id}
                    className={cn(
                      variant === 'feed' ? 'h-9 w-9' : 'h-8 w-8',
                      'ring-background -ml-1 shrink-0 ring-2',
                      i === 0 ? 'z-10' : 'z-0'
                    )}
                  >
                    <AvatarImage src={mention.avatar} alt={mentionName} />
                    <AvatarFallback className="text-[10px]">
                      {getUserInitial(mention)}
                    </AvatarFallback>
                  </Avatar>
                    );
                  })()
                ))}
            </div>
          )}
        </div>

        {/**  */}
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="truncate text-sm font-semibold underline-offset-2 hover:underline"
              onClick={e => {
                e.stopPropagation();
                onUserClick?.(post.author._id);
              }}
            >
              {authorName}
            </span>
            {authorVerified && (
              <>
                <span className="text-muted-foreground text-xs font-normal">
                  ·
                </span>
                <CheckCircle className="fill-primary-foreground text-primary h-3.5 w-3.5 shrink-0" />
              </>
            )}

            {post.mentions && post.mentions.length > 0 && (
              <>
                <span className="text-muted-foreground text-xs font-normal">
                  and
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer truncate text-sm font-semibold underline-offset-2 hover:underline">
                        {post.mentions.length}{' '}
                        {post.mentions.length === 1 ? 'other' : 'others'}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="border-border/50 bg-primary text-primary-foreground space-y-2 rounded-md p-3 shadow-2xl backdrop-blur-lg">
                      <div className="text-muted-foreground/60 mb-1 px-1 text-[10px] font-bold uppercase tracking-widest">
                        Collaborators
                      </div>
                      {post.mentions
                        .filter(
                          (m): m is Exclude<typeof m, string> =>
                            typeof m !== 'string'
                        )
                        .map(mention => (
                          (() => {
                            const mentionName = getUserDisplayName(mention);
                            return (
                          <div
                            key={mention._id}
                            className="hover:bg-primary-foreground/10 flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1 transition-colors"
                            onClick={e => {
                              e.stopPropagation();
                              router.push(`/profile/${mention._id}`);
                            }}
                          >
                            <Avatar className="ring-border/10 h-6 w-6 ring-1">
                              <AvatarImage src={mention.avatar} />
                              <AvatarFallback className="text-[10px] font-bold">
                                {getUserInitial(mention)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold leading-none">
                                {mentionName}
                              </span>
                              <span className="text-muted-foreground/70 text-[9px] leading-none">
                                @{mention.username || 'collab'}
                              </span>
                            </div>
                          </div>
                            );
                          })()
                        ))}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium opacity-70">
            <span>@{post.author.username}</span>
            <span>·</span>
            <span>{timeAgo}</span>
            <span>·</span>
            {post.visibility === 'PUBLIC' && <Globe className="h-3 w-3" />}
            {post.visibility === 'FRIENDS' && <Users className="h-3 w-3" />}
            {(post.visibility === 'PRIVATE' ||
              post.visibility === 'CUSTOM') && <Lock className="h-3 w-3" />}
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
          <DropdownMenuItem
            onSelect={() => {
              navigator.clipboard.writeText(
                window.location.origin + '/post/' + post._id
              );
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Flag className="mr-2 h-4 w-4" />
            Report
          </DropdownMenuItem>
          {isOwner && onEdit && (
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit post
            </DropdownMenuItem>
          )}
          {isOwner && onDelete && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={onDelete}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting post...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete post
                </>
              )}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
