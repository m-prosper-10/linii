import { Heart, MessageCircle, UserPlus, AtSign, Info } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { mockNotifications } from '@/data/mockData';
import { cn } from '@/app/components/ui/utils';

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  mention: AtSign,
  system: Info
};

const notificationColors = {
  like: 'text-red-500',
  comment: 'text-blue-500',
  follow: 'text-green-500',
  mention: 'text-purple-500',
  system: 'text-yellow-500'
};

export function NotificationsView() {
  const unreadNotifications = mockNotifications.filter(n => !n.read);
  const allNotifications = mockNotifications;

  const NotificationItem = ({ notification }: { notification: typeof mockNotifications[0] }) => {
    const Icon = notificationIcons[notification.type];
    const iconColor = notificationColors[notification.type];

    return (
      <div className={cn(
        'p-4 hover:bg-accent/50 transition-colors cursor-pointer border-b border-border',
        !notification.read && 'bg-accent/30'
      )}>
        <div className="flex gap-3">
          {notification.user ? (
            <Avatar className="w-10 h-10">
              <AvatarImage src={notification.user.avatar} />
              <AvatarFallback>{notification.user.displayName[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center bg-accent', iconColor)}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p>
                  {notification.user && (
                    <span className="font-medium hover:underline cursor-pointer">
                      {notification.user.displayName}
                    </span>
                  )}
                  {' '}
                  <span className="text-muted-foreground">{notification.content}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.timestamp}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              )}
            </div>

            {notification.type === 'follow' && notification.user && (
              <Button size="sm" variant="outline" className="mt-2">
                Follow back
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <h2 className="font-semibold text-xl">Notifications</h2>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-auto p-0">
          <TabsTrigger 
            value="all" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="unread" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent relative"
          >
            Unread
            {unreadNotifications.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {unreadNotifications.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="mentions" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Mentions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {allNotifications.length > 0 ? (
            allNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No notifications yet
            </div>
          )}
        </TabsContent>

        <TabsContent value="unread" className="mt-0">
          {unreadNotifications.length > 0 ? (
            unreadNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              You're all caught up!
            </div>
          )}
        </TabsContent>

        <TabsContent value="mentions" className="mt-0">
          {mockNotifications.filter(n => n.type === 'mention').length > 0 ? (
            mockNotifications
              .filter(n => n.type === 'mention')
              .map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No mentions yet
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
