import type { QuotedMessagePreview } from '@/services/chat';
import type { MessageActionContext } from './types';

export function replyPreviewLabel(
  input: Pick<MessageActionContext, 'content' | 'messageType' | 'files'>
): string {
  switch (input.messageType) {
    case 'IMAGE':
      return 'Photo';
    case 'VIDEO':
      return 'Video';
    case 'AUDIO':
      return 'Voice message';
    case 'FILE':
      return 'File';
    default: {
      const t = (input.content || '').trim();
      if (!t || t === 'Shared files') return 'Message';
      return t.length > 100 ? `${t.slice(0, 100)}…` : t;
    }
  }
}

export function quotedPreviewText(quote: QuotedMessagePreview): string {
  if (quote.isDeleted) return 'This message was deleted';
  return replyPreviewLabel({
    content: quote.content,
    messageType: quote.messageType,
    files: quote.files,
  });
}
