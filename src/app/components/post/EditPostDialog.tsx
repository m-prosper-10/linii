'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { PostService, PostApiType } from '@/services/post';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface EditPostDialogProps {
  post: PostApiType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (post: PostApiType) => void;
}

export function EditPostDialog({ post, open, onOpenChange, onSaved }: EditPostDialogProps) {
  const [content, setContent] = useState(post.content);
  const [visibility, setVisibility] = useState(post.visibility);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setContent(post.content);
      setVisibility(post.visibility);
    }
  }, [open, post]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await PostService.updatePost(post._id, {
        content: content.trim(),
        visibility: visibility as 'PUBLIC' | 'FRIENDS' | 'PRIVATE',
      });
      toast.success('Post updated');
      onSaved(updated);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
        </DialogHeader>
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={6}
          className="resize-none"
        />
        <div className="space-y-2">
          <span className="text-muted-foreground text-xs font-medium">Visibility</span>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLIC">Public</SelectItem>
              <SelectItem value="FRIENDS">Followers</SelectItem>
              <SelectItem value="PRIVATE">Only you</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !content.trim()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
