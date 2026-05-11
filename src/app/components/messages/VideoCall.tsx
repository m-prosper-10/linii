'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/app/components/ui/utils';
import { User } from '@/services/auth';
import { getUserDisplayName, getUserInitial } from '@/lib/user';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MoreVertical,
  UserPlus,
  MessageSquare,
  FlipHorizontal,
  Maximize2,
  Minimize2,
  Timer,
} from 'lucide-react';

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  otherUser: User;
  isIncoming?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onEnd?: () => void;
}

export function VideoCall({
  isOpen,
  onClose,
  otherUser,
  isIncoming = false,
  onAccept,
  onDecline,
  onEnd,
}: VideoCallProps) {
  const otherUserName = getUserDisplayName(otherUser);
  const [callStatus, setCallStatus] = useState<'incoming' | 'connecting' | 'connected' | 'ended'>(isIncoming ? 'incoming' : 'connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

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
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);


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

  const handleVideoToggle = () => {
    setIsVideoOn(!isVideoOn);
  };

  const handleCameraSwitch = () => {
    setIsFrontCamera(!isFrontCamera);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) return null;

  // Minimized view
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-100 w-48 h-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/20 bg-black">
        <div className="relative w-full h-full bg-muted">
          {/* Remote video placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
              {otherUser.avatar ? (
                <img 
                  src={otherUser.avatar} 
                  alt={otherUserName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {getUserInitial(otherUser)}
                </span>
              )}
            </div>
          </div>
          
          {/* Controls overlay */}
          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-white text-xs">{formatDuration(callDuration)}</span>
              <button
                onClick={() => setIsMinimized(false)}
                className="p-1 rounded-full bg-white/20 text-white"
              >
                <Maximize2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed inset-0 z-100 bg-black flex flex-col",
      isFullscreen ? "fixed" : "relative"
    )}>
      {/* Main video area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black">
        {/* Remote video (other user) */}
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          {callStatus === 'connected' ? (
            <div className="w-full h-full flex items-center justify-center">
              {/* Remote video placeholder - in real implementation this would be actual video */}
              <div className="h-40 w-40 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                {otherUser.avatar ? (
                  <img 
                    src={otherUser.avatar} 
                    alt={otherUserName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-bold text-white">
                    {getUserInitial(otherUser)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-white/10 flex items-center justify-center ring-4 ring-white/20 overflow-hidden">
                  {otherUser.avatar ? (
                    <img 
                      src={otherUser.avatar} 
                      alt={otherUserName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white">
                      {getUserInitial(otherUser)}
                    </span>
                  )}
                </div>
                {/* Calling animation */}
                {callStatus === 'connecting' && (
                  <div className="absolute -inset-4 flex items-center justify-center pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full border-2 border-white/30 animate-ping"
                        style={{
                          width: `${140 + i * 30}px`,
                          height: `${140 + i * 30}px`,
                          animationDelay: `${i * 200}ms`,
                          animationDuration: '2s',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="text-center text-white">
                <h2 className="text-2xl font-semibold">{otherUserName}</h2>
                <p className="text-white/70 mt-1">
                  {callStatus === 'incoming' && 'Incoming video call...'}
                  {callStatus === 'connecting' && 'Calling...'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Local video (self) - pip */}
        {callStatus === 'connected' && (
          <div className="absolute top-4 right-4 w-40 h-52 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg bg-black">
            {isVideoOn ? (
              <div className="w-full h-full flex items-center justify-center">
                {/* Local video placeholder */}
                <div className="text-white/50 text-xs">Camera {isFrontCamera ? '(Front)' : '(Back)'}</div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="rounded-full bg-muted-foreground/20 p-4">
                  <VideoOff className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
            )}
            
            {/* PIP controls */}
            <button
              onClick={handleCameraSwitch}
              className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <FlipHorizontal className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Header overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white text-sm">
              <Timer className="h-4 w-4" />
              <span>{formatDuration(callDuration)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleMinimize}
              className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleFullscreen}
              className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Call controls */}
      <div className="p-6 pb-8 bg-gradient-to-t from-black/80 to-transparent">
        {callStatus === 'incoming' ? (
          /* Incoming call buttons */
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={handleDecline}
              className={cn(
                'flex flex-col items-center gap-2',
                'h-16 w-16 rounded-full bg-red-500 text-white',
                'hover:bg-red-600 transition-all hover:scale-105 active:scale-95',
                'shadow-lg shadow-red-500/30'
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
              <Video className="h-6 w-6" />
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
                variant="dark"
              />
              <ControlButton
                icon={isVideoOn ? Video : VideoOff}
                label={isVideoOn ? 'Stop video' : 'Start video'}
                isActive={!isVideoOn}
                onClick={handleVideoToggle}
                variant="dark"
              />
              <ControlButton
                icon={FlipHorizontal}
                label="Flip"
                onClick={handleCameraSwitch}
                variant="dark"
              />
              <ControlButton
                icon={UserPlus}
                label="Add"
                onClick={() => {}}
                variant="dark"
              />
              <ControlButton
                icon={MessageSquare}
                label="Chat"
                onClick={() => {}}
                variant="dark"
              />
            </div>

            {/* End call button */}
            <div className="flex justify-center">
              <button
                onClick={handleEnd}
                className={cn(
                  'flex items-center gap-2 px-8 py-4 rounded-full',
                  'bg-red-500 text-white',
                  'hover:bg-red-600 transition-all hover:scale-105 active:scale-95',
                  'shadow-lg shadow-red-500/30'
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
  variant = 'light',
}: {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  variant?: 'light' | 'dark';
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 transition-all duration-200"
    >
      <div
        className={cn(
          'h-12 w-12 rounded-full flex items-center justify-center',
          'transition-all duration-200',
          variant === 'dark'
            ? isActive
              ? 'bg-white text-black'
              : 'bg-white/20 text-white hover:bg-white/30'
            : isActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className={cn(
        'text-xs',
        variant === 'dark' ? 'text-white/70' : 'text-muted-foreground'
      )}>
        {label}
      </span>
    </button>
  );
}
