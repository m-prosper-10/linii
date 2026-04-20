import { Skeleton } from "@/app/components/ui/skeleton"

const ExploreSkeleton = () => {
    return (
        <div className="mx-auto max-w-2xl">
            {/* Search Bar Skeleton */}
            <div className="bg-background/80 border-border sticky top-0 z-10 border-b backdrop-blur-sm">
                <div className="p-4 space-y-4">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="border-border flex h-12 w-full border-b px-4">
                <Skeleton className="h-full w-24 rounded-none" />
                <Skeleton className="h-full w-24 rounded-none" />
                <Skeleton className="h-full w-24 rounded-none" />
            </div>

            {/* List Skeleton */}
            <div className="space-y-4 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
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
    )
}

export default ExploreSkeleton