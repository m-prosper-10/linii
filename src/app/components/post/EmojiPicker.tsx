'use client';

import { Button } from '@/app/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Smile } from 'lucide-react';
import { useState } from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const COMMON_EMOJIS = [
  // Faces
  '\u{1F600}', '\u{1F602}', '\u{1F923}', '\u{1F60A}', '\u{1F60D}', '\u{1F970}',
  '\u{1F618}', '\u{1F60B}', '\u{1F61B}', '\u{1F61C}', '\u{1F92A}', '\u{1F928}',
  '\u{1F9D0}', '\u{1F913}', '\u{1F60E}', '\u{1F929}', '\u{1F973}', '\u{1F60F}',
  '\u{1F612}', '\u{1F61E}', '\u{1F614}', '\u{1F61F}', '\u{1F615}', '\u{1F641}',
  '\u{1F626}', '\u{1F627}', '\u{1F632}', '\u{1F633}', '\u{1F97A}', '\u{1F628}',
  '\u{1F630}', '\u{1F625}', '\u{1F622}', '\u{1F62D}', '\u{1F631}', '\u{1F616}',
  '\u{1F629}', '\u{1F62A}', '\u{1F62B}', '\u{1F971}', '\u{1F624}', '\u{1F621}',
  '\u{1F620}', '\u{1F92C}', '\u{1F608}', '\u{1F47F}', '\u{1F480}', '\u{1F4A9}',
  '\u{1F921}', '\u{1F479}', '\u{1F47A}', '\u{1F47B}', '\u{1F47D}', '\u{1F47E}', '\u{1F916}',
  // Hands
  '\u{1F44B}', '\u{1F91A}', '\u{1F590}', '\u{270B}', '\u{1F596}', '\u{1F44C}',
  '\u{1F90C}', '\u{1F90F}', '\u{270C}', '\u{1F91E}', '\u{1F919}', '\u{1F91F}',
  '\u{1F918}', '\u{1F44D}', '\u{1F44E}', '\u{1F44A}', '\u{1F91C}', '\u{1F91B}',
  '\u{1F44F}', '\u{1F64C}', '\u{1F450}', '\u{1F932}', '\u{1F91D}', '\u{1F64F}',
  '\u{270D}', '\u{1F485}', '\u{1F933}', '\u{1F4AA}', '\u{1F9BE}', '\u{1F9BF}',
  // Body
  '\u{1F9B5}', '\u{1F9B6}', '\u{1F463}', '\u{1F442}', '\u{1F9BB}', '\u{1F443}',
  '\u{1F9E0}', '\u{1FAC0}', '\u{1FAC1}', '\u{1F9B7}', '\u{1F9B4}', '\u{1F440}', '\u{1F445}', '\u{1F444}',
];

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <style>{`
        .emoji-scroll::-webkit-scrollbar { width: 4px; }
        .emoji-scroll::-webkit-scrollbar-track { background: transparent; }
        .emoji-scroll::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 99px; }
        .emoji-scroll::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground) / 0.4); }
      `}</style>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 rounded-lg transition-colors ${isOpen ? 'text-primary bg-primary/10' : 'text-muted-foreground/50 hover:text-foreground'}`}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          sideOffset={8}
          className="w-72 p-0 border-border/40 shadow-xl rounded-2xl overflow-hidden bg-background/98 backdrop-blur-sm"
        >
          <div className="px-3 py-2 border-b border-border/30">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
              Emojis
            </span>
          </div>

          <div className="emoji-scroll grid grid-cols-8 gap-0.5 p-2 max-h-52 overflow-y-auto">
            {COMMON_EMOJIS.map((emoji, i) => (
              <button
                key={`${i}`}
                onClick={() => {
                  onEmojiSelect(emoji);
                  setIsOpen(false);
                }}
                className="h-8 w-8 flex items-center justify-center text-lg rounded-lg hover:bg-accent transition-all duration-100 hover:scale-110 active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
