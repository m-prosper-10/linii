'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { 
  Heart, 
  Repeat2, 
  Bookmark, 
  X, 
  ArrowLeft
} from 'lucide-react';
import { PostService, PostApiType } from '@/services/post';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface PostDetailModalProps {
  postId: string;
  onClose: () => void;
  onDeleted?: (postId: string) => void;
}

export function PostDetailModal({ postId, onClose, onDeleted }: PostDetailModalProps) {
  const [post, setPost] = useState<PostApiType | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const { currentUser } = useApp();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await PostService.getPost(postId);
      setPost(data);
    } catch (error) {
      toast.error('Failed to load post details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    const isLiked = post.userReaction?.reactionType === 'LIKE';
    
    // Optimistic update
    setPost({
      ...post,
      likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1,
      userReaction: isLiked ? undefined : { reactionType: 'LIKE' }
    });

    try {
      await PostService.toggleReaction(post._id, 'LIKE');
    } catch (error) {
      // Rollback
      fetchPost();
      toast.error('Failed to update like');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !post) return;
    const content = newComment.trim();
    setNewComment('');

    try {
      await PostService.addComment({ postId: post._id, content });
      fetchPost(); // Refresh to show new comment
      toast.success('Comment added');
    } catch (error) {
      setNewComment(content);
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await PostService.deletePost(post._id);
      toast.success('Post deleted');
      onDeleted?.(post._id);
      onClose();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-0 md:p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-6xl flex flex-col md:flex-row min-h-[500px] max-h-full md:max-h-[90vh] rounded-none md:rounded-xl overflow-hidden shadow-2xl relative">
        
        {/* Mobile Close Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 left-4 z-10 md:hidden bg-black/20 backdrop-blur-md text-white rounded-full"
          onClick={onClose}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        {/* Desktop Close Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 z-10 hidden md:flex text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Media Side (Left) */}
        <div className="flex-[1.5] bg-black flex items-center justify-center min-h-[300px]">
          {post.media && post.media.length > 0 ? (
            <div className="w-full h-full">
              {post.media[0].type === 'VIDEO' ? (
                <video 
                  src={post.media[0].url} 
                  controls 
                  className="w-full h-full object-contain"
                />
              ) : (
                <img 
                  src={post.media[0].url} 
                  alt="Post content" 
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          ) : (
            <div className="text-muted-foreground flex flex-col items-center gap-2">
               <span className="text-lg font-medium">Text Post</span>
               <p className="px-8 text-center text-sm opacity-60">This post contains only text content.</p>
            </div>
          )}
        </div>

        {/* Info Side (Right) */}
        <div className="flex-1 flex flex-col bg-card border-l border-border min-w-0">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatar} alt={post.author.fullnames} />
                <AvatarFallback>{post.author.fullnames[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-sm hover:underline cursor-pointer">
                  {post.author.fullnames}
                </span>
                <span className="text-muted-foreground text-xs">
                  @{post.author.username}
                </span>
              </div>
            </div>
            
            {currentUser?._id === post.author._id && (
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Content & Comments (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {/* Post Content */}
            <div className="mb-6">
              <p className="whitespace-pre-wrap wrap-break-word text-sm md:text-base mb-3">
                {post.content}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider mb-4">
                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                <span>·</span>
                <span>{post.views} views</span>
              </div>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-primary hover:underline cursor-pointer text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-border my-4" />

            {/* Comments List */}
            <div className="space-y-6 pb-4">
              <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-tight">Comments ({post.commentsCount})</h3>
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={comment.author.avatar} alt={comment.author.fullnames} />
                      <AvatarFallback>{comment.author.fullnames[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-xs">{comment.author.fullnames}</span>
                        <span className="text-muted-foreground text-[10px]">
                          {formatDistanceToNow(new Date(comment.createdAt))}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors">Like</button>
                        <button className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors">Reply</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No comments yet.
                </div>
              )}
            </div>
          </div>

          {/* Footer (Actions & Input) */}
          <div className="p-4 border-t border-border bg-card shrink-0">
            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleLike}>
                  <Heart className={`h-5 w-5 ${post.userReaction?.reactionType === 'LIKE' ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Repeat2 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Bookmark className="h-5 w-5" />
                </Button>
              </div>
              <span className="text-xs font-semibold">{post.likesCount} likes</span>
            </div>

            {/* Comment Input */}
            <div className="flex gap-3 items-end">
              <Avatar className="h-8 w-8 shrink-0 mb-1">
                <AvatarImage src={currentUser?.avatar} alt={currentUser?.fullnames} />
                <AvatarFallback>{currentUser?.fullnames?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[40px] max-h-[120px] resize-none text-sm bg-accent/30 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  className="h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  disabled={!newComment.trim()}
                  onClick={handleAddComment}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
