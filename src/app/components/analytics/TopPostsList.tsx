import { PostCard } from '@/app/components/post/PostCard';
import type { PostApiType } from '@/services/post';

interface TopPostsListProps {
  posts: PostApiType[];
  onPostClick: (id: string) => void;
  onPostDeleted: (id: string) => void;
}

export function TopPostsList({ posts, onPostClick, onPostDeleted }: TopPostsListProps) {
  if (posts.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground/50 italic">
        No top posts yet. Start posting to see your best content here.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map(post => (
        <div
          key={post._id}
          className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-shadow hover:shadow-md"
        >
          <PostCard
            post={post}
            onPostClick={onPostClick}
            onDeleted={onPostDeleted}
          />
        </div>
      ))}
    </div>
  );
}
