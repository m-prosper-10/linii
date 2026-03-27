'use client';

import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import { Smile } from 'lucide-react';
import { useState } from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

const EMOJI_CATEGORIES = {
  Smileys: [
    '😀',
    '😃',
    '😄',
    '😁',
    '😅',
    '😂',
    '🤣',
    '😊',
    '😇',
    '🙂',
    '🙃',
    '😉',
    '😌',
    '😍',
    '🥰',
    '😘',
    '😗',
    '😙',
    '😚',
    '😋',
  ],
  Gestures: [
    '👍',
    '👎',
    '👌',
    '✌️',
    '🤞',
    '🤟',
    '🤘',
    '🤙',
    '👈',
    '👉',
    '👆',
    '👇',
    '☝️',
    '👏',
    '🙌',
    '👐',
    '🤲',
    '🤝',
    '🙏',
    '✍️',
  ],
  Hearts: [
    '❤️',
    '🧡',
    '💛',
    '💚',
    '💙',
    '💜',
    '🖤',
    '🤍',
    '🤎',
    '💔',
    '❣️',
    '💕',
    '💞',
    '💓',
    '💗',
    '💖',
    '💘',
    '💝',
    '💟',
    '♥️',
  ],
  Objects: [
    '🎉',
    '🎊',
    '🎈',
    '🎁',
    '🏆',
    '🥇',
    '🥈',
    '🥉',
    '⭐',
    '🌟',
    '✨',
    '💫',
    '🔥',
    '💯',
    '✅',
    '❌',
    '⚡',
    '💡',
    '💰',
    '🎯',
  ],
};

export function EmojiPicker({ onEmojiSelect, className }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<keyof typeof EMOJI_CATEGORIES>('Smileys');

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-9 p-0"
      >
        <Smile className="h-5 w-5" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Emoji Picker Popover */}
          <div className="bg-card border-border animate-in slide-in-from-bottom-2 absolute bottom-full right-0 z-50 mb-2 w-80 rounded-lg border shadow-lg duration-200">
            <div className="p-3">
              {/* Category Tabs */}
              <div className="border-border mb-3 flex gap-1 border-b pb-2">
                {Object.keys(EMOJI_CATEGORIES).map(category => (
                  <button
                    key={category}
                    onClick={() =>
                      setSelectedCategory(
                        category as keyof typeof EMOJI_CATEGORIES
                      )
                    }
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Emoji Grid */}
              <div className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto">
                {EMOJI_CATEGORIES[selectedCategory].map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="hover:bg-accent rounded-md p-2 text-2xl transition-colors active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
