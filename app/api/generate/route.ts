import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { auth } from '@clerk/nextjs/server';
import { uploadEmojiToStorage } from '@/lib/supabase-storage';
import { createClient } from '@supabase/supabase-js';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await req.json();

    // Generate emoji using Replicate
    const prediction = await replicate.predictions.create({
      version: "dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e",
      input: {
        prompt: 'A TOK emoji of a ' + prompt,
        apply_watermark: false
      }
    });

    // Poll for the prediction result
    let finalPrediction = await replicate.predictions.get(prediction.id);
    while (finalPrediction.status !== 'succeeded' && finalPrediction.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      finalPrediction = await replicate.predictions.get(prediction.id);
    }

    if (finalPrediction.status === 'failed') {
      throw new Error('Prediction failed');
    }

    // Upload generated image to Supabase storage
    const imageUrl = await uploadEmojiToStorage(finalPrediction.output[0], userId);

    // Store emoji metadata in Supabase database
    const { error: dbError } = await supabase
      .from('emojis')
      .insert({
        image_url: imageUrl,
        prompt: prompt,
        creator_user_id: userId,
        likes_count: 0
      });

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json({ output: [imageUrl] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error generating emoji' },
      { status: 500 }
    );
  }
} 