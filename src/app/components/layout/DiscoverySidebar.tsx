"use client";

import { Search, TrendingUp, UserPlus, Check } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import React, { useEffect, useState } from 'react';
import { analyticsService, TrendingTopic } from '@/services/analytics';
import { socialService } from '@/services/social';
import { User } from '@/services/auth';
import { toast } from 'sonner';
import { Skeleton } from '@/app/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { cn } from '@/app/components/ui/utils';

export function DiscoverySidebar() {
  const router = useRouter();
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<Partial<User>[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [trendingTopics, suggestions] = await Promise.all([
          analyticsService.getTrendingTopics(5),
          socialService.getSuggestedUsers(3)
        ]);
        setTopics(trendingTopics);
        setSuggestedUsers(suggestions);
      } catch {
        // Error handling
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const handleFollow = async (userId: string) => {
    if (followingIds.has(userId)) return;
    
    try {
      await socialService.followUser(userId);
      setFollowingIds(prev => new Set(prev).add(userId));
      toast.success('Following');
    } catch {
      toast.error('Failed to follow user');
    }
  };

  const TopicSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-3 w-12 rounded-full opacity-50" />
        </div>
      ))}
    </div>
  );

  const UserSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-2 w-16 rounded-full opacity-50" />
          </div>
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="sticky top-0 h-screen flex flex-col p-4 space-y-4 overflow-y-auto no-scrollbar">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-9 bg-accent/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl"
        />
      </div>

      <div className="bg-accent/10 border border-border/5 rounded-2xl p-4">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-primary" />
          Trending Topics
        </h3>
        <div className="space-y-4">
          {loading ? (
            <TopicSkeleton />
          ) : topics.length > 0 ? (
            topics.map((topic, i) => (
              <div
                key={i}
                className="group cursor-pointer hover:bg-accent/20 p-2 -mx-2 rounded-xl transition-all"
                onClick={() => router.push(`/explore?q=${encodeURIComponent(topic.hashtag)}`)}
              >
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Trending</div>
                <div className="font-bold text-sm text-foreground/90 group-hover:text-primary transition-colors">#{topic.hashtag}</div>
                <div className="text-[10px] text-muted-foreground font-medium">
                  {topic.posts.toLocaleString()} posts
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">No trending topics yet</p>
          )}
        </div>
      </div>

      <div className="bg-accent/10 border border-border/5 rounded-2xl p-4">
        <h3 className="font-bold mb-4 flex items-center gap-2 text-sm">
          <UserPlus className="h-4 w-4 text-primary" />
          Suggested Accounts
        </h3>
        <div className="space-y-4">
          {loading ? (
            <UserSkeleton />
          ) : suggestedUsers.length > 0 ? (
            suggestedUsers.map((user) => (
              <div key={user._id} className="flex items-center gap-3 group">
                <div 
                  className="cursor-pointer transition-transform hover:scale-105" 
                  onClick={() => handleUserClick(user._id!)}
                >
                  <Avatar className="w-10 h-10 border border-border/10">
                    <AvatarImage src={user.avatar} alt={user.fullnames} />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                      {(user.fullnames || 'U').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:underline group-hover:text-primary transition-colors"
                    onClick={() => handleUserClick(user._id!)}
                  >
                    <span className="font-bold text-sm truncate">{user.fullnames}</span>
                    {user.verified && (
                      <Badge variant="secondary" className="h-3 w-3 p-0 flex items-center justify-center rounded-full bg-primary/10 border-none shrink-0">
                        <Check className="h-2 w-2 text-primary stroke-[4px]" />
                      </Badge>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate font-medium">@{user.username}</div>
                </div>
                <Button 
                  size="sm" 
                  variant={followingIds.has(user._id!) ? "secondary" : "default"}
                  className={cn(
                    "h-8 rounded-full px-3 font-bold text-[10px] transition-all",
                    followingIds.has(user._id!) ? "opacity-60" : "shadow-lg shadow-primary/10 hover:shadow-primary/20"
                  )}
                  onClick={() => handleFollow(user._id!)}
                  disabled={followingIds.has(user._id!)}
                >
                  {followingIds.has(user._id!) ? 'Following' : 'Follow'}
                </Button>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">Find friends on Linii</p>
          )}
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground flex flex-wrap gap-x-2 gap-y-1 pt-4 px-2 font-medium">
        <a href="#" className="hover:underline hover:text-primary transition-colors">Terms of Service</a>
        <span>·</span>
        <a href="#" className="hover:underline hover:text-primary transition-colors">Privacy Policy</a>
        <span>·</span>
        <a href="#" className="hover:underline hover:text-primary transition-colors">Cookie Policy</a>
        <span>·</span>
        <a href="#" className="hover:underline hover:text-primary transition-colors">Accessibility</a>
        <span>·</span>
        <a href="#" className="hover:underline hover:text-primary transition-colors">Ads info</a>
        <span>·</span>
        <a href="#" className="hover:underline hover:text-primary transition-colors">More</a>
        <div className="w-full pt-2">© 2026 Linii Corp.</div>
      </div>
    </div>
  );
}
