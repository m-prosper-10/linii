import { apiClient } from '../lib/api';

export interface PostApiType {
  _id: string;
  author: {
    _id: string;
    fullnames: string;
    username: string;
    email: string;
    avatar?: string;
    isVerified?: boolean;
  };
  content: string;
  postType: string;
  media: Array<{
    type: string;
    url: string;
    thumbnail?: string;
  }>;
  comments: Array<{
    _id: string;
    author: {
      _id: string;
      fullnames: string;
      username: string;
      email: string;
      avatar?: string;
      isVerified?: boolean;
    };
    content: string;
    createdAt: string;
    likesCount: number;
    userReaction?: {
      reactionType: string;
    };
  }>;
  visibility: string;
  tags: string[];
  mentions: Array<string | { 
    _id: string; 
    fullnames: string; 
    username: string; 
    email: string; 
    avatar?: string;
    isVerified?: boolean;
  }>;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  views: number;
  userReaction?: {
    reactionType: string;
  };
  userShared?: boolean;
  /** Server: whether the current user saved this post */
  userSaved?: boolean;
  createdAt: string;
  poll?: {
    _id: string;
    question: string;
    options: Array<{
      _id: string;
      text: string;
      votes: string[]; // user ids
    }>;
    expiresAt: string;
    totalVotes: number;
    userVoted?: string[]; // array of option IDs
  };
}

export interface PostsResponse {
  posts: PostApiType[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface CreatePostPayload {
  content: string;
  postType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'POLL' | 'EVENT';
  media?: Array<{ type: string; url: string }>;
  visibility?: 'PUBLIC' | 'FRIENDS' | 'PRIVATE' | 'CUSTOM';
  tags?: string[];
  mentions?: string[];
  poll?: {
    question: string;
    options: string[];
    allowMultiple?: boolean;
    expiresAt?: Date;
  };
  location?: {
    name: string;
    coordinates?: [number, number];
  };
  scheduledFor?: Date;
}

export interface CreateCommentPayload {
  postId: string;
  content: string;
}

export type FeedTypeFilter = 'ALL' | 'FOLLOWING' | 'TRENDING' | 'NEARBY';
export type FeedTimeFilter = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH';

/** Sent as query params when using NEARBY feed; `radiusKm` maps to backend `radius` (kilometers). */
export interface NearbyQuery {
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export interface FeedQueryOptions {
  type?: FeedTypeFilter;
  postType?: string;
  timeRange?: FeedTimeFilter;
  nearby?: NearbyQuery;
}

export class PostService {
  static async getFeed(
    page = 1,
    limit = 20,
    options?: FeedQueryOptions
  ): Promise<PostsResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (options?.type && options.type !== 'ALL') {
      params.set('type', options.type);
    }
    if (options?.postType) {
      params.set('postType', options.postType);
    }
    if (options?.timeRange && options.timeRange !== 'ALL') {
      params.set('timeRange', options.timeRange);
    }
    if (options?.nearby) {
      params.set('latitude', String(options.nearby.latitude));
      params.set('longitude', String(options.nearby.longitude));
      params.set('radius', String(options.nearby.radiusKm));
    }
    const response = await apiClient.get<PostsResponse>(`/posts?${params.toString()}`);
    return response.data!;
  }

  static async createPost(data: Omit<CreatePostPayload, 'media'> & { mediaFiles?: File[] }): Promise<PostApiType> {
    const formData = new FormData();
    formData.append('content', data.content);

    if (data.postType) {
      formData.append('postType', data.postType);
    }

    if (data.visibility) {
      formData.append('visibility', data.visibility);
    }

    if (data.mediaFiles && data.mediaFiles.length > 0) {
      data.mediaFiles.forEach((file) => {
        formData.append('media', file);
      });
    }

    if (data.poll) {
      formData.append('poll', JSON.stringify(data.poll));
    }

    if (data.location) {
      formData.append('location', JSON.stringify(data.location));
    }

    if (data.scheduledFor) {
      formData.append('scheduledFor', data.scheduledFor.toISOString());
    }

    if (data.mentions && data.mentions.length > 0) {
      formData.append('mentions', JSON.stringify(data.mentions));
    }

    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    }

    // Since we are sending FormData, we should use apiClient.upload
    // Note: By doing this, we also need to ensure apiClient.upload returns the expected shape.
    // apiClient.upload doesn't set Content-Type header so the browser sets multipart/form-data with boundaries automatically.
    const response = await apiClient.upload<{ data: { post: PostApiType } }>(
      '/posts',
      formData
    );
    return response.data?.data.post as PostApiType;
  }

  static async toggleReaction(postId: string, reactionType = 'LIKE') {
    const response = await apiClient.post<{ message: string, data: unknown }>('/engagement/react', {
      targetType: 'POST',
      targetId: postId,
      reactionType
    });
    return response;
  }

  static async addComment(payload: CreateCommentPayload) {
    const response = await apiClient.post<unknown>(`/engagement/posts/${payload.postId}/comments`, {
      postId: payload.postId,
      content: payload.content
    });
    return response.data;
  }

  static async toggleRepost(postId: string) {
    try {
      // Attempt to share. If user already shared, this might fail according to backend logic
      // But let's assume if it fails with 'Post already shared', we want to unshare
      const response = await apiClient.post<unknown>(`/engagement/posts/${postId}/share`, {
        postId,
        shareType: 'REPOST',
        content: ''
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message === 'Post already shared') {
        const response = await apiClient.delete<unknown>(`/engagement/posts/${postId}/share`);
        return response.data;
      }
      throw error;
    }
  }

  static async getUserPosts(userId: string, page = 1, limit = 20): Promise<PostsResponse> {
    const response = await apiClient.get<PostsResponse>(`/posts/user/${userId}?page=${page}&limit=${limit}`);
    return response.data!;
  }

  static async getPost(postId: string): Promise<PostApiType> {
    const response = await apiClient.get<{ post: PostApiType }>(`/posts/${postId}`);
    return response.data!.post;
  }

  static async deletePost(postId: string): Promise<void> {
    await apiClient.delete(`/posts/${postId}`);
  }

  static async updatePost(
    postId: string,
    body: {
      content?: string;
      visibility?: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
      tags?: string[];
      isPinned?: boolean;
    }
  ): Promise<PostApiType> {
    const response = await apiClient.put<{ post: PostApiType }>(`/posts/${postId}`, body);
    return response.data!.post;
  }

  static async toggleSavePost(postId: string): Promise<{ saved: boolean }> {
    const response = await apiClient.post<{ saved: boolean }>(`/posts/${postId}/save`, {});
    return response.data!;
  }

  static async searchPosts(query: string, page = 1, limit = 20): Promise<PostsResponse> {
    const response = await apiClient.get<PostsResponse>(`/posts/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data!;
  }

  static async votePoll(postId: string, optionId: string): Promise<PostApiType> {
    const response = await apiClient.post<{ data: { post: PostApiType } }>(
      `/posts/${postId}/vote`,
      { optionIds: [optionId] }
    );
    return response.data!.data.post;
  }
}
