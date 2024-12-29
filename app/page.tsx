'use client';
import { useState, useRef } from "react";
import EmojiGrid  from "@/components/EmojiGrid";

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const emojiGridRef = useRef<{ refreshEmojis: () => Promise<void> } | null>(null);

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
      
      await response.json();
      
      // Refresh the emoji grid after successful generation
      if (emojiGridRef.current) {
        await emojiGridRef.current.refreshEmojis();
      }
    } catch (error) {
      console.error('Error generating emoji:', error);
    } finally {
      setIsLoading(false);
      setPrompt('');
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
          <EmojiGrid ref={emojiGridRef} />
        </div>
      </main>
    </div>
  );
}
