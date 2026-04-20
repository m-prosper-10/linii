import { Skeleton } from '../ui/skeleton';

const PostSkeleton = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
};

export default PostSkeleton;
