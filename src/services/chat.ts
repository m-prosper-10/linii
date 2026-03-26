import { apiClient } from '../lib/api';
import { User } from './auth';

export interface Message {
  _id: string;
  conversationId: string;
  sender: User;
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

export interface CreateMessageRequest {
  conversationId: string;
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
  files?: string[];
}

export interface CreateConversationRequest {
  participants: string[];
  conversationType: 'DIRECT' | 'GROUP';
  name?: string;
  description?: string;
  avatar?: string;
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
}

export const chatService = new ChatService();
