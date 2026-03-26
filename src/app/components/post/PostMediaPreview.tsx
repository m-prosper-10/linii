'use client';

import { Button } from '@/app/components/ui/button';
import { X } from 'lucide-react';

interface PostMediaPreviewProps {
  media: { url: string; type: 'IMAGE' | 'VIDEO' } | null;
  onRemove: () => void;
}

export function PostMediaPreview({ media, onRemove }: PostMediaPreviewProps) {
  if (!media) return null;

  return (
    <div className="relative group animate-in zoom-in-95 duration-200">
      {media.type === 'IMAGE' ? (
        <img
          src={media.url}
          alt="Upload preview"
          className="max-h-[450px] w-full rounded-2xl border border-border/50 object-cover shadow-2xl transition-all group-hover:brightness-95"
        />
      ) : (
        <video
          src={media.url}
          controls
          className="max-h-[450px] w-full rounded-2xl border border-border/50 object-cover shadow-2xl transition-all group-hover:brightness-95"
        />
      )}
      <Button
        variant="destructive"
        size="sm"
        className="absolute right-4 top-4 h-9 w-9 rounded-full p-0 opacity-0 transition-all group-hover:opacity-100 shadow-xl hover:scale-110 active:scale-95 bg-destructive/90 backdrop-blur-sm"
        onClick={onRemove}
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
