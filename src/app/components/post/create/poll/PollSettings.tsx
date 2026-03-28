'use client';

import { Switch } from '@/app/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Clock, CheckSquare } from 'lucide-react';

interface PollSettingsProps {
  allowMultiple: boolean;
  setAllowMultiple: (val: boolean) => void;
  expiresAt: string;
  setExpiresAt: (val: string) => void;
}

export function PollSettings({
  allowMultiple,
  setAllowMultiple,
  expiresAt,
  setExpiresAt
}: PollSettingsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-6 py-2 px-1">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center rounded-full bg-primary/5 text-primary">
          <Clock className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <Select value={expiresAt} onValueChange={setExpiresAt}>
            <SelectTrigger className="min-w-[100px] px-2 text-xs font-bold focus:ring-0">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-border/40 px-2">
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="1d">1 Day</SelectItem>
              <SelectItem value="3d">3 Days</SelectItem>
              <SelectItem value="7d">1 Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary">
          <CheckSquare className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Multiple Answers</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-bold">{allowMultiple ? 'On' : 'Off'}</span>
            <Switch
              checked={allowMultiple}
              onCheckedChange={setAllowMultiple}
              className="scale-75 origin-left"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
