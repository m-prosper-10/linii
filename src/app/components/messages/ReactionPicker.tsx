'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';

interface ReactionPickerProps {
  onSelect: (emoji: string, type: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

const REACTIONS = [
  { emoji: '❤️', type: 'love' },
  { emoji: '👍', type: 'like' },
  { emoji: '😊', type: 'happy' },
  { emoji: '😂', type: 'laugh' },
  { emoji: '😢', type: 'sad' },
  { emoji: '😠', type: 'angry' },
];

export function ReactionPicker({ onSelect, onClose, position }: ReactionPickerProps) {
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);

  return (
    <div
      className="fixed z-50 bg-background border border-border rounded-lg shadow-lg p-1 flex gap-1"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%) translateY(-100%)',
      }}
    >
      {REACTIONS.map(({ emoji, type }) => (
        <Button
          key={type}
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 relative transition-all duration-200",
            "hover:scale-125 hover:bg-accent/50",
            hoveredReaction === type && "scale-125 bg-accent/50"
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
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-muted text-muted-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
              {type}
            </div>
          )}
        </Button>
      ))}
    </div>
  );
}
