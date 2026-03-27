'use client';

import { useState } from 'react';
import { PostService } from '@/services/post';
import type { PostApiType } from '@/services/post';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { PostContent } from '@/app/components/post/PostContent';
import { PostHeader } from '@/app/components/post/PostHeader';
import { PostActions } from '@/app/components/post/PostActions';
import { PostCommentList } from '@/app/components/post/PostCommentList';
import { PostCommentInput } from '@/app/components/post/PostCommentInput';

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
    if (!confirm('Delete this post?')) return;
    try {
      setIsDeleting(true);
      await PostService.deletePost(post._id);
      toast.success('Post deleted');
      onDeleted?.(post._id);
    } catch (_err) {
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
      {/* Header */}
      <PostHeader
        post={post}
        currentUserId={currentUser?._id}
        variant="feed"
        onUserClick={onUserClick}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

      {/* Content (text, tags, poll, media) */}
      <div className="mt-3">
        <PostContent
          post={post}
          onUpdate={setPost}
          onPostClick={() => onPostClick?.(post._id)}
        />
      </div>

      {/* Views count */}
      <div className="text-muted-foreground mb-2 mt-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider opacity-60">
        <span>{post.views.toLocaleString()} views</span>
      </div>

      {/* Actions */}
      <PostActions
        post={post}
        onToggleComments={() => setShowComments(v => !v)}
        showComments={showComments}
        commentCount={commentCount}
      />

      {/* Inline comments panel */}
      {showComments && (
        <div
          className="border-border mt-4 border-t pt-4 space-y-4"
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
