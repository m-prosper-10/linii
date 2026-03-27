'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Heart,
  Repeat2,
  Bookmark,
  X,
  ArrowLeft,
  Loader2,
  Reply,
  Send,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PostService, PostApiType } from '@/services/post';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import useEmblaCarousel from 'embla-carousel-react';

interface PostDetailModalProps {
  postId: string;
  onClose: () => void;
  onDeleted?: (postId: string) => void;
}

export function PostDetailModal({
  postId,
  onClose,
  onDeleted,
}: PostDetailModalProps) {
  const [post, setPost] = useState<PostApiType | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const { currentUser } = useApp();

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    fetchPost();
    // Prevent scrolling on the body when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await PostService.getPost(postId);
      setPost(data);
    } catch (_error) {
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
      userReaction: isLiked ? undefined : { reactionType: 'LIKE' },
    });

    try {
      await PostService.toggleReaction(post._id, 'LIKE');
    } catch (_error) {
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
      setIsCommenting(true);
      await PostService.addComment({ postId: post._id, content });
      fetchPost(); // Refresh to show new comment
      toast.success('Comment added');
    } catch (_error) {
      setNewComment(content);
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
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
    } catch (_error) {
      toast.error('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-0 backdrop-blur-md md:p-4">
      <div className="bg-card relative flex max-h-full min-h-[500px] w-full max-w-6xl flex-col overflow-hidden rounded-none shadow-2xl md:max-h-[85vh] md:flex-row md:rounded-2xl">
        {/* Mobile Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4 z-10 rounded-full text-white backdrop-blur-md md:hidden bg-black/20 hover:bg-black/40"
          onClick={onClose}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        {/* Desktop Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-foreground absolute right-4 top-4 z-10 hidden md:flex bg-background/50 backdrop-blur-sm rounded-full h-10 w-10 border border-border/50"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Media Side (Left) - Carousel */}
        <div className="bg-black/95 relative flex min-h-[350px] flex-[1.6] items-center justify-center group">
          {post.media && post.media.length > 0 ? (
            <div className="h-full w-full overflow-hidden" ref={emblaRef}>
              <div className="flex h-full w-full">
                {post.media.map((item, index) => (
                  <div key={index} className="relative flex-[0_0_100%] min-w-0 h-full flex items-center justify-center bg-black">
                    {item.type === 'VIDEO' ? (
                      <video
                        src={item.url}
                        controls
                        className="max-h-full w-full object-contain"
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={`Post content ${index + 1}`}
                        className="max-h-full w-full object-contain"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Carousel Navigation */}
              {post.media.length > 1 && emblaApi && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={scrollPrev}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={scrollNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                  
                  {/* Indicators */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
                    {post.media.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1.5 w-1.5 rounded-full transition-all ${
                          // Embla current index needs more complex state for visual indicators, but we can just use 100% loop
                          "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-3xl bg-accent/20 flex items-center justify-center mb-2">
                <Repeat2 className="h-8 w-8 opacity-40 rotate-12" />
              </div>
              <span className="text-xl font-bold tracking-tight">Text Post</span>
              <p className="px-12 text-center text-sm opacity-50 font-medium">
                This post contains only expressive text content without media.
              </p>
            </div>
          )}
        </div>

        {/* Info Side (Right) */}
        <div className="bg-card border-border flex min-w-0 flex-1 flex-col border-l">
          {/* Header */}
          <div className="border-border flex shrink-0 items-center justify-between border-b p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={post.author.avatar}
                  alt={post.author.fullnames}
                />
                <AvatarFallback>{post.author.fullnames[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="cursor-pointer text-sm font-semibold hover:underline">
                  {post.author.fullnames}
                </span>
                <span className="text-muted-foreground text-xs">
                  @{post.author.username}
                </span>
              </div>
            </div>

            {currentUser?._id === post.author._id && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Content & Comments (Scrollable) */}
          <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
            {/* Post Content */}
            <div className="mb-6">
              <p className="wrap-break-word mb-3 whitespace-pre-wrap text-sm md:text-base">
                {post.content}
              </p>
              <div className="text-muted-foreground mb-4 flex items-center gap-2 text-[10px] uppercase tracking-wider">
                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                <span>·</span>
                <span>{post.views} views</span>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-primary cursor-pointer text-sm hover:underline"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-border my-4 h-px" />

            {/* Comments List */}
            <div className="space-y-6 pb-4">
              <h3 className="text-muted-foreground mb-4 text-sm font-semibold uppercase tracking-tight">
                Comments ({post.commentsCount})
              </h3>
              {post.comments && post.comments.length > 0 ? (
                post.comments.map(comment => (
                  <div key={comment._id} className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage
                        src={comment.author.avatar}
                        alt={comment.author.fullnames}
                      />
                      <AvatarFallback>
                        {comment.author.fullnames[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-semibold">
                          {comment.author.fullnames}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          {formatDistanceToNow(new Date(comment.createdAt))}
                        </span>
                      </div>
                      <p className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed">
                        {comment.content}
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        <button className="text-muted-foreground hover:text-foreground text-[10px] font-medium transition-colors">
                          <Heart className="mr-1 inline h-3 w-3" />
                          Like
                        </button>
                        <button className="text-muted-foreground hover:text-foreground text-[10px] font-medium transition-colors">
                          <Reply className="mr-1 inline h-3 w-3" />
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground py-8 text-center text-sm">
                  No comments yet.
                </div>
              )}
            </div>
          </div>

          {/* Footer (Actions & Input) */}
          <div className="border-border bg-card shrink-0 border-t p-4">
            {/* Action Buttons */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleLike}
                >
                  <Heart
                    className={`h-5 w-5 ${post.userReaction?.reactionType === 'LIKE' ? 'fill-red-500 text-red-500' : ''}`}
                  />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Repeat2 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Bookmark className="h-5 w-5" />
                </Button>
              </div>
              <span className="text-xs font-semibold">
                {post.likesCount} likes
              </span>
            </div>

            {/* Comment Input */}
            <div className="flex items-end gap-3">
              <Avatar className="mb-1 h-8 w-8 shrink-0">
                <AvatarImage
                  src={currentUser?.avatar}
                  alt={currentUser?.fullnames}
                />
                <AvatarFallback>{currentUser?.fullnames?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="bg-accent/30 focus-visible:ring-primary/50 border-border max-h-[120px] min-h-[40px] resize-none text-sm focus-visible:ring-1"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 rounded-md px-4 font-medium"
                  disabled={!newComment.trim()}
                  onClick={handleAddComment}
                >
                  {isCommenting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
