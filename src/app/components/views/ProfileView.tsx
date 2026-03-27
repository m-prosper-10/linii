'use client';

import { PostCard } from '@/app/components/post/PostCard';
import { PostDetailModal } from '@/app/components/post/PostDetailModal';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/app/components/ui/tabs';
import {
  ArrowLeft,
  Calendar,
  Edit,
  Link as LinkIcon,
  MapPin,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authService, User as ApiUser } from '@/services/auth';
import { PostService, PostApiType } from '@/services/post';
import { socialService } from '@/services/social';
import ProfileSkeleton from '@/app/components/skeletons/ProfileSkeleton';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

export function ProfileView() {
  const router = useRouter();
  const params = useParams();
  const { currentUser: appUser } = useApp();

  const [user, setUser] = useState<ApiUser | null>(null);
  const [posts, setPosts] = useState<PostApiType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const userId = params?.userId as string;
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
        setIsFollowing(profileData.followStatus?.isFollowing || false);
      }

      if (postsData) {
        setPosts(postsData.posts);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) return;
    const previousState = isFollowing;
    try {
      setIsFollowing(!isFollowing);
      if (previousState) {
        await socialService.unfollowUser(user._id);
        toast.success(`Unfollowed @${user.username}`);
      } else {
        await socialService.followUser(user._id);
        toast.success(`Following @${user.username}`);
      }
    } catch (error: any) {
      setIsFollowing(previousState);
      toast.error(error.message || 'Failed to update follow status');
    }
  };

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts(posts.filter(p => p._id !== deletedPostId));
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">User not found</h2>
        <Button variant="link" onClick={() => router.push('/home')}>
          Go Home
        </Button>
      </div>
    );
  }

  const mediaPosts = posts.filter(post => post.media && post.media.length > 0);
  const likedPosts = posts.filter(
    post => post.userReaction?.reactionType === 'LIKE'
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="bg-background/80 border-border sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">{user.fullnames}</h2>
            <p className="text-muted-foreground text-xs font-medium opacity-70">
              {user.postsCount || 0} posts
            </p>
          </div>
        </div>
      </div>

      <div>
        {/* Cover Image */}
        <div className="bg-accent/20 relative h-48 overflow-hidden">
          {user.coverImage ? (
            <img
              src={user.coverImage}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="from-primary/10 to-accent/10 h-full w-full bg-gradient-to-r" />
          )}
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="-mt-16 mb-4 flex items-start justify-between">
            <Avatar className="border-background h-32 w-32 border-4 shadow-xl">
              <AvatarImage src={user.avatar} alt={user.fullnames} />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                {user.fullnames
                  ? user.fullnames[0]
                  : user.username
                    ? user.username[0]
                    : '?'}
              </AvatarFallback>
            </Avatar>

            <div className="mt-16">
              {isOwnProfile ? (
                <Button
                  variant="outline"
                  className="gap-2 rounded-full px-6 font-semibold"
                  onClick={() => router.push('/edit-profile')}
                >
                  <Edit className="h-4 w-4" />
                  Edit profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant={isFollowing ? 'outline' : 'default'}
                    className="rounded-full px-6 font-bold"
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button variant="outline" className="rounded-full">
                    Message
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {user.fullnames}
                </h1>
                {user.verified && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary h-5 border-none px-2"
                  >
                    ✓
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground font-medium opacity-80">
                @{user.username}
              </p>
            </div>

            {user.bio && (
              <p className="text-foreground/90 whitespace-pre-wrap font-normal leading-relaxed">
                {user.bio}
              </p>
            )}

            <div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium opacity-80">
              {user.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 opacity-70" />
                  {user.location}
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-1.5">
                  <LinkIcon className="h-4 w-4 opacity-70" />
                  <a
                    href={`https://${user.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {user.website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 opacity-70" />
                Joined{' '}
                {new Date(user.joinedDate).toLocaleDateString(undefined, {
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>

            <div className="flex gap-6 pb-2">
              <button className="flex items-center gap-1.5 hover:underline">
                <span className="text-foreground font-bold">
                  {user.following?.toLocaleString() || 0}
                </span>{' '}
                <span className="text-muted-foreground text-sm font-medium">
                  Following
                </span>
              </button>
              <button className="flex items-center gap-1.5 hover:underline">
                <span className="text-foreground font-bold">
                  {user.followers?.toLocaleString() || 0}
                </span>{' '}
                <span className="text-muted-foreground text-sm font-medium">
                  Followers
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="border-border h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="posts"
              className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-8 py-4 text-sm font-bold data-[state=active]:bg-transparent"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-8 py-4 text-sm font-bold data-[state=active]:bg-transparent"
            >
              Media
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-8 py-4 text-sm font-bold data-[state=active]:bg-transparent"
            >
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            {posts.length > 0 ? (
              posts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPostClick={() => setSelectedPostId(post._id)}
                  onDeleted={handlePostDeleted}
                />
              ))
            ) : (
              <div className="text-muted-foreground p-12 text-center font-medium opacity-60">
                No posts yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="media" className="mt-0 p-1">
            {mediaPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {mediaPosts.map(post => (
                  <div
                    key={post._id}
                    className="bg-accent/20 border-border/50 aspect-square cursor-pointer overflow-hidden border transition-opacity hover:opacity-90"
                    onClick={() => setSelectedPostId(post._id)}
                  >
                    {post.media[0].type === 'VIDEO' ? (
                      <div className="flex h-full w-full items-center justify-center bg-black">
                        <span className="text-xs font-bold uppercase tracking-widest text-white">
                          Video
                        </span>
                      </div>
                    ) : (
                      <img
                        src={post.media[0].url}
                        alt="Media"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground p-12 text-center font-medium opacity-60">
                No media posts yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="likes" className="mt-0">
            {likedPosts.length > 0 ? (
              likedPosts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPostClick={() => setSelectedPostId(post._id)}
                  onDeleted={handlePostDeleted}
                />
              ))
            ) : (
              <div className="text-muted-foreground p-12 text-center font-medium opacity-60">
                No liked posts yet
              </div>
            )}
          </TabsContent>
        </Tabs>
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
