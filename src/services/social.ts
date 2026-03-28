import { apiClient } from "@/lib/api";
import { User } from "./auth";

export interface FollowStatus {
  isFollowing: boolean;
  isFollowedBy: boolean;
  status: 'FOLLOWING' | 'REQUESTED' | 'NONE';
}

export interface UserStats {
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export const socialService = {
  /**
   * Follow a user
   */
  async followUser(userId: string): Promise<void> {
    const response = await apiClient.post(`/social/${userId}/follow`, {});
    if (!response.success) {
      throw new Error(response.message || 'Failed to follow user');
    }
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(userId: string): Promise<void> {
    const response = await apiClient.delete(`/social/${userId}/follow`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to unfollow user');
    }
  },

  /**
   * Block a user
   */
  async blockUser(userId: string): Promise<void> {
    const response = await apiClient.post(`/social/${userId}/block`, {});
    if (!response.success) {
      throw new Error(response.message || 'Failed to block user');
    }
  },

  /**
   * Unblock a user
   */
  async unblockUser(userId: string): Promise<void> {
    const response = await apiClient.delete(`/social/${userId}/block`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to unblock user');
    }
  },

  /**
   * Get follow status between current user and target user
   */
  async getFollowStatus(userId: string): Promise<FollowStatus> {
    const response = await apiClient.get<FollowStatus>(`/social/${userId}/status`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get follow status');
  },

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserStats> {
    const response = await apiClient.get<UserStats>(`/social/${userId}/stats`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get user stats');
  },

  /**
   * Get suggested users to follow
   */
  async getSuggestedUsers(limit: number = 5): Promise<Partial<User>[]> {
    const response = await apiClient.get<{ users: Partial<User>[] }>(`/social/suggested?limit=${limit}`);
    if (response.success && response.data) {
      return response.data.users;
    }
    throw new Error(response.message || 'Failed to get suggested users');
  },

  /**
   * Search for users by query
   */
  async searchUsers(query: string, page: number = 1, limit: number = 20): Promise<{ users: Partial<User>[], total: number }> {
    const response = await apiClient.get<any>(`/social/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    if (response.success && response.data) {
      return {
        users: response.data.users,
        total: response.data.total
      };
    }
    throw new Error(response.message || 'Search failed');
  }
};
