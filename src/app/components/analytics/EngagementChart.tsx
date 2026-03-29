import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface EngagementChartProps {
  data: Array<{ date: string; rate: number }>;
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '12px',
    padding: '12px',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
  labelStyle: {
    color: 'hsl(var(--foreground))',
    fontWeight: 700,
    marginBottom: '8px',
    fontSize: '12px',
  },
  itemStyle: { padding: '4px 0', fontSize: '12px', fontWeight: 600 },
  cursor: { stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' },
};

export function EngagementChart({ data }: EngagementChartProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="tracking-tight">Engagement Rate</CardTitle>
        <CardDescription className="font-medium opacity-70">
          Engagement rate over time
        </CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
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
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={v => `${v}%`}
            />
            <Tooltip {...tooltipStyle} />
            <Legend
              wrapperStyle={{ paddingTop: '16px' }}
              iconType="circle"
              formatter={value => (
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(var(--muted-foreground))' }}>
                  {value}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              name="Engagement Rate"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
