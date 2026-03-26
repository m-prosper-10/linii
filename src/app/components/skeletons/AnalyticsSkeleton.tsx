import { Skeleton } from '@/app/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';

const AnalyticsSkeleton = () => {
  return (
    <div className="mx-auto max-w-6xl pb-20">
      {/* Header Skeleton */}
      <div className="bg-background/80 border-border sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="p-4 space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="space-y-6 p-4">
        {/* Key Metrics Skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Big Chart Skeleton */}
        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="h-80">
            <Skeleton className="h-full w-full rounded-xl" />
          </CardContent>
        </Card>

        {/* Lower Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-border shadow-sm">
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="h-64">
              <Skeleton className="h-full w-full rounded-xl" />
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5 shadow-inner">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-background/50 border-border/50 rounded-xl border p-3 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Top Content Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-7 w-48 mx-1" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border-border bg-card overflow-hidden rounded-2xl border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSkeleton;
