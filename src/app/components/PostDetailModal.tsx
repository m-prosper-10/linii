'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Repeat2,
  X,
} from 'lucide-react';
import { PostService, PostApiType } from '@/services/post';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import useEmblaCarousel from 'embla-carousel-react';
import { PostContent } from '@/app/components/post/PostContent';
import { PostHeader } from '@/app/components/post/PostHeader';
import { PostActions } from '@/app/components/post/PostActions';
import { PostCommentList } from '@/app/components/post/PostCommentList';
import { PostCommentInput } from '@/app/components/post/PostCommentInput';

interface PostDetailModalProps {
  postId: string;
  onClose: () => void;
  onDeleted?: (postId: string) => void;
}

export function PostDetailModal({ postId, onClose, onDeleted }: PostDetailModalProps) {
  const [post, setPost] = useState<PostApiType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const { currentUser } = useApp();

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    fetchPost();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await PostService.getPost(postId);
      setPost(data);
      setCommentCount(data.commentsCount);
    } catch (_err) {
      toast.error('Failed to load post details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      setIsDeleting(true);
      await PostService.deletePost(post._id);
      toast.success('Post deleted');
      onDeleted?.(post._id);
      onClose();
    } catch (_err) {
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
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

  const hasMedia = post.media && post.media.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-0 backdrop-blur-md md:p-4">
      <div className="bg-card relative flex max-h-full min-h-[500px] w-full max-w-6xl flex-col overflow-hidden rounded-none shadow-2xl md:max-h-[85vh] md:flex-row md:rounded-2xl">

        {/* ————— Mobile close ————— */}
        <Button
          variant="ghost" size="icon"
          className="absolute left-4 top-4 z-10 rounded-full text-white bg-black/20 hover:bg-black/40 md:hidden"
          onClick={onClose}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* ————— Desktop close ————— */}
        <Button
          variant="ghost" size="icon"
          className="hover:text-foreground absolute right-4 top-4 z-10 hidden md:flex bg-background/50 backdrop-blur-sm rounded-full h-10 w-10 border border-border/50"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* ————— Left: Media carousel ————— */}
        <div className="bg-black/95 relative flex min-h-[300px] flex-[1.6] items-center justify-center group">
          {hasMedia ? (
            <div className="h-full w-full overflow-hidden" ref={emblaRef}>
              <div className="flex h-full w-full">
                {post.media.map((item, index) => (
                  <div
                    key={index}
                    className="relative flex-[0_0_100%] min-w-0 h-full flex items-center justify-center bg-black"
                  >
                    {item.type === 'VIDEO' ? (
                      <video src={item.url} controls className="max-h-full w-full object-contain" />
                    ) : (
                      <img
                        src={item.url}
                        alt={`Post media ${index + 1}`}
                        className="max-h-full w-full object-contain"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Nav arrows (only when >1 media) */}
              {post.media.length > 1 && emblaApi && (
                <>
                  <Button
                    variant="ghost" size="icon"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={scrollPrev}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={scrollNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                  {/* Dot indicators */}
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
                    {post.media.map((_, i) => (
                      <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/50" />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Placeholder for text-only posts */
            <div className="text-muted-foreground flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-3xl bg-accent/20 flex items-center justify-center">
                <Repeat2 className="h-8 w-8 opacity-40 rotate-12" />
              </div>
              <span className="text-xl font-bold tracking-tight">Text Post</span>
              <p className="px-12 text-center text-sm opacity-50 font-medium">
                This post contains only expressive text content without media.
              </p>
            </div>
          )}
        </div>

        {/* ————— Right: Info panel ————— */}
        <div className="bg-card border-border flex min-w-0 flex-1 flex-col border-l">

          {/* Header */}
          <div className="border-border shrink-0 border-b p-4">
            <PostHeader
              post={post}
              currentUserId={currentUser?._id}
              variant="modal"
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          </div>

          {/* Scrollable: content + comments */}
          <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
            {/* Post content */}
            <div className="mb-4">
              <PostContent post={post} onUpdate={setPost} hideMedia />
              <div className="text-muted-foreground mt-2 flex items-center gap-2 text-[10px] uppercase tracking-wider opacity-60">
                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                <span>·</span>
                <span>{post.views} views</span>
              </div>
            </div>

            <div className="bg-border my-4 h-px" />

            {/* Comments list */}
            <h3 className="text-muted-foreground mb-4 text-xs font-semibold uppercase tracking-tight">
              Comments ({commentCount})
            </h3>
            <PostCommentList
              comments={post.comments || []}
              totalCount={commentCount}
              showActions
            />
          </div>

          {/* Footer: actions + comment input */}
          <div className="border-border bg-card shrink-0 border-t p-4 space-y-3">
            <PostActions
              post={post}
              commentCount={commentCount}
              showLikesCount
            />
            <PostCommentInput
              postId={post._id}
              submitMode="enter"
              placeholder="Add a comment…"
              onCommentAdded={() => {
                setCommentCount(c => c + 1);
                fetchPost();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
