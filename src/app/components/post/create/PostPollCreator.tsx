'use client';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { X, Plus, Clock, CheckSquare } from 'lucide-react';

interface PostPollCreatorProps {
  question: string;
  setQuestion: (val: string) => void;
  options: string[];
  setOptions: (val: string[]) => void;
  allowMultiple: boolean;
  setAllowMultiple: (val: boolean) => void;
  expiresAt: string;
  setExpiresAt: (val: string) => void;
  onRemove: () => void;
}

export function PostPollCreator({
  question,
  setQuestion,
  options,
  setOptions,
  allowMultiple,
  setAllowMultiple,
  expiresAt,
  setExpiresAt,
  onRemove,
}: PostPollCreatorProps) {
  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="bg-accent/20 space-y-4 rounded-2xl p-4 border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
      <Input
        placeholder="Ask a question..."
        value={question}
        onChange={e => setQuestion(e.target.value)}
        className="bg-background border-border/50 font-bold h-11 rounded-xl focus:ring-primary"
      />
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex gap-2 group">
            <Input
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={e => handleOptionChange(index, e.target.value)}
              className="bg-background border-border/50 h-10 rounded-xl focus:ring-primary"
            />
            {options.length > 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveOption(index)}
                className="text-destructive hover:bg-destructive/10 h-10 w-10 p-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 py-1">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
          <Select value={expiresAt} onValueChange={setExpiresAt}>
            <SelectTrigger className="h-8 w-[110px] bg-background border-border/50 rounded-lg text-xs font-semibold">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="1d">1 Day</SelectItem>
              <SelectItem value="3d">3 Days</SelectItem>
              <SelectItem value="7d">1 Week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">Multiple options</span>
          <Switch checked={allowMultiple} onCheckedChange={setAllowMultiple} />
        </div>
      </div>

      <div className="flex gap-2 pt-1 border-t border-border/30">
        {options.length < 4 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="flex-1 border-dashed border-border/50 hover:bg-accent/50 text-xs font-bold uppercase tracking-widest h-9 rounded-xl"
          >
            <Plus className="mr-2 h-3 w-3" />
            Add Option
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive text-xs font-bold px-4 h-9 rounded-xl"
        >
          Remove Poll
        </Button>
      </div>
    </div>
  );
}
