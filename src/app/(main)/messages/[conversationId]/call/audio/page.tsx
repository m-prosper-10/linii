'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AudioCall } from '@/app/components/messages/AudioCall';
import { User } from '@/services/auth';
import { chatService } from '@/services/chat';

export default function AudioCallPage() {
  const params = useParams();
  const router = useRouter();
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const conversationId = params.conversationId as string;

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const conversation = await chatService.getConversation(conversationId);
        // Get the other user from conversation participants
        const other = conversation.participants?.[0];
        if (other) {
          setOtherUser(other);
        }
      } catch (error) {
        console.error('Failed to fetch conversation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId]);

  const handleClose = () => {
    router.push(`/messages/${conversationId}`);
  };

  const handleEnd = () => {
    // Call ended logic here
    handleClose();
  };

  if (isLoading || !otherUser) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <AudioCall
      isOpen={true}
      onClose={handleClose}
      otherUser={otherUser}
      isIncoming={false}
      onEnd={handleEnd}
    />
  );
}
