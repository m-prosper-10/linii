'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { chatService, Conversation } from '@/services/chat';
import { socialService } from '@/services/social';
import { useApp } from '@/context/AppContext';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { cn } from '@/app/components/ui/utils';
import { getUserDisplayName, getUserInitial } from '@/lib/user';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Check,
  Crown,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  UserMinus,
  UserX,
  X,
} from 'lucide-react';

// ── Background options ────────────────────────────────────────────────────────

const BG_OPTIONS = [
  { id: 'default', label: 'Default', class: 'bg-background' },
  { id: 'slate', label: 'Slate', class: 'bg-slate-900' },
  { id: 'zinc', label: 'Zinc', class: 'bg-zinc-800' },
  { id: 'rose', label: 'Rose', class: 'bg-rose-950' },
  { id: 'indigo', label: 'Indigo', class: 'bg-indigo-950' },
  { id: 'emerald', label: 'Emerald', class: 'bg-emerald-950' },
  { id: 'amber', label: 'Amber', class: 'bg-amber-950' },
];

const BG_STORAGE_KEY = (id: string) => `chat_bg_${id}`;

// ── Main view ─────────────────────────────────────────────────────────────────

export function ConversationSettingsView() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;
  const { currentUser } = useApp();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [editingName, setEditingName] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [muted, setMuted] = useState(false);
  const [selectedBg, setSelectedBg] = useState('default');

  // Add members dialog
  const [addMembersOpen, setAddMembersOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await chatService.getConversation(conversationId);
        setConversation(data);
        setGroupName(data.name ?? '');
        setGroupDesc(data.description ?? '');
        // Load saved bg preference
        const saved = localStorage.getItem(BG_STORAGE_KEY(conversationId));
        if (saved) setSelectedBg(saved);
      } catch {
        toast.error('Failed to load conversation');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [conversationId, router]);

  if (loading || !conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-muted-foreground/40 h-5 w-5 animate-spin" />
      </div>
    );
  }

  const isGroup = conversation.conversationType === 'GROUP';
  const isAdmin = conversation.admins.includes(currentUser?._id ?? '');
  const isCreator = conversation.createdBy === currentUser?._id;
  const otherUser = conversation.participants.find(
    p => p._id !== currentUser?._id
  );
  const otherUserName = getUserDisplayName(otherUser);

  const handleSaveName = async () => {
    if (!groupName.trim()) return;
    setSaving(true);
    try {
      const updated = await chatService.updateConversation(conversationId, {
        name: groupName.trim(),
        description: groupDesc.trim(),
      });
      setConversation(updated);
      setEditingName(false);
      toast.success('Group info updated');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      const updated = await chatService.removeParticipant(
        conversationId,
        participantId
      );
      setConversation(updated);
      toast.success('Participant removed');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to remove participant');
    }
  };

  const handleLeave = async () => {
    try {
      await chatService.leaveConversation(conversationId);
      toast.success('Left conversation');
      router.push('/messages');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to leave');
    }
  };

  const handleDelete = async () => {
    try {
      await chatService.deleteConversation(conversationId);
      toast.success('Conversation deleted');
      router.push('/messages');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to delete');
    }
  };

  const handleBlock = async () => {
    if (!otherUser) return;
    try {
      await socialService.blockUser(otherUser._id!);
      toast.success(`Blocked @${otherUser.username}`);
      router.push('/messages');
    } catch {
      toast.error('Failed to block user');
    }
  };

  const handleBgSelect = (bgId: string) => {
    setSelectedBg(bgId);
    localStorage.setItem(BG_STORAGE_KEY(conversationId), bgId);
    toast.success('Background updated');
  };

  const handleMembersAdded = async () => {
    // Refresh conversation after adding members
    try {
      const updated = await chatService.getConversation(conversationId);
      setConversation(updated);
    } catch {
      /* silent */
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      {/* Header */}
      <div className="bg-background/80 border-border/40 sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="hover:bg-accent/60 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-bold">Chat Settings</h2>
      </div>

      <div className="space-y-6 p-4">
        {/* ── Identity section ── */}
        <Section title={isGroup ? 'Group Info' : 'Contact'}>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={isGroup ? conversation.avatar : otherUser?.avatar}
              />
              <AvatarFallback className="text-xl font-bold">
                {isGroup
                  ? (conversation.name?.[0] ?? 'G')
                  : getUserInitial(otherUser)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              {isGroup && editingName ? (
                <div className="space-y-2">
                  <Input
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    placeholder="Group name"
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Input
                    value={groupDesc}
                    onChange={e => setGroupDesc(e.target.value)}
                    placeholder="Description (optional)"
                    className="h-8 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-7 rounded-lg px-3 text-xs"
                      onClick={handleSaveName}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 rounded-lg px-3 text-xs"
                      onClick={() => setEditingName(false)}
                    >
                      <X className="h-3 w-3" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">
                      {isGroup
                        ? (conversation.name ?? 'Unnamed group')
                        : otherUserName}
                    </p>
                    {isGroup && (isAdmin || isCreator) && (
                      <button
                        onClick={() => setEditingName(true)}
                        className="text-muted-foreground/50 hover:text-foreground transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-muted-foreground/60 mt-0.5 text-xs">
                    {isGroup
                      ? conversation.description ||
                        `${conversation.participants.length} members`
                      : `@${otherUser?.username}`}
                  </p>
                </>
              )}
            </div>
          </div>
        </Section>

        {/* ── Chat background ── */}
        <Section title="Chat Background">
          <div className="grid grid-cols-7 gap-2">
            {BG_OPTIONS.map(bg => (
              <button
                key={bg.id}
                onClick={() => handleBgSelect(bg.id)}
                title={bg.label}
                className={cn(
                  'relative h-9 w-full rounded-lg border-2 transition-all',
                  bg.class,
                  selectedBg === bg.id
                    ? 'border-primary shadow-primary/20 scale-105 shadow-md'
                    : 'border-border/30 hover:border-border'
                )}
              >
                {selectedBg === bg.id && (
                  <Check className="text-primary absolute inset-0 m-auto h-3.5 w-3.5 drop-shadow" />
                )}
              </button>
            ))}
          </div>
          <p className="text-muted-foreground/50 mt-2 text-[11px]">
            Background is saved locally on this device.
          </p>
        </Section>

        {/* ── Notifications ── */}
        <Section title="Notifications">
          <button
            onClick={() => setMuted(m => !m)}
            className="hover:bg-accent/50 flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors"
          >
            <div className="flex items-center gap-3">
              {muted ? (
                <BellOff className="text-muted-foreground/60 h-4 w-4" />
              ) : (
                <Bell className="text-muted-foreground/60 h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {muted ? 'Unmute notifications' : 'Mute notifications'}
              </span>
            </div>
            <div
              className={cn(
                'h-5 w-9 rounded-full transition-colors',
                muted ? 'bg-primary' : 'bg-muted'
              )}
            >
              <div
                className={cn(
                  'h-5 w-5 rounded-full bg-white shadow transition-transform',
                  muted ? 'translate-x-4' : 'translate-x-0'
                )}
              />
            </div>
          </button>
        </Section>

        {/* ── Members (group only) ── */}
        {isGroup && (
          <Section
            title={`Members · ${conversation.participants.length}`}
            action={
              isAdmin || isCreator ? (
                <button
                  onClick={() => setAddMembersOpen(true)}
                  className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-semibold transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              ) : undefined
            }
          >
            <div className="space-y-1">
              {conversation.participants.map(participant => {
                const pIsAdmin = conversation.admins.includes(participant._id!);
                const pIsCreator = conversation.createdBy === participant._id;
                const isSelf = participant._id === currentUser?._id;
                const canRemove =
                  (isAdmin || isCreator) && !isSelf && !pIsCreator;

                return (
                  <div
                    key={participant._id}
                    className="hover:bg-accent/30 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback className="text-xs font-bold">
                        {getUserInitial(participant)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium">
                          {getUserDisplayName(participant)}
                        </span>
                        {pIsCreator && (
                          <Crown className="h-3 w-3 shrink-0 text-amber-500" />
                        )}
                        {pIsAdmin && !pIsCreator && (
                          <span className="text-primary/70 bg-primary/10 rounded-md px-1.5 py-0.5 text-[10px] font-bold">
                            Admin
                          </span>
                        )}
                        {isSelf && (
                          <span className="text-muted-foreground/50 text-[10px]">
                            (you)
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground/50 text-[11px]">
                        @{participant.username}
                      </p>
                    </div>
                    {canRemove && (
                      <button
                        onClick={() =>
                          handleRemoveParticipant(participant._id!)
                        }
                        className="text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive rounded-lg p-1.5 transition-colors"
                        title="Remove"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Danger zone ── */}
        <Section title="Danger Zone">
          <div className="space-y-1">
            {!isGroup && (
              <DangerRow
                icon={UserX}
                label={`Block @${otherUser?.username}`}
                onClick={handleBlock}
              />
            )}
            {isGroup && (
              <DangerRow
                icon={LogOut}
                label="Leave conversation"
                onClick={handleLeave}
              />
            )}
            {(isCreator || !isGroup) && (
              <DangerRow
                icon={Trash2}
                label="Delete conversation"
                onClick={handleDelete}
              />
            )}
          </div>
        </Section>
      </div>

      {/* Add members dialog — reuses NewConversationDialog but we handle the result differently */}
      {isGroup && (
        <AddMembersDialog
          open={addMembersOpen}
          onOpenChange={setAddMembersOpen}
          conversationId={conversationId}
          existingIds={conversation.participants.map(p => p._id!)}
          onAdded={handleMembersAdded}
        />
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between px-0.5">
        <span className="text-muted-foreground/50 text-[10px] font-bold uppercase tracking-widest">
          {title}
        </span>
        {action}
      </div>
      <div className="border-border/30 bg-card/60 rounded-2xl border px-3 py-2">
        {children}
      </div>
    </div>
  );
}

function DangerRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors"
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

// Thin wrapper around the search dialog that adds participants instead of creating a conversation
function AddMembersDialog({
  open,
  onOpenChange,
  conversationId,
  existingIds,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  conversationId: string;
  existingIds: string[];
  onAdded: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<
    {
      _id?: string;
      fullnames?: string;
      displayName?: string;
      username?: string;
      avatar?: string;
    }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const { users } = await socialService.searchUsers(query, 1, 10);
        setResults(users.filter(u => u._id && !existingIds.includes(u._id)));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, existingIds]);

  const handleAdd = async (userId: string) => {
    setAdding(userId);
    try {
      await chatService.addParticipants(conversationId, [userId]);
      toast.success('Member added');
      onAdded();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to add member');
    } finally {
      setAdding(null);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="border-border/40 bg-background fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border shadow-2xl">
        <div className="border-border/30 border-b px-4 py-3">
          <p className="text-sm font-semibold">Add members</p>
        </div>
        <div className="border-border/20 flex items-center gap-2 border-b px-4 py-3">
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search people…"
            className="placeholder:text-muted-foreground/40 flex-1 bg-transparent text-sm focus:outline-none"
          />
          {searching && (
            <Loader2 className="text-muted-foreground/40 h-3.5 w-3.5 animate-spin" />
          )}
        </div>
        <div className="scrollbar-thin max-h-72 overflow-y-auto">
          {results.length > 0 ? (
            results.map(user => (
              <div
                key={user._id}
                className="hover:bg-accent/40 flex items-center gap-3 px-4 py-3 transition-colors"
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs">
                    {getUserInitial(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {getUserDisplayName(user)}
                  </p>
                  <p className="text-muted-foreground/50 text-xs">
                    @{user.username}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="h-7 rounded-lg px-3 text-xs"
                  disabled={adding === user._id}
                  onClick={() => handleAdd(user._id!)}
                >
                  {adding === user._id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Add'
                  )}
                </Button>
              </div>
            ))
          ) : query.trim() && !searching ? (
            <p className="text-muted-foreground/50 py-8 text-center text-sm">
              No users found
            </p>
          ) : (
            <p className="text-muted-foreground/40 py-8 text-center text-sm">
              Search for people to add
            </p>
          )}
        </div>
      </div>
    </>
  );
}
