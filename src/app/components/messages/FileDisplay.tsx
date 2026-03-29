'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import {
  Download,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
} from 'lucide-react';
import { FilePreviewModal } from './FilePreviewModal';

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

  const formatFileSize = (): string => {
    // This is a placeholder - in a real app, you'd get file size from the API
    return 'Unknown size';
  };

  const getFileName = (url: string): string => {
    return url.split('/').pop() || 'Unknown file';
  };

  const handlePreview = (index: number) => {
    setPreviewIndex(index);
    setIsPreviewOpen(true);
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = getFileName(url);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If it's an image message and there are files, display as images
  if (messageType === 'IMAGE') {
    return (
      <>
        <div className="mt-2 space-y-2">
          {files.map((url, index) => (
            <div key={index} className="group relative">
              <div className="overflow-hidden rounded-lg">
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="h-auto max-w-full cursor-pointer object-cover"
                  onClick={() => handlePreview(index)}
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-2 top-2 h-6 w-6 bg-black/50 p-0 opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                onClick={() => handleDownload(url)}
              >
                <Download className="h-3 w-3 text-white" />
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

  // For video files
  if (messageType === 'VIDEO') {
    return (
      <>
        <div className="mt-2 space-y-2">
          {files.map((url, index) => (
            <div key={index} className="group relative">
              <video
                controls
                className="h-auto max-w-full rounded-lg cursor-pointer"
                preload="metadata"
                onClick={() => handlePreview(index)}
              >
                <source src={url} />
                Your browser does not support the video tag.
              </video>
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-2 top-2 h-6 w-6 bg-black/50 p-0 opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                onClick={() => handleDownload(url)}
              >
                <Download className="h-3 w-3 text-white" />
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

  // For audio files
  if (messageType === 'AUDIO') {
    return (
      <>
        <div className="mt-2 space-y-2">
          {files.map((url, index) => (
            <div
              key={index}
              className="bg-accent/50 flex items-center gap-2 rounded-lg p-2 cursor-pointer hover:bg-accent/70"
              onClick={() => handlePreview(index)}
            >
              <FileAudio className="text-muted-foreground h-4 w-4" />
              <audio controls className="flex-1" onClick={(e) => e.stopPropagation()}>
                <source src={url} />
                Your browser does not support the audio tag.
              </audio>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(url);
                }}
              >
                <Download className="h-3 w-3" />
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

  // For other file types
  return (
    <>
      <div className="mt-2 space-y-2">
        {files.map((url, index) => {
          const Icon = getFileIcon();
          const fileName = getFileName(url);

          return (
            <div
              key={index}
              className={`
                flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer
                ${
                  isCurrentUser
                    ? 'bg-primary/10 border-primary/20 hover:bg-primary/20'
                    : 'bg-accent/50 border-accent hover:bg-accent/70'
                }
              `}
              onClick={() => handlePreview(index)}
            >
              <Icon className="text-muted-foreground h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{fileName}</p>
                <p className="text-muted-foreground text-xs">
                  {formatFileSize()}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 shrink-0 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(url);
                }}
              >
                <Download className="h-3 w-3" />
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
