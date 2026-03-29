'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import { User } from '@/services/auth';
import { Conversation } from '@/services/chat';
import {
  Bell,
  BellOff,
  LogOut,
  Trash2,
  UserX,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatSettingsProps {
  open: boolean;
  onClose: () => void;
  conversation: Conversation;
  otherUser: User;
  onMute?: () => void;
  onDelete?: () => void;
  onBlock?: () => void;
  onLeave?: () => void;
  isMuted?: boolean;
}

export function ChatSettings({
  open,
  onClose,
  conversation,
  otherUser,
  onMute,
  onDelete,
  onBlock,
  onLeave,
  isMuted = false,
}: ChatSettingsProps) {
  const router = useRouter();

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-[1px]"
          onClick={onClose}
        />
      )}

      {/* Slide-in panel */}
      <div
        className={cn(
          'border-border/40 bg-card absolute inset-y-0 right-0 z-30 flex w-72 flex-col border-l shadow-2xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="border-border/30 flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Conversation info</span>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground/60 hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User info */}
        <div className="flex flex-col items-center gap-3 px-4 py-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={otherUser.avatar} alt={otherUser.fullnames} />
            <AvatarFallback className="text-2xl font-bold">
              {otherUser.fullnames?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-semibold">{otherUser.fullnames}</p>
            <p className="text-xs text-muted-foreground/60">@{otherUser.username}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-5 text-xs font-semibold"
            onClick={() => router.push(`/profile/${otherUser._id}`)}
          >
            View profile
          </Button>
        </div>

        {/* Conversation meta */}
        <div className="border-border/20 mx-4 rounded-xl border bg-accent/20 px-4 py-3 text-xs text-muted-foreground/60 space-y-1">
          <p>
            <span className="font-semibold text-foreground/70">Type: </span>
            {conversation.conversationType === 'DIRECT' ? 'Direct message' : 'Group'}
          </p>
          <p>
            <span className="font-semibold text-foreground/70">Started: </span>
            {new Date(conversation.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-1 px-2">
          <ActionRow
            icon={isMuted ? Bell : BellOff}
            label={isMuted ? 'Unmute notifications' : 'Mute notifications'}
            onClick={onMute}
          />
          {conversation.conversationType === 'GROUP' && (
            <ActionRow
              icon={LogOut}
              label="Leave conversation"
              onClick={onLeave}
            />
          )}
          <ActionRow
            icon={UserX}
            label={`Block @${otherUser.username}`}
            onClick={onBlock}
            destructive
          />
          <ActionRow
            icon={Trash2}
            label="Delete conversation"
            onClick={onDelete}
            destructive
          />
        </div>
      </div>
    </>
  );
}

function ActionRow({
  icon: Icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left',
        destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground/80 hover:bg-accent/60'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}
