"use client";

import { PostCard } from '@/app/components/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useApp } from '@/context/AppContext';
import { mockPosts, mockTrendingTopics, mockUsers } from '@/data/mockData';
import { Hash, Search, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

export function ExploreView() {
  const { setCurrentView, setSelectedUserId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentView('profile');
  };

  const filteredPosts = mockPosts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const suggestedUsers = mockUsers.slice(0, 5);

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
              className="pl-10 bg-accent/50"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0">
          <TabsTrigger 
            value="trending" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger 
            value="people" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Users className="h-4 w-4 mr-2" />
            People
          </TabsTrigger>
          <TabsTrigger 
            value="topics" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Hash className="h-4 w-4 mr-2" />
            Topics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-0">
          {searchQuery ? (
            <div>
              <div className="p-4 border-b border-border">
                <p className="text-sm text-muted-foreground">
                  {filteredPosts.length} results for &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
              {filteredPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  onUserClick={handleUserClick}
                />
              ))}
            </div>
          ) : (
            mockPosts.slice(0, 10).map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                onUserClick={handleUserClick}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="people" className="mt-0">
          <div className="p-4 space-y-4">
            <h3 className="font-semibold">Suggested for you</h3>
            {suggestedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors">
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => handleUserClick(user.id)}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar} alt={user.displayName} />
                    <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.displayName}</div>
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                    <div className="text-sm text-muted-foreground">{user.followers.toLocaleString()} followers</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Follow
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="topics" className="mt-0">
          <div className="p-4 space-y-4">
            <h3 className="font-semibold">Trending topics</h3>
            {mockTrendingTopics.map((topic, index) => (
              <div key={index} className="p-3 hover:bg-accent/50 rounded-lg transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">#{topic.hashtag}</div>
                    <div className="text-sm text-muted-foreground">{topic.posts.toLocaleString()} posts</div>
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}