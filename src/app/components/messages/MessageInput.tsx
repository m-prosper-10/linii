'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { EmojiPicker } from '@/app/components/post/EmojiPicker';
import { Paperclip, Send } from 'lucide-react';

const QUICK_REPLIES = [
  'Sounds good! 👍',
  "Let's schedule a call 📅",
  'Great idea! 💡',
  'On my way! 🚀',
];

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export function MessageInput({ value, onChange, onSend }: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      onSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    onChange(value + emoji);
    textareaRef.current?.focus();
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
          className="h-8 w-8 shrink-0 rounded-full p-0 text-muted-foreground/60 hover:text-foreground"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

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
          disabled={!value.trim()}
          onClick={onSend}
          className="h-8 w-8 shrink-0 rounded-full p-0 transition-all active:scale-95"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
