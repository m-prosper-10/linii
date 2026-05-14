'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import {
  Download,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
} from 'lucide-react';
import { FilePreviewModal } from './FilePreviewModal';
import {
  downloadChatFile,
  fileNameFromUrl,
  resolveChatMediaUrl,
} from './mediaUtils';

interface FileDisplayProps {
  files: string[];
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
  isCurrentUser?: boolean;
}

export function FileDisplay({
  files,
  messageType,
  isCurrentUser = false,
}: FileDisplayProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  if (!files || files.length === 0) return null;

  const getFileIcon = () => {
    if (messageType === 'IMAGE') return FileImage;
    if (messageType === 'VIDEO') return FileVideo;
    if (messageType === 'AUDIO') return FileAudio;
    return FileText;
  };

  const resolvedFiles = files.map(resolveChatMediaUrl);

  const handlePreview = (index: number) => {
    setPreviewIndex(index);
    setIsPreviewOpen(true);
  };

  const handleDownload = (url: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const name = fileNameFromUrl(url);
    void downloadChatFile(url, name);
  };

  if (messageType === 'IMAGE') {
    const gridClass =
      resolvedFiles.length > 1 ? 'grid grid-cols-2 gap-2' : 'space-y-2';

    return (
      <>
        <div className={cn('mt-2', gridClass)}>
          {resolvedFiles.map((url, index) => (
            <div key={`${url}-${index}`} className="group relative">
              <div className="overflow-hidden rounded-lg">
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="h-auto max-h-72 w-full cursor-pointer object-cover"
                  onClick={() => handlePreview(index)}
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="absolute right-2 top-2 h-7 w-7 bg-black/50 p-0 opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                onClick={e => handleDownload(files[index], e)}
              >
                <Download className="h-3.5 w-3.5 text-white" />
              </Button>
            </div>
          ))}
        </div>

        <FilePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          files={files}
          currentIndex={previewIndex}
          messageType={messageType}
          onNavigate={setPreviewIndex}
        />
      </>
    );
  }

  if (messageType === 'VIDEO') {
    return (
      <>
        <div className="mt-2 space-y-2">
          {resolvedFiles.map((url, index) => (
            <div key={`${url}-${index}`} className="group relative">
              <video
                controls
                className="max-h-80 w-full cursor-pointer rounded-lg"
                preload="metadata"
                onClick={() => handlePreview(index)}
              >
                <source src={url} />
                Your browser does not support the video tag.
              </video>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="absolute right-2 top-2 h-7 w-7 bg-black/50 p-0 opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                onClick={e => handleDownload(files[index], e)}
              >
                <Download className="h-3.5 w-3.5 text-white" />
              </Button>
            </div>
          ))}
        </div>

        <FilePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          files={files}
          currentIndex={previewIndex}
          messageType={messageType}
          onNavigate={setPreviewIndex}
        />
      </>
    );
  }

  if (messageType === 'AUDIO') {
    return (
      <>
        <div className="mt-2 space-y-2">
          {resolvedFiles.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="bg-accent/50 hover:bg-accent/70 flex cursor-pointer items-center gap-2 rounded-lg p-2"
              onClick={() => handlePreview(index)}
            >
              <FileAudio className="text-muted-foreground h-4 w-4 shrink-0" />
              <audio
                controls
                className="min-w-0 flex-1"
                onClick={e => e.stopPropagation()}
              >
                <source src={url} />
                Your browser does not support the audio tag.
              </audio>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 w-7 shrink-0 p-0"
                onClick={e => handleDownload(files[index], e)}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <FilePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          files={files}
          currentIndex={previewIndex}
          messageType={messageType}
          onNavigate={setPreviewIndex}
        />
      </>
    );
  }

  return (
    <>
      <div className="mt-2 space-y-2">
        {resolvedFiles.map((url, index) => {
          const Icon = getFileIcon();
          const fileName = fileNameFromUrl(files[index]);

          return (
            <div
              key={`${url}-${index}`}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                isCurrentUser
                  ? 'border-primary/20 bg-primary/10 hover:bg-primary/20'
                  : 'border-border bg-accent/50 hover:bg-accent/70'
              )}
              onClick={() => handlePreview(index)}
            >
              <Icon className="text-muted-foreground h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{fileName}</p>
                <p className="text-muted-foreground text-xs">Attachment</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 w-7 shrink-0 p-0"
                onClick={e => handleDownload(files[index], e)}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>

      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        files={files}
        currentIndex={previewIndex}
        messageType={messageType}
        onNavigate={setPreviewIndex}
      />
    </>
  );
}
