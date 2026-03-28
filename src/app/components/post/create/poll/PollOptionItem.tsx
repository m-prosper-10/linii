'use client';

import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Trash2 } from 'lucide-react';

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
    <div className="flex gap-2 group animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="relative flex-1 group/input">
        <Input
          placeholder={`Option ${index + 1}`}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="bg-background border-border/40 h-12 rounded-2xl focus:ring-primary/10 focus:border-primary/50 transition-all pl-12 shadow-sm group-hover/input:border-primary/20"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-lg bg-accent/50 text-muted-foreground/40 font-bold text-[10px] tracking-tighter ring-1 ring-border/10 group-focus-within/input:bg-primary/10 group-focus-within/input:text-primary/60 transition-colors">
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
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
