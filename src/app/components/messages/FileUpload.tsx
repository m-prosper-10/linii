'use client';

import { useState, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { Paperclip, X, File, Image, Video, Music } from 'lucide-react';
import { chatService, UploadedFile } from '@/services/chat';

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
}

export function FileUpload({ 
  onFilesUploaded, 
  maxFiles = 5, 
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.txt']
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File ${file.name} is too large. Maximum size is ${chatService.formatFileSize(maxSize)}`;
    }

    // Check file type if acceptedTypes is provided
    if (acceptedTypes.length > 0) {
      const isAccepted = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type === type;
      });

      if (!isAccepted) {
        return `File ${file.name} is not an accepted type`;
      }
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setError(null);

    // Check total file limit
    if (selectedFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate each file
    const invalidFileError = files.find(file => validateFile(file));
    if (invalidFileError) {
      setError(invalidFileError);
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress (in a real app, you'd get this from the upload)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const uploadedFiles = await chatService.uploadFiles(selectedFiles);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Notify parent component
      onFilesUploaded(uploadedFiles);
      
      // Clear selected files
      setSelectedFiles([]);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 1000);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (file: File) => {
    if (chatService.isImageFile(file.type)) return <Image className="h-4 w-4" />;
    if (chatService.isVideoFile(file.type)) return <Video className="h-4 w-4" />;
    if (chatService.isAudioFile(file.type)) return <Music className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="space-y-3">
      {/* File input */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || selectedFiles.length >= maxFiles}
          className="h-8 w-8 rounded-full p-0 text-muted-foreground/60 hover:text-foreground"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {selectedFiles.length > 0 && (
          <Button
            type="button"
            size="sm"
            onClick={handleUpload}
            disabled={uploading}
            className="h-8 px-3 text-xs"
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
          </Button>
        )}
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-1" />
          <p className="text-xs text-muted-foreground">Uploading files... {uploadProgress}%</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Selected files:</p>
          <div className="space-y-1">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-md bg-accent/50 p-2 text-xs"
              >
                {getFileIcon(file)}
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-muted-foreground">
                  {chatService.formatFileSize(file.size)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-5 w-5 rounded-full p-0 text-muted-foreground hover:text-foreground"
                  disabled={uploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File info */}
      <p className="text-xs text-muted-foreground">
        Max {maxFiles} files • Max {chatService.formatFileSize(maxSize)} each
      </p>
    </div>
  );
}
