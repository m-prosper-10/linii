'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import { Button } from '@/app/components/ui/button';
import { EmojiPicker } from '@/app/components/post/EmojiPicker';
import { ChevronDown, ChevronUp, CornerDownRight, Paperclip, Send, X, Loader2 } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import AIService from '@/services/ai';
import type { LocalFile } from './types';

export interface MessageInputHandle {
  focus: () => void;
  loadSmartReplies: (messageText: string, context?: string[]) => Promise<void>;
}

export interface MessageReplyDraft {
  messageId: string;
  senderLabel: string;
  preview: string;
}

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (files: LocalFile[]) => void | Promise<void>;
  replyTo?: MessageReplyDraft | null;
  onCancelReply?: () => void;
}

export const MessageInput = forwardRef<MessageInputHandle, MessageInputProps>(
  function MessageInput({ value, onChange, onSend, replyTo, onCancelReply }, ref) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [quickOpen, setQuickOpen] = useState(false);
    const [smartReplies, setSmartReplies] = useState<string[]>([]);
    const [loadingReplies, setLoadingReplies] = useState(false);

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      loadSmartReplies: async (messageText: string, context?: string[]) => {
        if (!messageText.trim()) return;
        setLoadingReplies(true);
        try {
          const suggestions = await AIService.suggestReplies(messageText, context);
          setSmartReplies(suggestions);
          if (suggestions.length > 0) {
            setQuickOpen(true);
          }
        } catch (error) {
          console.error('Failed to load smart replies:', error);
          setSmartReplies([]);
        } finally {
          setLoadingReplies(false);
        }
      },
    }));

    useEffect(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    };

    const handleEmojiSelect = (emoji: string) => {
      onChange(value + emoji);
      textareaRef.current?.focus();
    };

    const createPreview = (file: File): Promise<string> => {
      return new Promise(resolve => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = e => resolve((e.target?.result as string) || '');
          reader.readAsDataURL(file);
        } else {
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
          newLocalFiles.push({
            id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
            file,
            preview,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
          });
        }

        setLocalFiles(prev => [...prev, ...newLocalFiles]);
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    };

    const handleRemoveFile = (fileId: string) => {
      setLocalFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const handleSend = useCallback(async () => {
      if (!value.trim() && localFiles.length === 0) return;

      const snapshot = [...localFiles];
      try {
        await Promise.resolve(onSend(snapshot));
        setLocalFiles([]);
        onChange('');
        // Clear smart replies after sending
        setSmartReplies([]);
      } catch {
        // Parent may restore text; attachments stay until user clears or retries
      }
    }, [value, localFiles, onSend, onChange]);

    return (
      <div className="border-border/40 bg-card/60 border-t px-4 py-3 backdrop-blur-md">
        {replyTo && (
          <div className="border-border/50 bg-accent/40 mb-3 flex items-start gap-2 rounded-xl border px-3 py-2">
            <CornerDownRight className="text-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-primary text-xs font-semibold">Replying to {replyTo.senderLabel}</p>
              <p className="text-muted-foreground line-clamp-2 text-xs">{replyTo.preview}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-7 w-7 shrink-0 rounded-full p-0"
              onClick={() => onCancelReply?.()}
              aria-label="Cancel reply"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {smartReplies.length > 0 && (
          <div className="mb-2">
            <button
              type="button"
              onClick={() => setQuickOpen(o => !o)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-medium transition-colors"
            >
              {loadingReplies ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating replies...
                </>
              ) : (
                <>
                  Smart replies
                  {quickOpen ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </>
              )}
            </button>
            <div
              className={cn(
                'scrollbar-thin mt-2 flex gap-1.5 overflow-x-auto pb-1 transition-all',
                !quickOpen && 'hidden'
              )}
            >
              {smartReplies.map((reply, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(reply);
                    textareaRef.current?.focus();
                  }}
                  className="border-border/40 bg-accent/40 hover:bg-accent/70 shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-muted-foreground/60 hover:text-foreground h-8 w-8 shrink-0 rounded-full p-0"
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
              className="scrollbar-thin placeholder:text-muted-foreground/40 max-h-[120px] min-h-[24px] flex-1 resize-none bg-transparent text-sm leading-relaxed focus:outline-none"
            />
            <div className="shrink-0 pb-0.5">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            disabled={!value.trim() && localFiles.length === 0}
            onClick={() => void handleSend()}
            className="h-8 w-8 shrink-0 rounded-full p-0 transition-all active:scale-95"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>

        {localFiles.length > 0 && (
          <div className="mt-2">
            <LocalFilePreview files={localFiles} onRemove={handleRemoveFile} />
          </div>
        )}
      </div>
    );
  }
);

function LocalFilePreview({
  files,
  onRemove,
}: {
  files: LocalFile[];
  onRemove: (id: string) => void;
}) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
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
        <div
          key={file.id}
          className="bg-accent/50 relative flex items-center gap-2 rounded-lg border p-2"
        >
          {file.preview ? (
            <Image
              src={file.preview}
              alt={file.originalName}
              width={48}
              height={48}
              className="h-12 w-12 rounded object-cover"
            />
          ) : (
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded">
              <span className="text-lg">{getFileIcon(file.mimeType)}</span>
            </div>
          )}
          <div className="max-w-32">
            <p className="truncate text-sm font-medium">{file.originalName}</p>
            <p className="text-muted-foreground text-xs">
              {formatFileSize(file.size)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(file.id)}
            className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
