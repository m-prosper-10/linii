'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Globe, Users, Lock, UserPlus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';

interface PostCreationHeaderProps {
  user: {
    displayName: string;
    avatar?: string;
  };
  visibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  onVisibilityChange: (value: 'PUBLIC' | 'FRIENDS' | 'PRIVATE') => void;
  mentions?: Array<{ id: string; name: string; avatar?: string }>;
  onAddMention?: () => void;
}

export function PostCreationHeader({
  user,
  visibility,
  onVisibilityChange,
  mentions = [],
  onAddMention
}: PostCreationHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex flex-row items-center gap-3 w-full border">
        <div className="flex -space-x-2 overflow-hidden">
          <Avatar className="h-10 w-10 border-2 border-background ring-1 ring-border/20 shrink-0">
            <AvatarImage src={user.avatar} alt={user.displayName} />
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
              {user.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          {mentions.slice(0, 2).map((mention) => (
            <Avatar key={mention.id} className="h-10 w-10 border-2 border-background ring-1 ring-border/20 shrink-0">
              <AvatarImage src={mention.avatar} alt={mention.name} />
              <AvatarFallback className="bg-accent text-[10px] font-bold">
                {mention.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ))}
          
          {mentions.length > 2 && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-accent text-[10px] font-bold ring-1 ring-border/20">
              +{mentions.length - 2}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[15px] leading-tight flex items-center gap-1">
              {user.displayName}
              {mentions.length > 0 && (
                <span className="text-muted-foreground font-medium text-sm">
                  and {mentions.length === 1 ? mentions[0].name : `${mentions.length} others`}
                </span>
              )}
            </span>
            {onAddMention && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={onAddMention}
                    >
                      <UserPlus className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-[10px]">Add Collaborators</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <Select value={visibility} onValueChange={onVisibilityChange}>
            <SelectTrigger className="h-5 gap-1 rounded-full border-none bg-accent/30 hover:bg-accent/50 px-2 text-[10px] font-bold uppercase tracking-wider transition-all focus:ring-0 w-fit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" className="rounded-xl border-border/50 shadow-2xl">
              <SelectItem value="PUBLIC">
                <div className="flex items-center gap-2 py-0.5">
                  <Globe className="h-3 w-3 text-sky-500"/> 
                  <span className="font-semibold">Public</span>
                </div>
              </SelectItem>
              <SelectItem value="FRIENDS">
                <div className="flex items-center gap-2 py-0.5">
                  <Users className="h-3 w-3 text-emerald-500"/> 
                  <span className="font-semibold">Friends</span>
                </div>
              </SelectItem>
              <SelectItem value="PRIVATE">
                <div className="flex items-center gap-2 py-0.5">
                  <Lock className="h-3 w-3 text-amber-500"/> 
                  <span className="font-semibold">Private</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}