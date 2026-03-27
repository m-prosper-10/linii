'use client';

import { PostApiType } from '@/services/post';
import { PollRendering } from './PollRendering';
import { MediaGallery } from './MediaGallery';
import { cn } from '@/app/components/ui/utils';

interface PostContentProps {
  post: PostApiType;
  onUpdate?: (updatedPost: PostApiType) => void;
  onPostClick?: () => void;
  hideMedia?: boolean;
}

export function PostContent({ 
  post, 
  onUpdate, 
  onPostClick,
  hideMedia = false 
}: PostContentProps) {
  return (
    <div className={cn("flex flex-col", post.content ? "mt-1" : "")}>
      {/* Primary Text Content */}
      {post.content && (
        <div className="mb-3">
          <p className="wrap-break-word text-muted-foreground/90 whitespace-pre-wrap font-normal leading-relaxed">
            {post.content}
          </p>
          
          {/* Tags rendered immediately after content */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="text-primary/70 cursor-pointer text-sm font-medium hover:underline"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Special Content Types (e.g. Polls) */}
      {post.poll && (
        <PollRendering 
          post={post} 
          onUpdate={onUpdate} 
        />
      )}

      {/* Supplementary Media (Gallery/Carousel) */}
      {!hideMedia && post.media && post.media.length > 0 && (
        <MediaGallery 
          media={post.media} 
          onPostClick={onPostClick}
        />
      )}
    </div>
  );
}
