'use client';

import {
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Share2,
  BarChart2,
  Calendar,
  Bell,
  CheckCheck,
  Loader2,
  Trash2,
  LucideIcon,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import { useEffect, useState, useCallback } from 'react';
import { notificationService, Notification } from '@/services/notification';
import { socialService } from '@/services/social';
import { getUserDisplayName, getUserInitial } from '@/lib/user';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import NotificationSkeleton from '../skeletons/NotificationSkeleton';
import { toast } from 'sonner';

// ── Icon + colour config ──────────────────────────────────────────────────────

const TYPE_META: Record<string, { icon: LucideIcon; bg: string; fg: string }> =
  {
    LIKE: { icon: Heart, bg: 'bg-rose-500/10', fg: 'text-rose-500' },
    COMMENT: { icon: MessageCircle, bg: 'bg-blue-500/10', fg: 'text-blue-500' },
    FOLLOW: { icon: UserPlus, bg: 'bg-emerald-500/10', fg: 'text-emerald-500' },
    MENTION: { icon: AtSign, bg: 'bg-violet-500/10', fg: 'text-violet-500' },
    SHARE: { icon: Share2, bg: 'bg-orange-500/10', fg: 'text-orange-500' },
    POLL_VOTE: { icon: BarChart2, bg: 'bg-cyan-500/10', fg: 'text-cyan-500' },
    EVENT_INVITE: {
      icon: Calendar,
      bg: 'bg-indigo-500/10',
      fg: 'text-indigo-500',
    },
    POST: { icon: Bell, bg: 'bg-amber-500/10', fg: 'text-amber-500' },
  };

const DEFAULT_META = {
  icon: Bell,
  bg: 'bg-muted',
  fg: 'text-muted-foreground',
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'mentions', label: 'Mentions' },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ── Main view ─────────────────────────────────────────────────────────────────

export function NotificationsView() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('all');
  // Track follow-back state per sender id
  const [followedBack, setFollowedBack] = useState<Set<string>>(new Set());
  const [followingInProgress, setFollowingInProgress] = useState<Set<string>>(
    new Set()
  );

  const fetchNotifications = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        const data = await notificationService.getNotifications(pageNum);
        setNotifications(prev =>
          append ? [...prev, ...data.notifications] : data.notifications
        );
        setUnreadCount(data.unreadCount);
        setHasMore(data.pagination.hasMore);
        setPage(data.pagination.page);
      } catch {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      /* silent */
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const target = notifications.find(n => n._id === id);
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (target && !target.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await notificationService.deleteNotification(id);
    } catch {
      toast.error('Failed to delete notification');
      fetchNotifications(); // revert
    }
  };

  const handleFollowBack = async (e: React.MouseEvent, senderId: string) => {
    e.stopPropagation();
    if (followedBack.has(senderId) || followingInProgress.has(senderId)) return;
    setFollowingInProgress(prev => new Set(prev).add(senderId));
    try {
      await socialService.followUser(senderId);
      setFollowedBack(prev => new Set(prev).add(senderId));
      toast.success('Following back');
    } catch {
      toast.error('Failed to follow');
    } finally {
      setFollowingInProgress(prev => {
        const s = new Set(prev);
        s.delete(senderId);
        return s;
      });
    }
  };

  const handleNotificationClick = (n: Notification) => {
    markAsRead(n._id, n.isRead);
    if (n.type === 'FOLLOW') {
      router.push(`/profile/${n.sender._id}`);
    } else if (
      ['LIKE', 'COMMENT', 'SHARE', 'MENTION', 'POLL_VOTE'].includes(n.type) &&
      n.targetType === 'POST'
    ) {
      router.push(`/post/${n.targetId}`);
    } else if (n.type === 'EVENT_INVITE') {
      router.push(`/post/${n.targetId}`);
    }
  };

  const filtered = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'mentions') return n.type === 'MENTION';
    return true;
  });

  return (
    <div className="mx-auto min-h-screen max-w-2xl">
      {/* Sticky header */}
      <div className="bg-background/80 border-border/40 sticky top-0 z-10 border-b backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-xl font-bold tracking-tight">Notifications</h2>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-primary hover:text-primary/80 flex items-center gap-1.5 text-xs font-semibold transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-border/30 flex border-t">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex-1 py-3 text-sm font-semibold transition-colors',
                activeTab === tab.id
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground/70'
              )}
            >
              {tab.label}
              {tab.id === 'unread' && unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-black">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="bg-primary absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          [...Array(6)].map((_, i) => <NotificationSkeleton key={i} />)
        ) : filtered.length > 0 ? (
          <>
            {filtered.map(n => (
              <NotificationItem
                key={n._id}
                notification={n}
                followedBack={followedBack}
                followingInProgress={followingInProgress}
                onClick={() => handleNotificationClick(n)}
                onDelete={deleteNotification}
                onFollowBack={handleFollowBack}
              />
            ))}

            {hasMore && (
              <div className="p-4">
                <Button
                  variant="ghost"
                  className="text-primary hover:bg-primary/5 w-full text-sm font-semibold"
                  disabled={loadingMore}
                  onClick={() => fetchNotifications(page + 1, true)}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading…
                    </>
                  ) : (
                    'Load more'
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState tab={activeTab} />
        )}
      </div>
    </div>
  );
}

