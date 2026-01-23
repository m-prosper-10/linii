import { PostCard } from '@/app/components/PostCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { mockAnalytics } from '@/data/mockData';
import { Eye, Heart, MessageCircle, TrendingUp, Users } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function AnalyticsView() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <h2 className="font-semibold text-xl">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Track your performance and audience growth
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAnalytics.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockAnalytics.totalLikes.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +18% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockAnalytics.totalComments.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +24% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockAnalytics.totalFollowers.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 text-xs flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +{mockAnalytics.followerGrowth}% growth
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Post Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Post Performance</CardTitle>
            <CardDescription>
              Views, engagement, and likes over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={mockAnalytics.postPerformance}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.5}
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                  }}
                  labelStyle={{
                    color: 'hsl(var(--foreground))',
                    fontWeight: 600,
                    marginBottom: '8px'
                  }}
                  itemStyle={{
                    color: 'hsl(var(--foreground))',
                    padding: '4px 0'
                  }}
                  cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                  formatter={(value) => <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px' }}>{value}</span>}
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={4}
                  name="Views"
                  dot={{ fill: 'hsl(var(--chart-1))', r: 5, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                  activeDot={{ r: 7, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={4}
                  name="Engagement"
                  dot={{ fill: 'hsl(var(--chart-2))', r: 5, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                  activeDot={{ r: 7, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
                <Line 
                  type="monotone" 
                  dataKey="likes" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={4}
                  name="Likes"
                  dot={{ fill: 'hsl(var(--chart-3))', r: 5, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                  activeDot={{ r: 7, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audience Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Audience Growth</CardTitle>
              <CardDescription>
                Follower count over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockAnalytics.audienceGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="followers" 
                    stroke="hsl(var(--chart-4))" 
                    strokeWidth={3}
                    fill="hsl(var(--chart-4))" 
                    fillOpacity={0.4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engagement Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement by Day</CardTitle>
              <CardDescription>
                Daily engagement rate comparison
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockAnalytics.postPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="engagement" 
                    fill="hsl(var(--chart-5))" 
                    fillOpacity={0.9}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Personalized recommendations to improve your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-accent/30 rounded-lg">
                <h4 className="font-medium mb-2">Best Posting Time</h4>
                <p className="text-sm text-muted-foreground">
                  Your audience is most active on Wednesdays at 2 PM. Consider posting during this time for maximum engagement.
                </p>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg">
                <h4 className="font-medium mb-2">Content Performance</h4>
                <p className="text-sm text-muted-foreground">
                  Posts with images receive 40% more engagement than text-only posts. Try including more visual content in your feed.
                </p>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg">
                <h4 className="font-medium mb-2">Trending Topics</h4>
                <p className="text-sm text-muted-foreground">
                  #AIRevolution and #WebDevelopment are trending in your network. Consider creating content around these topics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>
              Your most successful content this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.topPosts.map((post) => (
                <div key={post.id} className="border border-border rounded-lg overflow-hidden">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}