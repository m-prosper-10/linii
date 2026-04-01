import type { User } from '@/services/auth';

export interface LocalFile {
  id: string;
  file: File;
  preview: string;
  originalName: string;
  mimeType: string;
  size: number;
}

/** Payload passed to reply / forward handlers from a bubble */
export interface MessageActionContext {
  content: string;
  sender: User;
  createdAt: string;
  files?: string[];
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';
}
