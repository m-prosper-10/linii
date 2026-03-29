'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { chatService, Conversation, Message } from '@/services/chat';
import { cn } from '@/app/components/ui/utils';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Search, Send, SquarePen, X } from 'lucide-react';

import { ConversationListItem } from '@/app/components/messages/ConversationListItem';
import { MessageBubble } from '@/app/components/messages/MessageBubble';
import { ChatHeader } from '@/app/components/messages/ChatHeader';
import { MessageInput } from '@/app/components/messages/MessageInput';
import { ChatSettings } from '@/app/components/messages/ChatSettings';
import { NewConversationDialog } from '@/app/components/messages/NewConversationDialog';
import ConversationSkeleton from '@/app/components/skeletons/ConversationSkeleton';
import MessageSkeleton from '@/app/components/skeletons/MessageSkeleton';

export function MessagesView() {
  const { currentUser } = useApp();

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
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Typing indicator (local simulation)
  useEffect(() => {
    if (!messageInput) { setIsTyping(false); return; }
    setIsTyping(true);
    const t = setTimeout(() => setIsTyping(false), 1000);
    return () => clearTimeout(t);
  }, [messageInput]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSend = async () => {
    const content = messageInput.trim();
    if (!content || !selectedConversationId) return;
    setMessageInput('');
    try {
      const msg = await chatService.sendMessage({ conversationId: selectedConversationId, content });
      setMessages(prev => [...prev, msg]);
      setConversations(prev =>
        prev.map(c => c._id === selectedConversationId ? { ...c, lastMessage: msg } : c)
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    }
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
            isTyping={isTyping}
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

          {/* Settings panel — overlays the chat area */}
          <ChatSettings
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            conversation={selectedConversation}
            otherUser={otherUser}
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
