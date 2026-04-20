'use client';

import { PostCard } from '@/app/components/post/PostCard';
import { PostDetailModal } from '@/app/components/post/PostDetailModal';
import { Button } from '@/app/components/ui/button';
import PostSkeleton from '@/app/components/skeletons/PostSkeleton';
import { cn } from '@/app/components/ui/utils';
import { Filter, Loader2, MapPin, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  PostService,
  PostApiType,
  type FeedQueryOptions,
  type FeedTypeFilter,
  type FeedTimeFilter,
} from '@/services/post';
import { toast } from 'sonner';

const NEARBY_CACHE_KEY = 'linii_nearby_position';
const NEARBY_CACHE_MAX_AGE_MS = 30 * 60 * 1000;

function readCachedNearby(): { latitude: number; longitude: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(NEARBY_CACHE_KEY);
    if (!raw) return null;
    const { lat, lng, ts } = JSON.parse(raw) as {
      lat: number;
      lng: number;
      ts: number;
    };
    if (typeof lat !== 'number' || typeof lng !== 'number' || !ts) return null;
    if (Date.now() - ts > NEARBY_CACHE_MAX_AGE_MS) return null;
    return { latitude: lat, longitude: lng };
  } catch {
    return null;
  }
}

function writeCachedNearby(latitude: number, longitude: number) {
  sessionStorage.setItem(
    NEARBY_CACHE_KEY,
    JSON.stringify({ lat: latitude, lng: longitude, ts: Date.now() })
  );
}

const FEED_TYPES: { value: FeedTypeFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'FOLLOWING', label: 'Following' },
  { value: 'TRENDING', label: 'Trending' },
  { value: 'NEARBY', label: 'Nearby' },
];

const TIME_FILTERS: { value: FeedTimeFilter; label: string }[] = [
  { value: 'ALL', label: 'Any time' },
  { value: 'TODAY', label: 'Today' },
  { value: 'WEEK', label: 'This week' },
  { value: 'MONTH', label: 'This month' },
];

const RADIUS_OPTIONS_KM = [5, 25, 50, 100] as const;

