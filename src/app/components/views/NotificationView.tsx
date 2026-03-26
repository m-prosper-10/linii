import { Heart, MessageCircle, UserPlus, AtSign, Info, Share2, Vote, Calendar, MoreHorizontal, Check, CheckCheck, Trash2, Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { cn } from '@/app/components/ui/utils';
import { useEffect, useState, useCallback, FC } from 'react';
import { notificationService, Notification } from '@/services/notification';
import { formatDistanceToNow } from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/app/components/ui/dropdown-menu';
import { socialService } from '@/services/social';

const notificationIcons: Record<string, FC<any>> = {
  LIKE: Heart,
  COMMENT: MessageCircle,
  FOLLOW: UserPlus,
  MENTION: AtSign,
  SHARE: Share2,
  POLL_VOTE: Vote,
  EVENT_INVITE: Calendar,
  POST: Info,
  default: Info
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
  default: 'text-gray-500 bg-gray-500/10'
};

export function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
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
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
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
    if (activeTab === 'mentions') return notifications.filter(n => n.type === 'MENTION');
    return notifications;
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const Icon = notificationIcons[notification.type] || notificationIcons.default;
    const iconStyles = notificationColors[notification.type] || notificationColors.default;

    return (
      <div 
        className={cn(
          'p-4 hover:bg-accent/50 transition-colors cursor-pointer border-b border-border group relative',
          !notification.isRead && 'bg-primary/5'
        )}
        onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
      >
        <div className="flex gap-3">
          {notification.sender && notification.sender.avatar ? (
            <Avatar className="w-12 h-12 border border-border">
              <AvatarImage src={notification.sender.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {notification.sender.fullnames?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className={cn('w-12 h-12 rounded-full flex items-center justify-center shrink-0', iconStyles)}>
              <Icon className="h-6 w-6" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-[15px] leading-tight text-foreground">
                  {notification.sender && (
                    <span className="font-bold hover:underline cursor-pointer">
                      {notification.sender.fullnames}
                    </span>
                  )}
                  {' '}
                  <span className="text-muted-foreground">{notification.message}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {!notification.isRead && (
                      <DropdownMenuItem onClick={() => handleMarkAsRead(notification._id, false)}>
                        <Check className="h-4 w-4 mr-2" /> Mark as read
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(notification._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {!notification.isRead && (
                <div className="w-2.5 h-2.5 bg-primary rounded-full mt-2 shrink-0 shadow-sm shadow-primary/30" />
              )}
            </div>

            {notification.type === 'FOLLOW' && (
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-3 font-semibold rounded-full px-4 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                onClick={(e) => {
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
    <div className="max-w-2xl mx-auto min-h-screen border-x border-border/50 bg-card">
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border/50">
        <div className="p-4 flex items-center justify-between">
          <h2 className="font-bold text-2xl tracking-tight">Notifications</h2>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:bg-primary/10 font-bold gap-2 text-xs uppercase tracking-wider"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-t border-border/50 bg-transparent h-auto p-0 gap-8 px-4">
            <TabsTrigger 
              value="all" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-12 px-0 text-sm font-bold min-w-[60px]"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="unread" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-12 px-0 text-sm font-bold min-w-[60px] relative"
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-black">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="mentions" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent h-12 px-0 text-sm font-bold min-w-[60px]"
            >
              Mentions
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col">
        {getFilteredNotifications().length > 0 ? (
          <>
            {getFilteredNotifications().map((notification) => (
              <NotificationItem key={notification._id} notification={notification} />
            ))}
            
            {hasMore && (
              <div className="p-4 flex justify-center">
                <Button 
                  variant="ghost" 
                  onClick={() => fetchNotifications(page + 1, true)}
                  disabled={loading}
                  className="w-full font-bold text-primary hover:bg-primary/5"
                >
                  {loading ? 'Loading...' : 'Load more'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-accent/30 rounded-full flex items-center justify-center">
              <Bell className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <div>
              <h3 className="font-bold text-xl">
                {activeTab === 'unread' ? "You're all caught up!" : "No notifications yet"}
              </h3>
              <p className="text-muted-foreground mt-2 max-w-[250px] mx-auto">
                {activeTab === 'unread' 
                  ? "When you get new notifications, they'll show up here." 
                  : "Start interacting with others to see notifications here!"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
