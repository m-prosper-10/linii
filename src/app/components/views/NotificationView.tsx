'use client';

import {
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Info,
  Share2,
  Vote,
  Calendar,
  MoreHorizontal,
  Check,
  CheckCheck,
  Trash2,
  Bell,
  LucideIcon,
  Loader2,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { cn } from '@/app/components/ui/utils';
import { useEffect, useState, useCallback } from 'react';
import { notificationService, Notification } from '@/services/notification';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { socialService } from '@/services/social';

const notificationIcons: Record<string, LucideIcon> = {
  LIKE: Heart,
  COMMENT: MessageCircle,
  FOLLOW: UserPlus,
  MENTION: AtSign,
  SHARE: Share2,
  POLL_VOTE: Vote,
  EVENT_INVITE: Calendar,
  POST: Info,
  default: Info,
};

const notificationColors: Record<string, string> = {
  LIKE: 'text-red-500 bg-red-500/10',
  COMMENT: 'text-blue-500 bg-blue-500/10',
  FOLLOW: 'text-green-500 bg-green-500/10',
  MENTION: 'text-purple-500 bg-purple-500/10',
  SHARE: 'text-orange-500 bg-orange-500/10',
  POLL_VOTE: 'text-cyan-500 bg-cyan-500/10',
  EVENT_INVITE: 'text-indigo-500 bg-indigo-500/10',
  POST: 'text-yellow-500 bg-yellow-500/10',
  default: 'text-gray-500 bg-gray-500/10',
};

export function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchNotifications = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        setLoading(true);
        const data = await notificationService.getNotifications(pageNum);

        if (append) {
          setNotifications(prev => [...prev, ...data.notifications]);
        } else {
          setNotifications(data.notifications);
        }

        setUnreadCount(data.unreadCount);
        setHasMore(data.pagination.hasMore);
        setPage(data.pagination.page);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      const deletedNotif = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await socialService.followUser(userId);
      // Optional: Update UI to show following status
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const getFilteredNotifications = () => {
    if (activeTab === 'unread') return notifications.filter(n => !n.isRead);
    if (activeTab === 'mentions')
      return notifications.filter(n => n.type === 'MENTION');
    return notifications;
  };

  const NotificationItem = ({
    notification,
  }: {
    notification: Notification;
  }) => {
    const Icon =
      notificationIcons[notification.type] || notificationIcons.default;
    const iconStyles =
      notificationColors[notification.type] || notificationColors.default;

    return (
      <div
        className={cn(
          'hover:bg-accent/50 border-border group relative cursor-pointer border-b p-4 transition-colors',
          !notification.isRead && 'bg-primary/5'
        )}
        onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
      >
        <div className="flex gap-3">
          {notification.sender && notification.sender.avatar ? (
            <Avatar className="border-border h-12 w-12 border">
              <AvatarImage src={notification.sender.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {notification.sender.fullnames?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                iconStyles
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-foreground leading-tight">
                  {notification.sender && (
                    <span className="cursor-pointer font-bold hover:underline">
                      {notification.sender.fullnames}
                    </span>
                  )}{' '}
                  <span className="text-muted-foreground">
                    {notification.message}
                  </span>
                </p>
                <p className="text-muted-foreground mt-1.5 text-xs font-medium">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={e => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {!notification.isRead && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleMarkAsRead(notification._id, false)
                        }
                      >
                        <Check className="mr-2 h-4 w-4" /> Mark as read
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(notification._id);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {!notification.isRead && (
                <div className="bg-primary shadow-primary/30 mt-2 h-2.5 w-2.5 shrink-0 rounded-full shadow-sm" />
              )}
            </div>

            {notification.type === 'FOLLOW' && (
              <Button
                size="sm"
                variant="outline"
                className="hover:bg-primary hover:text-primary-foreground hover:border-primary mt-3 rounded-full px-4 font-semibold transition-all"
                onClick={e => {
                  e.stopPropagation();
                  handleFollow(notification.sender._id);
                }}
              >
                Follow back
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border-border/50 bg-card mx-auto min-h-screen max-w-full border-x">
      <div className="bg-card/80 border-border/50 sticky top-0 z-10 border-b backdrop-blur-md">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/10 gap-2 text-xs font-bold uppercase tracking-wider"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="border-border/50 h-auto w-full justify-start rounded-none border-t bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="data-[state=active]:border-primary h-12 min-w-[60px] rounded-none border-b-2 border-transparent px-0 text-sm font-bold data-[state=active]:bg-transparent"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="data-[state=active]:border-primary relative h-12 min-w-[60px] rounded-none border-b-2 border-transparent px-0 text-sm font-bold data-[state=active]:bg-transparent"
            >
              Unread
              {unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-black">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="mentions"
              className="data-[state=active]:border-primary h-12 min-w-[60px] rounded-none border-b-2 border-transparent px-0 text-sm font-bold data-[state=active]:bg-transparent"
            >
              Mentions
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col">
        {getFilteredNotifications().length > 0 ? (
          <>
            {getFilteredNotifications().map(notification => (
              <NotificationItem
                key={notification._id}
                notification={notification}
              />
            ))}

            {hasMore && (
              <div className="flex justify-center p-4">
                <Button
                  variant="ghost"
                  onClick={() => fetchNotifications(page + 1, true)}
                  disabled={loading}
                  className="text-primary hover:bg-primary/5 w-full font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    'Load more'
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 p-20 text-center">
            <div className="bg-accent/30 flex h-20 w-20 items-center justify-center rounded-full">
              <Bell className="text-muted-foreground/50 h-10 w-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {activeTab === 'unread'
                  ? "You're all caught up!"
                  : 'No notifications yet'}
              </h3>
              <p className="text-muted-foreground mx-auto mt-2 max-w-[250px]">
                {activeTab === 'unread'
                  ? "When you get new notifications, they'll show up here."
                  : 'Start interacting with others to see notifications here!'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
