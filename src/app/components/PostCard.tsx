"use client";

import { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal, Sparkles, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Textarea } from '@/app/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import type { Post, Comment } from '@/data/mockData';
import { mockComments, currentUser } from '@/data/mockData';

interface PostCardProps {
  post: Post;
  onUserClick?: (userId: string) => void;
}

export function PostCard({ post, onUserClick }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [isReposted, setIsReposted] = useState(post.isReposted);
  const [likes, setLikes] = useState(post.likes);
  const [reposts, setReposts] = useState(post.reposts);
  const [saves, setSaves] = useState(post.saves);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(mockComments[post.id] || []);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleRepost = () => {
    setIsReposted(!isReposted);
    setReposts(isReposted ? reposts - 1 : reposts + 1);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    setSaves(isSaved ? saves - 1 : saves + 1);
  };

  const handleCommentLike = (commentId: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const wasLiked = comment.isLiked;
        return {
          ...comment,
          isLiked: !wasLiked,
          likes: wasLiked ? comment.likes - 1 : comment.likes + 1
        };
      }
      return comment;
    }));
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `c${Date.now()}`,
      author: currentUser,
      content: newComment.trim(),
      timestamp: 'just now',
      likes: 0,
      isLiked: false,
    };

    setComments([...comments, comment]);
    setCommentCount(commentCount + 1);
    setNewComment('');
  };

  return (
    <div className="border-b border-border bg-card p-4 hover:bg-accent/5 transition-colors">
      <div className="flex gap-3">
        <div 
          className="cursor-pointer"
          onClick={() => onUserClick?.(post.author.id)}
        >
          <Avatar className="w-12 h-12">
            <AvatarImage src={post.author.avatar} alt={post.author.displayName} />
            <AvatarFallback>{post.author.displayName[0]}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => onUserClick?.(post.author.id)}
            >
              <span className="font-medium hover:underline">
                {post.author.displayName}
              </span>
              {post.author.verified && (
                <Badge variant="secondary" className="h-4 px-1 text-xs">✓</Badge>
              )}
              <span className="text-muted-foreground text-sm">
                @{post.author.username}
              </span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">{post.timestamp}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Copy link</DropdownMenuItem>
                <DropdownMenuItem>Embed post</DropdownMenuItem>
                <DropdownMenuItem>Report post</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Block user</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-3">
            <p className="whitespace-pre-wrap break-words">{post.content}</p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-primary/70 hover:underline cursor-pointer text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {post.image && (
            <div className="mb-3 rounded-lg overflow-hidden border border-border">
              <img 
                src={post.image} 
                alt="Post content" 
                className="w-full object-cover max-h-96"
              />
            </div>
          )}

          {post.isAIGenerated && (
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground bg-accent/50 px-3 py-1.5 rounded-md w-fit">
              <Sparkles className="h-3 w-3" />
              <span>AI-assisted content</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <span>{post.reach.toLocaleString()} views</span>
          </div>

          <div className="flex items-center justify-between max-w-md">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 gap-2 hover:text-blue-500 hover:bg-blue-500/10 ${
                showComments ? 'text-blue-500' : ''
              }`}
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{commentCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 gap-2 hover:text-green-500 hover:bg-green-500/10 ${
                isReposted ? 'text-green-500' : ''
              }`}
              onClick={handleRepost}
            >
              <Repeat2 className="h-4 w-4" />
              <span className="text-sm">{reposts}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 gap-2 hover:text-red-500 hover:bg-red-500/10 ${
                isLiked ? 'text-red-500' : ''
              }`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 gap-2 hover:text-yellow-500 hover:bg-yellow-500/10 ${
                isSaved ? 'text-yellow-500' : ''
              }`}
              onClick={handleSave}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              <span className="text-sm">{saves}</span>
            </Button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-border">
              {/* Comment Input */}
              <div className="flex gap-3 mb-4">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
                  <AvatarFallback>{currentUser.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] resize-none"
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
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar 
                        className="w-8 h-8 flex-shrink-0 cursor-pointer"
                        onClick={() => onUserClick?.(comment.author.id)}
                      >
                        <AvatarImage src={comment.author.avatar} alt={comment.author.displayName} />
                        <AvatarFallback>{comment.author.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div 
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => onUserClick?.(comment.author.id)}
                          >
                            <span className="font-medium text-sm hover:underline">
                              {comment.author.displayName}
                            </span>
                            {comment.author.verified && (
                              <Badge variant="secondary" className="h-3 px-1 text-xs">✓</Badge>
                            )}
                            <span className="text-muted-foreground text-xs">
                              @{comment.author.username}
                            </span>
                            <span className="text-muted-foreground text-xs">·</span>
                            <span className="text-muted-foreground text-xs">{comment.timestamp}</span>
                          </div>
                        </div>
                        <p className="text-sm mb-2 whitespace-pre-wrap break-words">{comment.content}</p>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-6 gap-1 px-2 text-xs hover:text-red-500 hover:bg-red-500/10 ${
                              comment.isLiked ? 'text-red-500' : ''
                            }`}
                            onClick={() => handleCommentLike(comment.id)}
                          >
                            <Heart className={`h-3 w-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                            <span>{comment.likes}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 gap-1 px-2 text-xs hover:text-blue-500 hover:bg-blue-500/10"
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}