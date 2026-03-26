'use client';

import { useState } from 'react';
import { PostCard } from '@/app/components/PostCard';
import { PostDetailModal } from '@/app/components/PostDetailModal';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { mockAnalytics } from '@/data/mockData';
import { Eye, Heart, MessageCircle, TrendingUp, Users } from 'lucide-react';
import { PostApiType } from '@/services/post';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function AnalyticsView() {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Map mock top posts to PostApiType for compatibility with updated PostCard
  const topPosts = mockAnalytics.topPosts.map(
    post =>
      ({
        _id: post.id,
        author: {
          _id: post.author.id,
          fullnames: post.author.displayName,
          username: post.author.username,
          avatar: post.author.avatar,
          verified: post.author.verified,
        },
        content: post.content,
        media: post.image ? [{ url: post.image, type: 'IMAGE' }] : [],
        likesCount: post.likes,
        commentsCount: post.comments,
        sharesCount: post.reposts,
        views: post.reach,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: post.tags || [],
        userReaction: post.isLiked ? { reactionType: 'LIKE' } : undefined,
        userShared: post.isReposted,
      }) as unknown as PostApiType
  );

  return (
    <div className="mx-auto max-w-6xl pb-20">
      <div className="bg-background/80 border-border sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="p-4">
          <h2 className="text-xl font-semibold">Analytics</h2>
          <p className="text-muted-foreground text-sm">
            Track your performance and audience growth
          </p>
        </div>
      </div>

      <div className="space-y-6 p-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-tight opacity-70">
                Total Posts
              </CardTitle>
              <Eye className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockAnalytics.totalPosts}
              </div>
              <p className="text-muted-foreground text-xs font-semibold opacity-60">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-tight opacity-70">
                Total Likes
              </CardTitle>
              <Heart className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockAnalytics.totalLikes.toLocaleString()}
              </div>
              <p className="text-muted-foreground text-xs font-semibold opacity-60">
                +18% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-tight opacity-70">
                Comments
              </CardTitle>
              <MessageCircle className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockAnalytics.totalComments.toLocaleString()}
              </div>
              <p className="text-muted-foreground text-xs font-semibold opacity-60">
                +24% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-tight opacity-70">
                Followers
              </CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockAnalytics.totalFollowers.toLocaleString()}
              </div>
              <p className="flex items-center gap-1 text-xs font-bold text-green-500">
                <TrendingUp className="h-3 w-3" />+
                {mockAnalytics.followerGrowth}% growth
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Post Performance Chart */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="tracking-tight">Post Performance</CardTitle>
            <CardDescription className="font-medium opacity-70">
              Views, engagement, and likes over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={mockAnalytics.postPerformance}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.3}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={value => value.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  }}
                  labelStyle={{
                    color: 'hsl(var(--foreground))',
                    fontWeight: 700,
                    marginBottom: '8px',
                    fontSize: '12px',
                  }}
                  itemStyle={{
                    padding: '4px 0',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                  cursor={{
                    stroke: 'hsl(var(--primary))',
                    strokeWidth: 1,
                    strokeDasharray: '3 3',
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                  formatter={value => (
                    <span className="text-muted-foreground mx-2 text-[11px] font-bold uppercase tracking-widest">
                      {value}
                    </span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  name="Views"
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  stroke="hsl(var(--accent-foreground))"
                  strokeWidth={3}
                  name="Engagement"
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="likes"
                  stroke="rgb(239, 68, 68)"
                  strokeWidth={3}
                  name="Likes"
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Insights and Additional Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Audience Growth */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg tracking-tight">
                Audience Growth
              </CardTitle>
              <CardDescription className="font-medium opacity-70">
                Follower count over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockAnalytics.audienceGrowth}>
                  <defs>
                    <linearGradient
                      id="colorFollowers"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.2}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    fontWeight={600}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    fontWeight={600}
                    hide
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="followers"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorFollowers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* AI Insights Component */}
          <Card className="border-primary/20 bg-primary/5 shadow-inner">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg tracking-tight">
                <TrendingUp className="text-primary h-5 w-5" />
                AI Content Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Simplified Insight items */}
              {[
                {
                  title: 'Peak Engagement',
                  desc: 'Your audience is most active on Wednesdays at 2 PM.',
                },
                {
                  title: 'Visual Advantage',
                  desc: 'Posts with media receive 40% more engagement.',
                },
                {
                  title: 'Topic Trend',
                  desc: 'Try posting about #AIRevolution or #WebDev.',
                },
              ].map((insight, i) => (
                <div
                  key={i}
                  className="bg-background/50 border-border/50 rounded-xl border p-3"
                >
                  <h4 className="text-primary mb-1 text-xs font-bold uppercase tracking-widest">
                    {insight.title}
                  </h4>
                  <p className="text-muted-foreground text-xs font-medium leading-snug">
                    {insight.desc}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Posts */}
        <div className="space-y-4">
          <h3 className="px-1 text-lg font-bold tracking-tight">
            Top Performing Content
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {topPosts.map(post => (
              <div
                key={post._id}
                className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md"
              >
                <PostCard
                  post={post}
                  onPostClick={id => setSelectedPostId(id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedPostId && (
        <PostDetailModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </div>
  );
}
