'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Heart, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { PostApiType } from '@/services/post';

type Comment = PostApiType['comments'][number];

interface PostCommentListProps {
  comments: Comment[];
  totalCount: number;
  /** Max comments to show before "view all". Undefined = show all */
  limit?: number;
  onUserClick?: (userId: string) => void;
  onViewAll?: () => void;
  /** Show Like / Reply action buttons per comment */
  showActions?: boolean;
  /** Additional class for the container */
  className?: string;
}

export function PostCommentList({
  comments,
  totalCount,
  limit,
  onUserClick,
  onViewAll,
  showActions = false,
  className = '',
}: PostCommentListProps) {
  const visible = limit ? comments.slice(0, limit) : comments;

  if (totalCount === 0) {
    return (
      <div className={`text-muted-foreground py-6 text-center text-sm italic ${className}`}>
        No comments yet.
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {visible.map(comment => (
        <div key={comment._id} className="flex gap-3">
          <Avatar
            className="h-8 w-8 shrink-0 cursor-pointer"
            onClick={() => onUserClick?.(comment.author._id)}
          >
            <AvatarImage src={comment.author.avatar} alt={comment.author.fullnames} />
            <AvatarFallback>{comment.author.fullnames[0]}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-2">
              <span
                className="cursor-pointer text-xs font-semibold hover:underline"
                onClick={() => onUserClick?.(comment.author._id)}
              >
                {comment.author.fullnames}
              </span>
              <span className="text-muted-foreground text-[10px]">
                {formatDistanceToNow(new Date(comment.createdAt))} ago
              </span>
            </div>
            <p className="text-foreground/80 whitespace-pre-wrap text-sm leading-relaxed">
              {comment.content}
            </p>
            {showActions && (
              <div className="mt-1.5 flex items-center gap-3">
                <button className="text-muted-foreground hover:text-foreground text-[10px] font-medium transition-colors flex items-center gap-1">
                  <Heart className="h-3 w-3" /> Like
                </button>
                <button className="text-muted-foreground hover:text-foreground text-[10px] font-medium transition-colors flex items-center gap-1">
                  <Reply className="h-3 w-3" /> Reply
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {limit && totalCount > limit && onViewAll && (
        <Button
          variant="link"
          className="text-primary h-auto p-0 text-xs font-semibold opacity-80 hover:no-underline hover:opacity-100"
          onClick={onViewAll}
        >
          View all {totalCount} comments
        </Button>
      )}
    </div>
  );
}
