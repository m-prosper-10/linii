import { apiClient } from '../lib/api';

export interface ContentAnalytics {
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  uniqueViewers: number;
  engagementRate: number;
  dailyBreakdown: Array<{ date: string; views: number; engagement: number }>;
}

export interface UserAnalytics {
  totalPosts: number;
  totalFollowers: number;
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
}

class AnalyticsService {
  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    const response = await apiClient.get<{ analytics: UserAnalytics }>(`/analytics/users/${userId}`);
    if (response.success && response.data) {
      return response.data.analytics;
    }
    throw new Error(response.message || 'Failed to fetch user analytics');
  }

  async getAccountInsights(): Promise<any> {
    const response = await apiClient.get<{ insights: any }>('/analytics/account/insights');
    if (response.success && response.data) {
      return response.data.insights;
    }
    throw new Error(response.message || 'Failed to fetch account insights');
  }

  async getContentAnalytics(contentType: string, contentId: string): Promise<ContentAnalytics> {
    const response = await apiClient.get<{ analytics: ContentAnalytics }>(`/analytics/content/${contentType}/${contentId}`);
    if (response.success && response.data) {
      return response.data.analytics;
    }
    throw new Error(response.message || 'Failed to fetch content analytics');
  }

  async getTrendingTopics(limit: number = 10): Promise<Array<{ hashtag: string; posts: number }>> {
    const response = await apiClient.get<{ topics: Array<{ hashtag: string; posts: number }> }>(`/analytics/topics?limit=${limit}`);
    if (response.success && response.data) {
      return response.data.topics;
    }
    throw new Error(response.message || 'Failed to fetch trending topics');
  }
}

export const analyticsService = new AnalyticsService();
