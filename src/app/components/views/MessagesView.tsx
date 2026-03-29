'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { chatService, Conversation, Message } from '@/services/chat';
import { useSocket, TypingIndicator } from '@/services/socket';
import { User } from '@/services/auth';

interface LocalFile {
  id: string;
  file: File;
  preview: string;
  originalName: string;
  mimeType: string;
  size: number;
}

interface MessageData {
  content: string;
  sender: User;
  createdAt: string;
  files?: string[];
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
}

import { cn } from '@/app/components/ui/utils';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Search, Send, SquarePen, X } from 'lucide-react';

import { ConversationListItem } from '@/app/components/messages/ConversationListItem';
import { MessageBubble } from '@/app/components/messages/MessageBubble';
import { ChatHeader } from '@/app/components/messages/ChatHeader';
import { MessageInput } from '@/app/components/messages/MessageInput';
import { NewConversationDialog } from '@/app/components/messages/NewConversationDialog';
import ConversationSkeleton from '@/app/components/skeletons/ConversationSkeleton';
import MessageSkeleton from '@/app/components/skeletons/MessageSkeleton';

export function MessagesView() {
  const { currentUser } = useApp();
  const { socket, isConnected } = useSocket();

  // ── Conversation list state ──────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // ── Active conversation state ────────────────────────────────────────────
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');

  // ── Real-time state ─────────────────────────────────────────────────────
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map()); // conversationId -> Set of userIds
  const otherUserTyping = selectedConversationId ? (typingUsers.get(selectedConversationId)?.size ?? 0) > 0 : false;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedConversation = conversations.find(c => c._id === selectedConversationId);
  const otherUser = selectedConversation?.participants.find(p => p._id !== currentUser?._id);

  // ── Data fetching ────────────────────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
      if (data.length > 0 && !selectedConversationId) {
        setSelectedConversationId(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setListLoading(false);
    }
  }, [selectedConversationId]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data.reverse());
      await chatService.markAsRead(conversationId);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => {
    if (selectedConversationId) fetchMessages(selectedConversationId);
  }, [selectedConversationId, fetchMessages]);

  // Socket connection and real-time handlers
  useEffect(() => {
    if (!isConnected || !currentUser) return;

    // Connect to socket
    socket.connect().catch(console.error);

    // Set up event listeners
    const handleNewMessage = (message: Message) => {
      if (message.conversationId === selectedConversationId) {
        setMessages(prev => [...prev, message]);
        // Mark as read if it's not our message
        if (message.sender._id !== currentUser._id) {
          socket.markAsRead({ conversationId: message.conversationId, messageId: message._id });
        }
      }
      
      // Update conversation list
      setConversations(prev =>
        prev.map(c => c._id === message.conversationId 
          ? { ...c, lastMessage: message, lastActivity: message.createdAt }
          : c
        )
      );
    };

    const handleMessageRead = (data: { userId: string; conversationId: string; messageId?: string }) => {
      if (data.conversationId === selectedConversationId) {
        setMessages(prev => 
          prev.map(msg => {
            if (data.messageId) {
              return msg._id === data.messageId 
                ? { ...msg, readBy: [...msg.readBy, { userId: data.userId, readAt: new Date().toISOString() }] }
                : msg;
            } else {
              // Mark all messages from other users as read by this user
              return msg.sender._id !== currentUser._id 
                ? { ...msg, readBy: [...msg.readBy, { userId: data.userId, readAt: new Date().toISOString() }] }
                : msg;
            }
          })
        );
      }
    };

    const handleUserTyping = (data: TypingIndicator) => {
      if (data.conversationId === selectedConversationId && data.userId !== currentUser._id) {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          const conversationTypers = newMap.get(data.conversationId) || new Set();
          
          if (data.isTyping) {
            conversationTypers.add(data.userId);
          } else {
            conversationTypers.delete(data.userId);
          }
          
          if (conversationTypers.size > 0) {
            newMap.set(data.conversationId, conversationTypers);
          } else {
            newMap.delete(data.conversationId);
          }
          
          return newMap;
        });
      }
    };

    const handleMessageError = (data: { error: string }) => {
      console.error('Message error:', data.error);
      // Show error notification to user
    };

    // Register event listeners
    socket.onMessage(handleNewMessage);
    socket.onMessageRead(handleMessageRead);
    socket.onUserTyping(handleUserTyping);
    socket.onMessageError(handleMessageError);

    return () => {
      // Clean up event listeners
      socket.offMessage(handleNewMessage);
      socket.offMessageRead(handleMessageRead);
      socket.offUserTyping(handleUserTyping);
      socket.offMessageError(handleMessageError);
    };
  }, [isConnected, currentUser, selectedConversationId, socket]);

  // Join/leave conversation rooms
  useEffect(() => {
    if (isConnected && selectedConversationId) {
      socket.joinConversation(selectedConversationId);
      return () => {
        socket.leaveConversation(selectedConversationId);
      };
    }
  }, [isConnected, selectedConversationId, socket]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Typing indicator with socket integration
  useEffect(() => {
    if (!selectedConversationId) return;

    if (messageInput.trim()) {
      socket.startTyping(selectedConversationId);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.stopTyping(selectedConversationId);
      }, 1000);
    } else {
      socket.stopTyping(selectedConversationId);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageInput, selectedConversationId, socket]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSend = async (localFiles: LocalFile[]) => {
    const content = messageInput.trim();
    if (!content && localFiles.length === 0 || !selectedConversationId) return;
    
    // Clear input immediately for better UX
    setMessageInput('');
    
    try {
      let msg: Message;
      
      if (localFiles.length > 0) {
        // Upload files first, then send message
        const filesToUpload = localFiles.map(f => f.file);
        const uploadedFiles = await chatService.uploadFiles(filesToUpload);
        
        // Ensure content is not empty - use default message if no text provided
        const messageContent = content || 'Shared files';
        
        // Send message with uploaded files
        msg = await chatService.sendMessageWithFiles(
          selectedConversationId,
          messageContent,
          uploadedFiles
        );
      } else {
        // Send regular text message
        msg = await chatService.sendMessage({ conversationId: selectedConversationId, content });
      }
      
      setMessages(prev => [...prev, msg]);
      setConversations(prev =>
        prev.map(c => c._id === selectedConversationId ? { ...c, lastMessage: msg } : c)
      );
    } catch (err) {
      console.error('Failed to send message:', err);
      // Restore message on error
      setMessageInput(content);
    }
  };

  const handleReply = (messageToReply: MessageData) => {
    // Set the input to show reply context
    const replyText = `> ${messageToReply.sender.fullnames}: ${messageToReply.content.substring(0, 100)}${messageToReply.content.length > 100 ? '...' : ''}\n\n`;
    setMessageInput(replyText);
    // Focus the input
    document.querySelector('textarea')?.focus();
  };

  const handleForward = (messageToForward: MessageData) => {
    // For now, just copy the message content to input
    // In a real app, you'd open a dialog to select conversation to forward to
    const forwardText = `${messageToForward.content}`;
    setMessageInput(forwardText);
    document.querySelector('textarea')?.focus();
  };

  const handleReact = async (messageId: string, emoji: string, type: string) => {
    // This would typically call an API to add/remove reaction
    console.log('React to message:', messageId, emoji, type);
    // For now, just log it - in real implementation you'd call the API
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setShowMobileChat(true);
  };

  const handleConversationCreated = (conv: Conversation) => {
    setConversations(prev => prev.some(c => c._id === conv._id) ? prev : [conv, ...prev]);
    setSelectedConversationId(conv._id);
    setShowMobileChat(true);
  };

  const shouldGroupMessage = (index: number) =>
    index > 0 && messages[index].sender._id === messages[index - 1].sender._id;

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filteredConversations = conversations.filter(conv => {
    const other = conv.participants.find(p => p._id !== currentUser?._id);
    const q = searchQuery.toLowerCase();
    return (
      other?.fullnames.toLowerCase().includes(q) ||
      conv.lastMessage?.content.toLowerCase().includes(q)
    );
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full w-full overflow-hidden">
      <NewConversationDialog
        open={newConvOpen}
        onOpenChange={setNewConvOpen}
        onConversationCreated={handleConversationCreated}
      />

      {/* ── Sidebar: conversation list ── */}
      <div className={cn(
        'border-border/40 bg-card flex w-full flex-col border-r md:w-80 lg:w-96',
        showMobileChat && 'hidden md:flex'
      )}>
        {/* Sidebar header */}
        <div className="border-border/30 bg-card/60 sticky top-0 z-10 space-y-3 border-b px-4 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Messages</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewConvOpen(true)}
              className="h-7 w-7 rounded-xl p-0 text-muted-foreground/60 hover:text-foreground"
              title="New message"
            >
              <SquarePen className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="text-muted-foreground/50 absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder="Search conversations…"
              className="bg-accent/30 border-0 pl-8 text-sm focus-visible:ring-1"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-muted-foreground/50 hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation list */}
        <div className="scrollbar-thin flex-1 min-h-0 overflow-y-auto">
          {listLoading ? (
            [...Array(6)].map((_, i) => <ConversationSkeleton key={i} />)
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map(conv => {
              const other = conv.participants.find(p => p._id !== currentUser?._id);
              const unread =
                conv.lastMessage?.sender._id !== currentUser?._id &&
                !conv.lastMessage?.readBy.some(r => r.userId === currentUser?._id)
                  ? 1 : 0;
              return (
                <ConversationListItem
                  key={conv._id}
                  otherUser={other!}
                  lastMessage={conv.lastMessage}
                  unreadCount={unread}
                  isSelected={conv._id === selectedConversationId}
                  isOnline
                  onClick={() => handleSelectConversation(conv._id)}
                />
              );
            })
          ) : (
            <p className="text-muted-foreground/50 p-8 text-center text-sm">
              {searchQuery ? 'No results found' : 'No conversations yet'}
            </p>
          )}
        </div>
      </div>

      {/* ── Main: chat area ── */}
      {selectedConversation && otherUser ? (
        <div className={cn(
          'relative flex flex-1 flex-col overflow-hidden',
          !showMobileChat && 'hidden md:flex'
        )}>
          <ChatHeader
            conversationId={selectedConversation._id}
            otherUser={otherUser}
            isTyping={otherUserTyping}
            onBack={() => setShowMobileChat(false)}
          />

          {/* Messages */}
          <div className="scrollbar-thin flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-1 px-4 py-3">
              {messagesLoading && messages.length === 0 ? (
                [...Array(6)].map((_, i) => <MessageSkeleton key={i} />)
              ) : (
                messages.map((msg, i) => (
                  <MessageBubble
                    key={msg._id}
                    content={msg.content}
                    createdAt={msg.createdAt}
                    sender={msg.sender}
                    isCurrentUser={msg.sender._id === currentUser?._id}
                    isRead={msg.readBy.some(r => r.userId !== msg.sender._id)}
                    showAvatar={!shouldGroupMessage(i)}
                    isGrouped={shouldGroupMessage(i)}
                    files={msg.files}
                    messageType={msg.messageType}
                    onReply={handleReply}
                    onForward={handleForward}
                    onReact={handleReact}
                    reactions={[]} // TODO: Add reactions from message data
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <MessageInput
            value={messageInput}
            onChange={setMessageInput}
            onSend={handleSend}
          />
        </div>
      ) : (
        <div className={cn(
          'text-muted-foreground/50 flex flex-1 flex-col items-center justify-center gap-3',
          !showMobileChat && 'hidden md:flex'
        )}>
          <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl">
            <Send className="text-primary h-7 w-7" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground/70">Your Messages</p>
            <p className="mt-0.5 text-sm">Select a conversation to start chatting</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-1 rounded-full px-5 text-xs font-semibold"
            onClick={() => setNewConvOpen(true)}
          >
            New message
          </Button>
        </div>
      )}
    </div>
  );
}
