'use client';

import { PostCard } from '@/app/components/PostCard';
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
import { Post } from '@/data/mockData';
import {
  ArrowLeft,
  Calendar,
  Edit,
  Link as LinkIcon,
  MapPin,
  Loader2,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authService, User as ApiUser } from '@/services/auth';
import { PostService, PostApiType } from '@/services/post';
import { socialService } from '@/services/social';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

export function ProfileView() {
  const router = useRouter();
  const params = useParams();
  const { currentUser: appUser } = useApp();

  const [user, setUser] = useState<ApiUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const userId = params?.userId as string;
  const isOwnProfile = !userId || userId === appUser?.id;

  useEffect(() => {
    fetchProfile();
  }, [userId, appUser?.id]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const targetId = userId || appUser?.id;
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
        setPosts(postsData.posts.map(mapToPost));
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
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
      coverImage: '',
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
    commentsData: apiPost.comments?.map(apiComment => ({
      id: apiComment._id,
      author: {
        id: apiComment.author._id,
        displayName: apiComment.author.fullnames,
        username: apiComment.author.username,
        avatar: apiComment.author.avatar || '',
        verified: apiComment.author.verified || false,
        joinedDate: '',
        following: 0,
        followers: 0,
        bio: '',
        coverImage: '',
      },
      content: apiComment.content,
      timestamp: new Date(apiComment.createdAt).toLocaleDateString(),
      likes: apiComment.likesCount,
      isLiked: apiComment.userReaction?.reactionType === 'LIKE',
    })),
  });

  const handleFollowToggle = async () => {
    if (!user) return;
    const previousState = isFollowing;
    try {
      setIsFollowing(!isFollowing);
      if (previousState) {
        await socialService.unfollowUser(user.id);
        toast.success(`Unfollowed @${user.username}`);
      } else {
        await socialService.followUser(user.id);
        toast.success(`Following @${user.username}`);
      }
    } catch (error: any) {
      setIsFollowing(previousState);
      toast.error(error.message || 'Failed to update follow status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
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

  const mediaPosts = posts.filter(post => post.image || post.video);
  const likedPosts = posts.filter(post => post.isLiked);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="bg-background/80 border-border sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{user.displayName}</h2>
            <p className="text-muted-foreground text-sm">
              {user.postsCount || 0} posts
            </p>
          </div>
        </div>
      </div>

      <div>
        {/* Cover Image */}
        <div className="bg-accent relative h-48">
          {user.coverImage && (
            <img
              src={user.coverImage}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="-mt-16 mb-4 flex items-start justify-between">
            <Avatar className="border-background h-32 w-32 border-4">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback className="text-3xl">
                {user.displayName[0]}
              </AvatarFallback>
            </Avatar>

            <div className="mt-16">
              {isOwnProfile ? (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => router.push('/edit-profile')}
                >
                  <Edit className="h-4 w-4" />
                  Edit profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant={isFollowing ? 'outline' : 'default'}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button variant="outline">Message</Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{user.displayName}</h1>
                {user.verified && (
                  <Badge variant="secondary" className="h-5 px-2">
                    ✓
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>

            {user.bio && <p className="whitespace-pre-wrap">{user.bio}</p>}

            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {user.location}
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  <a
                    href={`https://${user.website}`}
                    className="text-primary hover:underline"
                  >
                    {user.website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined{' '}
                {new Date(user.joinedDate).toLocaleDateString(undefined, {
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <button className="hover:underline">
                <span className="font-semibold">
                  {user.following?.toLocaleString()}
                </span>{' '}
                <span className="text-muted-foreground">Following</span>
              </button>
              <button className="hover:underline">
                <span className="font-semibold">
                  {user.followers?.toLocaleString()}
                </span>{' '}
                <span className="text-muted-foreground">Followers</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="border-border h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="posts"
              className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
            >
              Media
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
            >
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            {posts.length > 0 ? (
              posts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="text-muted-foreground p-8 text-center">
                No posts yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="media" className="mt-0">
            {mediaPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 p-4">
                {mediaPosts.map(post => (
                  <div
                    key={post.id}
                    className="bg-accent aspect-square overflow-hidden rounded-lg"
                  >
                    <img
                      src={post.image}
                      alt="Media"
                      className="h-full w-full cursor-pointer object-cover transition-opacity hover:opacity-90"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground p-8 text-center">
                No media posts yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="likes" className="mt-0">
            {likedPosts.length > 0 ? (
              likedPosts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="text-muted-foreground p-8 text-center">
                No liked posts yet
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
