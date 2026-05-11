'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft, Phone, Settings2, Video } from 'lucide-react';
import { User } from '@/services/auth';
import { useRouter } from 'next/navigation';
import { AudioCall } from './AudioCall';
import { VideoCall } from './VideoCall';
import { getUserDisplayName, getUserInitial } from '@/lib/user';

interface ChatHeaderProps {
  conversationId: string;
  otherUser: User;
  isTyping: boolean;
  onBack: () => void;
}

export function ChatHeader({ conversationId, otherUser, isTyping, onBack }: ChatHeaderProps) {
  const router = useRouter();
  const [isAudioCallOpen, setIsAudioCallOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const otherUserName = getUserDisplayName(otherUser);
  return (
    <div className="border-border/40 bg-card/60 sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3 backdrop-blur-md">
      {/* Left: back + user info */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-1 h-8 w-8 rounded-full p-0 md:hidden"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="relative">
          <Avatar className="h-9 w-9">
            <AvatarImage src={otherUser.avatar} alt={otherUserName} />
            <AvatarFallback className="text-sm font-bold">
              {getUserInitial(otherUser)}
            </AvatarFallback>
          </Avatar>
          {/* Online dot */}
          <span className="border-background absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 bg-emerald-500" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">{otherUserName}</p>
          <div className="text-[11px] text-muted-foreground/60 font-medium h-4">
            {isTyping ? (
              <span className="flex items-center gap-1">
                <span>typing</span>
                <span className="flex gap-0.5 items-center">
                  {[0, 150, 300].map(delay => (
                    <span
                      key={delay}
                      className="bg-muted-foreground/60 h-1 w-1 animate-bounce rounded-full"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </span>
              </span>
            ) : (
              'Active now'
            )}
          </div>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-0.5">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground"
          onClick={() => setIsAudioCallOpen(true)}
        >
          <Phone className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground"
          onClick={() => setIsVideoCallOpen(true)}
        >
          <Video className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-foreground"
          onClick={() => router.push(`/messages/${conversationId}/settings`)}
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Audio Call Modal */}
      <AudioCall
        isOpen={isAudioCallOpen}
        onClose={() => setIsAudioCallOpen(false)}
        otherUser={otherUser}
        isIncoming={false}
        onEnd={() => setIsAudioCallOpen(false)}
      />

      {/* Video Call Modal */}
      <VideoCall
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
        otherUser={otherUser}
        isIncoming={false}
        onEnd={() => setIsVideoCallOpen(false)}
      />
    </div>
  );
}
