import { NextResponse } from 'next/server';
import { getVoicesFromEdge } from '@/lib/tts';

export async function GET() {
  try {
    const voices = await getVoicesFromEdge();
    return NextResponse.json({ voices, count: voices.length });
  } catch (error: any) {
    console.error('Error fetching voices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voices', details: error.message },
      { status: 500 }
    );
  }
}
