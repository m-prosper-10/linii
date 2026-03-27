'use client';

import { useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Bookmark,
  Copy,
  Flag,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Send,
  Trash2,
  Loader2,
} from 'lucide-react';
import type { PostApiType } from '@/services/post';
import { PostService } from '@/services/post';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { MediaGallery } from '@/app/components/post/MediaGallery';

interface PostCardProps {
  post: PostApiType;
  onUserClick?: (userId: string) => void;
  onPostClick?: (postId: string) => void;
  onDeleted?: (postId: string) => void;
}

export function PostCard({
  post,
  onUserClick,
  onPostClick,
  onDeleted,
}: PostCardProps) {
  const { currentUser: appUser } = useApp();

  const [isLiked, setIsLiked] = useState(
    post.userReaction?.reactionType === 'LIKE'
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isReposted, setIsReposted] = useState(post.userShared);
  const [likes, setLikes] = useState(post.likesCount);
  const [reposts, setReposts] = useState(post.sharesCount);
  const [saves, setSaves] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments] = useState(post.comments || []);
  const [commentCount, setCommentCount] = useState(post.commentsCount);
  const [newComment, setNewComment] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const previousLiked = isLiked;
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);

    try {
      await PostService.toggleReaction(post._id, 'LIKE');
    } catch (_error) {
      setIsLiked(previousLiked);
      setLikes(previousLiked ? likes : likes - 1);
      toast.error('Failed to update like');
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const previousReposted = isReposted;
    setIsReposted(!isReposted);
    setReposts(isReposted ? reposts - 1 : reposts + 1);

    try {
      await PostService.toggleRepost(post._id);
    } catch (_error) {
      setIsReposted(previousReposted);
      setReposts(previousReposted ? reposts : reposts - 1);
      toast.error('Failed to update repost');
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    setSaves(isSaved ? saves - 1 : saves + 1);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const content = newComment.trim();
    setNewComment('');

    try {
      await PostService.addComment({ postId: post._id, content });
      setCommentCount(commentCount + 1);
      toast.success('Comment added');
    } catch (_error) {
      setNewComment(content);
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsDeleting(true);
      await PostService.deletePost(post._id);
      toast.success('Post deleted');
      onDeleted?.(post._id);
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      className="border-border bg-card hover:bg-accent/5 cursor-pointer border-b p-4 transition-colors"
      onClick={() => onPostClick?.(post._id)}
    >
      <div className="flex gap-3">
        <div
          className="cursor-pointer"
          onClick={e => {
            e.stopPropagation();
            onUserClick?.(post.author._id);
          }}
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={post.author.avatar} alt={post.author.fullnames} />
            <AvatarFallback>{post.author.fullnames[0]}</AvatarFallback>
          </Avatar>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between">
            <div
              className="flex cursor-pointer items-center gap-2"
              onClick={e => {
                e.stopPropagation();
                onUserClick?.(post.author._id);
              }}
            >
              <span className="font-medium hover:underline">
                {post.author.fullnames}
              </span>
              {post.author.verified && (
                <Badge variant="secondary" className="h-4 px-1 text-xs">
                  ✓
                </Badge>
              )}
              <span className="text-muted-foreground text-sm">
                @{post.author.username}
              </span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">{timeAgo}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={e => e.stopPropagation()}
              >
                <DropdownMenuItem className="">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem className="">
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
                {appUser?._id === post.author._id && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={handleDelete}
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete post
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-3">
            <p className="wrap-break-word text-muted-foreground/90 whitespace-pre-wrap font-normal">
              {post.content}
            </p>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-primary/70 cursor-pointer text-sm font-medium hover:underline"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <MediaGallery 
            media={post.media} 
            onPostClick={() => onPostClick?.(post._id)} 
          />

          <div className="text-muted-foreground mb-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider opacity-60">
            <span>{post.views.toLocaleString()} views</span>
          </div>

          <div className="flex max-w-md items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 gap-2 transition-colors ${
                isLiked
                  ? 'bg-red-500/5 text-red-500'
                  : 'hover:bg-red-500/10 hover:text-red-500'
              }`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 gap-2 transition-colors hover:bg-blue-500/10 hover:text-blue-500 ${
                showComments ? 'bg-blue-500/5 text-blue-500' : ''
              }`}
              onClick={e => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{commentCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 gap-2 transition-colors hover:bg-green-500/10 hover:text-green-500 ${
                isReposted ? 'bg-green-500/5 text-green-500' : ''
              }`}
              onClick={handleRepost}
            >
              <Repeat2 className="h-4 w-4" />
              <span className="text-sm font-medium">{reposts}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 gap-2 transition-colors hover:bg-yellow-500/10 hover:text-yellow-500 ${
                isSaved ? 'bg-yellow-500/5 text-yellow-500' : ''
              }`}
              onClick={handleSave}
            >
              <Bookmark
                className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`}
              />
              <span className="text-sm font-medium">{saves}</span>
            </Button>
          </div>

          {/* Inline Comments Section (Brief) */}
          {showComments && (
            <div
              className="border-border mt-4 border-t pt-4"
              onClick={e => e.stopPropagation()}
            >
              {/* Comment Input */}
              <div className="mb-4 flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={appUser?.avatar} alt={appUser?.fullnames} />
                  <AvatarFallback>{appUser?.fullnames?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 gap-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    className="bg-accent/20 border-border focus-visible:ring-primary/20 min-h-[60px] resize-none text-sm"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleAddComment();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="self-end rounded-lg"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Top Comments List */}
              <div className="space-y-4">
                {comments && comments.length > 0 ? (
                  comments.slice(0, 3).map(comment => (
                    <div key={comment._id} className="flex gap-3">
                      <Avatar
                        className="h-7 w-7 shrink-0 cursor-pointer"
                        onClick={() => onUserClick?.(comment.author._id)}
                      >
                        <AvatarImage
                          src={comment.author.avatar}
                          alt={comment.author.fullnames}
                        />
                        <AvatarFallback>
                          {comment.author.fullnames[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className="flex cursor-pointer items-center gap-2"
                            onClick={() => onUserClick?.(comment.author._id)}
                          >
                            <span className="text-xs font-semibold hover:underline">
                              {comment.author.fullnames}
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              @{comment.author.username}
                            </span>
                          </div>
                        </div>
                        <p className="text-foreground/80 mt-0.5 text-sm">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground py-2 text-center text-xs italic">
                    No comments yet.
                  </div>
                )}
                {commentCount > 3 && (
                  <Button
                    variant="link"
                    className="text-primary h-auto p-0 text-xs font-semibold opacity-80 hover:no-underline hover:opacity-100"
                    onClick={() => onPostClick?.(post._id)}
                  >
                    View all {commentCount} comments
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
