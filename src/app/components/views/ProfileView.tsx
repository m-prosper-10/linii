"use client";

import { useState } from 'react';
import { ArrowLeft, MapPin, Link as LinkIcon, Calendar, Edit } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { PostCard } from '@/app/components/PostCard';
import { useApp } from '@/context/AppContext';
import { mockPosts, mockUsers, currentUser as mockCurrentUser } from '@/data/mockData';

export function ProfileView() {
  const { setCurrentView, selectedUserId, setSelectedUserId } = useApp();
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Determine which user to show
  const user = selectedUserId 
    ? mockUsers.find(u => u.id === selectedUserId) || mockCurrentUser
    : mockCurrentUser;
  
  const isOwnProfile = !selectedUserId || user.id === mockCurrentUser.id;
  
  // Filter posts by user
  const userPosts = mockPosts.filter(post => post.author.id === user.id);
  const userMediaPosts = userPosts.filter(post => post.image || post.video);
  const userLikedPosts = mockPosts.filter(post => post.isLiked);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setCurrentView('home')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold text-xl">{user.displayName}</h2>
            <p className="text-sm text-muted-foreground">{userPosts.length} posts</p>
          </div>
        </div>
      </div>

      <div>
        {/* Cover Image */}
        <div className="h-48 bg-accent relative">
          <img 
            src={user.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-start -mt-16 mb-4">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback className="text-3xl">{user.displayName[0]}</AvatarFallback>
            </Avatar>

            <div className="mt-16">
              {isOwnProfile ? (
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setCurrentView('edit-profile')}
                >
                  <Edit className="h-4 w-4" />
                  Edit profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant={isFollowing ? 'outline' : 'default'}
                    onClick={() => setIsFollowing(!isFollowing)}
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
                  <Badge variant="secondary" className="h-5 px-2">✓</Badge>
                )}
              </div>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>

            <p>{user.bio}</p>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {user.location}
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  <a href={`https://${user.website}`} className="text-primary hover:underline">
                    {user.website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {user.joinedDate}
              </div>
            </div>

            <div className="flex gap-4">
              <button className="hover:underline">
                <span className="font-semibold">{user.following.toLocaleString()}</span>{' '}
                <span className="text-muted-foreground">Following</span>
              </button>
              <button className="hover:underline">
                <span className="font-semibold">{user.followers.toLocaleString()}</span>{' '}
                <span className="text-muted-foreground">Followers</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0">
            <TabsTrigger 
              value="posts" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="media" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Media
            </TabsTrigger>
            <TabsTrigger 
              value="likes" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No posts yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="media" className="mt-0">
            {userMediaPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 p-4">
                {userMediaPosts.map((post) => (
                  <div key={post.id} className="aspect-square bg-accent rounded-lg overflow-hidden">
                    <img 
                      src={post.image} 
                      alt="Media" 
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No media posts yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="likes" className="mt-0">
            {userLikedPosts.length > 0 ? (
              userLikedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No liked posts yet
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}