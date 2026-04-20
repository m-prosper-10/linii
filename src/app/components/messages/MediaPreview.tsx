'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import { chatService, UploadedFile } from '@/services/chat';
import { X, Download, Play, Pause, Volume2 } from 'lucide-react';

interface MediaPreviewProps {
  files: UploadedFile[];
  onRemove?: (fileId: string) => void;
  showRemoveButton?: boolean;
  compact?: boolean;
}

export function MediaPreview({ 
  files, 
  onRemove, 
  showRemoveButton = true, 
  compact = false 
}: MediaPreviewProps) {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const setVideoRef = useCallback((id: string, el: HTMLVideoElement | null) => {
    if (el) videoRefs.current.set(id, el);
    else videoRefs.current.delete(id);
  }, []);

  const toggleVideo = (fileId: string) => {
    const video = videoRefs.current.get(fileId);
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  };

  const toggleAudio = (fileId: string) => {
    const audio = document.querySelector(
      `audio[data-file-id="${fileId}"]`
    ) as HTMLAudioElement | null;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  const renderFilePreview = (file: UploadedFile) => {
    // file.url is now a complete MinIO URL, no need to prepend backend URL
    const fileUrl = file.url.startsWith('http') ? file.url : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}${file.url}`;

    if (chatService.isImageFile(file.mimeType)) {
      return (
        <div className="relative group">
          <Image
            src={fileUrl}
            alt={file.originalName}
            width={compact ? 64 : 128}
            height={compact ? 64 : 128}
            className={cn(
              "rounded-lg object-cover transition-transform group-hover:scale-105",
              compact ? "h-16 w-16" : "h-32 w-32"
            )}
            loading="lazy"
          />
          {showRemoveButton && onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onRemove(file.id)}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    }

    if (chatService.isVideoFile(file.mimeType)) {
      return (
        <div className="relative group">
          <video
            ref={el => setVideoRef(file.id, el)}
            data-file-id={file.id}
            src={fileUrl}
            className={cn(
              'rounded-lg object-cover',
              compact ? 'h-16 w-16' : 'h-32 w-32'
            )}
            onPlay={() => setPlayingVideo(file.id)}
            onPause={() => setPlayingVideo(null)}
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleVideo(file.id)}
              className="h-8 w-8 rounded-full bg-white/20 text-white hover:bg-white/30"
            >
              {playingVideo === file.id ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
          {showRemoveButton && onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onRemove(file.id)}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    }

    if (chatService.isAudioFile(file.mimeType)) {
      return (
        <div className={cn(
          "flex items-center gap-3 rounded-lg border bg-accent/30 p-3",
          compact ? "w-full max-w-xs" : "w-full"
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Volume2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{file.originalName}</p>
            <p className="text-xs text-muted-foreground">
              {chatService.formatFileSize(file.size)}
            </p>
          </div>
          <audio
            src={fileUrl}
            className="hidden"
            data-file-id={file.id}
            onPlay={() => setPlayingAudio(file.id)}
            onPause={() => setPlayingAudio(null)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => toggleAudio(file.id)}
            className="h-8 w-8 rounded-full"
          >
            {playingAudio === file.id ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          {showRemoveButton && onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(file.id)}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    }

    // Generic file preview
    return (
      <div className={cn(
        "flex items-center gap-3 rounded-lg border bg-accent/30 p-3",
        compact ? "w-full max-w-xs" : "w-full"
      )}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Download className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{file.originalName}</p>
          <p className="text-xs text-muted-foreground">
            {chatService.formatFileSize(file.size)}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = file.originalName;
            link.click();
          }}
          className="h-8 w-8 rounded-full"
        >
          <Download className="h-4 w-4" />
        </Button>
        {showRemoveButton && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(file.id)}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  if (files.length === 0) {
    return null;
  }

  // Check if all files are images for grid layout
  const allImages = files.every(file => chatService.isImageFile(file.mimeType));

  return (
    <div className="space-y-3">
      {allImages && !compact ? (
        // Image grid layout
        <div className="grid grid-rows-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {files.map(file => (
            <div key={file.id}>
              {renderFilePreview(file)}
            </div>
          ))}
        </div>
      ) : (
        // List layout for mixed files or compact mode
        <div className="space-y-2">
          {files.map(file => (
            <div key={file.id}>
              {renderFilePreview(file)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
