'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Repeat2, X } from 'lucide-react';
import { PostService, PostApiType } from '@/services/post';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import useEmblaCarousel from 'embla-carousel-react';
import { PostContent } from './PostContent';
import { PostHeader } from './PostHeader';
import { PostActions } from './PostActions';
import { PostCommentList } from './PostCommentList';
import { PostCommentInput } from './PostCommentInput';

import PostDetailsSkeleton from '../skeletons/PostDetailsSkeleton';

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const { currentUser } = useApp();

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    fetchPost();
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
    return <PostDetailsSkeleton onClose={onClose} />;
  }

  if (!post) return null;

  const hasMedia = post.media && post.media.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-0 backdrop-blur-md md:p-4">
      <div className="bg-card relative flex max-h-full min-h-[500px] w-full max-w-6xl flex-col overflow-hidden rounded-none shadow-2xl md:max-h-[85vh] md:flex-row md:rounded-2xl">
        {/* Mobile close */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4 z-10 rounded-full bg-black/20 text-white hover:bg-black/40 md:hidden"
          onClick={onClose}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Desktop close */}
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-foreground bg-background/50 border-border/50 absolute right-4 top-4 z-10 hidden h-10 w-10 rounded-full border backdrop-blur-sm md:flex"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Left: Media carousel */}
        <div className="group relative flex min-h-[300px] flex-[1.6] items-center justify-center bg-black/95">
          {hasMedia ? (
            <div className="h-full w-full overflow-hidden" ref={emblaRef}>
              <div className="flex h-full w-full">
                {post.media.map((item, index) => (
                  <div
                    key={index}
                    className="relative flex h-full min-w-0 flex-[0_0_100%] items-center justify-center bg-black"
                  >
                    {item.type === 'VIDEO' ? (
                      <video
                        src={item.url}
                        controls
                        className="max-h-full w-full object-contain"
                      />
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

              {post.media.length > 1 && emblaApi && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border border-white/10 bg-white/10 text-white opacity-0 transition-opacity hover:bg-white/20 group-hover:opacity-100"
                    onClick={scrollPrev}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border border-white/10 bg-white/10 text-white opacity-0 transition-opacity hover:bg-white/20 group-hover:opacity-100"
                    onClick={scrollNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                  <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 backdrop-blur-md">
                    {post.media.map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-white/50"
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground flex flex-col items-center gap-3">
              <div className="bg-accent/20 flex h-16 w-16 items-center justify-center rounded-3xl">
                <Repeat2 className="h-8 w-8 rotate-12 opacity-40" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Text Post
              </span>
              <p className="px-12 text-center text-sm font-medium opacity-50">
                This post contains only expressive text content without media.
              </p>
            </div>
          )}
        </div>

        {/* Right: Info panel */}
        <div className="bg-card border-border flex min-w-0 flex-1 flex-col border-l">
          <div className="border-border shrink-0 border-b p-4">
            <PostHeader
              post={post}
              currentUserId={currentUser?._id}
              variant="modal"
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          </div>

          <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <PostContent post={post} onUpdate={setPost} hideMedia />
              <div className="text-muted-foreground mt-2 flex items-center gap-2 text-[10px] uppercase tracking-wider opacity-60">
                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                <span>·</span>
                <span>{post.views} views</span>
              </div>
            </div>

            <div className="bg-border my-4 h-px" />

            <h3 className="text-muted-foreground mb-4 text-xs font-semibold uppercase tracking-tight">
              Comments ({commentCount})
            </h3>
            <PostCommentList
              comments={post.comments || []}
              totalCount={commentCount}
              showActions
            />
          </div>

          <div className="border-border bg-card shrink-0 space-y-3 border-t p-4">
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
