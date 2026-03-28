'use client';

import React, { useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import { PollOptionItem } from './poll/PollOptionItem';
import { PollSettings } from './poll/PollSettings';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Question Area - Styled like PostCreationTextInput */}
      <div className="flex flex-col rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/30">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-primary/10 bg-primary/5">
          <HelpCircle className="h-4 w-4 text-primary opacity-60" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Poll Question</span>
        </div>
        <Textarea
          ref={textareaRef}
          placeholder="What would you like to ask?"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          className="min-h-[120px] resize-none border-none bg-transparent px-5 py-4 text-[18px] font-medium leading-relaxed focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/30"
        />
      </div>

      {/* Options Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Choices</span>
          <span className="text-[10px] text-muted-foreground/40 font-medium">{options.length}/4 used</span>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {options.map((option, index) => (
            <PollOptionItem
              key={index}
              index={index}
              value={option}
              onChange={val => handleOptionChange(index, val)}
              onRemove={() => handleRemoveOption(index)}
              canRemove={options.length > 2}
            />
          ))}
          
          {options.length < 4 && (
            <Button
              variant="outline"
              onClick={handleAddOption}
              className="h-11 border-dashed border-primary/20 bg-primary/2 hover:bg-primary/5 text-primary/60 hover:text-primary rounded-xl flex items-center justify-center gap-2 transition-all group"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              <span className="text-xs font-bold uppercase tracking-wider">Add Choice</span>
            </Button>
          )}
        </div>
      </div>

      {/* Settings & Footer */}
      <div className="pt-4 border-t border-border/40">
        <PollSettings
          allowMultiple={allowMultiple}
          setAllowMultiple={setAllowMultiple}
          expiresAt={expiresAt}
          setExpiresAt={setExpiresAt}
        />
        
        <div className="mt-6 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 px-4 rounded-xl transition-all flex items-center gap-2"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Discard Poll</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
