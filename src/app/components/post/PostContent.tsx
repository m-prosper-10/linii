'use client';

import { PostApiType } from '@/services/post';
import { PollRendering } from './PollRendering';
import { MediaGallery } from './MediaGallery';
import { cn } from '@/app/components/ui/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
          <div className="wrap-break-word text-foreground/90 font-normal leading-relaxed overflow-hidden text-[15px]">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
              components={{
                p: ({_node, ...props}: any) => <p className="mb-2 last:mb-0 whitespace-pre-wrap break-words" {...props} />,
                a: ({_node, ...props}: any) => <a className="text-primary hover:underline break-words" target="_blank" rel="noopener noreferrer" {...props} />,
                ul: ({_node, ...props}: any) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                ol: ({_node, ...props}: any) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                li: ({_node, ...props}: any) => <li className="" {...props} />,
                h1: ({_node, ...props}: any) => <h1 className="text-xl font-bold mb-2 mt-4 text-foreground leading-tight" {...props} />,
                h2: ({_node, ...props}: any) => <h2 className="text-lg font-bold mb-2 mt-3 text-foreground leading-tight" {...props} />,
                h3: ({_node, ...props}: any) => <h3 className="text-base font-bold mb-1 mt-2 text-foreground leading-tight" {...props} />,
                code: ({_node, inline, className, children, ...props}: any) => 
                  inline ? 
                    <code className="bg-accent/50 text-accent-foreground rounded-sm px-1.5 py-0.5 font-mono text-[13px]" {...props}>{children}</code> : 
                    <div className="my-3 overflow-hidden rounded-md border border-border/40 bg-accent/20">
                      <div className="flex items-center px-3 py-1.5 bg-accent/30 border-b border-border/40 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        Code Snippet
                      </div>
                      <pre className="p-3 overflow-x-auto"><code className="font-mono text-[13px] text-foreground/80 leading-relaxed" {...props}>{children}</code></pre>
                    </div>,
                blockquote: ({_node, ...props}: any) => <blockquote className="border-l-4 border-primary/50 pl-4 py-1 my-3 bg-accent/5 rounded-r-md italic text-muted-foreground" {...props} />
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
          
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
