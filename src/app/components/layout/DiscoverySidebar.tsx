'use client';

import { Search, TrendingUp, UserPlus, Check, X, Loader2 } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import React, { useEffect, useState } from 'react';
import { analyticsService, TrendingTopic } from '@/services/analytics';
import { User } from '@/services/auth';
import { socialService, type SuggestedUser } from '@/services/social';
import { toast } from 'sonner';
import { Skeleton } from '@/app/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { cn } from '@/app/components/ui/utils';

export function DiscoverySidebar() {
  const router = useRouter();
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Partial<User>[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [trendingTopics, suggestions] = await Promise.all([
          analyticsService.getTrendingTopics(3), // Limit to 3
          socialService.getSuggestedUsers(3),
        ]);
        setTopics(trendingTopics);
        setSuggestedUsers(suggestions);
      } catch {
        toast.error('Could not load suggestions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Live search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { users } = await socialService.searchUsers(searchQuery, 1, 5);
        setSearchResults(users);
      } catch {
        // Error
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
    setSearchQuery(''); // Clear search on navigate
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
      {[1, 2, 3].map(i => (
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
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-2 w-16 rounded-full opacity-50" />
          </div>
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="no-scrollbar sticky top-0 flex h-screen flex-col space-y-4 overflow-y-auto p-4">
      <div className="group/search relative">
        <Search className="text-muted-foreground group-focus-within/search:text-primary absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="hover:bg-accent absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5"
          >
            <X className="text-muted-foreground h-3 w-3" />
          </button>
        )}
        <Input
          placeholder="Search Linii..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-accent/30 focus-visible:ring-primary/20 rounded-xl border-none pl-9 pr-9 focus-visible:ring-1"
        />

        {/* Search Results Dropdown */}
        {searchQuery.trim() !== '' && (
          <div className="bg-background border-border/50 animate-in fade-in zoom-in absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl duration-200">
            <div className="no-scrollbar max-h-[400px] overflow-y-auto p-2">
              {isSearching ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="text-primary h-4 w-4 animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-muted-foreground px-3 py-2 text-[10px] font-bold uppercase tracking-widest">
                    People
                  </div>
                  {searchResults.map(user => (
                    (() => {
                      const displayName = user.displayName || user.fullnames || 'Unknown';
                      const isVerified = user.verified ?? user.isVerified;
                      return (
                    <div
                      key={user._id}
                      onClick={() => handleUserClick(user._id!)}
                      className="hover:bg-accent/50 group flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors"
                    >
                      <Avatar className="border-border/5 group-hover:border-primary/20 h-9 w-9 border transition-colors">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                          displayName.charAt(0)
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <div className="flex items-center gap-1">
                          <span className="group-hover:text-primary truncate text-sm font-bold transition-colors">
                            {displayName}
                          </span>
                          {isVerified && (
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 flex h-3 w-3 shrink-0 items-center justify-center rounded-full border-none p-0"
                            >
                              <Check className="text-primary h-2 w-2 stroke-[4px]" />
                            </Badge>
                          )}
                        </div>
                        <span className="text-muted-foreground truncate text-[10px] font-medium">
                          @{user.username}
                        </span>
                      </div>
                    </div>
                      );
                    })()
                  ))}
                </div>
              ) : (
                <div className="bg-accent/5 rounded-xl py-8 text-center">
                  <Search className="text-muted-foreground/20 mx-auto mb-2 h-6 w-6" />
                  <p className="text-muted-foreground px-4 text-xs font-medium">
                    No results for &quot;{searchQuery}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div
        className={cn(
          'transition-all duration-300',
          searchQuery
            ? 'pointer-events-none scale-95 opacity-30 blur-[1px]'
            : 'opacity-100'
        )}
      >
        <div className="bg-accent/10 border-border/5 mb-4 rounded-2xl border p-4">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold">
            <TrendingUp className="text-primary h-4 w-4" />
            Trending Topics
          </h3>
          <div className="space-y-4">
            {loading ? (
              <TopicSkeleton />
            ) : topics.length > 0 ? (
              topics.map((topic, i) => (
                <div
                  key={i}
                  className="hover:bg-accent/20 group -mx-2 cursor-pointer rounded-xl p-2 transition-all"
                  onClick={() =>
                    router.push(
                      `/explore?q=${encodeURIComponent(topic.hashtag)}`
                    )
                  }
                >
                  <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                    Trending
                  </div>
                  <div className="text-foreground/90 group-hover:text-primary text-sm font-bold transition-colors">
                    #{topic.hashtag}
                  </div>
                  <div className="text-muted-foreground text-[10px] font-medium">
                    {topic.posts.toLocaleString()} posts
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground py-2 text-center text-xs">
                No trending topics yet
              </p>
            )}
          </div>
        </div>

        <div className="bg-accent/10 border-border/5 rounded-2xl border p-4">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-bold">
            <UserPlus className="text-primary h-4 w-4" />
            Who to follow
          </h3>
          <p className="text-muted-foreground mb-4 text-[11px] leading-snug">
            Based on your network, who&apos;s posting, and what&apos;s popular.
          </p>
          <div className="space-y-4">
            {loading ? (
              <UserSkeleton />
            ) : suggestedUsers.length > 0 ? (
              suggestedUsers.map(user => (
                (() => {
                  const displayName = user.displayName || user.fullnames || 'Unknown';
                  const isVerified = user.verified ?? user.isVerified;
                  return (
                <div key={user._id} className="group flex items-center gap-3">
                  <div
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={() => handleUserClick(user._id!)}
                  >
                    <Avatar className="border-border/10 h-10 w-10 border">
                      <AvatarImage src={user.avatar} alt={displayName} />
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                        displayName.charAt(0)
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="group-hover:text-primary flex cursor-pointer items-center gap-1 transition-colors hover:underline"
                      onClick={() => handleUserClick(user._id!)}
                    >
                      <span className="truncate text-sm font-bold">
                        {displayName}
                      </span>
                      {isVerified && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 flex h-3 w-3 shrink-0 items-center justify-center rounded-full border-none p-0"
                        >
                          <Check className="text-primary h-2 w-2 stroke-[4px]" />
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground truncate text-[10px] font-medium">
                      @{user.username}
                    </div>
                    {user.suggestionLabel && (
                      <div className="text-primary/80 mt-0.5 line-clamp-2 text-[10px] font-medium leading-snug">
                        {user.suggestionLabel}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={
                      followingIds.has(user._id!) ? 'secondary' : 'default'
                    }
                    className={cn(
                      'h-8 rounded-full px-3 text-[10px] font-bold transition-all',
                      followingIds.has(user._id!)
                        ? 'opacity-60'
                        : 'shadow-primary/10 hover:shadow-primary/20 shadow-lg'
                    )}
                    onClick={() => handleFollow(user._id!)}
                    disabled={followingIds.has(user._id!)}
                  >
                    {followingIds.has(user._id!) ? 'Following' : 'Follow'}
                  </Button>
                </div>
                  );
                })()
              ))
            ) : (
              <p className="text-muted-foreground py-2 text-center text-xs">
                Find friends on Linii
              </p>
            )}
          </div>
        </div>

        <div className="text-muted-foreground flex flex-wrap gap-x-2 gap-y-1 px-2 pt-4 text-[10px] font-medium">
          <a
            href="#"
            className="hover:text-primary transition-colors hover:underline"
          >
            Terms of Service
          </a>
          <span>·</span>
          <a
            href="#"
            className="hover:text-primary transition-colors hover:underline"
          >
            Privacy Policy
          </a>
          <span>·</span>
          <a
            href="#"
            className="hover:text-primary transition-colors hover:underline"
          >
            Cookie Policy
          </a>
          <span>·</span>
          <a
            href="#"
            className="hover:text-primary transition-colors hover:underline"
          >
            Accessibility
          </a>
          <span>·</span>
          <a
            href="#"
            className="hover:text-primary transition-colors hover:underline"
          >
            Ads info
          </a>
          <span>·</span>
          <a
            href="#"
            className="hover:text-primary transition-colors hover:underline"
          >
            More
          </a>
          <div className="w-full pt-2">© 2026 Linii Corp.</div>
        </div>
      </div>
    </div>
  );
}
