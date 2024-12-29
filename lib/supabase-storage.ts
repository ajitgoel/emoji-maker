import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadEmojiToStorage(imageUrl: string, userId: string) {
  try {
    // Download image from URL
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Generate unique filename
    const filename = `${userId}_${Date.now()}.png`;
    
    // Upload to Supabase storage
    const { error } = await supabase.storage
      .from('emojis')
      .upload(filename, blob, {
        contentType: 'image/png',
        cacheControl: '3600'
      });

    if (error) {
      throw error;
    }

    // Get public URL of uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('emojis')
      .getPublicUrl(filename);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading emoji:', error);
    throw error;
  }
} 