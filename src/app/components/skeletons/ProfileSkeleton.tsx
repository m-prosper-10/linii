import { Skeleton } from '@/app/components/ui/skeleton';

const ProfileSkeleton = () => {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Header Skeleton */}
      <div className="bg-background/80 border-border sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="flex items-center gap-4 p-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      <div>
        {/* Cover Image Skeleton */}
        <Skeleton className="h-48 w-full" />

        {/* Profile Info Skeleton */}
        <div className="px-4 pb-4">
          <div className="-mt-16 mb-4 flex items-start justify-between">
            <Skeleton className="h-32 w-32 rounded-full border-background border-4 shadow-xl" />
            <div className="mt-16">
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <div className="flex gap-6 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="border-border flex h-14 w-full border-b px-4">
          <Skeleton className="h-full w-24 rounded-none" />
          <Skeleton className="h-full w-24 rounded-none" />
          <Skeleton className="h-full w-24 rounded-none" />
        </div>

        {/* Content Skeleton (Posts) */}
        <div className="space-y-4 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
