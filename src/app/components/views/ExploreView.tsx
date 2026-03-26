"use client";

import { useEffect, useState } from 'react';
import { PostCard } from '@/app/components/PostCard';
import { PostDetailModal } from '@/app/components/PostDetailModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Hash, Search, TrendingUp, Users, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
        analyticsService.getTrendingTopics(10)
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
      const isFollowing = suggestedUsers.find(u => u._id === userId)?.isFollowing;
      if (isFollowing) {
        await socialService.unfollowUser(userId);
        toast.success('Unfollowed user');
      } else {
        await socialService.followUser(userId);
        toast.success('Following user');
      }
      
      // Update local state
      setSuggestedUsers(prev => prev.map(u => 
        u._id === userId ? { ...u, isFollowing: !isFollowing } : u
      ));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Action failed';
      toast.error(message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <h2 className="font-semibold text-xl mb-4">Explore</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts, people, and topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-accent/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0">
          <TabsTrigger 
            value="trending" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-semibold text-sm transition-all"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger 
            value="people" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-semibold text-sm transition-all"
          >
            <Users className="h-4 w-4 mr-2" />
            People
          </TabsTrigger>
          <TabsTrigger 
            value="topics" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-semibold text-sm transition-all"
          >
            <Hash className="h-4 w-4 mr-2" />
            Topics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-0">
          {loading ? (
            <div className="p-12 flex justify-center items-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Searching...
            </div>
          ) : posts.length > 0 ? (
            <div>
              {searchQuery && (
                <div className="p-4 border-b border-border bg-accent/5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    {posts.length} results for &ldquo;{searchQuery}&rdquo;
                  </p>
                </div>
              )}
              {posts.map((post) => (
                <PostCard 
                  key={post._id} 
                  post={post}
                  onUserClick={handleUserClick}
                  onPostClick={(id) => setSelectedPostId(id)}
                  onDeleted={handlePostDeleted}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground font-medium italic opacity-60">
              {searchQuery ? 'No results found for your search.' : 'No trending posts right now.'}
            </div>
          )}
        </TabsContent>

        <TabsContent value="people" className="mt-0">
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-tight mb-4">Suggested for you</h3>
            {suggestedUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 hover:bg-accent/30 rounded-xl transition-all group">
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => handleUserClick(user._id)}
                >
                  <Avatar className="w-12 h-12 border-2 border-transparent group-hover:border-primary/20 transition-all">
                    <AvatarImage src={user.avatar} alt={user.fullnames} />
                    <AvatarFallback className="font-bold">{user.fullnames?.[0] || user.username?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-sm">{user.fullnames}</div>
                    <div className="text-xs text-muted-foreground font-medium">@{user.username}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 font-semibold opacity-60 uppercase tracking-tighter">
                      {(user.followersCount || 0).toLocaleString()} followers
                    </div>
                  </div>
                </div>
                <Button 
                  variant={user.isFollowing ? "outline" : "default"} 
                  size="sm" 
                  className="rounded-full font-bold px-4 hover:bg-primary hover:text-primary-foreground border-primary/20 hover:border-primary transition-all"
                  onClick={() => handleFollowToggle(user._id)}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="topics" className="mt-0">
          <div className="p-4 space-y-2">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-tight mb-4">Trending topics</h3>
            {trendingTopics.length > 0 ? (
              trendingTopics.map((topic, index) => (
                <div key={index} className="px-4 py-3 hover:bg-accent/30 rounded-xl transition-all cursor-pointer group flex items-center justify-between">
                  <div>
                    <div className="font-bold text-primary group-hover:underline">#{topic.hashtag}</div>
                    <div className="text-xs text-muted-foreground font-semibold opacity-60 mt-0.5">{topic.posts.toLocaleString()} posts</div>
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" />
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground font-medium italic opacity-60">
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