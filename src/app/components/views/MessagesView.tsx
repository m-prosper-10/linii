'use client';

import { ConversationListItem } from '@/app/components/messages/ConversationListItem';
import { EmojiPicker } from '@/app/components/messages/EmojiPicker';
import { MessageBubble } from '@/app/components/messages/MessageBubble';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { useApp } from '@/context/AppContext';
import { chatService, Conversation, Message } from '@/services/chat';
import { cn } from '@/app/components/ui/utils';
import {
  ArrowLeft,
  Loader2,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Verified,
  Video,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';

export function MessagesView() {
  const { user: currentUser } = useApp();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const selectedConversation = conversations.find(
    c => c._id === selectedConversationId
  );

  const otherUser = selectedConversation?.participants.find(
    p => p._id !== currentUser?._id
  );

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
      if (data.length > 0 && !selectedConversationId) {
        setSelectedConversationId(data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedConversationId]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data.reverse()); // Backend returns newest first
      await chatService.markAsRead(conversationId);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(
      p => p._id !== currentUser?._id
    );
    return (
      otherParticipant?.fullnames
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (messageInput.length > 0) {
      setIsTyping(true);
      const timeout = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [messageInput]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && selectedConversationId) {
      const content = messageInput.trim();
      setMessageInput('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }

      try {
        const newMessage = await chatService.sendMessage({
          conversationId: selectedConversationId,
          content,
        });
        setMessages(prev => [...prev, newMessage]);
        // Update last message in conversations list
        setConversations(prev => prev.map(c => 
          c._id === selectedConversationId ? { ...c, lastMessage: newMessage } : c
        ));
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  // Determine if messages should be grouped
  const shouldGroupMessage = (index: number) => {
    if (index === 0) return false;
    return messages[index].sender._id === messages[index - 1].sender._id;
  };

  return (
    <div className="mx-2 flex h-[calc(100vh-4rem)] max-w-full flex-row">
      {/* Conversations List */}
      <div
        className={cn(
          'border-border bg-card flex w-full flex-col border-r md:w-96',
          showMobileChat && 'hidden md:flex'
        )}
      >
        <div className="border-border bg-card/50 sticky top-0 z-10 space-y-4 border-b p-4 backdrop-blur-sm">
          <h2 className="text-xl font-semibold">Messages</h2>
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search conversations..."
              className="bg-accent/50 border-0 pl-9 focus-visible:ring-1"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map(conversation => {
              const otherParticipant = conversation.participants.find(
                p => p._id !== currentUser?._id
              );
              
              // Simple unread count for now - backend could provide this properly
              const unreadCount = conversation.lastMessage?.sender._id !== currentUser?._id && 
                                 !conversation.lastMessage?.readBy.some(r => r.userId === currentUser?._id) ? 1 : 0;

              return (
                <ConversationListItem
                  key={conversation._id}
                  otherUser={otherParticipant!}
                  lastMessage={conversation.lastMessage!}
                  unreadCount={unreadCount}
                  isSelected={conversation._id === selectedConversationId}
                  isOnline={true}
                  onClick={() => handleConversationSelect(conversation._id)}
                />
              );
            })
          ) : (
            <div className="text-muted-foreground p-8 text-center">
              <p>No conversations found</p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div
          className={cn(
            'bg-background flex flex-1 flex-col',
            !showMobileChat && 'hidden md:flex'
          )}
        >
          {/* Chat Header */}
          <div className="border-border bg-card/50 sticky top-0 z-10 flex items-center justify-between border-b p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-2 md:hidden"
                onClick={handleBackToList}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="ring-primary/10 h-10 w-10 ring-2">
                <AvatarImage src={otherUser?.avatar} />
                <AvatarFallback>{otherUser?.fullnames[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 font-medium">
                  {otherUser?.fullnames}
                  {/* Verified logic could be more robust */}
                  {otherUser?.username === 'verified_user' && (
                    <Verified
                      className="h-4 w-4 fill-blue-600"
                    />
                  )}
                </div>
                <div className="text-muted-foreground text-sm">
                  {isTyping ? (
                    <span className="flex items-center gap-1">
                      <span className="animate-pulse">typing</span>
                      <span className="flex gap-0.5">
                        <span
                          className="bg-muted-foreground h-1 w-1 animate-bounce rounded-full"
                          style={{ animationDelay: '0ms' }}
                        />
                        <span
                          className="bg-muted-foreground h-1 w-1 animate-bounce rounded-full"
                          style={{ animationDelay: '150ms' }}
                        />
                        <span
                          className="bg-muted-foreground h-1 w-1 animate-bounce rounded-full"
                          style={{ animationDelay: '300ms' }}
                        />
                      </span>
                    </span>
                  ) : (
                    'Active now'
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {messagesLoading && messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="mx-auto max-w-4xl space-y-4">
                {messages.map((message, index) => {
                  const isCurrentUser = message.sender._id === currentUser?._id;
                  const isGrouped = shouldGroupMessage(index);
                  const isRead = message.readBy.some(r => r.userId !== message.sender._id);
                  return (
                    <MessageBubble
                      key={message._id}
                      content={message.content}
                      createdAt={message.createdAt}
                      sender={message.sender}
                      isCurrentUser={isCurrentUser}
                      isRead={isRead}
                      showAvatar={!isGrouped}
                      isGrouped={isGrouped}
                    />
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="border-border bg-card/50 border-t p-4 backdrop-blur-sm">
            <form onSubmit={handleSendMessage} className="space-y-3">
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 shrink-0 p-0"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>

                <div className="relative flex-1">
                  <textarea
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    className="bg-accent/50 border-border focus:ring-primary/20 max-h-[120px] min-h-[44px] w-full resize-none rounded-2xl border px-4 py-2.5 transition-all focus:outline-none focus:ring-2"
                    rows={1}
                  />
                </div>

                <EmojiPicker onEmojiSelect={handleEmojiSelect} />

                <Button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="h-9 w-9 shrink-0 rounded-full p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* AI Suggestions */}
              <div className="flex flex-wrap gap-2">
                {[
                  '👍 Sounds good!',
                  "📅 Let's schedule a call",
                  '💡 Great idea!',
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMessageInput(suggestion)}
                    className="bg-accent hover:bg-accent/80 border-border rounded-full border px-3 py-1.5 text-xs transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'text-muted-foreground bg-accent/20 flex flex-1 items-center justify-center',
            !showMobileChat && 'hidden md:flex'
          )}
        >
          <div className="space-y-3 text-center">
            <div className="bg-primary/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
              <Send className="text-primary h-10 w-10" />
            </div>
            <div>
              <h3 className="text-foreground mb-1 text-lg font-semibold">
                Your Messages
              </h3>
              <p className="text-sm">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
