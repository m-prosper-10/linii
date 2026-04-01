'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';

export const MESSAGE_REACTIONS = [
  { emoji: '❤️', type: 'love' },
  { emoji: '👍', type: 'like' },
  { emoji: '😊', type: 'happy' },
  { emoji: '😂', type: 'laugh' },
  { emoji: '😢', type: 'sad' },
  { emoji: '😠', type: 'angry' },
] as const;

/** Inline strip (same row as message toolbar) — iMessage / Messenger style */
export function ReactionPickerStrip({
  onSelect,
  onClose,
  className,
}: {
  onSelect: (emoji: string, type: string) => void;
  onClose: () => void;
  className?: string;
}) {
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);

  return (
    <div
      role="listbox"
      aria-label="Choose a reaction"
      className={cn(
        'border-border/80 bg-background/95 flex items-center gap-0.5 rounded-full border px-1 py-0.5 shadow-md backdrop-blur-sm',
        className
      )}
    >
      {MESSAGE_REACTIONS.map(({ emoji, type }) => (
        <Button
          key={type}
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'relative h-8 w-8 shrink-0 p-0 transition-transform duration-150',
            'hover:scale-110 hover:bg-accent/60',
            hoveredReaction === type && 'scale-110 bg-accent/60'
          )}
          onClick={() => {
            onSelect(emoji, type);
            onClose();
          }}
          onMouseEnter={() => setHoveredReaction(type)}
          onMouseLeave={() => setHoveredReaction(null)}
        >
          <span className="text-base leading-none">{emoji}</span>
        </Button>
      ))}
    </div>
  );
}

interface ReactionPickerProps {
  onSelect: (emoji: string, type: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
  placement?: 'above-trigger' | 'center';
}

/** @deprecated Prefer ReactionPickerStrip inside MessageBubbleToolbar */
export function ReactionPicker({
  onSelect,
  onClose,
  position,
  placement = 'above-trigger',
}: ReactionPickerProps) {
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);

  const positionStyle =
    placement === 'center'
      ? {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)' as const,
        }
      : {
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translateX(-50%) translateY(calc(-100% - 8px))' as const,
        };

  return (
    <div
      role="dialog"
      aria-label="Choose a reaction"
      className="border-border bg-background fixed z-50 flex gap-1 rounded-lg border p-1 shadow-lg"
      style={positionStyle}
    >
      {MESSAGE_REACTIONS.map(({ emoji, type }) => (
        <Button
          key={type}
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'relative h-8 w-8 p-0 transition-all duration-200',
            'hover:scale-125 hover:bg-accent/50',
            hoveredReaction === type && 'scale-125 bg-accent/50'
          )}
          onClick={() => {
            onSelect(emoji, type);
            onClose();
          }}
          onMouseEnter={() => setHoveredReaction(type)}
          onMouseLeave={() => setHoveredReaction(null)}
        >
          <span className="text-lg">{emoji}</span>
          {hoveredReaction === type && (
            <div className="bg-muted text-muted-foreground absolute -top-8 left-1/2 -translate-x-1/2 transform whitespace-nowrap rounded px-2 py-1 text-xs">
              {type}
            </div>
          )}
        </Button>
      ))}
    </div>
  );
}
