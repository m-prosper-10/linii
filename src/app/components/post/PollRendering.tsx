'use client';

import { useState } from 'react';
import { cn } from '@/app/components/ui/utils';
import { PostService, PostApiType } from '@/services/post';
import { toast } from 'sonner';
import { CheckCircle2, Loader2 } from 'lucide-react';
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

  const handleVote = async (optionId: string) => {
    if (hasVoted || isExpired || isVoting) return;

    try {
      setIsVoting(optionId);
      const updatedPost = await PostService.votePoll(post._id, optionId);
      onUpdate?.(updatedPost);
      toast.success('Vote recorded!');
    } catch (_error) {
      toast.error('Failed to record vote');
    } finally {
      setIsVoting(null);
    }
  };

  return (
    <div className="space-y-3 mb-4 bg-accent/5 p-4 rounded-2xl border border-border/40">
      <div className="space-y-2">
        {poll.options.map((option) => {
          const voteCount = option.votes.length;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isSelected = poll.userVoted?.includes(option._id);

          return (
            <button
              key={option._id}
              disabled={hasVoted || isExpired || !!isVoting}
              onClick={() => handleVote(option._id)}
              className={cn(
                "relative w-full overflow-hidden rounded-xl border p-3 text-left transition-all duration-300 group/option",
                isSelected 
                  ? "border-primary/50 bg-primary/5 shadow-sm" 
                  : "border-border/50 hover:border-border hover:bg-accent/20",
                (hasVoted || isExpired) ? "cursor-default" : "cursor-pointer active:scale-[0.98]"
              )}
            >
              {/* Progress Bar Background */}
              {(hasVoted || isExpired) && (
                <div 
                  className={cn(
                    "absolute inset-y-0 left-0 transition-all duration-1000 ease-out opacity-20",
                    isSelected ? "bg-primary" : "bg-muted-foreground"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn(
                    "font-medium truncate",
                    isSelected ? "text-primary" : "text-foreground/90"
                  )}>
                    {option.text}
                  </span>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                </div>

                {(hasVoted || isExpired) && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold tabular-nums">
                      {percentage}%
                    </span>
                    {isVoting === option._id && <Loader2 className="h-3 w-3 animate-spin" />}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-1">
        <span>{totalVotes.toLocaleString()} votes</span>
        <span>
          {isExpired 
            ? 'Poll ended' 
            : isValidDate 
              ? `Ends ${formatDistanceToNow(expiresAtDate, { addSuffix: true })}`
              : 'Ending soon'
          }
        </span>
      </div>
    </div>
  );
}
