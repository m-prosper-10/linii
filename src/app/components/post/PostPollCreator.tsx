'use client';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { X, Plus } from 'lucide-react';

interface PostPollCreatorProps {
  question: string;
  setQuestion: (val: string) => void;
  options: string[];
  setOptions: (val: string[]) => void;
  onRemove: () => void;
}

export function PostPollCreator({
  question,
  setQuestion,
  options,
  setOptions,
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
    <div className="bg-accent/20 space-y-3 rounded-2xl p-4 border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
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
      
      <div className="flex gap-2">
        {options.length < 4 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="flex-1 border-dashed border-border/50 hover:bg-accent/50 text-xs font-bold uppercase tracking-widest h-10 rounded-xl"
          >
            <Plus className="mr-2 h-3 w-3" />
            Add Option
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive text-xs font-bold px-4 rounded-xl"
        >
          Remove Poll
        </Button>
      </div>
    </div>
  );
}
