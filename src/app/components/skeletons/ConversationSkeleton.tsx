import { Skeleton } from "../ui/skeleton";

const ConversationSkeleton = () => (
  <div className="border-border border-b p-4">
    <div className="flex gap-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  </div>
);

export default ConversationSkeleton;