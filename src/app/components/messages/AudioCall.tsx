'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/app/components/ui/utils';
import { User } from '@/services/auth';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MoreVertical,
  UserPlus,
  MessageSquare,
  Pause,
  Timer,
} from 'lucide-react';

interface AudioCallProps {
  isOpen: boolean;
  onClose: () => void;
  otherUser: User;
  isIncoming?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onEnd?: () => void;
}

export function AudioCall({
  isOpen,
  onClose,
  otherUser,
  isIncoming = false,
  onAccept,
  onDecline,
  onEnd,
}: AudioCallProps) {
  const [callStatus, setCallStatus] = useState<'incoming' | 'connecting' | 'connected' | 'ended'>(isIncoming ? 'incoming' : 'connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Handle connecting simulation
  useEffect(() => {
    if (!isOpen) return;
    
    if (!isIncoming && callStatus === 'connecting') {
      const timer = setTimeout(() => {
        setCallStatus('connected');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isIncoming, callStatus]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'connected' && !isPaused) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus, isPaused]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = () => {
    setCallStatus('connected');
    onAccept?.();
  };

  const handleDecline = () => {
    setCallStatus('ended');
    onDecline?.();
    onClose();
  };

  const handleEnd = () => {
    setCallStatus('ended');
    onEnd?.();
    onClose();
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onClose}
          className="rounded-full p-2 text-muted-foreground hover:bg-accent transition-colors"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span>{formatDuration(callDuration)}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 bg-background">
        {/* User info */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center ring-4 ring-primary/20 overflow-hidden">
              {otherUser.avatar ? (
                <img 
                  src={otherUser.avatar} 
                  alt={otherUser.fullnames}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-muted-foreground">
                  {otherUser.fullnames?.[0]}
                </span>
              )}
            </div>
            {/* Audio wave animation */}
            {callStatus === 'connected' && (
              <div className="absolute -inset-4 flex items-center justify-center pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full border-2 border-primary/30 animate-ping"
                    style={{
                      width: `${160 + i * 40}px`,
                      height: `${160 + i * 40}px`,
                      animationDelay: `${i * 200}ms`,
                      animationDuration: '2s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-semibold">{otherUser.fullnames}</h2>
            <p className="text-muted-foreground mt-1">
              {callStatus === 'incoming' && 'Incoming call...'}
              {callStatus === 'connecting' && 'Connecting...'}
              {callStatus === 'connected' && 'Call in progress'}
              {callStatus === 'ended' && 'Call ended'}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">@{otherUser.username}</p>
          </div>
        </div>
      </div>

      {/* Call controls */}
      <div className="p-8 pb-12">
        {callStatus === 'incoming' ? (
          /* Incoming call buttons */
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={handleDecline}
              className={cn(
                'flex flex-col items-center gap-2',
                'h-16 w-16 rounded-full bg-destructive text-destructive-foreground',
                'hover:bg-destructive/90 transition-all hover:scale-105 active:scale-95',
                'shadow-lg shadow-destructive/30'
              )}
            >
              <PhoneOff className="h-6 w-6" />
            </button>
            <button
              onClick={handleAccept}
              className={cn(
                'flex flex-col items-center gap-2',
                'h-16 w-16 rounded-full bg-emerald-500 text-white',
                'hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95',
                'shadow-lg shadow-emerald-500/30'
              )}
            >
              <Phone className="h-6 w-6" />
            </button>
          </div>
        ) : (
          /* Active call buttons */
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-6">
              <ControlButton
                icon={isMuted ? MicOff : Mic}
                label={isMuted ? 'Unmute' : 'Mute'}
                isActive={isMuted}
                onClick={handleMute}
              />
              <ControlButton
                icon={isSpeakerOn ? VolumeX : Volume2}
                label={isSpeakerOn ? 'Speaker off' : 'Speaker'}
                isActive={isSpeakerOn}
                onClick={handleSpeaker}
              />
              <ControlButton
                icon={isPaused ? Phone : Pause}
                label={isPaused ? 'Resume' : 'Hold'}
                isActive={isPaused}
                onClick={handlePause}
              />
              <ControlButton
                icon={UserPlus}
                label="Add"
                onClick={() => {}}
              />
              <ControlButton
                icon={MessageSquare}
                label="Chat"
                onClick={() => {}}
              />
            </div>

            {/* End call button */}
            <div className="flex justify-center">
              <button
                onClick={handleEnd}
                className={cn(
                  'flex items-center gap-2 px-8 py-4 rounded-full',
                  'bg-destructive text-destructive-foreground',
                  'hover:bg-destructive/90 transition-all hover:scale-105 active:scale-95',
                  'shadow-lg shadow-destructive/30'
                )}
              >
                <PhoneOff className="h-6 w-6" />
                <span className="font-medium">End Call</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ControlButton({
  icon: Icon,
  label,
  isActive = false,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5',
        'transition-all duration-200'
      )}
    >
      <div
        className={cn(
          'h-12 w-12 rounded-full flex items-center justify-center',
          'transition-all duration-200',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-accent'
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </button>
  );
}
