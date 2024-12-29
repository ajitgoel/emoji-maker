'use client';
import Image from "next/image";
import { useState } from "react";

interface EmojiData {
  url: string;
  likes: number;
  id: string;
  isLiked: boolean;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emojis, setEmojis] = useState<EmojiData[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      const newEmojis = data.output.map((url: string) => ({
        url,
        likes: 0,
        id: Math.random().toString(36).substr(2, 9),
        isLiked: false
      }));
      
      setEmojis(prevEmojis => [...newEmojis, ...prevEmojis]);
    } catch (error) {
      console.error('Error generating emoji:', error);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  const handleLike = (id: string) => {
    setEmojis(prevEmojis =>
      prevEmojis.map(emoji =>
        emoji.id === id 
          ? {
              ...emoji,
              isLiked: !emoji.isLiked,
              likes: emoji.isLiked ? emoji.likes - 1 : emoji.likes + 1
            }
          : emoji
      )
    );
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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
          <h1 className="text-3xl font-bold">Emoji maker</h1>
          
          <div className="w-full">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <input 
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter prompt to generate emoji..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit" 
                disabled={isLoading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Generate'}
              </button>
            </form>
          </div>

          <div className="grid grid-cols-4 gap-4 w-full">
            {emojis.length > 0 ? (
              emojis.map((emoji) => (
                <div key={emoji.id} className="flex flex-col">
                  <div className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={emoji.url}
                      alt="Generated emoji"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDownload(emoji.url)}
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
                          onClick={() => handleLike(emoji.id)}
                          className="p-2 rounded-full bg-white hover:bg-white/90 transition-colors"
                          aria-label="Like emoji"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill={emoji.isLiked ? "#ef4444" : "none"}
                            stroke={emoji.isLiked ? "#ef4444" : "black"}
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
                  <div className="text-sm text-gray-500 mt-2 text-center">
                    {emoji.likes} {emoji.likes === 1 ? 'like' : 'likes'}
                  </div>
                </div>
              ))
            ) : (
              // Placeholder skeleton loading states
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col">
                  <div className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded mt-2 w-16 mx-auto animate-pulse" />
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