export function HomeView() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostApiType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [feedType, setFeedType] = useState<FeedTypeFilter>('ALL');
  const [timeRange, setTimeRange] = useState<FeedTimeFilter>('ALL');
  const [showFeedFilters, setShowFeedFilters] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const [nearbyCoords, setNearbyCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [nearbyRadiusKm, setNearbyRadiusKm] = useState<number>(25);
  const [geoLoading, setGeoLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);

  const buildFeedOptions = useCallback((): FeedQueryOptions => {
    const base: FeedQueryOptions = { type: feedType, timeRange };
    if (feedType === 'NEARBY' && nearbyCoords) {
      base.nearby = {
        latitude: nearbyCoords.latitude,
        longitude: nearbyCoords.longitude,
        radiusKm: nearbyRadiusKm,
      };
    }
    return base;
  }, [feedType, timeRange, nearbyCoords, nearbyRadiusKm]);

  const fetchFirstPage = useCallback(async () => {
    if (feedType === 'NEARBY' && !nearbyCoords) {
      setPosts([]);
      setHasMore(false);
      setPage(1);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await PostService.getFeed(1, 20, buildFeedOptions());
      setPosts(data.posts);
      setHasMore(data.pagination.hasMore);
      setPage(1);
    } catch (error: unknown) {
      toast.error('Failed to load feed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [feedType, nearbyCoords, buildFeedOptions]);

  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  const loadMore = async () => {
    if (!hasMore || loadingMore || loading) return;
    if (feedType === 'NEARBY' && !nearbyCoords) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await PostService.getFeed(nextPage, 20, buildFeedOptions());
      setPosts(prev => [...prev, ...data.posts]);
      setHasMore(data.pagination.hasMore);
      setPage(nextPage);
    } catch (error: unknown) {
      toast.error('Failed to load more posts');
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFeedTypeChange = (value: FeedTypeFilter) => {
    setFeedType(value);
    setNearbyError(null);
    if (value === 'NEARBY') {
      const cached = readCachedNearby();
      if (cached) {
        setNearbyCoords(cached);
      }
    }
  };

  const clearNearbyLocation = () => {
    sessionStorage.removeItem(NEARBY_CACHE_KEY);
    setNearbyCoords(null);
    setNearbyError(null);
  };

  const requestLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setNearbyError('Location is not supported in this browser.');
      toast.error('Location is not supported in this browser.');
      return;
    }
    setGeoLoading(true);
    setNearbyError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        writeCachedNearby(latitude, longitude);
        setNearbyCoords({ latitude, longitude });
        setGeoLoading(false);
      },
      err => {
        setGeoLoading(false);
        let message = 'Could not get your location.';
        if (err.code === err.PERMISSION_DENIED) {
          message =
            'Location permission denied. Allow location in your browser settings to use Nearby.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = 'Location unavailable. Try again or check device settings.';
        } else if (err.code === err.TIMEOUT) {
          message = 'Location request timed out. Try again.';
        }
        setNearbyError(message);
        toast.error(message);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  };

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
  };

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts(prev => prev.filter(p => p._id !== deletedPostId));
  };

  const showNearbySetup = feedType === 'NEARBY' && !nearbyCoords && !loading;
  const showNearbyEmpty =
    feedType === 'NEARBY' && nearbyCoords && !loading && posts.length === 0;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="bg-background/80 border-border sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-semibold">Home</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Feed
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'gap-2',
                showFeedFilters
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent/50'
              )}
              onClick={() => setShowFeedFilters(!showFeedFilters)}
            >
              <Filter className="h-4 w-4" />
              {showFeedFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </div>
        {showFeedFilters && (
          <div className="border-border/60 flex flex-col gap-3 border-t px-4 pb-3 pt-2">
            <div className="flex flex-wrap gap-2">
              <span className="text-muted-foreground w-full text-[11px] font-semibold uppercase tracking-wider">
                Feed
              </span>
              {FEED_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleFeedTypeChange(value)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    feedType === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:bg-accent/50'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {feedType === 'NEARBY' && nearbyCoords && (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                    Radius
                  </span>
                  {RADIUS_OPTIONS_KM.map(km => (
                    <button
                      key={km}
                      type="button"
                      onClick={() => setNearbyRadiusKm(km)}
                      className={cn(
                        'rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                        nearbyRadiusKm === km
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:bg-accent/50'
                      )}
                    >
                      {km} km
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={clearNearbyLocation}
                  className="text-muted-foreground hover:text-foreground text-left text-[11px] underline-offset-2 hover:underline sm:text-right"
                >
                  Clear location
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <span className="text-muted-foreground w-full text-[11px] font-semibold uppercase tracking-wider">
                Time
              </span>
              {TIME_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTimeRange(value)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    timeRange === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:bg-accent/50'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showNearbySetup && (
        <div className="border-border bg-accent/5 mx-4 mt-4 rounded-xl border p-5 text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
            <MapPin className="h-6 w-6" />
          </div>
          <h3 className="text-foreground mb-1 text-sm font-semibold">
            Posts near you
          </h3>
          <p className="text-muted-foreground mb-4 text-xs leading-relaxed">
            Share your approximate location to see public posts tagged with a
            place within your chosen radius. Position is only sent to the server
            when you load this feed—not stored on your profile.
          </p>
          {nearbyError && (
            <p className="text-destructive mb-3 text-xs">{nearbyError}</p>
          )}
          <Button
            type="button"
            size="sm"
            className="rounded-full"
            disabled={geoLoading}
            onClick={requestLocation}
          >
            {geoLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting location…
              </>
            ) : (
              'Use my location'
            )}
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {loading && !(feedType === 'NEARBY' && !nearbyCoords) ? (
          <div className="flex flex-col gap-6 p-4">
            {[...Array(5)].map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onUserClick={handleUserClick}
              onPostClick={handlePostClick}
              onDeleted={handlePostDeleted}
            />
          ))
        ) : showNearbyEmpty ? (
          <div className="text-muted-foreground p-8 text-center text-sm">
            <p className="text-foreground mb-1 font-medium">No nearby posts</p>
            <p>
              Try increasing the radius or pick another time range. Posts must
              be public and include a map location to appear here.
            </p>
          </div>
        ) : feedType === 'NEARBY' ? null : (
          <div className="text-muted-foreground p-8 text-center">
            No posts found. Create your first post!
          </div>
        )}
      </div>

      {!loading && posts.length > 0 && hasMore && (
        <div className="flex justify-center p-6">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMore}
            disabled={loadingMore}
            className="min-w-[140px]"
          >
            {/** TODO: Use skeleton loading instead of text */}
            {loadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}

      {!loading &&
        posts.length > 0 &&
        !hasMore &&
        !(feedType === 'NEARBY' && !nearbyCoords) && (
          <div className="text-muted-foreground p-8 text-center text-sm">
            <p>You&apos;re up to date — no more posts to load.</p>
          </div>
        )}

      {selectedPostId && (
        <PostDetailModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
          onDeleted={handlePostDeleted}
        />
      )}
    </div>
  );
}
