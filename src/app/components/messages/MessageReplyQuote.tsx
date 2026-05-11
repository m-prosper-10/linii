'use client';

import { cn } from '@/app/components/ui/utils';
import type { QuotedMessagePreview } from '@/services/chat';
import { quotedPreviewText } from './replyPreviewText';
import { getUserDisplayName } from '@/lib/user';

interface MessageReplyQuoteProps {
  quote: QuotedMessagePreview;
  isCurrentUser: boolean;
  onJumpToOriginal?: (messageId: string) => void;
}

export function MessageReplyQuote({
  quote,
  isCurrentUser,
  onJumpToOriginal,
}: MessageReplyQuoteProps) {
  const text = quotedPreviewText(quote);
  const name = getUserDisplayName(quote.sender);

  return (
    <button
      type="button"
      className={cn(
        'mb-2 flex max-w-full min-w-0 flex-col gap-0.5 rounded-md border-l-[3px] py-1.5 pl-2.5 pr-2 text-left transition-opacity',
        'hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        isCurrentUser
          ? 'border-primary-foreground/55 bg-primary-foreground/12'
          : 'border-primary/65 bg-muted/70'
      )}
      onClick={e => {
        e.stopPropagation();
        onJumpToOriginal?.(quote._id);
      }}
      aria-label={`Jump to message from ${name}`}
    >
      <span
        className={cn(
          'truncate text-xs font-semibold',
          isCurrentUser ? 'text-primary-foreground/95' : 'text-foreground'
        )}
      >
        {name}
      </span>
      <span
        className={cn(
          'line-clamp-2 text-xs leading-snug',
          isCurrentUser ? 'text-primary-foreground/80' : 'text-muted-foreground'
        )}
      >
        {text}
      </span>
    </button>
  );
}
