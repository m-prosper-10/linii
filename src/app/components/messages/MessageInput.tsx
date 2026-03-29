'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/app/components/ui/button';
import { EmojiPicker } from '@/app/components/post/EmojiPicker';
import { Paperclip, Send, X } from 'lucide-react';

const QUICK_REPLIES = [
  'Sounds good! 👍',
  "Let's schedule a call 📅",
  'Great idea! 💡',
  'On my way! 🚀',
];

interface LocalFile {
  id: string;
  file: File;
  preview: string;
  originalName: string;
  mimeType: string;
  size: number;
}

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (files: LocalFile[]) => void;
}

export function MessageInput({ value, onChange, onSend }: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    onChange(value + emoji);
    textareaRef.current?.focus();
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        // For non-image files, we'll use a placeholder or icon
        resolve('');
      }
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const newLocalFiles: LocalFile[] = [];
    
    try {
      for (const file of files) {
        const preview = await createPreview(file);
        const localFile: LocalFile = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
          file,
          preview,
          originalName: file.name,
          mimeType: file.type,
          size: file.size
        };
        newLocalFiles.push(localFile);
      }

      setLocalFiles(prev => [...prev, ...newLocalFiles]);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setLocalFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSend = () => {
    if (!value.trim() && localFiles.length === 0) return;
    
    onSend(localFiles);
    setLocalFiles([]);
    onChange('');
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border-border/40 bg-card/60 border-t px-4 py-3 backdrop-blur-md">
      {/* Quick replies */}
      <div className="scrollbar-thin mb-2.5 flex gap-1.5 overflow-x-auto pb-1">
        {QUICK_REPLIES.map((reply, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(reply)}
            className="border-border/40 bg-accent/40 hover:bg-accent/70 shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleFileButtonClick}
          disabled={uploading}
          className="h-8 w-8 shrink-0 rounded-full p-0 text-muted-foreground/60 hover:text-foreground"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />

        <div className="border-border/40 bg-accent/30 focus-within:border-primary/30 focus-within:bg-primary/5 flex flex-1 items-end gap-1 rounded-2xl border px-3 py-2 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Type a message…"
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="scrollbar-thin max-h-[120px] min-h-[24px] flex-1 resize-none bg-transparent text-sm leading-relaxed placeholder:text-muted-foreground/40 focus:outline-none"
          />
          <div className="shrink-0 pb-0.5">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          disabled={!value.trim() && localFiles.length === 0}
          onClick={handleSend}
          className="h-8 w-8 shrink-0 rounded-full p-0 transition-all active:scale-95"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      {/* Local file preview */}
      {localFiles.length > 0 && (
        <div className="mt-2">
          <LocalFilePreview 
            files={localFiles} 
            onRemove={handleRemoveFile}
          />
        </div>
      )}
    </div>
  );
}

// Local file preview component
function LocalFilePreview({ files, onRemove }: { files: LocalFile[], onRemove: (id: string) => void }) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    return '📄';
  };

  return (
    <div className="flex flex-wrap gap-2">
      {files.map(file => (
        <div key={file.id} className="bg-accent/50 relative flex items-center gap-2 rounded-lg border p-2">
          {file.preview ? (
            <Image 
              src={file.preview} 
              alt={file.originalName}
              width={48}
              height={48}
              className="h-12 w-12 rounded object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
              <span className="text-lg">{getFileIcon(file.mimeType)}</span>
            </div>
          )}
          <div className="max-w-32">
            <p className="truncate text-sm font-medium">{file.originalName}</p>
            <p className="text-muted-foreground text-xs">{formatFileSize(file.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(file.id)}
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
