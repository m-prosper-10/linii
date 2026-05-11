'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Search, Loader2, MessageCircle } from 'lucide-react';
import { socialService } from '@/services/social';
import { chatService, Conversation } from '@/services/chat';
import { useApp } from '@/context/AppContext';
import { User } from '@/services/auth';
import { cn } from '@/app/components/ui/utils';
import { getUserDisplayName, getUserInitial } from '@/lib/user';
import { toast } from 'sonner';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversation: Conversation) => void;
}

export function NewConversationDialog({
  open,
  onOpenChange,
  onConversationCreated,
}: NewConversationDialogProps) {
  const { currentUser } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Partial<User>[]>([]);
  const [searching, setSearching] = useState(false);
  const [startingWith, setStartingWith] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { users } = await socialService.searchUsers(query.trim(), 1, 10);
        // Exclude self
        setResults(users.filter(u => u._id !== currentUser?._id));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, currentUser?._id]);

  const handleSelect = async (user: Partial<User>) => {
    if (!user._id || startingWith) return;
    setStartingWith(user._id);
    try {
      const conversation = await chatService.createConversation({
        participants: [user._id],
        conversationType: 'DIRECT',
      });
      onConversationCreated(conversation);
      onOpenChange(false);
    } catch {
      toast.error('Failed to start conversation');
    } finally {
      setStartingWith(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-md rounded-2xl overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border/30">
          <DialogTitle className="text-base font-semibold">New Message</DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/20">
          <Search className="h-4 w-4 text-muted-foreground/50 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search people..."
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/40 focus:outline-none"
          />
          {searching && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground/40 shrink-0" />}
        </div>

        {/* Results */}
        <div className="scrollbar-thin max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            results.map(user => (
              <button
                key={user._id}
                onClick={() => handleSelect(user)}
                disabled={!!startingWith}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                  'hover:bg-accent/50 active:bg-accent/70',
                  startingWith === user._id && 'opacity-60'
                )}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={user.avatar} alt={getUserDisplayName(user)} />
                  <AvatarFallback className="text-sm">{getUserInitial(user)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{getUserDisplayName(user)}</p>
                  <p className="text-xs text-muted-foreground/60 truncate">@{user.username}</p>
                </div>
                {startingWith === user._id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/40 shrink-0" />
                ) : (
                  <MessageCircle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                )}
              </button>
            ))
          ) : query.trim() && !searching ? (
            <div className="py-10 text-center text-sm text-muted-foreground/50">
              No users found for &ldquo;{query}&rdquo;
            </div>
          ) : !query.trim() ? (
            <div className="py-10 text-center text-sm text-muted-foreground/40">
              Search for someone to message
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
