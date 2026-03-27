"use client";

import { Search, TrendingUp, UserPlus } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { mockTrendingTopics, mockUsers } from '@/data/mockData';
import { useApp } from '@/context/AppContext';

export function DiscoverySidebar() {
  const { setCurrentView, setSelectedUserId } = useApp();

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentView('profile');
  };

  return (
    <div className="sticky top-0 h-screen flex flex-col p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-9 bg-accent/50 border-0"
        />
      </div>

      <div className="bg-accent/30 rounded-lg p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trending Topics
        </h3>
        <div className="space-y-3">
          {mockTrendingTopics.map((topic) => (
            <div
              key={topic.id}
              className="cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{topic.category}</div>
                  <div className="font-medium">{topic.hashtag}</div>
                  <div className="text-sm text-muted-foreground">
                    {topic.posts.toLocaleString()} posts
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-accent/30 rounded-lg p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Suggested Accounts
        </h3>
        <div className="space-y-4">
          {mockUsers.slice(0, 3).map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <div className="cursor-pointer" onClick={() => handleUserClick(user.id)}>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar} alt={user.displayName} />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="flex items-center gap-1 cursor-pointer hover:underline"
                  onClick={() => handleUserClick(user.id)}
                >
                  <span className="font-medium truncate">{user.displayName}</span>
                  {user.verified && (
                    <Badge variant="secondary" className="h-4 px-1 text-xs">✓</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground truncate">@{user.username}</div>
              </div>
              <Button size="sm" variant="outline">Follow</Button>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-x-2 pt-4">
        <a href="#" className="hover:underline">Terms</a>
        <span>·</span>
        <a href="#" className="hover:underline">Privacy</a>
        <span>·</span>
        <a href="#" className="hover:underline">Help</a>
      </div>
    </div>
  );
}
