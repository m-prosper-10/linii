'use client';

import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { X } from 'lucide-react';

interface PollOptionItemProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
  canRemove: boolean;
}

export function PollOptionItem({
  index,
  value,
  onChange,
  onRemove,
  canRemove
}: PollOptionItemProps) {
  return (
    <div className="flex gap-2 group animate-in fade-in slide-in-from-left-2 duration-200">
      <div className="relative flex-1">
        <Input
          placeholder={`Option ${index + 1}`}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="bg-background border-border/40 h-11 rounded-xl focus:ring-primary/20 focus:border-primary/40 transition-all pl-10"
        />
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-bold text-xs">
          {index + 1}
        </div>
      </div>
      {canRemove && onRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-11 w-11 p-0 rounded-xl sm:opacity-0 group-hover:opacity-100 transition-all shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
