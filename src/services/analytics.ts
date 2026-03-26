import { apiClient } from "@/lib/api";
import { PostApiType } from "./post";

export interface TrendingPost extends PostApiType {
  score?: number;
}

export interface TrendingTopic {
  hashtag: string;
  posts: number;
}

export const analyticsService = {
  /**
   * Get trending content
   */
  async getTrendingContent(limit: number = 10): Promise<PostApiType[]> {
    const response = await apiClient.get<{ trending: PostApiType[] }>(`/analytics/trending?limit=${limit}`);
    if (response.success && response.data) {
      return response.data.trending;
    }
    throw new Error(response.message || 'Failed to get trending content');
  },

  /**
   * Get trending topics (hashtags)
   * Note: This might need a backend implementation if not already present
   */
  async getTrendingTopics(limit: number = 10): Promise<TrendingTopic[]> {
    try {
      // For now, if there's no dedicated endpoint, we might just return empty or mock
      // But let's assume we'll add one or it exists under a different name
      const response = await apiClient.get<{ topics: TrendingTopic[] }>('/analytics/topics');
      if (response.success && response.data) {
        return response.data.topics;
      }
      return [];
    } catch (error) {
       console.error('Failed to get trending topics:', error);
       return [];
    }
  }
};
