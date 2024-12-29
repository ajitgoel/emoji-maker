import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

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
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      finalPrediction = await replicate.predictions.get(prediction.id);
    }

    if (finalPrediction.status === 'failed') {
      throw new Error('Prediction failed');
    }

    return NextResponse.json({ output: finalPrediction.output });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error generating emoji' },
      { status: 500 }
    );
  }
} 