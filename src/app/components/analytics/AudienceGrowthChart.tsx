import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';

interface AudienceGrowthChartProps {
  data: Array<{ date: string; count: number }>;
}

export function AudienceGrowthChart({ data }: AudienceGrowthChartProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="tracking-tight">Audience Growth</CardTitle>
        <CardDescription className="font-medium opacity-70">
          Follower count over time
        </CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="followersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.2}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={str => {
                try { return format(new Date(str), 'MMM d'); } catch { return str; }
              }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              hide
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                padding: '10px 14px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 700, fontSize: 12 }}
              itemStyle={{ fontSize: 12, fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="count"
              name="Followers"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#followersGradient)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
