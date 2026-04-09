'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { chatService, Conversation, Message } from '@/services/chat';
import { useSocket, TypingIndicator } from '@/services/socket';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/app/components/ui/utils';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Search, Send, SquarePen, X } from 'lucide-react';
import { toast } from 'sonner';

import { ConversationListItem } from '@/app/components/messages/ConversationListItem';
import { MessageBubble } from '@/app/components/messages/MessageBubble';
import { ChatHeader } from '@/app/components/messages/ChatHeader';
import {
  MessageInput,
  type MessageInputHandle,
  type MessageReplyDraft,
} from '@/app/components/messages/MessageInput';
import { replyPreviewLabel } from '@/app/components/messages/replyPreviewText';
import { NewConversationDialog } from '@/app/components/messages/NewConversationDialog';
import ConversationSkeleton from '@/app/components/skeletons/ConversationSkeleton';
import MessageSkeleton from '@/app/components/skeletons/MessageSkeleton';
import type {
  LocalFile,
  MessageActionContext,
} from '@/app/components/messages/types';

export function MessagesView() {
  const { currentUser } = useApp();
  const { socket, isConnected } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const params = useParams();
  const router = useRouter();
  const selectedConversationId = params?.conversationId as string | null;
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [replyDraft, setReplyDraft] = useState<MessageReplyDraft | null>(null);

  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(
    new Map()
  );
  const otherUserTyping = selectedConversationId
    ? (typingUsers.get(selectedConversationId)?.size ?? 0) > 0
    : false;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageInputRef = useRef<MessageInputHandle>(null);

  const selectedConversation = conversations.find(
    c => c._id === selectedConversationId
  );
  const otherUser = selectedConversation?.participants.find(
    p => p._id !== currentUser?._id
  );

  const fetchConversations = useCallback(async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      toast.error('Could not load conversations');
    } finally {
      setListLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data.reverse());
      await chatService.markAsRead(conversationId);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      toast.error('Could not load messages');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversationId) void fetchMessages(selectedConversationId);
  }, [selectedConversationId, fetchMessages]);

  useEffect(() => {
    setReplyDraft(null);
    if (selectedConversationId) {
      setShowMobileChat(true);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    if (!isConnected || !currentUser) return;

    socket.connect().catch(console.error);

    const handleNewMessage = (message: Message) => {
      if (message.conversationId === selectedConversationId) {
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
        if (message.sender._id !== currentUser._id) {
          socket.markAsRead({
            conversationId: message.conversationId,
            messageId: message._id,
          });
        }
      }

      setConversations(prev =>
        prev.map(c =>
          c._id === message.conversationId
            ? { ...c, lastMessage: message, lastActivity: message.createdAt }
            : c
        )
      );
    };

    const handleMessageRead = (data: {
      userId: string;
      conversationId: string;
      messageId?: string;
    }) => {
      if (data.conversationId === selectedConversationId) {
        setMessages(prev =>
          prev.map(msg => {
            if (data.messageId) {
              return msg._id === data.messageId
                ? {
                    ...msg,
                    readBy: [
                      ...msg.readBy,
                      { userId: data.userId, readAt: new Date().toISOString() },
                    ],
                  }
                : msg;
            }
            return msg.sender._id !== currentUser._id
              ? {
                  ...msg,
                  readBy: [
                    ...msg.readBy,
                    { userId: data.userId, readAt: new Date().toISOString() },
                  ],
                }
              : msg;
          })
        );
      }
    };

    const handleUserTyping = (data: TypingIndicator) => {
      if (
        data.conversationId === selectedConversationId &&
        data.userId !== currentUser._id
      ) {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          const conversationTypers =
            newMap.get(data.conversationId) || new Set();

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

    const handleMessageReaction = (data: {
      messageId: string;
      conversationId: string;
      reactions: Message['reactions'];
    }) => {
      if (data.conversationId === selectedConversationId) {
        setMessages(prev =>
          prev.map(msg =>
            msg._id === data.messageId ? { ...msg, reactions: data.reactions } : msg
          )
        );
      }
    };

    const handleMessageError = (data: { error: string }) => {
      console.error('Message error:', data.error);
      toast.error(data.error || 'Message could not be sent');
    };

    socket.onMessage(handleNewMessage);
    socket.onMessageRead(handleMessageRead);
    socket.onUserTyping(handleUserTyping);
    socket.onMessageReaction(handleMessageReaction);
    socket.onMessageError(handleMessageError);

    return () => {
      socket.offMessage(handleNewMessage);
      socket.offMessageRead(handleMessageRead);
      socket.offUserTyping(handleUserTyping);
      socket.offMessageReaction(handleMessageReaction);
      socket.offMessageError(handleMessageError);
    };
  }, [isConnected, currentUser, selectedConversationId, socket]);

  useEffect(() => {
    if (isConnected && selectedConversationId) {
      socket.joinConversation(selectedConversationId);
      return () => {
        socket.leaveConversation(selectedConversationId);
      };
    }
  }, [isConnected, selectedConversationId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!selectedConversationId) return;

    if (messageInput.trim()) {
      socket.startTyping(selectedConversationId);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

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

  const jumpToQuotedMessage = useCallback((messageId: string) => {
    const el = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!(el instanceof HTMLElement)) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add(
      'ring-2',
      'ring-primary',
      'ring-offset-2',
      'ring-offset-background',
      'rounded-lg'
    );
    window.setTimeout(() => {
      el.classList.remove(
        'ring-2',
        'ring-primary',
        'ring-offset-2',
        'ring-offset-background',
        'rounded-lg'
      );
    }, 1400);
  }, []);

  const handleSend = useCallback(
    async (localFiles: LocalFile[]) => {
      const content = messageInput.trim();
      if ((!content && localFiles.length === 0) || !selectedConversationId)
        return;

      const replyToMessageId = replyDraft?.messageId;

      try {
        let msg: Message;

        if (localFiles.length > 0) {
          const filesToUpload = localFiles.map(f => f.file);
          const uploadedFiles = await chatService.uploadFiles(filesToUpload);
          const messageContent = content || 'Shared files';
          msg = await chatService.sendMessageWithFiles(
            selectedConversationId,
            messageContent,
            uploadedFiles,
            replyToMessageId
          );
        } else {
          msg = await chatService.sendMessage({
            conversationId: selectedConversationId,
            content,
            ...(replyToMessageId ? { replyToMessageId } : {}),
          });
        }

        setReplyDraft(null);
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        setConversations(prev =>
          prev.map(c =>
            c._id === selectedConversationId ? { ...c, lastMessage: msg } : c
          )
        );
      } catch (err) {
        console.error('Failed to send message:', err);
        toast.error('Failed to send message');
        throw err;
      }
    },
    [messageInput, selectedConversationId, replyDraft]
  );

  const handleReply = useCallback((messageToReply: MessageActionContext) => {
    setReplyDraft({
      messageId: messageToReply.messageId,
      senderLabel:
        messageToReply.sender.fullnames ||
        messageToReply.sender.username ||
        'User',
      preview: replyPreviewLabel(messageToReply),
    });
    queueMicrotask(() => messageInputRef.current?.focus());
  }, []);

  const handleForward = useCallback(
    (messageToForward: MessageActionContext) => {
      setMessageInput(messageToForward.content);
      queueMicrotask(() => messageInputRef.current?.focus());
    },
    []
  );

  const handleReact = useCallback(
    async (messageId: string, emoji: string, _type?: string) => {
      try {
        await chatService.reactToMessage(messageId, emoji);
      } catch (err) {
        console.error('Failed to react:', err);
        toast.error('Could not update reaction');
      }
    },
    []
  );

  const handleDeleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(m => m._id !== messageId));
    toast.success('Message removed on this device', {
      description:
        'Reloading the chat may show it again until delete is synced to the server.',
    });
  }, []);

  const handleReportMessage = useCallback(() => {
    toast.message('Report message', {
      description:
        'Thanks for letting us know — full reporting is coming soon.',
    });
  }, []);

  const handleSelectConversation = (id: string) => {
    router.push(`/messages/${id}`);
    setShowMobileChat(true);
  };

  const handleConversationCreated = (conv: Conversation) => {
    setConversations(prev =>
      prev.some(c => c._id === conv._id) ? prev : [conv, ...prev]
    );
    router.push(`/messages/${conv._id}`);
    setShowMobileChat(true);
  };

  const shouldGroupMessage = (index: number) =>
    index > 0 && messages[index].sender._id === messages[index - 1].sender._id;

  const filteredConversations = conversations.filter(conv => {
    const other = conv.participants.find(p => p._id !== currentUser?._id);
    const q = searchQuery.toLowerCase();
    return (
      other?.fullnames.toLowerCase().includes(q) ||
      conv.lastMessage?.content.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-full w-full overflow-hidden">
      <NewConversationDialog
        open={newConvOpen}
        onOpenChange={setNewConvOpen}
        onConversationCreated={handleConversationCreated}
      />

      <div
        className={cn(
          'border-border/40 bg-card flex w-full flex-col border-r md:w-80 lg:w-96',
          showMobileChat && 'hidden md:flex'
        )}
      >
        <div className="border-border/30 bg-card/60 sticky top-0 z-10 space-y-3 border-b px-4 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">Messages</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewConvOpen(true)}
              className="text-muted-foreground/60 hover:text-foreground h-7 w-7 rounded-xl p-0"
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
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-muted-foreground/50 hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
          {listLoading ? (
            [...Array(6)].map((_, i) => <ConversationSkeleton key={i} />)
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map(conv => {
              const other = conv.participants.find(
                p => p._id !== currentUser?._id
              );
              const unread =
                conv.lastMessage?.sender._id !== currentUser?._id &&
                !conv.lastMessage?.readBy.some(
                  r => r.userId === currentUser?._id
                )
                  ? 1
                  : 0;
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

      {selectedConversation && otherUser ? (
        <div
          className={cn(
            'relative flex flex-1 flex-col overflow-hidden',
            !showMobileChat && 'hidden md:flex'
          )}
        >
          <ChatHeader
            conversationId={selectedConversation._id}
            otherUser={otherUser}
            isTyping={otherUserTyping}
            onBack={() => setShowMobileChat(false)}
          />

          <div className="from-background via-background to-muted/20 scrollbar-thin min-h-0 flex-1 overflow-y-auto bg-gradient-to-b">
            <div className="space-y-1 px-4 py-3">
              {messagesLoading && messages.length === 0
                ? [...Array(6)].map((_, i) => <MessageSkeleton key={i} />)
                : messages.map((msg, i) => (
                    <MessageBubble
                      key={msg._id}
                      messageId={msg._id}
                      content={msg.content}
                      createdAt={msg.createdAt}
                      sender={msg.sender}
                      isCurrentUser={msg.sender._id === currentUser?._id}
                      isRead={msg.readBy.some(r => r.userId !== msg.sender._id)}
                      showAvatar={!shouldGroupMessage(i)}
                      isGrouped={shouldGroupMessage(i)}
                      files={msg.files}
                      messageType={msg.messageType}
                      replyTo={msg.replyTo}
                      onJumpToQuotedMessage={jumpToQuotedMessage}
                      onReply={handleReply}
                      onForward={handleForward}
                      onReact={handleReact}
                      onDelete={handleDeleteMessage}
                      onReport={handleReportMessage}
                      reactions={msg.reactions}
                    />
                  ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <MessageInput
            ref={messageInputRef}
            value={messageInput}
            onChange={setMessageInput}
            onSend={handleSend}
            replyTo={replyDraft}
            onCancelReply={() => setReplyDraft(null)}
          />
        </div>
      ) : (
        <div
          className={cn(
            'bg-background/50 flex flex-1 flex-col items-center justify-center gap-4 text-center px-6',
            !showMobileChat && 'hidden md:flex'
          )}
        >
          <div className="bg-primary/5 border-primary/10 flex h-24 w-24 items-center justify-center rounded-3xl border-2 shadow-sm">
            <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl">
              <Send className="text-primary h-8 w-8" />
            </div>
          </div>
          <div className="max-w-xs space-y-2">
            <h3 className="text-lg font-bold tracking-tight">Select a conversation</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Choose an existing chat from the left sidebar or start a new conversation to connect with your friends.
            </p>
          </div>
          <Button
            size="lg"
            className="mt-2 rounded-2xl px-8 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105"
            onClick={() => setNewConvOpen(true)}
          >
            Start new chat
          </Button>
        </div>
      )}
    </div>
  );
}