// ── Notification item ─────────────────────────────────────────────────────────

interface ItemProps {
  notification: Notification;
  followedBack: Set<string>;
  followingInProgress: Set<string>;
  onClick: () => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onFollowBack: (e: React.MouseEvent, senderId: string) => void;
}

function NotificationItem({
  notification: n,
  followedBack,
  followingInProgress,
  onClick,
  onDelete,
  onFollowBack,
}: ItemProps) {
  const meta = TYPE_META[n.type] ?? DEFAULT_META;
  const Icon = meta.icon;
  const isFollow = n.type === 'FOLLOW';
  const senderId = n.sender._id;
  const isFollowing = followedBack.has(senderId);
  const isPending = followingInProgress.has(senderId);
  const senderName = getUserDisplayName(n.sender);

  return (
    <div
      onClick={onClick}
      className={cn(
        'border-border/30 group relative flex cursor-pointer items-start gap-3 border-b px-4 py-3.5 transition-colors',
        'hover:bg-accent/40',
        !n.isRead && 'bg-primary/3'
      )}
    >
      {/* Unread dot */}
      {!n.isRead && (
        <span className="bg-primary absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full" />
      )}

      {/* Avatar + icon badge */}
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11">
          <AvatarImage src={n.sender.avatar} alt={senderName} />
          <AvatarFallback className="text-sm font-bold">
            {getUserInitial(n.sender)}
          </AvatarFallback>
        </Avatar>
        {/* Type icon badge */}
        <span
          className={cn(
            'border-background absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2',
            meta.bg
          )}
        >
          <Icon className={cn('h-2.5 w-2.5', meta.fg)} />
        </span>
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug">
          <span className="text-foreground font-semibold">
            {senderName}
          </span>{' '}
          <span className="text-muted-foreground">{n.message}</span>
        </p>
        <p className="text-muted-foreground/50 mt-1 text-[11px] font-medium">
          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
        </p>

        {/* Follow-back CTA */}
        {isFollow && (
          <button
            onClick={e => onFollowBack(e, senderId)}
            disabled={isFollowing || isPending}
            className={cn(
              'mt-2.5 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all',
              isFollowing
                ? 'bg-muted text-muted-foreground cursor-default'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Following…
              </>
            ) : isFollowing ? (
              <>
                <UserPlus className="h-3 w-3" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="h-3 w-3" />
                Follow back
              </>
            )}
          </button>
        )}
      </div>

      {/* Delete button — appears on hover */}
      <button
        onClick={e => onDelete(e, n._id)}
        className={cn(
          'text-muted-foreground/40 shrink-0 rounded-lg p-1.5 transition-all',
          'hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100'
        )}
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: TabId }) {
  const copy = {
    all: {
      title: 'No notifications yet',
      sub: 'Start interacting with others to see activity here.',
    },
    unread: {
      title: "You're all caught up!",
      sub: 'New notifications will appear here.',
    },
    mentions: {
      title: 'No mentions yet',
      sub: "When someone mentions you, it'll show up here.",
    },
  }[tab];

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="bg-accent/40 flex h-16 w-16 items-center justify-center rounded-2xl">
        <Bell className="text-muted-foreground/30 h-8 w-8" />
      </div>
      <div>
        <p className="text-foreground/80 font-semibold">{copy.title}</p>
        <p className="text-muted-foreground/50 mt-1 max-w-[220px] text-sm">
          {copy.sub}
        </p>
      </div>
    </div>
  );
}
