"use client";

import { PostCard } from '@/app/components/PostCard';
import { Button } from '@/app/components/ui/button';
import { mockPosts } from '@/data/mockData';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function HomeView() {
  const router = useRouter();

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-semibold text-xl">Home</h2>
          <Button variant="ghost" size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Feed
          </Button>
        </div>
      </div>

      <div className="border-b border-border p-4">
        <div 
          className="text-muted-foreground cursor-pointer hover:bg-accent/50 p-4 rounded-lg transition-colors"
          onClick={() => router.push('/post/create')}
        >
          What's on your mind?
        </div>
      </div>

      <div>
        {mockPosts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post}
            onUserClick={handleUserClick}
          />
        ))}
      </div>

      <div className="p-8 text-center text-muted-foreground">
        <p>You've reached the end</p>
      </div>
    </div>
  );
}
