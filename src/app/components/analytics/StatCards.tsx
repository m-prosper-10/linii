import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Eye, Heart, MessageCircle, Repeat2, TrendingUp, Users, FileText } from 'lucide-react';
import type { UserAnalytics } from '@/services/analytics';

interface StatCardsProps {
  analytics: UserAnalytics;
}

const STATS = (a: UserAnalytics) => [
  {
    label: 'Total Posts',
    value: a.totalPosts.toLocaleString(),
    sub: 'Lifetime content',
    icon: FileText,
  },
  {
    label: 'Stories',
    value: a.totalStories.toLocaleString(),
    sub: 'Published stories',
    icon: FileText,
  },
  {
    label: 'Total Views',
    value: a.totalViews.toLocaleString(),
    sub: 'Across all posts',
    icon: Eye,
  },
  {
    label: 'Total Likes',
    value: a.totalLikesReceived.toLocaleString(),
    sub: 'Received across posts',
    icon: Heart,
  },
  {
    label: 'Comments',
    value: a.totalCommentsReceived.toLocaleString(),
    sub: 'Audience engagement',
    icon: MessageCircle,
  },
  {
    label: 'Shares',
    value: a.totalSharesReceived.toLocaleString(),
    sub: 'Reposts and shares',
    icon: Repeat2,
  },
  {
    label: 'Followers',
    value: a.totalFollowers.toLocaleString(),
    sub: null,
    icon: Users,
    badge: `${a.engagementRate.toFixed(1)}% ER`,
  },
];

export function StatCards({ analytics }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {STATS(analytics).map(({ label, value, sub, icon: Icon, badge }) => (
        <Card key={label} className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {label}
            </CardTitle>
            <Icon className="h-3.5 w-3.5 text-muted-foreground/40" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            {badge ? (
              <p className="mt-0.5 flex items-center gap-1 text-xs font-bold text-emerald-500">
                <TrendingUp className="h-3 w-3" />
                {badge}
              </p>
            ) : (
              <p className="mt-0.5 text-[11px] font-medium text-muted-foreground/50">{sub}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
