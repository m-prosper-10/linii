'use client';

import * as React from 'react';
import { Check, Loader2, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/app/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { socialService } from '@/services/social';
import { User } from '@/services/auth';
import { cn } from '@/app/components/ui/utils';
import { toast } from 'sonner';

interface UserSearchPickerProps {
  selectedUsers: Array<{ id: string; name: string; avatar?: string }>;
  onSelect: (user: { id: string; name: string; avatar?: string }) => void;
  onRemove: (userId: string) => void;
  children: React.ReactNode;
}

export function UserSearchPicker({
  selectedUsers,
  onSelect,
  onRemove,
  children
}: UserSearchPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<Partial<User>[]>([]);
  const [loading, setLoading] = React.useState(false);

  const searchUsers = React.useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const { users } = await socialService.searchUsers(q);
      setResults(users);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchUsers]);

  const isSelected = (userId: string) => selectedUsers.some(u => u.id === userId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 rounded-2xl shadow-2xl border-border/50 overflow-hidden" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search users..." 
            value={query} 
            onValueChange={setQuery}
            className="border-none focus:ring-0"
          />
          <CommandList className="max-h-[300px] custom-scrollbar">
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary opacity-50" />
              </div>
            )}
            
            {!loading && results.length === 0 && query.trim() !== '' && (
              <CommandEmpty>No users found.</CommandEmpty>
            )}

            {!loading && query.trim() === '' && (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <Search className="h-8 w-8 text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground font-medium">Type to search for collaborators</p>
              </div>
            )}

            <CommandGroup>
              {results.map((user) => (
                <CommandItem
                  key={user._id}
                  value={user._id}
                  onSelect={() => {
                    if (isSelected(user._id!)) {
                      onRemove(user._id!);
                    } else {
                      onSelect({
                        id: user._id!,
                        name: user.fullnames || user.username || 'Unknown',
                        avatar: user.avatar
                      });
                    }
                  }}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors rounded-xl mx-1"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={user.avatar} alt={user.fullnames} />
                    <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                      {(user.fullnames || 'U').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-bold truncate">{user.fullnames}</span>
                    <span className="text-[10px] text-muted-foreground truncate">@{user.username}</span>
                  </div>
                  {isSelected(user._id!) && (
                    <div className="bg-primary rounded-full p-1 shrink-0">
                      <Check className="h-2 w-2 text-primary-foreground stroke-[4px]" />
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
