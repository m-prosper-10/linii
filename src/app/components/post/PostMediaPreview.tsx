'use client';

import { Button } from '@/app/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';

interface PostMediaPreviewProps {
  media: Array<{ url: string; type: string }>;
  onRemove: (index: number) => void;
}

export function PostMediaPreview({ media, onRemove }: PostMediaPreviewProps) {
  if (!media || media.length === 0) return null;

  const count = media.length;

  return (
    <div
      className={cn(
        "grid gap-2 overflow-hidden rounded-2xl border border-border/50 shadow-2xl animate-in zoom-in-95 duration-300",
        count === 1 ? "grid-cols-1" : "grid-cols-2",
        count >= 2 ? "aspect-[16/9]" : ""
      )}
    >
      {media.map((item, index) => (
        <div 
          key={index} 
          className={cn(
            "relative group overflow-hidden bg-accent/20",
            count === 3 && index === 0 ? "row-span-2 h-full" : "h-full w-full",
            count === 1 ? "aspect-auto max-h-[500px]" : ""
          )}
        >
          {item.type === 'IMAGE' ? (
            <img
              src={item.url}
              alt={`Preview ${index + 1}`}
              className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-90"
            />
          ) : (
            <video
              src={item.url}
              className="h-full w-full object-cover transition-all duration-500 group-hover:brightness-90"
              muted
              playsInline
              onMouseOver={e => e.currentTarget.play()}
              onMouseOut={e => e.currentTarget.pause()}
            />
          )}

          <Button
            variant="destructive"
            size="sm"
            className="bg-destructive/80 absolute right-2 top-2 h-7 w-7 rounded-full border border-white/20 p-0 opacity-0 shadow-xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 group-hover:opacity-100"
            onClick={e => {
              e.stopPropagation();
              onRemove(index);
            }}
          >
            <X className="h-4 w-4" />
          </Button>

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
