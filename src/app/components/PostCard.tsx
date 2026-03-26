"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Textarea } from '@/app/components/ui/textarea';
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Repeat2, Send, Trash2 } from 'lucide-react';
import type { PostApiType } from '@/services/post';
import { PostService } from '@/services/post';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: PostApiType;
  onUserClick?: (userId: string) => void;
  onPostClick?: (postId: string) => void;
  onDeleted?: (postId: string) => void;
}

export function PostCard({ post, onUserClick, onPostClick, onDeleted }: PostCardProps) {
  const { currentUser: appUser } = useApp();
  
  const [isLiked, setIsLiked] = useState(post.userReaction?.reactionType === 'LIKE');
  const [isSaved, setIsSaved] = useState(false);
  const [isReposted, setIsReposted] = useState(post.userShared);
  const [likes, setLikes] = useState(post.likesCount);
  const [reposts, setReposts] = useState(post.sharesCount);
  const [saves, setSaves] = useState(0); 
  const [showComments, setShowComments] = useState(false);
  const [comments] = useState(post.comments || []);
  const [commentCount, setCommentCount] = useState(post.commentsCount);
  const [newComment, setNewComment] = useState('');

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
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await PostService.deletePost(post._id);
      toast.success('Post deleted');
      onDeleted?.(post._id);
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <div 
      className="border-b border-border bg-card p-4 hover:bg-accent/5 transition-colors cursor-pointer"
      onClick={() => onPostClick?.(post._id)}
    >
      <div className="flex gap-3">
        <div 
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onUserClick?.(post.author._id);
          }}
        >
          <Avatar className="w-12 h-12">
            <AvatarImage src={post.author.avatar} alt={post.author.fullnames} />
            <AvatarFallback>{post.author.fullnames[0]}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onUserClick?.(post.author._id);
              }}
            >
              <span className="font-medium hover:underline">
                {post.author.fullnames}
              </span>
              {post.author.verified && (
                <Badge variant="secondary" className="h-4 px-1 text-xs">✓</Badge>
              )}
              <span className="text-muted-foreground text-sm">
                @{post.author.username}
              </span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">{timeAgo}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem>Copy link</DropdownMenuItem>
                {appUser?._id === post.author._id && (
                  <DropdownMenuItem className="text-destructive font-semibold" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete post
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-destructive">Report post</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-3">
            <p className="whitespace-pre-wrap wrap-break-word font-normal text-muted-foreground/90">{post.content}</p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-primary/70 hover:underline cursor-pointer text-sm font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {post.media && post.media.length > 0 && (
            <div className="mb-3 rounded-xl overflow-hidden border border-border bg-black/5" onClick={(e) => e.stopPropagation()}>
              {post.media[0].type === 'VIDEO' ? (
                <video src={post.media[0].url} className="w-full object-contain max-h-[512px]" controls />
              ) : (
                <img 
                  src={post.media[0].url} 
                  alt="Post content" 
                  className="w-full object-cover max-h-[512px] hover:scale-[1.01] transition-transform duration-300"
                  onClick={() => onPostClick?.(post._id)}
                />
              )}
            </div>
          )}

          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-semibold opacity-60">
            <span>{post.views.toLocaleString()} views</span>
          </div>

          <div className="flex items-center justify-between max-w-md">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 gap-2 hover:text-blue-500 hover:bg-blue-500/10 transition-colors ${
                showComments ? 'text-blue-500 bg-blue-500/5' : ''
              }`}
              onClick={(e) => {
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
              className={`h-8 gap-2 hover:text-green-500 hover:bg-green-500/10 transition-colors ${
                isReposted ? 'text-green-500 bg-green-500/5' : ''
              }`}
              onClick={handleRepost}
            >
              <Repeat2 className="h-4 w-4" />
              <span className="text-sm font-medium">{reposts}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 gap-2 hover:text-red-500 hover:bg-red-500/10 transition-colors ${
                isLiked ? 'text-red-500 bg-red-500/5' : ''
              }`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 gap-2 hover:text-yellow-500 hover:bg-yellow-500/10 transition-colors ${
                isSaved ? 'text-yellow-500 bg-yellow-500/5' : ''
              }`}
              onClick={handleSave}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{saves}</span>
            </Button>
          </div>

          {/* Inline Comments Section (Brief) */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-border" onClick={(e) => e.stopPropagation()}>
              {/* Comment Input */}
              <div className="flex gap-3 mb-4">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={appUser?.avatar} alt={appUser?.fullnames} />
                  <AvatarFallback>{appUser?.fullnames?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] resize-none text-sm bg-accent/20 border-border focus-visible:ring-primary/20"
                    onKeyDown={(e) => {
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
                  comments.slice(0, 3).map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      <Avatar 
                        className="w-7 h-7 shrink-0 cursor-pointer"
                        onClick={() => onUserClick?.(comment.author._id)}
                      >
                        <AvatarImage src={comment.author.avatar} alt={comment.author.fullnames} />
                        <AvatarFallback>{comment.author.fullnames[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div 
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => onUserClick?.(comment.author._id)}
                          >
                            <span className="font-semibold text-xs hover:underline">
                              {comment.author.fullnames}
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              @{comment.author.username}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80 mt-0.5">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-muted-foreground py-2 italic">
                    No comments yet.
                  </div>
                )}
                {commentCount > 3 && (
                  <Button 
                    variant="link" 
                    className="text-xs p-0 h-auto text-primary font-semibold hover:no-underline opacity-80 hover:opacity-100" 
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