'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';
import { User } from '@/services/auth';
import { Conversation } from '@/services/chat';
import {
  Bell,
  BellOff,
  LogOut,
  Trash2,
  UserX,
  X,
  Settings,
  Shield,
  Palette,
  Download,
  Upload,
  Lock,
  Eye,
  Volume2,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Zap,
  Archive,
  Star,
  Pin,
  Clock,
  Image,
  FileText,
  Video,
  HardDrive,
  Wifi,
  MessageSquare,
  Users,
  Copy,
  Share,
  Flag,
  Info,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatSettingsProps {
  open: boolean;
  onClose: () => void;
  conversation: Conversation;
  otherUser: User;
  onMute?: () => void;
  onDelete?: () => void;
  onBlock?: () => void;
  onLeave?: () => void;
  isMuted?: boolean;
}

interface SettingsState {
  notifications: {
    messageNotifications: boolean;
    mentionNotifications: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    desktopNotifications: boolean;
    showPreview: boolean;
  };
  privacy: {
    readReceipts: boolean;
    lastSeen: boolean;
    onlineStatus: boolean;
    profilePhoto: boolean;
    statusMessage: boolean;
    typingIndicators: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    chatWallpaper: string;
    fontSize: 'small' | 'medium' | 'large';
    messageDensity: 'compact' | 'comfortable' | 'spacious';
  };
  media: {
    autoDownload: 'none' | 'wifi' | 'all';
    autoPlayVideos: boolean;
    showMediaPreview: boolean;
    maxFileSize: number;
  };
  advanced: {
    autoArchive: boolean;
    starredMessages: boolean;
    pinnedMessages: boolean;
    chatBackup: boolean;
    endToEndEncryption: boolean;
  };
}

export function ChatSettings({
  open,
  onClose,
  conversation,
  otherUser,
  onMute,
  onDelete,
  onBlock,
  onLeave,
  isMuted = false,
}: ChatSettingsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy' | 'appearance' | 'media' | 'advanced'>('general');
  
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      messageNotifications: true,
      mentionNotifications: true,
      soundEnabled: true,
      vibrationEnabled: true,
      desktopNotifications: false,
      showPreview: true,
    },
    privacy: {
      readReceipts: true,
      lastSeen: true,
      onlineStatus: true,
      profilePhoto: true,
      statusMessage: true,
      typingIndicators: true,
    },
    appearance: {
      theme: 'system',
      chatWallpaper: '',
      fontSize: 'medium',
      messageDensity: 'comfortable',
    },
    media: {
      autoDownload: 'wifi',
      autoPlayVideos: false,
      showMediaPreview: true,
      maxFileSize: 100,
    },
    advanced: {
      autoArchive: false,
      starredMessages: true,
      pinnedMessages: true,
      chatBackup: true,
      endToEndEncryption: true,
    },
  });

  const updateSetting = (category: keyof SettingsState, key: string, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'advanced', label: 'Advanced', icon: Zap },
  ];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-[1px]"
          onClick={onClose}
        />
      )}

      {/* Slide-in panel */}
      <div
        className={cn(
          'border-border/40 bg-card absolute inset-y-0 right-0 z-30 flex w-96 flex-col border-l shadow-2xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="border-border/30 flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Chat Settings</span>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground/60 hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-border/20 border-b px-2 py-2">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap',
                  activeTab === id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4 p-4">
              {/* User info */}
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={otherUser.avatar} alt={otherUser.fullnames} />
                  <AvatarFallback className="text-lg font-bold">
                    {otherUser.fullnames?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-semibold">{otherUser.fullnames}</p>
                  <p className="text-xs text-muted-foreground">@{otherUser.username}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 text-xs"
                  onClick={() => router.push(`/profile/${otherUser._id}`)}
                >
                  View profile
                </Button>
              </div>

              {/* Conversation meta */}
              <div className="rounded-lg border bg-accent/20 p-3 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span>{conversation.conversationType === 'DIRECT' ? 'Direct' : 'Group'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Started:</span>
                    <span>{new Date(conversation.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className="text-green-600">Active</span>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground">Quick Actions</h4>
                <ActionRow
                  icon={isMuted ? Bell : BellOff}
                  label={isMuted ? 'Unmute notifications' : 'Mute notifications'}
                  onClick={onMute}
                />
                <ActionRow icon={Star} label="Add to favorites" />
                <ActionRow icon={Pin} label="Pin conversation" />
                <ActionRow icon={Archive} label="Archive conversation" />
                <ActionRow icon={Share} label="Share conversation" />
              </div>

              {/* Dangerous actions */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground">Danger Zone</h4>
                {conversation.conversationType === 'GROUP' && (
                  <ActionRow icon={LogOut} label="Leave conversation" onClick={onLeave} />
                )}
                <ActionRow icon={UserX} label={`Block @${otherUser.username}`} onClick={onBlock} destructive />
                <ActionRow icon={Trash2} label="Delete conversation" onClick={onDelete} destructive />
                <ActionRow icon={Flag} label="Report conversation" destructive />
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Message Notifications</h4>
                <ToggleRow
                  icon={Bell}
                  label="Message notifications"
                  description="Get notified for new messages"
                  checked={settings.notifications.messageNotifications}
                  onChange={(checked) => updateSetting('notifications', 'messageNotifications', checked)}
                />
                <ToggleRow
                  icon={MessageSquare}
                  label="Mention notifications"
                  description="Get notified when mentioned"
                  checked={settings.notifications.mentionNotifications}
                  onChange={(checked) => updateSetting('notifications', 'mentionNotifications', checked)}
                />
                <ToggleRow
                  icon={Eye}
                  label="Show message preview"
                  description="Show message content in notifications"
                  checked={settings.notifications.showPreview}
                  onChange={(checked) => updateSetting('notifications', 'showPreview', checked)}
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Sound & Vibration</h4>
                <ToggleRow
                  icon={Volume2}
                  label="Sound"
                  description="Play sound for notifications"
                  checked={settings.notifications.soundEnabled}
                  onChange={(checked) => updateSetting('notifications', 'soundEnabled', checked)}
                />
                <ToggleRow
                  icon={Smartphone}
                  label="Vibration"
                  description="Vibrate for notifications"
                  checked={settings.notifications.vibrationEnabled}
                  onChange={(checked) => updateSetting('notifications', 'vibrationEnabled', checked)}
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Desktop</h4>
                <ToggleRow
                  icon={Monitor}
                  label="Desktop notifications"
                  description="Show desktop notifications"
                  checked={settings.notifications.desktopNotifications}
                  onChange={(checked) => updateSetting('notifications', 'desktopNotifications', checked)}
                />
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Privacy Settings</h4>
                <ToggleRow
                  icon={Eye}
                  label="Read receipts"
                  description="Let others know you've read their messages"
                  checked={settings.privacy.readReceipts}
                  onChange={(checked) => updateSetting('privacy', 'readReceipts', checked)}
                />
                <ToggleRow
                  icon={Clock}
                  label="Last seen"
                  description="Share when you were last active"
                  checked={settings.privacy.lastSeen}
                  onChange={(checked) => updateSetting('privacy', 'lastSeen', checked)}
                />
                <ToggleRow
                  icon={Users}
                  label="Online status"
                  description="Show when you're online"
                  checked={settings.privacy.onlineStatus}
                  onChange={(checked) => updateSetting('privacy', 'onlineStatus', checked)}
                />
                <ToggleRow
                  icon={MessageSquare}
                  label="Typing indicators"
                  description="Show when you're typing"
                  checked={settings.privacy.typingIndicators}
                  onChange={(checked) => updateSetting('privacy', 'typingIndicators', checked)}
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Profile Privacy</h4>
                <ToggleRow
                  icon={Image}
                  label="Profile photo"
                  description="Show your profile photo"
                  checked={settings.privacy.profilePhoto}
                  onChange={(checked) => updateSetting('privacy', 'profilePhoto', checked)}
                />
                <ToggleRow
                  icon={Info}
                  label="Status message"
                  description="Show your status message"
                  checked={settings.privacy.statusMessage}
                  onChange={(checked) => updateSetting('privacy', 'statusMessage', checked)}
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Blocking</h4>
                <ActionRow icon={UserX} label="Blocked contacts" />
                <ActionRow icon={Flag} label="Blocked groups" />
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Theme</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'system', label: 'System', icon: Monitor },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => updateSetting('appearance', 'theme', value)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-colors',
                        settings.appearance.theme === value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-accent'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Chat Wallpaper</h4>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: '', label: 'Default', color: 'bg-gray-100' },
                    { value: 'blue', label: 'Blue', color: 'bg-blue-100' },
                    { value: 'green', label: 'Green', color: 'bg-green-100' },
                    { value: 'purple', label: 'Purple', color: 'bg-purple-100' },
                  ].map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => updateSetting('appearance', 'chatWallpaper', value)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors',
                        settings.appearance.chatWallpaper === value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-accent'
                      )}
                    >
                      <div className={cn('h-6 w-6 rounded', color)} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Font Size</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updateSetting('appearance', 'fontSize', value)}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-xs transition-colors',
                        settings.appearance.fontSize === value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-accent'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Message Density</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'compact', label: 'Compact' },
                    { value: 'comfortable', label: 'Comfortable' },
                    { value: 'spacious', label: 'Spacious' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => updateSetting('appearance', 'messageDensity', value)}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-xs transition-colors',
                        settings.appearance.messageDensity === value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-accent'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Auto-Download</h4>
                <div className="space-y-2">
                  {[
                    { value: 'none', label: 'Never', description: 'Never auto-download media' },
                    { value: 'wifi', label: 'Wi-Fi only', description: 'Auto-download on Wi-Fi only' },
                    { value: 'all', label: 'Always', description: 'Always auto-download media' },
                  ].map(({ value, label, description }) => (
                    <button
                      key={value}
                      onClick={() => updateSetting('media', 'autoDownload', value)}
                      className={cn(
                        'w-full rounded-lg border p-3 text-left transition-colors',
                        settings.media.autoDownload === value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-accent'
                      )}
                    >
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">{description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Media Settings</h4>
                <ToggleRow
                  icon={Video}
                  label="Auto-play videos"
                  description="Automatically play videos in chat"
                  checked={settings.media.autoPlayVideos}
                  onChange={(checked) => updateSetting('media', 'autoPlayVideos', checked)}
                />
                <ToggleRow
                  icon={Eye}
                  label="Show media preview"
                  description="Show preview of media files"
                  checked={settings.media.showMediaPreview}
                  onChange={(checked) => updateSetting('media', 'showMediaPreview', checked)}
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Storage</h4>
                <div className="rounded-lg border bg-accent/20 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Media storage</span>
                    </div>
                    <span className="text-xs text-muted-foreground">2.3 GB</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div className="h-2 w-1/3 rounded-full bg-primary" />
                  </div>
                </div>
                <ActionRow icon={Trash2} label="Clear media cache" />
                <ActionRow icon={Download} label="Download all media" />
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Chat Features</h4>
                <ToggleRow
                  icon={Archive}
                  label="Auto-archive"
                  description="Archive inactive conversations"
                  checked={settings.advanced.autoArchive}
                  onChange={(checked) => updateSetting('advanced', 'autoArchive', checked)}
                />
                <ToggleRow
                  icon={Star}
                  label="Starred messages"
                  description="Allow starring important messages"
                  checked={settings.advanced.starredMessages}
                  onChange={(checked) => updateSetting('advanced', 'starredMessages', checked)}
                />
                <ToggleRow
                  icon={Pin}
                  label="Pinned messages"
                  description="Allow pinning important messages"
                  checked={settings.advanced.pinnedMessages}
                  onChange={(checked) => updateSetting('advanced', 'pinnedMessages', checked)}
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Security</h4>
                <ToggleRow
                  icon={Lock}
                  label="End-to-end encryption"
                  description="Encrypt all messages"
                  checked={settings.advanced.endToEndEncryption}
                  onChange={(checked) => updateSetting('advanced', 'endToEndEncryption', checked)}
                />
                <ActionRow icon={Key} label="Encryption keys" />
                <ActionRow icon={Shield} label="Security settings" />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Data & Storage</h4>
                <ToggleRow
                  icon={Upload}
                  label="Chat backup"
                  description="Automatically backup chats"
                  checked={settings.advanced.chatBackup}
                  onChange={(checked) => updateSetting('advanced', 'chatBackup', checked)}
                />
                <ActionRow icon={Download} label="Export chat" />
                <ActionRow icon={Copy} label="Duplicate chat" />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Network</h4>
                <ToggleRow
                  icon={Wifi}
                  label="Use less data for calls"
                  description="Reduce data usage during calls"
                  checked={false}
                  onChange={() => {}}
                />
                <ActionRow icon={Network} label="Network usage" />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Debug</h4>
                <ActionRow icon={Bug} label="Send debug logs" />
                <ActionRow icon={Info} label="App info" />
                <ActionRow icon={FileText} label="Terms & Privacy" />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ActionRow({
  icon: Icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left',
        destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground/80 hover:bg-accent/60'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg p-3 hover:bg-accent/50">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="text-sm font-medium">{label}</div>
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-muted'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-background transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  );
}

// Missing icons
function Key({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function Bug({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );
}

function Network({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  );
}
