'use client';

import { useEffect, useState } from 'react';
import { PostCard } from '@/app/components/post/PostCard';
import { PostDetailModal } from '@/app/components/post/PostDetailModal';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/app/components/ui/tabs';
import { Hash, Search, TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ExploreSkeleton from '@/app/components/skeletons/ExploreSkeleton';
import { PostService, PostApiType } from '@/services/post';
import { socialService } from '@/services/social';
import { analyticsService, TrendingTopic } from '@/services/analytics';
import { toast } from 'sonner';

interface SuggestedUser {
  _id: string;
  fullnames: string;
  username: string;
  avatar: string;
  bio?: string;
  followersCount?: number;
  isFollowing?: boolean;
}

export function ExploreView() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<PostApiType[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timer);
    } else if (searchQuery.trim().length === 0) {
      fetchExploreData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const fetchExploreData = async () => {
    try {
      setLoading(true);
      const [trendingPosts, suggestions, topics] = await Promise.all([
        analyticsService.getTrendingContent(10),
        socialService.getSuggestedUsers(10),
        analyticsService.getTrendingTopics(10),
      ]);

      setPosts(trendingPosts);
      setSuggestedUsers(suggestions as SuggestedUser[]);
      setTrendingTopics(topics);
    } catch {
      toast.error('Failed to load explore content');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await PostService.searchPosts(searchQuery);
      setPosts(data.posts);
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  const handleFollowToggle = async (userId: string) => {
    try {
      const isFollowing = suggestedUsers.find(
        u => u._id === userId
      )?.isFollowing;
      if (isFollowing) {
        await socialService.unfollowUser(userId);
        toast.success('Unfollowed user');
      } else {
        await socialService.followUser(userId);
        toast.success('Following user');
      }

      // Update local state
      setSuggestedUsers(prev =>
        prev.map(u =>
          u._id === userId ? { ...u, isFollowing: !isFollowing } : u
        )
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Action failed';
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="bg-background/80 border-border sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="p-4">
          <h2 className="mb-4 text-xl font-semibold">Explore</h2>
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search posts, people, and topics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-accent/50 focus-visible:ring-primary/50 border-none pl-10 focus-visible:ring-1"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="border-border h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="trending"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-semibold transition-all data-[state=active]:bg-transparent"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger
            value="people"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-semibold transition-all data-[state=active]:bg-transparent"
          >
            <Users className="mr-2 h-4 w-4" />
            People
          </TabsTrigger>
          <TabsTrigger
            value="topics"
            className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-semibold transition-all data-[state=active]:bg-transparent"
          >
            <Hash className="mr-2 h-4 w-4" />
            Topics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-0">
          {loading ? (
            <ExploreSkeleton />
          ) : posts.length > 0 ? (
            <div>
              {searchQuery && (
                <div className="border-border bg-accent/5 border-b p-4">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">
                    {posts.length} results for &ldquo;{searchQuery}&rdquo;
                  </p>
                </div>
              )}
              {posts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  onUserClick={handleUserClick}
                  onPostClick={id => setSelectedPostId(id)}
                  onDeleted={handlePostDeleted}
                />
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground p-12 text-center font-medium italic opacity-60">
              {searchQuery
                ? 'No results found for your search.'
                : 'No trending posts right now.'}
            </div>
          )}
        </TabsContent>

        <TabsContent value="people" className="mt-0">
          <div className="space-y-4 p-4">
            <h3 className="text-muted-foreground mb-4 text-sm font-bold uppercase tracking-tight">
              Suggested for you
            </h3>
            {suggestedUsers.map(user => (
              <div
                key={user._id}
                className="hover:bg-accent/30 group flex items-center justify-between rounded-xl p-3 transition-all"
              >
                <div
                  className="flex flex-1 cursor-pointer items-center gap-3"
                  onClick={() => handleUserClick(user._id)}
                >
                  <Avatar className="group-hover:border-primary/20 h-12 w-12 border-2 border-transparent transition-all">
                    <AvatarImage src={user.avatar} alt={user.fullnames} />
                    <AvatarFallback className="font-bold">
                      {user.fullnames?.[0] || user.username?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-bold">{user.fullnames}</div>
                    <div className="text-muted-foreground text-xs font-medium">
                      @{user.username}
                    </div>
                    <div className="text-muted-foreground mt-1 text-[10px] font-semibold uppercase tracking-tighter opacity-60">
                      {(user.followersCount || 0).toLocaleString()} followers
                    </div>
                  </div>
                </div>
                <Button
                  variant={user.isFollowing ? 'outline' : 'default'}
                  size="sm"
                  className="hover:bg-primary hover:text-primary-foreground border-primary/20 hover:border-primary rounded-full px-4 font-bold transition-all"
                  onClick={() => handleFollowToggle(user._id)}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="topics" className="mt-0">
          <div className="space-y-2 p-4">
            <h3 className="text-muted-foreground mb-4 text-sm font-bold uppercase tracking-tight">
              Trending topics
            </h3>
            {trendingTopics.length > 0 ? (
              trendingTopics.map((topic, index) => (
                <div
                  key={index}
                  className="hover:bg-accent/30 group flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 transition-all"
                >
                  <div>
                    <div className="text-primary font-bold group-hover:underline">
                      #{topic.hashtag}
                    </div>
                    <div className="text-muted-foreground mt-0.5 text-xs font-semibold opacity-60">
                      {topic.posts.toLocaleString()} posts
                    </div>
                  </div>
                  <TrendingUp className="text-muted-foreground group-hover:text-primary h-4 w-4 opacity-40 transition-all group-hover:opacity-100" />
                </div>
              ))
            ) : (
              <div className="text-muted-foreground p-12 text-center font-medium italic opacity-60">
                No trending topics yet.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedPostId && (
        <PostDetailModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
          onDeleted={handlePostDeleted}
        />
      )}
    </div>
  );
}
