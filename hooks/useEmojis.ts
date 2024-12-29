"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

export {};  // Makes this file a module

interface Emoji {
  created_at: string | null;
  creator_user_id: string;
  id: number;
  image_url: string;
  likes_count: number | null;
  prompt: string;
}
export function useEmojis() {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();
  
  const refreshEmojis = async () => {
    await fetchEmojis();
  };

  useEffect(() => {
    // Initial fetch
    fetchEmojis();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('emoji_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emojis'
        },
        (payload) => {
          setEmojis((current) => [(payload.new as Emoji), ...current]);
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchEmojis() {
    try {
      const response = await fetch('/api/emojis');
      const data = await response.json();
      if (data.emojis) {
        setEmojis(data.emojis);
      }
    } catch (error) {
      console.error('Error fetching emojis:', error);
    } finally {
      setLoading(false);
    }
  }

  const toggleLike = async (emojiId: number, currentLikes: number) => {
    try {
      // Get the emoji
      const { data: emoji } = await supabase
        .from('emojis')
        .select('likes_count')
        .eq('id', emojiId)
        .single();

      // Update the likes count
      const newLikesCount = currentLikes > 0 ? 0 : 1;

      // Update in database
      const { data, error } = await supabase
        .from('emojis')
        .update({ likes_count: newLikesCount })
        .eq('id', emojiId)
        .select();

      if (error) throw error;

      // Update local state
      setEmojis(prevEmojis =>
        prevEmojis.map(emoji =>
          emoji.id === emojiId
            ? { ...emoji, likes_count: newLikesCount }
            : emoji
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return { emojis, loading, toggleLike, refreshEmojis };
}