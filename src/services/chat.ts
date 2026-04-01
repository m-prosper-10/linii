import { apiClient } from '../lib/api';
import { User } from './auth';

/** Parent message embedded on replies (quoted bubble) */
export interface QuotedMessagePreview {
  _id: string;
  sender: User;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
  files?: string[];
  isDeleted: boolean;
  createdAt?: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: User;
  replyTo?: QuotedMessagePreview;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
  files?: string[];
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  readBy: { userId: string; readAt: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  conversationType: 'DIRECT' | 'GROUP';
  name?: string;
  description?: string;
  avatar?: string;
  admins: string[];
  createdBy: string;
  lastMessage?: Message;
  lastActivity: string;
  isActive: boolean;
  settings: {
    allowMembersToAddOthers: boolean;
    allowMembersToEditGroupInfo: boolean;
    muteNotifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

export interface CreateMessageRequest {
  conversationId: string;
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
  files?: string[];
  replyToMessageId?: string;
}

export interface CreateConversationRequest {
  participants: string[];
  conversationType: 'DIRECT' | 'GROUP';
  name?: string;
  description?: string;
  avatar?: string;
}

export interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

class ChatService {
  async getConversations(page: number = 1, limit: number = 20): Promise<Conversation[]> {
    const response = await apiClient.get<{ conversations: Conversation[] }>(`/conversations?page=${page}&limit=${limit}`);
    if (response.success && response.data) {
      return response.data.conversations;
    }
    throw new Error(response.message || 'Failed to fetch conversations');
  }

  async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<Message[]> {
    const response = await apiClient.get<{ messages: Message[] }>(`/messages/conversation/${conversationId}?page=${page}&limit=${limit}`);
    if (response.success && response.data) {
      return response.data.messages;
    }
    throw new Error(response.message || 'Failed to fetch messages');
  }

  async sendMessage(request: CreateMessageRequest): Promise<Message> {
    const response = await apiClient.post<{ message: Message }>('/messages', request);
    if (response.success && response.data) {
      return response.data.message;
    }
    throw new Error(response.message || 'Failed to send message');
  }

  async createConversation(request: CreateConversationRequest): Promise<Conversation> {
    const response = await apiClient.post<{ conversation: Conversation }>('/conversations', request);
    if (response.success && response.data) {
      return response.data.conversation;
    }
    throw new Error(response.message || 'Failed to create conversation');
  }

  async markAsRead(conversationId: string): Promise<void> {
    const response = await apiClient.post(`/messages/conversation/${conversationId}/read`, {});
    if (!response.success) {
      throw new Error(response.message || 'Failed to mark conversation as read');
    }
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await apiClient.get<{ conversation: Conversation }>(`/conversations/${conversationId}`);
    if (response.success && response.data) {
      return response.data.conversation;
    }
    throw new Error(response.message || 'Failed to fetch conversation');
  }

  async updateConversation(conversationId: string, data: { name?: string; description?: string }): Promise<Conversation> {
    const response = await apiClient.put<{ conversation: Conversation }>(`/conversations/${conversationId}`, data);
    if (response.success && response.data) {
      return response.data.conversation;
    }
    throw new Error(response.message || 'Failed to update conversation');
  }

  async addParticipants(conversationId: string, participantIds: string[]): Promise<Conversation> {
    const response = await apiClient.post<{ conversation: Conversation }>(`/conversations/${conversationId}/participants`, { participantIds });
    if (response.success && response.data) {
      return response.data.conversation;
    }
    throw new Error(response.message || 'Failed to add participants');
  }

  async removeParticipant(conversationId: string, participantId: string): Promise<Conversation> {
    const response = await apiClient.delete<{ conversation: Conversation }>(`/conversations/${conversationId}/participants/${participantId}`);
    if (response.success && response.data) {
      return response.data.conversation;
    }
    throw new Error(response.message || 'Failed to remove participant');
  }

  async leaveConversation(conversationId: string): Promise<void> {
    const response = await apiClient.post(`/conversations/${conversationId}/leave`, {});
    if (!response.success) {
      throw new Error(response.message || 'Failed to leave conversation');
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const response = await apiClient.delete(`/conversations/${conversationId}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete conversation');
    }
  }

  async searchMessages(query: string, conversationId?: string, page: number = 1, limit: number = 20): Promise<{ messages: Message[]; pagination: Pagination }> {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (conversationId) {
      params.append('conversationId', conversationId);
    }

    const response = await apiClient.get<{ messages: Message[]; pagination: Pagination }>(`/messages/search/${query}?${params}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to search messages');
  }

  async searchConversations(query: string): Promise<Conversation[]> {
    const response = await apiClient.get<{ conversations: Conversation[] }>(`/conversations/search?query=${encodeURIComponent(query)}`);
    if (response.success && response.data) {
      return response.data.conversations;
    }
    throw new Error(response.message || 'Failed to search conversations');
  }

  async uploadFiles(files: File[]): Promise<UploadedFile[]> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await apiClient.upload<{ files: UploadedFile[] }>('/files/upload', formData);

    if (response.success && response.data) {
      return response.data.files;
    }
    throw new Error(response.message || 'Failed to upload files');
  }

  async sendMessageWithFiles(
    conversationId: string,
    content: string,
    files: UploadedFile[],
    replyToMessageId?: string
  ): Promise<Message> {
    const response = await apiClient.post<{ message: Message }>('/messages', {
      conversationId,
      content,
      messageType: files.length > 0 ? this.getMessageTypeFromFiles(files) : 'TEXT',
      files: files.map(f => f.url),
      ...(replyToMessageId ? { replyToMessageId } : {}),
    });

    if (response.success && response.data) {
      return response.data.message;
    }
    throw new Error(response.message || 'Failed to send message');
  }

  private getMessageTypeFromFiles(files: UploadedFile[]): 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' {
    if (files.length === 0) return 'TEXT';
    
    const firstFile = files[0];
    if (firstFile.mimeType.startsWith('image/')) return 'IMAGE';
    if (firstFile.mimeType.startsWith('video/')) return 'VIDEO';
    if (firstFile.mimeType.startsWith('audio/')) return 'AUDIO';
    return 'FILE';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  isVideoFile(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }

  isAudioFile(mimeType: string): boolean {
    return mimeType.startsWith('audio/');
  }
}

export const chatService = new ChatService();
