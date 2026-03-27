import { Skeleton } from '../ui/skeleton';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

const PostDetailsSkeleton = ({ onClose }: { onClose?: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-0 backdrop-blur-md md:p-4">
      <div className="bg-card relative flex max-h-full min-h-[500px] w-full max-w-6xl flex-col overflow-hidden rounded-none shadow-2xl md:max-h-[85vh] md:flex-row md:rounded-2xl">
        {/* Mobile close */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4 z-10 rounded-full bg-black/20 text-white hover:bg-black/40 md:hidden"
          onClick={onClose}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Desktop close */}
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-foreground bg-background/50 border-border/50 absolute right-4 top-4 z-10 hidden h-10 w-10 rounded-full border backdrop-blur-sm md:flex"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Left: Media placeholder */}
        <div className="relative flex min-h-[300px] flex-[1.6] items-center justify-center bg-black/95">
          <Skeleton className="h-full w-full opacity-10" />
        </div>

        {/* Right: Info panel placeholder */}
        <div className="bg-card border-border flex min-w-0 flex-1 flex-col border-l">
          {/* Header */}
          <div className="border-border shrink-0 border-b p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-2 w-16 rounded-full" />
              </div>
            </div>
          </div>

          {/* Scrollable area */}
          <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-4">
            {/* Post content text */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-3 w-[90%] rounded-full" />
              <Skeleton className="h-3 w-[80%] rounded-full" />
            </div>

            <div className="bg-border my-4 h-px" />

            {/* Comments header */}
            <Skeleton className="h-3 w-24 rounded-full" />

            {/* Comments list */}
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-2 w-20 rounded-full" />
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="h-2 w-[80%] rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="border-border bg-card shrink-0 space-y-3 border-t p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="ml-auto h-5 w-5 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <Skeleton className="h-9 flex-1 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailsSkeleton;
