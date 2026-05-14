import { apiClient } from '../lib/api';
import { PostApiType } from './post';

export interface TrendingTopic {
  hashtag: string;
  posts: number;
}

export type AnalyticsTimeRange = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export interface ContentAnalytics {
  contentId: string;
  contentType: 'POST' | 'STORY' | 'USER';
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  totalClicks: number;
  totalImpressions: number;
  uniqueViewers: number;
  engagementRate: number;
  topLocations: Array<{ location: string; count: number }>;
  topDevices: Array<{ device: string; count: number }>;
  hourlyBreakdown: Array<{ hour: number; views: number; engagement: number }>;
  dailyBreakdown: Array<{ date: string; views: number; engagement: number }>;
}

export interface UserAnalytics {
  userId: string;
  totalPosts: number;
  totalStories: number;
  totalFollowers: number;
  totalFollowing: number;
  totalSharesReceived: number;
  totalLikesReceived: number;
  totalCommentsReceived: number;
  totalViews: number;
  engagementRate: number;
  topPerformingPosts: Array<{
    postId: string;
    views: number;
    engagement: number;
  }>;
  growthMetrics: {
    followersGrowth: Array<{ date: string; count: number }>;
    engagementGrowth: Array<{ date: string; rate: number }>;
  };
  audienceDemographics: {
    ageGroups: Record<string, number> | Map<string, number>;
    genders: Record<string, number> | Map<string, number>;
    locations: Record<string, number> | Map<string, number>;
    devices: Record<string, number> | Map<string, number>;
  };
}

export interface AccountInsights {
  overview: {
    totalPosts: number;
    totalStories: number;
    totalViews: number;
    totalEngagement: number;
    engagementRate: number;
  };
  performance: {
    topPerformingPosts: Array<{
      postId: string;
      views: number;
      engagement: number;
    }>;
    dailyBreakdown: Array<{ date: string; views: number; engagement: number }>;
    hourlyBreakdown: Array<{ hour: number; views: number; engagement: number }>;
  };
  audience: {
    demographics: UserAnalytics['audienceDemographics'];
    topLocations: Array<{ location: string; count: number }>;
    topDevices: Array<{ device: string; count: number }>;
  };
}

export interface TrackAnalyticsEventPayload {
  contentType: 'POST' | 'STORY' | 'COMMENT';
  contentId: string;
  eventType: 'VIEW' | 'LIKE' | 'SHARE' | 'COMMENT' | 'CLICK' | 'IMPRESSION';
  metadata?: Record<string, unknown>;
}

class AnalyticsService {
  async getUserAnalytics(userId: string, timeRange: Exclude<AnalyticsTimeRange, 'DAY'> = 'MONTH'): Promise<UserAnalytics> {
    const response = await apiClient.get<{ analytics: UserAnalytics }>(
      `/analytics/users/${userId}?timeRange=${timeRange}`
    );
    if (response.success && response.data) {
      return response.data.analytics;
    }
    throw new Error(response.message || 'Failed to fetch user analytics');
  }

  async getAccountInsights(timeRange: Exclude<AnalyticsTimeRange, 'DAY'> = 'MONTH'): Promise<AccountInsights> {
    const response = await apiClient.get<{ insights: AccountInsights }>(
      `/analytics/account/insights?timeRange=${timeRange}`
    );
    if (response.success && response.data) {
      return response.data.insights;
    }
    throw new Error(response.message || 'Failed to fetch account insights');
  }

  async getContentAnalytics(
    contentType: 'POST' | 'STORY' | 'USER',
    contentId: string,
    timeRange: AnalyticsTimeRange = 'WEEK'
  ): Promise<ContentAnalytics> {
    const response = await apiClient.get<{ analytics: ContentAnalytics }>(
      `/analytics/content/${contentType}/${contentId}?timeRange=${timeRange}`
    );
    if (response.success && response.data) {
      return response.data.analytics;
    }
    throw new Error(response.message || 'Failed to fetch content analytics');
  }

  async getTrendingContent(limit: number = 10): Promise<PostApiType[]> {
    const response = await apiClient.get<{ trending: PostApiType[] }>(`/analytics/trending?limit=${limit}`);
    if (response.success && response.data) {
      return response.data.trending;
    }
    throw new Error(response.message || 'Failed to fetch trending content');
  }

  async getTrendingTopics(limit: number = 10): Promise<TrendingTopic[]> {
    const response = await apiClient.get<{ topics: TrendingTopic[] }>(`/analytics/topics?limit=${limit}`);
    if (response.success && response.data) {
      return response.data.topics;
    }
    throw new Error(response.message || 'Failed to fetch trending topics');
  }

  async trackEvent(payload: TrackAnalyticsEventPayload): Promise<void> {
    const response = await apiClient.post('/analytics/track', payload);
    if (!response.success) {
      throw new Error(response.message || 'Failed to track analytics event');
    }
  }
}

export const analyticsService = new AnalyticsService();
