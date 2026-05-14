'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  downloadChatFile,
  fileNameFromUrl,
  resolveChatMediaUrl,
} from './mediaUtils';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: string[];
  currentIndex: number;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
  onNavigate?: (index: number) => void;
}

export function FilePreviewModal({
  isOpen,
  onClose,
  files,
  currentIndex,
  messageType,
  onNavigate,
}: FilePreviewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const el = containerRef.current;
    el?.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (!onNavigate) return;
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        onNavigate(currentIndex - 1);
      }
      if (e.key === 'ArrowRight' && currentIndex < files.length - 1) {
        e.preventDefault();
        onNavigate(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, onNavigate, currentIndex, files.length]);

  if (!isOpen || files.length === 0) return null;

  const rawUrl = files[currentIndex];
  const currentFile = resolveChatMediaUrl(rawUrl);
  const displayName = fileNameFromUrl(rawUrl);

  const handleDownload = () => {
    void downloadChatFile(rawUrl, displayName);
  };

  const handlePrevious = () => {
    if (onNavigate && currentIndex > 0) onNavigate(currentIndex - 1);
  };

  const handleNext = () => {
    if (onNavigate && currentIndex < files.length - 1)
      onNavigate(currentIndex + 1);
  };

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Media preview"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 outline-none backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-full w-full max-w-7xl items-center justify-center p-4"
        onClick={e => e.stopPropagation()}
      >
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="absolute right-4 top-4 z-10 h-10 w-10 rounded-full p-0 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="size-6" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="absolute right-16 top-4 z-10 h-10 w-10 rounded-full p-0 text-white hover:bg-white/20"
          onClick={handleDownload}
        >
          <Download className="size-6" />
        </Button>

        {files.length > 1 && (
          <>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                'absolute left-2 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full p-0 text-white hover:bg-white/20 sm:left-4',
                currentIndex === 0 && 'cursor-not-allowed opacity-40'
              )}
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="size-8" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                'absolute right-2 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full p-0 text-white hover:bg-white/20 sm:right-4',
                currentIndex === files.length - 1 &&
                  'cursor-not-allowed opacity-40'
              )}
              onClick={handleNext}
              disabled={currentIndex === files.length - 1}
            >
              <ChevronRight className="size-8" />
            </Button>
          </>
        )}

        {files.length > 1 && (
          <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/40 px-4 py-2 text-sm text-white backdrop-blur-sm">
            {currentIndex + 1} / {files.length}
          </div>
        )}

        <div className="flex max-h-full max-w-full items-center justify-center">
          {messageType === 'IMAGE' && (
            <img
              src={currentFile}
              alt={`Preview ${currentIndex + 1}`}
              className="max-h-[85vh] max-w-full object-contain"
            />
          )}

          {messageType === 'VIDEO' && (
            <video
              src={currentFile}
              controls
              className="max-h-[85vh] max-w-full"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          )}

          {messageType === 'AUDIO' && (
            <div className="w-full max-w-md rounded-lg bg-white/10 p-8 text-center text-white backdrop-blur-md">
              <p className="mb-4 text-lg font-medium">{displayName}</p>
              <p className="mb-4 text-sm opacity-75">Audio file</p>
              <audio controls className="w-full">
                <source src={currentFile} />
                Your browser does not support the audio tag.
              </audio>
            </div>
          )}

          {messageType === 'FILE' && (
            <div className="w-full max-w-md rounded-lg bg-white/10 p-8 text-center text-white backdrop-blur-md">
              <p className="mb-2 text-lg font-medium">{displayName}</p>
              <p className="mb-4 text-sm opacity-75">File preview</p>
              <Button
                type="button"
                onClick={handleDownload}
                className="bg-white/20 text-white hover:bg-white/30"
              >
                <Download className="mr-2 h-4 w-4" />
                Download file
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
