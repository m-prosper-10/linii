"use client";

import { PostCard } from '@/app/components/PostCard';
import { Button } from '@/app/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PostService, PostApiType } from '@/services/post';
import { toast } from 'sonner';
import { Post } from '@/data/mockData';

export function HomeView() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostApiType[]>([]);
  const [loading, setLoading] = useState(true);

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

  const mapToPost = (apiPost: PostApiType): Post => ({
    id: apiPost._id,
    author: {
      id: apiPost.author._id,
      displayName: apiPost.author.fullnames,
      username: apiPost.author.username,
      avatar: apiPost.author.avatar || '',
      verified: apiPost.author.verified || false,
      joinedDate: '',
      following: 0,
      followers: 0,
      bio: '',
      coverImage: ''
    },
    content: apiPost.content,
    image: apiPost.media?.[0]?.url,
    timestamp: new Date(apiPost.createdAt).toLocaleDateString(),
    likes: apiPost.likesCount,
    comments: apiPost.commentsCount,
    reposts: apiPost.sharesCount,
    saves: 0,
    reach: apiPost.views,
    isLiked: apiPost.userReaction?.reactionType === 'LIKE',
    isSaved: false,
    isReposted: !!apiPost.userShared,
    tags: apiPost.tags,
  });

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
          posts.map((apiPost) => (
            <PostCard 
              key={apiPost._id} 
              post={mapToPost(apiPost)}
              onUserClick={handleUserClick}
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
    </div>
  );
}
