'use client';

import React, { useRef } from 'react';
import { Textarea } from '@/app/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';
import { Button } from '@/app/components/ui/button';
import { Link2, Code, List, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/app/components/ui/utils';
import { Badge } from '@/app/components/ui/badge';

interface PostCreationTextInputProps {
  content: string;
  setContent: (value: string) => void;
  maxCharacters?: number;
  placeholder?: string;
  isPreviewMode: boolean;
  setIsPreviewMode: (value: boolean) => void;
}

export function PostCreationTextInput({
  content,
  setContent,
  maxCharacters = 280,
  placeholder = "What's on your mind? (Markdown supported)",
  isPreviewMode,
  setIsPreviewMode
}: PostCreationTextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = 
      content.substring(0, start) + 
      prefix + 
      (selectedText || (suffix ? 'text' : '')) + 
      suffix + 
      content.substring(end);
    
    setContent(newText);
    
    // Set cursor position back inside the wrapping
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText || (suffix ? 'text' : '')).length
      );
    }, 0);
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <div className="flex flex-col rounded-2xl border border-border/50 bg-accent/5 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/30">
      {/* Markdown Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border/40 bg-accent/10">
        <TooltipProvider delayDuration={400}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-foreground/70 hover:text-primary hover:bg-primary/10" onClick={() => insertMarkdown('**', '**')}>
                <span className="font-bold text-[14px]">B</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Bold</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-foreground/70 hover:text-primary hover:bg-primary/10" onClick={() => insertMarkdown('*', '*')}>
                <span className="italic font-serif text-[14px]">I</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Italic</TooltipContent>
          </Tooltip>

          <div className="w-px h-4 bg-border/50 mx-1.5" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-foreground/70 hover:text-primary hover:bg-primary/10" onClick={() => insertMarkdown('[', '](url)')}>
                <Link2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Link</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-foreground/70 hover:text-primary hover:bg-primary/10" onClick={() => insertMarkdown('`', '`')}>
                <Code className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Code</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-foreground/70 hover:text-primary hover:bg-primary/10" onClick={() => insertMarkdown('- ')}>
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">List</TooltipContent>
          </Tooltip>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-px h-4 bg-border/50 mx-1" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={isPreviewMode ? "secondary" : "ghost"}
                    size="sm" 
                    className={cn(
                      "h-7 px-3 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all",
                      isPreviewMode ? "text-primary bg-primary/15 hover:bg-primary/20" : "text-foreground/60 hover:text-foreground hover:bg-accent/40"
                    )}
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                  >
                    {isPreviewMode ? "Edit" : "Preview"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">Toggle Preview</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </TooltipProvider>
      </div>
      
      {/* Input Area */}
      <div className="relative">
        {isPreviewMode ? (
          <div className="min-h-[160px] max-h-[400px] overflow-y-auto px-5 py-4 prose prose-invert max-w-none text-[15px] leading-relaxed bg-accent/5 backdrop-blur-sm">
            {content ? (
              <div className="opacity-90">
                <div className="text-muted-foreground/50 italic text-[11px] mb-3 uppercase tracking-widest font-bold">
                  Markdown Preview
                </div>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({...props}) => <p className="mb-2 last:mb-0 whitespace-pre-wrap break-words" {...props} />,
                    a: ({...props}) => <a className="text-primary hover:underline break-words" target="_blank" rel="noopener noreferrer" {...props} />,
                    ul: ({...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                    ol: ({...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 space-y-2 py-8">
                <Sparkles className="h-6 w-6 opacity-20" />
                <span className="text-xs italic">Nothing to preview yet</span>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder={placeholder}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="min-h-[160px] resize-none border-none bg-transparent px-5 py-4 text-[16px] leading-relaxed focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/40"
              maxLength={maxCharacters + 50}
            />
            
            {/* Embedded Character Counter (Optional/Simplified) */}
            <div className="absolute bottom-3 right-4 flex items-center gap-3">
              <div className="relative flex items-center justify-center pointer-events-none">
                <svg className="h-7 w-7 -rotate-90 transform opacity-60">
                  <circle
                    cx="14"
                    cy="14"
                    r="11"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    className="text-border/30"
                  />
                  <circle
                    cx="14"
                    cy="14"
                    r="11"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 11}
                    strokeDashoffset={(1 - Math.min(characterCount / maxCharacters, 1)) * (2 * Math.PI * 11)}
                    className={cn(
                      "transition-all duration-500 ease-out",
                      characterCount > maxCharacters 
                        ? "text-destructive" 
                        : characterCount > maxCharacters - 20 
                          ? "text-orange-500" 
                          : "text-primary"
                    )}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              {isOverLimit && (
                <Badge variant="destructive" className="text-[9px] h-4 px-1.5 rounded-full uppercase font-black">
                  Over
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
