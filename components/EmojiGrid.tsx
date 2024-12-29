import { forwardRef, useImperativeHandle, useEffect } from 'react';
import { useEmojis } from '@/hooks/useEmojis';
import Image from 'next/image';

interface EmojiGridProps {
  onRefresh?: () => void;
}

export const EmojiGrid = forwardRef<{ refreshEmojis: () => Promise<void> }, EmojiGridProps>((props, ref) => {
  const { emojis, loading, toggleLike, refreshEmojis } = useEmojis();

  useImperativeHandle(ref, () => ({
    refreshEmojis
  }));

  useEffect(() => {
    if (props.onRefresh) {
      props.onRefresh();
    }
  }, [props.onRefresh]);

  if (loading) {
    return <div>Loading emojis...</div>;
  }

  const handleLike = async (id: number, currentLikes: number) => {
    await toggleLike(id, currentLikes);
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'emoji.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading emoji:', error);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {emojis.map((emoji) => (
        <div key={emoji.id} className="flex flex-col group">
          <div key={emoji.id} className="relative aspect-square w-full h-full min-h-[200px]">
            <Image
              src={emoji.image_url}
              alt={emoji.prompt}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover rounded-lg"
              onError={(e) => console.error(`Error loading image: ${emoji.image_url}`, e)}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
              <div className="flex gap-2">
                <button 
                  onClick={() => handleDownload(emoji.image_url)}
                  className="p-2 rounded-full bg-white hover:bg-white/90 transition-colors"
                  aria-label="Download emoji"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
                <button 
                  onClick={() => handleLike(emoji.id, emoji.likes_count ?? 0)}
                  className="p-2 rounded-full bg-white hover:bg-white/90 transition-colors"
                  aria-label="Like emoji"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill={(emoji.likes_count ?? 0) ? "#ef4444" : "none"}
                    stroke={(emoji.likes_count ?? 0) ? "#ef4444" : "black"}
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
            <div>{emoji.prompt}</div>
            <div>{emoji.likes_count} {emoji.likes_count === 1 ? 'like' : 'likes'}</div>
          </div>
        </div>
      ))}
    </div>
  );
});
