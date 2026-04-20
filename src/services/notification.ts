import { apiClient } from '../lib/api';
import { User } from './auth';

export interface Notification {
  _id: string;
  recipient: string;
  sender: User;
  type: 'LIKE' | 'COMMENT' | 'SHARE' | 'FOLLOW' | 'MENTION' | 'POST' | 'POLL_VOTE' | 'EVENT_INVITE';
  targetType: 'POST' | 'COMMENT' | 'USER' | 'EVENT' | 'STORY';
  targetId: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

class NotificationService {
  async getNotifications(page: number = 1, limit: number = 20): Promise<NotificationsResponse> {
    const response = await apiClient.get<NotificationsResponse>(`/notifications?page=${page}&limit=${limit}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch notifications');
  }

  async getUnreadNotifications(): Promise<{ notifications: Notification[]; count: number }> {
    const response = await apiClient.get<{ notifications: Notification[]; count: number }>('/notifications/unread');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch unread notifications');
  }

  async markAsRead(notificationId: string): Promise<void> {
    const response = await apiClient.post(`/notifications/${notificationId}/read`, {});
    if (!response.success) {
      throw new Error(response.message || 'Failed to mark notification as read');
    }
  }

  async markAllAsRead(): Promise<void> {
    const response = await apiClient.post('/notifications/read-all', {});
    if (!response.success) {
      throw new Error(response.message || 'Failed to mark all notifications as read');
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete notification');
    }
  }
}

export const notificationService = new NotificationService();
