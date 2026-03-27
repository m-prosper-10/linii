import { apiClient } from '../lib/api';

export interface PostApiType {
  _id: string;
  author: {
    _id: string;
    fullnames: string;
    username: string;
    email: string;
    avatar?: string;
    verified?: boolean;
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
      verified?: boolean;
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
  mentions: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  views: number;
  userReaction?: {
    reactionType: string;
  };
  userShared?: boolean;
  createdAt: string;
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

export class PostService {
  static async getFeed(page = 1, limit = 20): Promise<PostsResponse> {
    const response = await apiClient.get<PostsResponse>(`/posts?page=${page}&limit=${limit}`);
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

    if ((data as any).poll) {
      formData.append('poll', JSON.stringify((data as any).poll));
    }

    if ((data as any).location) {
      formData.append('location', JSON.stringify((data as any).location));
    }

    if ((data as any).scheduledFor) {
      formData.append('scheduledFor', (data as any).scheduledFor.toISOString());
    }

    if ((data as any).tags && (data as any).tags.length > 0) {
      formData.append('tags', JSON.stringify((data as any).tags));
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

  static async searchPosts(query: string, page = 1, limit = 20): Promise<PostsResponse> {
    const response = await apiClient.get<PostsResponse>(`/posts/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data!;
  }
}
