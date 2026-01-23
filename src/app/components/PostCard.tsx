"use client";

import { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal, Sparkles } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import type { Post } from '@/data/mockData';

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
              className="h-8 gap-2 hover:text-blue-500 hover:bg-blue-500/10"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.comments}</span>
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
        </div>
      </div>
    </div>
  );
}