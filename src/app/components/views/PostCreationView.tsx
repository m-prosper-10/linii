import { useState } from 'react';
import { ArrowLeft, Image, Video, MapPin, Smile, Calendar, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { currentUser } from '@/data/mockData';

export function PostCreationView() {
  const { setCurrentView } = useApp();
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return;
    
    setIsPosting(true);
    
    // Simulate posting delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset form
    setContent('');
    setSelectedImage(null);
    setIsPosting(false);
    
    // Navigate back to home
    setCurrentView('home');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const characterCount = content.length;
  const maxCharacters = 280;
  const isOverLimit = characterCount > maxCharacters;
  const canPost = content.trim().length > 0 && !isOverLimit && !isPosting;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCurrentView('home')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="font-semibold text-xl">Create Post</h2>
          </div>
          <Button 
            onClick={handlePost}
            disabled={!canPost}
            className="px-6"
          >
            {isPosting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex gap-3">
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
            <AvatarFallback>{currentUser.displayName[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] text-lg border-none resize-none focus-visible:ring-0 p-0 bg-transparent"
              maxLength={maxCharacters + 50} // Allow typing over limit to show warning
            />

            {selectedImage && (
              <div className="relative">
                <img 
                  src={selectedImage} 
                  alt="Upload preview" 
                  className="w-full max-h-96 object-cover rounded-lg border border-border"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2 w-8 h-8 p-0"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button variant="ghost" size="sm" className="gap-2" asChild>
                    <span className="cursor-pointer">
                      <Image className="h-4 w-4" />
                      Photo
                    </span>
                  </Button>
                </label>

                <Button variant="ghost" size="sm" className="gap-2" disabled>
                  <Video className="h-4 w-4" />
                  Video
                </Button>

                <Button variant="ghost" size="sm" className="gap-2" disabled>
                  <MapPin className="h-4 w-4" />
                  Location
                </Button>

                <Button variant="ghost" size="sm" className="gap-2" disabled>
                  <Smile className="h-4 w-4" />
                  Emoji
                </Button>

                <Button variant="ghost" size="sm" className="gap-2" disabled>
                  <Calendar className="h-4 w-4" />
                  Schedule
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <div className={`text-sm ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {characterCount}/{maxCharacters}
                </div>
                
                {isOverLimit && (
                  <Badge variant="destructive" className="text-xs">
                    Over limit
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>💡 <strong>Tips for great posts:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Keep it engaging and authentic</li>
            <li>Use relevant hashtags to reach more people</li>
            <li>Add images or videos to increase engagement</li>
            <li>Ask questions to encourage interaction</li>
          </ul>
        </div>
      </div>
    </div>
  );
}