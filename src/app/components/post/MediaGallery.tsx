'use client';

import { cn } from '@/app/components/ui/utils';

interface MediaGalleryProps {
  media: Array<{ url: string; type: string }>;
  onPostClick?: () => void;
}

export function MediaGallery({ media, onPostClick }: MediaGalleryProps) {
  if (!media || media.length === 0) return null;

  const count = media.length;

  return (
    <div
      className={cn(
        'border-border/50 mb-3 grid cursor-pointer gap-1 overflow-hidden rounded-xl border bg-black/5',
        count === 1 ? 'grid-cols-1' : 'grid-cols-2',
        count === 2 ? 'aspect-video' : '',
        count === 3 ? 'aspect-video' : '',
        count >= 4 ? 'aspect-video' : ''
      )}
      onClick={e => {
        e.stopPropagation();
        onPostClick?.();
      }}
    >
      {media.slice(0, 4).map((item, index) => (
        <div
          key={index}
          className={cn(
            'group relative overflow-hidden',
            count === 1 ? 'aspect-auto max-h-[512px]' : 'h-full w-full',
            count === 3 && index === 0 ? 'row-span-2' : ''
          )}
        >
          {item.type === 'IMAGE' ? (
            <img
              src={item.url}
              alt={`Post content ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
            />
          ) : (
            <video
              src={item.url}
              className="h-full w-full object-cover"
              muted
              playsInline
              loop
              onMouseOver={e => e.currentTarget.play()}
              onMouseOut={e => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
          )}

          {count > 4 && index === 3 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-2xl font-bold text-white backdrop-blur-[2px]">
              +{count - 4}
            </div>
          )}

          {item.type === 'VIDEO' && (
            <div className="pointer-events-none absolute bottom-2 left-2 rounded border border-white/10 bg-black/50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              Video
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
