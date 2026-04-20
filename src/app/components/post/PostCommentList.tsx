'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Heart, Reply, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/app/components/ui/utils';
import type { PostApiType } from '@/services/post';

type Comment = PostApiType['comments'][number];

interface PostCommentListProps {
  comments: Comment[];
  totalCount: number;
  limit?: number;
  onUserClick?: (userId: string) => void;
  onViewAll?: () => void;
  showActions?: boolean;
  className?: string;
}

export function PostCommentList({
  comments,
  totalCount,
  limit,
  onUserClick,
  onViewAll,
  showActions = false,
  className,
}: PostCommentListProps) {
  const visible = limit ? comments.slice(0, limit) : comments;
  const hiddenCount = totalCount - visible.length;

  if (totalCount === 0) {
    return (
      <p className={cn('py-6 text-center text-sm text-muted-foreground/50 italic', className)}>
        No comments yet. Be the first.
      </p>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {visible.map(comment => (
        <div key={comment._id} className="flex gap-2.5 group/comment">
          <Avatar
            className="h-7 w-7 shrink-0 mt-0.5 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all"
            onClick={() => onUserClick?.(comment.author._id)}
          >
            <AvatarImage src={comment.author.avatar} alt={comment.author.fullnames} />
            <AvatarFallback className="text-[10px]">{comment.author.fullnames[0]}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="inline-block max-w-full rounded-2xl rounded-tl-sm bg-muted/40 px-3.5 py-2.5">
              <button
                className="text-xs font-semibold text-foreground/90 hover:text-primary transition-colors mb-0.5 block"
                onClick={() => onUserClick?.(comment.author._id)}
              >
                {comment.author.fullnames}
              </button>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap wrap-break-word">
                {comment.content}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-1 px-1">
              <span className="text-[10px] text-muted-foreground/40 font-medium">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              {showActions && (
                <>
                  <button className={cn(
                    'text-[10px] font-semibold text-muted-foreground/50 hover:text-rose-500 transition-colors',
                    'flex items-center gap-1 opacity-0 group-hover/comment:opacity-100'
                  )}>
                    <Heart className="h-3 w-3" /> Like
                  </button>
                  <button className={cn(
                    'text-[10px] font-semibold text-muted-foreground/50 hover:text-primary transition-colors',
                    'flex items-center gap-1 opacity-0 group-hover/comment:opacity-100'
                  )}>
                    <Reply className="h-3 w-3" /> Reply
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      {hiddenCount > 0 && onViewAll && (
        <button
          onClick={onViewAll}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary/70 hover:text-primary transition-colors pl-9"
        >
          <ChevronDown className="h-3.5 w-3.5" />
          View {hiddenCount} more {hiddenCount === 1 ? 'comment' : 'comments'}
        </button>
      )}
    </div>
  );
}
