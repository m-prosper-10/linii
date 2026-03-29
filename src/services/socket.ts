import { io, Socket } from 'socket.io-client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Message } from './chat';

export interface TypingIndicator {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

export interface SocketEvents {
  'new-message': (message: Message) => void;
  'message-read': (data: { userId: string; conversationId: string; messageId?: string }) => void;
  'user-typing': (data: TypingIndicator) => void;
  'message-error': (data: { error: string }) => void;
  'new-message-notification': (data: { message: Message; conversationId: string }) => void;
  'joined-conversation': (data: { conversationId: string }) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = apiClient.getToken();
      if (!token) {
        reject(new Error('No authentication token available'));
        return;
      }

      this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
        auth: { token },
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('Connected to socket server');
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.handleReconnect();
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from socket server:', reason);
        if (reason === 'io server disconnect') {
          // Server disconnected, reconnect manually
          this.socket?.connect();
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`Reconnected after ${attemptNumber} attempts`);
        this.reconnectAttempts = 0;
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('Reconnection error:', error);
        this.handleReconnect();
      });
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      console.log(`Attempting to reconnect in ${delay}ms...`);
      
      setTimeout(() => {
        this.socket?.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Conversation management
  joinConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('join-conversation', conversationId);
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('leave-conversation', conversationId);
    }
  }

  // Message operations
  sendMessage(messageData: any) {
    if (this.socket) {
      this.socket.emit('send-message', messageData);
    }
  }

  markAsRead(data: { conversationId: string; messageId?: string }) {
    if (this.socket) {
      this.socket.emit('mark-read', data);
    }
  }

  // Typing indicators
  startTyping(conversationId: string) {
    if (this.socket) {
      this.socket.emit('typing-start', { conversationId });
    }
  }

  stopTyping(conversationId: string) {
    if (this.socket) {
      this.socket.emit('typing-stop', { conversationId });
    }
  }

  // Event listeners
  onMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  offMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.off('new-message', callback);
    }
  }

  onMessageRead(callback: (data: { userId: string; conversationId: string; messageId?: string }) => void) {
    if (this.socket) {
      this.socket.on('message-read', callback);
    }
  }

  offMessageRead(callback: (data: { userId: string; conversationId: string; messageId?: string }) => void) {
    if (this.socket) {
      this.socket.off('message-read', callback);
    }
  }

  onUserTyping(callback: (data: TypingIndicator) => void) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  offUserTyping(callback: (data: TypingIndicator) => void) {
    if (this.socket) {
      this.socket.off('user-typing', callback);
    }
  }

  onMessageError(callback: (data: { error: string }) => void) {
    if (this.socket) {
      this.socket.on('message-error', callback);
    }
  }

  offMessageError(callback: (data: { error: string }) => void) {
    if (this.socket) {
      this.socket.off('message-error', callback);
    }
  }

  onMessageNotification(callback: (data: { message: Message; conversationId: string }) => void) {
    if (this.socket) {
      this.socket.on('new-message-notification', callback);
    }
  }

  offMessageNotification(callback: (data: { message: Message; conversationId: string }) => void) {
    if (this.socket) {
      this.socket.off('new-message-notification', callback);
    }
  }

  // Generic event handlers
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Get socket ID for debugging
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Get connection status
  getStatus(): 'connected' | 'disconnected' | 'connecting' | 'reconnecting' {
    if (!this.socket) return 'disconnected';
    
    if (this.socket.connected) return 'connected';
    if (this.socket.connecting) return 'connecting';
    if (this.reconnectAttempts > 0) return 'reconnecting';
    
    return 'disconnected';
  }
}

export const socketService = new SocketService();

// Hook for React components
export const useSocket = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'reconnecting'>('disconnected');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(socketService.getStatus());
      setIsConnected(socketService.isConnected());
    };

    updateStatus();

    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    socket: socketService,
    status,
    isConnected,
    connect: () => socketService.connect(),
    disconnect: () => socketService.disconnect()
  };
};
