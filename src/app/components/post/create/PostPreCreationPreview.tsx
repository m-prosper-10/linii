'use client';

import React from 'react';
import { PostContent } from '../PostContent';
import { PostHeader } from '../PostHeader';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { PostApiType } from '@/services/post';

interface PostPreCreationPreviewProps {
  user: {
    displayName: string;
    username: string;
    avatar?: string;
  };
  content: string;
  media: Array<{ url: string; type: string }>;
  poll?: {
    question: string;
    options: string[];
    expiresAt: Date;
  };
  visibility: string;
  mentions?: Array<{ id: string; name: string; avatar?: string }>;
}

export function PostPreCreationPreview({
  user,
  content,
  media,
  poll,
  visibility,
  mentions = []
}: PostPreCreationPreviewProps) {
  // Mock a post object for PostContent
  const mockPost = {
    _id: 'preview',
    author: {
      _id: 'current',
      fullnames: user.displayName,
      username: user.username,
      email: '',
      avatar: user.avatar,
    },
    content,
    postType: poll ? 'POLL' : (media.length > 0 ? (media[0].type === 'VIDEO' ? 'VIDEO' : 'IMAGE') : 'TEXT'),
    media: media.map(m => ({ type: m.type, url: m.url })),
    poll: poll ? {
      _id: 'poll-preview',
      question: poll.question,
      options: poll.options.map((opt, i) => ({
        _id: `opt-${i}`,
        text: opt,
        votes: [],
        percentage: 0
      })),
      totalVotes: 0,
      expiresAt: poll.expiresAt.toISOString(),
      allowMultiple: false,
      userVoted: [],
      isExpired: false
    } : undefined,
    visibility,
    tags: [],
    mentions: mentions.map(m => ({
      _id: m.id,
      fullnames: m.name,
      username: '', // Not strictly needed for names in header
      email: '',
      avatar: m.avatar,
    })),
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    views: 0,
    createdAt: new Date().toISOString(),
    comments: []
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Live Preview</h3>
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">Draft</span>
      </div>

      <div className="rounded-3xl border border-primary/10 bg-card overflow-hidden shadow-2xl shadow-primary/5 transition-all animate-in fade-in zoom-in-95 duration-500">
        <div className="p-4 sm:p-5">
          {/* Real Post Header Component for perfect preview */}
          <div className="mb-4">
            <PostHeader 
              post={mockPost as unknown as PostApiType} 
              variant="feed"
            />
          </div>

          {/* Content Rendering */}
            <PostContent
              post={mockPost as unknown as PostApiType}
              onPostClick={() => {}}
              onUpdate={() => {}}
            />

          {/* Actions Mockup */}
          <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4 px-1">
            <div className="flex gap-6 sm:gap-8">
              <button className="group flex items-center gap-2 text-muted-foreground/60 transition-colors hover:text-rose-500">
                <div className="rounded-full p-2 group-hover:bg-rose-500/10 transition-all">
                  <Heart className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold">0</span>
              </button>
              <button className="group flex items-center gap-2 text-muted-foreground/60 transition-colors hover:text-sky-500">
                <div className="rounded-full p-2 group-hover:bg-sky-500/10 transition-all">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold">0</span>
              </button>
            </div>
            <div className="flex gap-4">
              <button className="rounded-full p-2 text-muted-foreground/60 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
        <p className="text-[11px] text-primary/70 leading-relaxed italic text-center">
          &quot;This is how your post will look to your followers. Review carefully before sharing.&quot;
        </p>
      </div>
    </div>
  );
}