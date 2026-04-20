'use client';

import { useState } from 'react';
import { cn } from '@/app/components/ui/utils';
import { PostService, PostApiType } from '@/services/post';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, Clock, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PollRenderingProps {
  post: PostApiType;
  onUpdate?: (updatedPost: PostApiType) => void;
}

export function PollRendering({ post, onUpdate }: PollRenderingProps) {
  const [isVoting, setIsVoting] = useState<string | null>(null);
  const poll = post.poll;

  if (!poll) return null;

  const totalVotes = poll.totalVotes || 0;
  const hasVoted = !!poll.userVoted?.length;
  const expiresAtDate = new Date(poll.expiresAt);
  const isValidDate = !isNaN(expiresAtDate.getTime());
  const isExpired = isValidDate && expiresAtDate < new Date();
  const showResults = hasVoted || isExpired;

  const handleVote = async (optionId: string) => {
    if (hasVoted || isExpired || isVoting) return;
    try {
      setIsVoting(optionId);
      const updatedPost = await PostService.votePoll(post._id, optionId);
      onUpdate?.(updatedPost);
      toast.success('Vote recorded');
    } catch {
      toast.error('Failed to record vote');
    } finally {
      setIsVoting(null);
    }
  };

  return (
    <div className="my-3 rounded-md border border-border/30 bg-card overflow-hidden">
      {/* Header */}
      {poll.question && (
        <div className="px-4 pt-4 pb-3 border-b border-border/20">
          <p className="font-medium leading-snug text-foreground">
            {poll.question}
          </p>
        </div>
      )}

      {/* Options */}
      <div className="p-3 space-y-2">
        {poll.options.map((option) => {
          const voteCount = option.votes.length;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isSelected = poll.userVoted?.includes(option._id);
          const isLeading = showResults && poll.options.every(o => o.votes.length <= voteCount) && voteCount > 0;

          return (
            <button
              key={option._id}
              disabled={showResults || !!isVoting}
              onClick={() => handleVote(option._id)}
              className={cn(
                'relative w-full overflow-hidden rounded-xl text-left transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                showResults
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]',
                isSelected
                  ? 'border border-primary/40 bg-primary/5'
                  : showResults
                    ? 'border border-border/30 bg-muted/30'
                    : 'border border-border/40 bg-muted/20 hover:border-primary/30 hover:bg-primary/5'
              )}
            >
              {/* Animated fill bar */}
              {showResults && (
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 transition-all duration-700 ease-out rounded-xl',
                    isSelected ? 'bg-primary/15' : isLeading ? 'bg-muted-foreground/10' : 'bg-muted/40'
                  )}
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative flex items-center justify-between gap-3 px-3.5 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Vote indicator dot / check */}
                  {!showResults && (
                    <span className="h-4 w-4 shrink-0 rounded-full border-2 border-border/60 group-hover:border-primary/50 transition-colors" />
                  )}
                  {isSelected && showResults && (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  )}
                  <span className={cn(
                    'text-sm font-medium truncate',
                    isSelected ? 'text-primary' : 'text-foreground/85'
                  )}>
                    {option.text}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isVoting === option._id && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  )}
                  {showResults && (
                    <span className={cn(
                      'text-xs font-bold tabular-nums',
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {percentage}%
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/20 bg-muted/10">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 font-medium">
          <Users className="h-3 w-3" />
          <span>{totalVotes.toLocaleString()} {totalVotes === 1 ? 'vote' : 'votes'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 font-medium">
          <Clock className="h-3 w-3" />
          <span>
            {isExpired
              ? 'Poll ended'
              : isValidDate
                ? `Ends ${formatDistanceToNow(expiresAtDate, { addSuffix: true })}`
                : 'Ending soon'}
          </span>
        </div>
      </div>
    </div>
  );
}
