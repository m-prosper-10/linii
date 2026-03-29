'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { analyticsService, UserAnalytics } from '@/services/analytics';
import { PostService, PostApiType } from '@/services/post';
import { PostDetailModal } from '@/app/components/post/PostDetailModal';
import AnalyticsSkeleton from '@/app/components/skeletons/AnalyticsSkeleton';

import { StatCards } from '@/app/components/analytics/StatCards';
import { EngagementChart } from '@/app/components/analytics/EngagementChart';
import { AudienceGrowthChart } from '@/app/components/analytics/AudienceGrowthChart';
import { AIInsightsCard } from '@/app/components/analytics/AIInsightsCard';
import { TopPostsList } from '@/app/components/analytics/TopPostsList';

export function AnalyticsView() {
  const { currentUser } = useApp();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [topPosts, setTopPosts] = useState<PostApiType[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!currentUser?._id) return;
    setLoading(true);
    try {
      const data = await analyticsService.getUserAnalytics(currentUser._id);
      setAnalytics(data);

      if (data.topPerformingPosts?.length > 0) {
        const results = await Promise.all(
          data.topPerformingPosts.map(p => PostService.getPost(p.postId).catch(() => null))
        );
        setTopPosts(results.filter((p): p is PostApiType => p !== null));
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?._id]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const handlePostDeleted = (id: string) => {
    setTopPosts(prev => prev.filter(p => p._id !== id));
  };

  if (loading) return <AnalyticsSkeleton />;

  if (!analytics) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted-foreground/60">
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
          <p className="text-xs text-muted-foreground/60 font-medium">
            Track your performance and audience growth
          </p>
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
          <AIInsightsCard />
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
