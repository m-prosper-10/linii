'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import {
  analyticsService,
  UserAnalytics,
  AccountInsights,
} from '@/services/analytics';
import { PostService, PostApiType } from '@/services/post';
import { PostDetailModal } from '@/app/components/post/PostDetailModal';
import AnalyticsSkeleton from '@/app/components/skeletons/AnalyticsSkeleton';

import { StatCards } from '@/app/components/analytics/StatCards';
import { EngagementChart } from '@/app/components/analytics/EngagementChart';
import { AudienceGrowthChart } from '@/app/components/analytics/AudienceGrowthChart';
import { AIInsightsCard } from '@/app/components/analytics/AIInsightsCard';
import { TopPostsList } from '@/app/components/analytics/TopPostsList';
import { Button } from '@/app/components/ui/button';

const TIME_RANGES = ['WEEK', 'MONTH', 'YEAR'] as const;
type TimeRange = (typeof TIME_RANGES)[number];

export function AnalyticsView() {
  const { currentUser } = useApp();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [accountInsights, setAccountInsights] = useState<AccountInsights | null>(
    null
  );
  const [topPosts, setTopPosts] = useState<PostApiType[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('MONTH');

  const fetchAnalytics = useCallback(async () => {
    if (!currentUser?._id) return;
    setLoading(true);
    try {
      const [data, insights] = await Promise.all([
        analyticsService.getUserAnalytics(currentUser._id, timeRange),
        analyticsService.getAccountInsights(timeRange),
      ]);
      setAnalytics(data);
      setAccountInsights(insights);

      if (data.topPerformingPosts?.length > 0) {
        const results = await Promise.all(
          data.topPerformingPosts.map(p =>
            PostService.getPost(p.postId).catch(() => null)
          )
        );
        setTopPosts(results.filter((p): p is PostApiType => p !== null));
      } else {
        setTopPosts([]);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?._id, timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handlePostDeleted = (id: string) => {
    setTopPosts(prev => prev.filter(p => p._id !== id));
  };

  const aiInsights = accountInsights
    ? [
        {
          title: 'Reach Snapshot',
          desc: `You generated ${accountInsights.overview.totalViews.toLocaleString()} views and ${accountInsights.overview.totalEngagement.toLocaleString()} interactions in this ${timeRange.toLowerCase()} window.`,
        },
        {
          title: 'Best Device Channel',
          desc:
            accountInsights.audience.topDevices[0]
              ? `${accountInsights.audience.topDevices[0].device.toLowerCase()} users are your biggest audience segment right now.`
              : 'Device segmentation will appear as more audience activity is tracked.',
        },
        {
          title: 'Top Geography',
          desc:
            accountInsights.audience.topLocations[0]
              ? `${accountInsights.audience.topLocations[0].location} is currently your strongest audience location.`
              : 'Location insights will appear once enough audience events are recorded.',
        },
      ]
    : undefined;

  if (loading) return <AnalyticsSkeleton />;

  if (!analytics) {
    return (
      <div className="text-muted-foreground/60 flex h-[calc(100vh-4rem)] items-center justify-center text-sm">
        No analytics data available yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl pb-20">
      {/* Header */}
      <div className="bg-background/80 border-border/40 sticky top-0 z-10 border-b backdrop-blur-md">
        <div className="px-4 py-3">
          <h2 className="text-xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground/60 text-xs font-medium">
            Track your performance and audience growth
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TIME_RANGES.map(range => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="h-8 rounded-full px-3 text-[10px] font-bold uppercase tracking-widest"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6 p-4">
        {/* Stat cards */}
        <StatCards analytics={analytics} />

        {/* Engagement line chart — full width */}
        <EngagementChart data={analytics.growthMetrics.engagementGrowth} />

        {/* Audience growth + AI insights — side by side on large screens */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AudienceGrowthChart data={analytics.growthMetrics.followersGrowth} />
          <AIInsightsCard insights={aiInsights} />
        </div>

        {/* Top performing posts */}
        <section>
          <h3 className="mb-3 px-0.5 text-base font-bold tracking-tight">
            Top Performing Content
          </h3>
          <TopPostsList
            posts={topPosts}
            onPostClick={setSelectedPostId}
            onPostDeleted={handlePostDeleted}
          />
        </section>
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
