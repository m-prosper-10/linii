'use client';

import { Button } from '@/app/components/ui/button';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';

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
  if (!isOpen || files.length === 0) return null;

  const currentFile = files[currentIndex];
  const getFileName = (url: string): string => {
    return url.split('/').pop() || 'Unknown file';
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

  const handlePrevious = () => {
    if (onNavigate && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (onNavigate && currentIndex < files.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && currentIndex > 0) handlePrevious();
    if (e.key === 'ArrowRight' && currentIndex < files.length - 1) handleNext();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div 
        className="relative h-full w-full max-w-7xl max-h-full p-4 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-4 right-1 z-10 p-4 rounded-full h-10 w-10 text-white hover:bg-white/20 pr-2"
          onClick={onClose}
        >
          <X className="size-6" />
        </Button>

        {/* Download button */}
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-4 right-12 z-10 p-4 rounded-full h-10 w-10 text-white hover:bg-white/20"
          onClick={() => handleDownload(currentFile)}
        >
          <Download className="size-6" />
        </Button>

        {/* Navigation buttons */}
        {files.length > 1 && (
          <>
            <Button
              size="sm"
              variant="ghost"
              className={`absolute left-4 z-10 h-12 w-12 p-4 rounded-full text-white hover:bg-white/20 ${
                currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="size-8" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`absolute right-4 z-10 h-8 w-8 p-0 text-white hover:bg-white/20 ${
                currentIndex === files.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleNext}
              disabled={currentIndex === files.length - 1}
            >
              <ChevronRight className="size-8" />
            </Button>
          </>
        )}

        {/* File counter */}
        {files.length > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-md bg-transparent backdrop-blur-sm px-4 py-2 rounded-full">
            {currentIndex + 1} / {files.length}
          </div>
        )}

        {/* Content */}
        <div className="max-w-full max-h-full flex items-center justify-center">
          {messageType === 'IMAGE' && (
            <img
              src={currentFile}
              alt={`Preview ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          )}

          {messageType === 'VIDEO' && (
            <video
              src={currentFile}
              controls
              className="max-w-full max-h-full"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          )}

          {messageType === 'AUDIO' && (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 max-w-md w-full">
              <div className="text-center text-white mb-4">
                <p className="text-lg font-medium">{getFileName(currentFile)}</p>
                <p className="text-sm opacity-75">Audio File</p>
              </div>
              <audio controls className="w-full">
                <source src={currentFile} />
                Your browser does not support the audio tag.
              </audio>
            </div>
          )}

          {messageType === 'FILE' && (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 max-w-md w-full text-center text-white">
              <p className="text-lg font-medium mb-2">{getFileName(currentFile)}</p>
              <p className="text-sm opacity-75 mb-4">File Preview</p>
              <Button
                onClick={() => handleDownload(currentFile)}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
