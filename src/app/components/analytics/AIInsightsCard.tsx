import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Sparkles } from 'lucide-react';

interface Insight {
  title: string;
  desc: string;
}

// These could be made dynamic by passing them as props from a real AI endpoint
const DEFAULT_INSIGHTS: Insight[] = [
  {
    title: 'Peak Engagement',
    desc: 'Your audience is most active on Wednesdays at 2 PM.',
  },
  {
    title: 'Visual Advantage',
    desc: 'Posts with media receive 40% more engagement than text-only posts.',
  },
  {
    title: 'Topic Trend',
    desc: 'Try posting about trending topics in your niche to boost reach.',
  },
];

interface AIInsightsCardProps {
  insights?: Insight[];
}

export function AIInsightsCard({ insights = DEFAULT_INSIGHTS }: AIInsightsCardProps) {
  return (
    <Card className="border-primary/20 bg-primary/3 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base tracking-tight">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          AI Content Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/40 bg-background/60 p-3"
          >
            <h4 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary/70">
              {insight.title}
            </h4>
            <p className="text-xs font-medium leading-relaxed text-muted-foreground/70">
              {insight.desc}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
