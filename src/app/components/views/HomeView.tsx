"use client";

import { PostCard } from '@/app/components/PostCard';
import { PostDetailModal } from '@/app/components/PostDetailModal';
import { Button } from '@/app/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PostService, PostApiType } from '@/services/post';
import { toast } from 'sonner';

export function HomeView() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostApiType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const data = await PostService.getFeed(1, 20);
      setPosts(data.posts);
    } catch (error: any) {
      toast.error('Failed to load feed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
  };

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts(posts.filter(p => p._id !== deletedPostId));
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
          What&apos;s on your mind?
        </div>
      </div>

      <div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading feed...
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post._id} 
              post={post}
              onUserClick={handleUserClick}
              onPostClick={handlePostClick}
              onDeleted={handlePostDeleted}
            />
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No posts found. Create your first post!
          </div>
        )}
      </div>

      <div className="p-8 text-center text-muted-foreground">
        <p>You&apos;ve reached the end</p>
      </div>

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
