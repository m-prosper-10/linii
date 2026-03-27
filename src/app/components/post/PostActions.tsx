'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Bookmark, Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { PostService } from '@/services/post';
import type { PostApiType } from '@/services/post';
import { toast } from 'sonner';

interface PostActionsProps {
  post: PostApiType;
  /** If provided, comment button will toggle inline comments. Otherwise opens detail. */
  onToggleComments?: () => void;
  showComments?: boolean;
  commentCount: number;
  /** Used in modal where we show likes count separately */
  showLikesCount?: boolean;
}

export function PostActions({
  post,
  onToggleComments,
  showComments = false,
  commentCount,
  showLikesCount = false,
}: PostActionsProps) {
  const [isLiked, setIsLiked] = useState(post.userReaction?.reactionType === 'LIKE');
  const [likes, setLikes] = useState(post.likesCount);
  const [isReposted, setIsReposted] = useState(post.userShared ?? false);
  const [reposts, setReposts] = useState(post.sharesCount);
  const [isSaved, setIsSaved] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const prev = isLiked;
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    try {
      await PostService.toggleReaction(post._id, 'LIKE');
    } catch (_err) {
      setIsLiked(prev);
      setLikes(prev ? likes : likes - 1);
      toast.error('Failed to update like');
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const prev = isReposted;
    setIsReposted(!isReposted);
    setReposts(isReposted ? reposts - 1 : reposts + 1);
    try {
      await PostService.toggleRepost(post._id);
    } catch (_err) {
      setIsReposted(prev);
      setReposts(prev ? reposts : reposts - 1);
      toast.error('Failed to update repost');
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        {/* Like */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 gap-1.5 transition-colors ${
            isLiked ? 'bg-red-500/5 text-red-500' : 'hover:bg-red-500/10 hover:text-red-500'
          }`}
          onClick={handleLike}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{likes}</span>
        </Button>

        {/* Comment */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 gap-1.5 transition-colors hover:bg-blue-500/10 hover:text-blue-500 ${
            showComments ? 'bg-blue-500/5 text-blue-500' : ''
          }`}
          onClick={e => {
            e.stopPropagation();
            onToggleComments?.();
          }}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-medium">{commentCount}</span>
        </Button>

        {/* Repost */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 gap-1.5 transition-colors hover:bg-green-500/10 hover:text-green-500 ${
            isReposted ? 'bg-green-500/5 text-green-500' : ''
          }`}
          onClick={handleRepost}
        >
          <Repeat2 className="h-4 w-4" />
          <span className="text-sm font-medium">{reposts}</span>
        </Button>

        {/* Save */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 gap-1.5 transition-colors hover:bg-yellow-500/10 hover:text-yellow-500 ${
            isSaved ? 'bg-yellow-500/5 text-yellow-500' : ''
          }`}
          onClick={handleSave}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {showLikesCount && (
        <span className="text-xs font-semibold text-muted-foreground">{likes} likes</span>
      )}
    </div>
  );
}
