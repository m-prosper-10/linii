'use client';

import { PostCard } from '@/app/components/post/PostCard';
import { PostDetailModal } from '@/app/components/post/PostDetailModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Edit,
  Link as LinkIcon,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Play,
  UserCheck,
  UserPlus,
  Verified,
  Bookmark,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authService, User as ApiUser } from '@/services/auth';
import { PostService, PostApiType } from '@/services/post';
import { socialService } from '@/services/social';
import { chatService } from '@/services/chat';
import ProfileSkeleton from '@/app/components/skeletons/ProfileSkeleton';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { cn } from '@/app/components/ui/utils';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

// ── Tab config ────────────────────────────────────────────────────────────────

type TabId = 'posts' | 'media' | 'likes' | 'saved';

const TABS: { id: TabId; label: string; ownOnly?: boolean }[] = [
  { id: 'posts',  label: 'Posts' },
  { id: 'media',  label: 'Media' },
  { id: 'likes',  label: 'Likes' },
  { id: 'saved',  label: 'Saved', ownOnly: true },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function ProfileView() {
  const router = useRouter();
  const params = useParams();
  const { currentUser: appUser } = useApp();

  const [user, setUser] = useState<ApiUser | null>(null);
  const [posts, setPosts] = useState<PostApiType[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostApiType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowedBy, setIsFollowedBy] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('posts');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const userId = params?.userId as string | undefined;
  const isOwnProfile = !userId || userId === appUser?._id;

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, appUser?._id]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const targetId = userId || appUser?._id;
      if (!targetId) return;

      const [profileData, postsData] = await Promise.all([
        authService.getUserProfile(targetId),
        PostService.getUserPosts(targetId),
      ]);

      if (profileData) {
        setUser(profileData);
        setIsFollowing(profileData.followStatus?.isFollowing ?? false);
        setIsFollowedBy(profileData.followStatus?.isFollowedBy ?? false);
      }

      if (postsData) {
        setPosts(postsData.posts);
      }

      // Fetch saved posts for own profile
      if (isOwnProfile) {
        try {
          const saved = await PostService.getUserPosts(targetId);
          if (saved) setSavedPosts(saved.posts.filter(p => p.userSaved));
        } catch { /* saved posts optional */ }
      }
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || followLoading) return;
    const prev = isFollowing;
    setFollowLoading(true);
    setIsFollowing(!prev);
    try {
      if (prev) {
        await socialService.unfollowUser(user._id);
        toast.success(`Unfollowed @${user.username}`);
      } else {
        await socialService.followUser(user._id);
        toast.success(`Following @${user.username}`);
      }
      // Refresh stats
      const updated = await authService.getUserProfile(user._id);
      if (updated) setUser(updated);
    } catch (err: unknown) {
      setIsFollowing(prev);
      toast.error((err as Error).message || 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!user || messageLoading) return;
    setMessageLoading(true);
    try {
      const conv = await chatService.createConversation({
        participants: [user._id],
        conversationType: 'DIRECT',
      });
      router.push(`/messages?conv=${conv._id}`);
    } catch {
      toast.error('Could not open conversation');
    } finally {
      setMessageLoading(false);
    }
  };

  const handlePostDeleted = (id: string) => {
    setPosts(prev => prev.filter(p => p._id !== id));
    setSavedPosts(prev => prev.filter(p => p._id !== id));
  };

  if (isLoading) return <ProfileSkeleton />;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-16 text-center">
        <p className="text-lg font-semibold">User not found</p>
        <Button variant="outline" onClick={() => router.push('/home')}>Go home</Button>
      </div>
    );
  }

  const mediaPosts = posts.filter(p => p.media?.length > 0);
  const likedPosts = posts.filter(p => p.userReaction?.reactionType === 'LIKE');
  const visibleTabs = TABS.filter(t => !t.ownOnly || isOwnProfile);

  const tabContent: Record<TabId, PostApiType[]> = {
    posts: posts,
    media: mediaPosts,
    likes: likedPosts,
    saved: savedPosts,
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Sticky top bar */}
      <div className="bg-background/80 border-border/40 sticky top-0 z-10 border-b backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent/60 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold leading-tight">{user.fullnames}</h2>
            <p className="text-[11px] text-muted-foreground/60 font-medium">
              {(user.postsCount || 0).toLocaleString()} posts
            </p>
          </div>
        </div>
      </div>

      {/* Cover */}
      <div className="relative h-44 overflow-hidden bg-accent/20">
        {user.coverImage ? (
          <img src={user.coverImage} alt="Cover" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-primary/20 via-primary/5 to-accent/20" />
        )}
      </div>

      {/* Profile info */}
      <div className="px-4 pb-2">
        {/* Avatar row */}
        <div className="-mt-14 mb-3 flex items-end justify-between">
          <div className="relative">
            <Avatar className="border-background h-28 w-28 border-4 shadow-lg">
              <AvatarImage src={user.avatar} alt={user.fullnames} />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                {user.fullnames?.[0] ?? user.username?.[0] ?? '?'}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator — placeholder, could be wired to socket */}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pb-1">
            {isOwnProfile ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-5 font-semibold"
                onClick={() => router.push('/edit-profile')}
              >
                <Edit className="mr-1.5 h-3.5 w-3.5" />
                Edit profile
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 rounded-full p-0"
                  onClick={handleMessage}
                  disabled={messageLoading}
                  title="Message"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant={isFollowing ? 'outline' : 'default'}
                  className={cn(
                    'rounded-full px-5 font-bold transition-all',
                    isFollowing && 'hover:border-destructive hover:text-destructive'
                  )}
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                >
                  {followLoading ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    </span>
                  ) : isFollowing ? (
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5" />
                      Following
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <UserPlus className="h-3.5 w-3.5" />
                      {isFollowedBy ? 'Follow back' : 'Follow'}
                    </span>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 w-9 rounded-full p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => socialService.blockUser(user._id).then(() => toast.success('User blocked'))}>
                      Block @{user.username}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        {/* Name + username */}
        <div className="mb-2">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-bold tracking-tight">{user.fullnames}</h1>
            {user.verified && <Verified className="h-5 w-5 fill-primary text-primary-foreground" />}
          </div>
          <p className="text-sm text-muted-foreground/70 font-medium">@{user.username}</p>
          {!isOwnProfile && isFollowedBy && !isFollowing && (
            <span className="mt-1 inline-block rounded-md bg-accent/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              Follows you
            </span>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="mb-3 text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
            {user.bio}
          </p>
        )}

        {/* Meta row */}
        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground/60">
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {user.location}
            </span>
          )}
          {user.website && (
            <a
              href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              {user.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          {user.joinedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Joined {format(new Date(user.joinedDate), 'MMMM yyyy')}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-5 pb-3">
          <button className="group flex items-baseline gap-1 hover:underline">
            <span className="font-bold text-foreground">{(user.following ?? 0).toLocaleString()}</span>
            <span className="text-sm text-muted-foreground/60 group-hover:text-muted-foreground">Following</span>
          </button>
          <button className="group flex items-baseline gap-1 hover:underline">
            <span className="font-bold text-foreground">{(user.followers ?? 0).toLocaleString()}</span>
            <span className="text-sm text-muted-foreground/60 group-hover:text-muted-foreground">Followers</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-border/40 flex border-b">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'relative flex flex-1 items-center justify-center gap-1.5 py-3.5 text-sm font-semibold transition-colors',
              activeTab === tab.id
                ? 'text-foreground'
                : 'text-muted-foreground/60 hover:text-muted-foreground'
            )}
          >
            {tab.id === 'saved' && <Bookmark className="h-3.5 w-3.5" />}
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'media' ? (
          <MediaGrid posts={mediaPosts} onPostClick={setSelectedPostId} />
        ) : tabContent[activeTab].length > 0 ? (
          tabContent[activeTab].map(post => (
            <PostCard
              key={post._id}
              post={post}
              onPostClick={() => setSelectedPostId(post._id)}
              onDeleted={handlePostDeleted}
            />
          ))
        ) : (
          <EmptyTab tab={activeTab} isOwn={isOwnProfile} />
        )}
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

// ── Media grid ────────────────────────────────────────────────────────────────

function MediaGrid({ posts, onPostClick }: { posts: PostApiType[]; onPostClick: (id: string) => void }) {
  if (posts.length === 0) return <EmptyTab tab="media" isOwn={false} />;

  return (
    <div className="grid grid-cols-3 gap-0.5 p-0.5">
      {posts.map(post => {
        const item = post.media[0];
        const isVideo = item.type === 'VIDEO';
        return (
          <div
            key={post._id}
            onClick={() => onPostClick(post._id)}
            className="group relative aspect-square cursor-pointer overflow-hidden bg-accent/20"
          >
            {isVideo ? (
              <div className="flex h-full w-full items-center justify-center bg-black/80">
                <Play className="h-8 w-8 fill-white text-white opacity-80" />
              </div>
            ) : (
              <img
                src={item.url}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            {/* Multi-media indicator */}
            {post.media.length > 1 && (
              <span className="absolute right-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                +{post.media.length - 1}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Empty states ──────────────────────────────────────────────────────────────

const EMPTY_COPY: Record<TabId, { own: string; other: string }> = {
  posts:  { own: "You haven't posted yet",       other: "No posts yet" },
  media:  { own: "No media posts yet",            other: "No media posts yet" },
  likes:  { own: "You haven't liked anything yet", other: "No liked posts" },
  saved:  { own: "No saved posts yet",            other: "" },
};

function EmptyTab({ tab, isOwn }: { tab: TabId; isOwn: boolean }) {
  const copy = isOwn ? EMPTY_COPY[tab].own : EMPTY_COPY[tab].other;
  return (
    <div className="py-16 text-center text-sm text-muted-foreground/50 font-medium italic">
      {copy}
    </div>
  );
}
