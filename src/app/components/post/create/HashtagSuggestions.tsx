'use client';
import React from 'react';
import { TrendingTopic } from '@/services/analytics';
import { Hash, TrendingUp } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';

interface HashtagSuggestionsProps {
  suggestions: TrendingTopic[];
  onSelect: (hashtag: string) => void;
  isLoading?: boolean;
  isVisible: boolean;
  activeIndex: number;
}

export function HashtagSuggestions({
  suggestions,
  onSelect,
  isLoading = false,
  isVisible,
  activeIndex
}: HashtagSuggestionsProps) {
  if (!isVisible || (suggestions.length === 0 && !isLoading)) return null;

  return (
    <div className="absolute z-60 bottom-full left-0 mb-2 w-64 bg-card/95 backdrop-blur-xl border border-primary/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="p-3 border-b border-border/40 bg-primary/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Trending Tags</span>
        </div>
        {isLoading && (
          <div className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        )}
      </div>
      <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion.hashtag}
            onClick={() => onSelect(suggestion.hashtag)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group text-left",
              index === activeIndex 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                : "hover:bg-primary/10 text-foreground/80"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-1.5 rounded-lg transition-colors",
                index === activeIndex ? "bg-primary-foreground/20" : "bg-primary/5 group-hover:bg-primary/20"
              )}>
                <Hash className="h-3.5 w-3.5" />
              </div>
              <span className="text-[13px] font-bold tracking-tight">#{suggestion.hashtag}</span>
            </div>
            <span className={cn(
              "text-[10px] font-medium opacity-60",
              index === activeIndex ? "text-primary-foreground" : ""
            )}>
              {suggestion.posts} posts
            </span>
          </button>
        ))}
        {suggestions.length === 0 && !isLoading && (
          <div className="p-8 text-center text-muted-foreground/40 italic text-xs">
            No tags found
          </div>
        )}
      </div>
    </div>
  );
}
