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
import { cn } from '@/app/components/ui/utils';
import { currentUser, mockConversations } from '@/data/mockData';
import {
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Verified,
  Video,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function MessagesView() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(mockConversations[0]?.id || null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const selectedConversation = mockConversations.find(
    c => c.id === selectedConversationId
  );

  const otherUser = selectedConversation?.participants.find(
    p => p.id !== currentUser.id
  );

  // Filter conversations based on search
  const filteredConversations = mockConversations.filter(conv => {
    const otherParticipant = conv.participants.find(
      p => p.id !== currentUser.id
    );
    return (
      otherParticipant?.displayName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Mock messages for the selected conversation
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const messages = selectedConversation
    ? [
        {
          id: '1',
          sender: otherUser!,
          content: 'Hey! How are you doing?',
          timestamp: '10:30 AM',
          read: true,
        },
        {
          id: '2',
          sender: currentUser,
          content: "I'm doing great! Working on some exciting projects.",
          timestamp: '10:32 AM',
          read: true,
        },
        {
          id: '3',
          sender: otherUser!,
          content: 'That sounds amazing! Would love to hear more about it.',
          timestamp: '10:35 AM',
          read: true,
        },
        {
          id: '4',
          sender: currentUser,
          content: "Sure! Let me know when you're free for a call.",
          timestamp: '10:37 AM',
          read: true,
        },
        {
          id: '5',
          sender: otherUser!,
          content: selectedConversation.lastMessage.content,
          timestamp: selectedConversation.lastMessage.timestamp,
          read: selectedConversation.lastMessage.read,
        },
      ]
    : [];

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      // Handle send message
      setMessageInput('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
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
    return messages[index].sender.id === messages[index - 1].sender.id;
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
          {filteredConversations.length > 0 ? (
            filteredConversations.map(conversation => {
              const otherParticipant = conversation.participants.find(
                p => p.id !== currentUser.id
              );
              return (
                <ConversationListItem
                  key={conversation.id}
                  otherUser={otherParticipant!}
                  lastMessage={conversation.lastMessage}
                  unreadCount={conversation.unreadCount}
                  isSelected={conversation.id === selectedConversationId}
                  isOnline={true}
                  onClick={() => handleConversationSelect(conversation.id)}
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
                <AvatarFallback>{otherUser?.displayName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 font-medium">
                  {otherUser?.displayName}
                  {otherUser?.verified && (
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
            <div className="mx-auto max-w-4xl space-y-4">
              {messages.map((message, index) => {
                const isCurrentUser = message.sender.id === currentUser.id;
                const isGrouped = shouldGroupMessage(index);
                return (
                  <MessageBubble
                    key={message.id}
                    content={message.content}
                    timestamp={message.timestamp}
                    sender={message.sender}
                    isCurrentUser={isCurrentUser}
                    isRead={message.read}
                    showAvatar={!isGrouped}
                    isGrouped={isGrouped}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
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
