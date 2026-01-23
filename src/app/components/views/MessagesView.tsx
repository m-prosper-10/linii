"use client";

import { useState } from 'react';
import { Search, Send, MoreVertical, Phone, Video } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { mockConversations, currentUser } from '@/data/mockData';
import { cn } from '@/app/components/ui/utils';

export function MessagesView() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    mockConversations[0]?.id || null
  );
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedConversation = mockConversations.find(
    (c) => c.id === selectedConversationId
  );

  const otherUser = selectedConversation?.participants.find(
    (p) => p.id !== currentUser.id
  );

  // Mock messages for the selected conversation
  const messages = selectedConversation ? [
    {
      id: '1',
      sender: otherUser!,
      content: 'Hey! How are you doing?',
      timestamp: '10:30 AM',
      read: true
    },
    {
      id: '2',
      sender: currentUser,
      content: 'I\'m doing great! Working on some exciting projects.',
      timestamp: '10:32 AM',
      read: true
    },
    {
      id: '3',
      sender: otherUser!,
      content: 'That sounds amazing! Would love to hear more about it.',
      timestamp: '10:35 AM',
      read: true
    },
    {
      id: '4',
      sender: currentUser,
      content: 'Sure! Let me know when you\'re free for a call.',
      timestamp: '10:37 AM',
      read: true
    },
    {
      id: '5',
      sender: otherUser!,
      content: selectedConversation.lastMessage.content,
      timestamp: selectedConversation.lastMessage.timestamp,
      read: selectedConversation.lastMessage.read
    }
  ] : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      // Handle send message
      setMessageInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col md:flex-row">
      {/* Conversations List */}
      <div className="w-full md:w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border space-y-4">
          <h2 className="font-semibold text-xl">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search messages..." 
              className="pl-9 bg-accent/50 border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {mockConversations.map((conversation) => {
            const otherParticipant = conversation.participants.find(
              (p) => p.id !== currentUser.id
            );
            const isSelected = conversation.id === selectedConversationId;

            return (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversationId(conversation.id)}
                className={cn(
                  'p-4 cursor-pointer hover:bg-accent/50 transition-colors border-b border-border',
                  isSelected && 'bg-accent/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={otherParticipant?.avatar} />
                      <AvatarFallback>{otherParticipant?.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate">
                        {otherParticipant?.displayName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {conversation.lastMessage.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {conversation.lastMessage.content}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge className="h-5 min-w-5 px-1.5 rounded-full">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={otherUser?.avatar} />
                <AvatarFallback>{otherUser?.displayName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{otherUser?.displayName}</div>
                <div className="text-sm text-muted-foreground">Active now</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => {
                const isCurrentUser = message.sender.id === currentUser.id;
                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      isCurrentUser && 'flex-row-reverse'
                    )}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.sender.avatar} />
                      <AvatarFallback>{message.sender.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className={cn('flex flex-col gap-1', isCurrentUser && 'items-end')}>
                      <div
                        className={cn(
                          'px-4 py-2 rounded-2xl max-w-md',
                          isCurrentUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-accent'
                        )}
                      >
                        <p>{message.content}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp}
                        {isCurrentUser && message.read && ' · Read'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 bg-accent/50"
              />
              <Button type="submit" disabled={!messageInput.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <div className="mt-2 text-xs text-muted-foreground">
              AI-assisted reply suggestions available
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p>Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}