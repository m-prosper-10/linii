'use client';

import { useState } from 'react';
import { PostService } from '@/services/post';
import type { PostApiType } from '@/services/post';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { PostContent } from './PostContent';
import { PostHeader } from './PostHeader';
import { PostActions } from './PostActions';
import { PostCommentList } from './PostCommentList';
import { PostCommentInput } from './PostCommentInput';

interface PostCardProps {
  post: PostApiType;
  onUserClick?: (userId: string) => void;
  onPostClick?: (postId: string) => void;
  onDeleted?: (postId: string) => void;
}

export function PostCard({
  post: initialPost,
  onUserClick,
  onPostClick,
  onDeleted,
}: PostCardProps) {
  const { currentUser } = useApp();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentsCount);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await PostService.deletePost(post._id);
      toast.success('Post deleted');
      onDeleted?.(post._id);
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="border-border bg-card hover:bg-accent/5 cursor-pointer border-b p-4 transition-colors"
      onClick={() => onPostClick?.(post._id)}
    >
      <PostHeader
        post={post}
        currentUserId={currentUser?._id}
        variant="feed"
        onUserClick={onUserClick}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

      <div className="mt-3">
        <PostContent
          post={post}
          onUpdate={setPost}
          onPostClick={() => onPostClick?.(post._id)}
        />
      </div>

      <div className="text-muted-foreground mb-2 mt-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider opacity-60">
        <span>{post.views.toLocaleString()} views</span>
      </div>

      <PostActions
        post={post}
        onToggleComments={() => setShowComments(v => !v)}
        showComments={showComments}
        commentCount={commentCount}
      />

      {showComments && (
        <div
          className="border-border mt-4 space-y-4 border-t pt-4"
          onClick={e => e.stopPropagation()}
        >
          <PostCommentInput
            postId={post._id}
            submitMode="ctrl-enter"
            onCommentAdded={() => setCommentCount(c => c + 1)}
          />
          <PostCommentList
            comments={post.comments || []}
            totalCount={commentCount}
            limit={3}
            onUserClick={onUserClick}
            onViewAll={() => onPostClick?.(post._id)}
          />
        </div>
      )}
    </div>
  );
}
