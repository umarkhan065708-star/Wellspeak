import { NextRequest, NextResponse } from 'next/server';
import { EdgeTTS } from '@andresaya/edge-tts';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = 'en-US-AriaNeural', rate = '+0%', pitch = '+0Hz', volume = '+0%', format } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
    }

    if (text.length > 60000) {
      return NextResponse.json({ error: 'Text exceeds maximum limit of 60000 characters' }, { status: 400 });
    }

    // Format rate, pitch, volume string if provided as numbers or formatted strings
    const formattedRate = typeof rate === 'number' ? `${rate >= 0 ? '+' : ''}${rate}%` : rate;
    const formattedPitch = typeof pitch === 'number' ? `${pitch >= 0 ? '+' : ''}${pitch}Hz` : pitch;
    const formattedVolume = typeof volume === 'number' ? `${volume >= 0 ? '+' : ''}${volume}%` : volume;

    const tmpDir = os.tmpdir();
    const outputFilePath = path.join(tmpDir, `tts-${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`);

    try {
      const tts = new EdgeTTS();
      await tts.synthesize(text, voice, {
        rate: formattedRate,
        pitch: formattedPitch,
        volume: formattedVolume,
        outputFormat: format || 'audio-24khz-48kbitrate-mono-mp3'
      });

      const audioBuffer = tts.toBuffer();

      return new NextResponse(audioBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.length.toString(),
          'Content-Disposition': 'inline; filename="synthesized-speech.mp3"',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } catch (synthesisError: any) {
      console.error('EdgeTTS primary synthesis error:', synthesisError);
      throw synthesisError;
    }
  } catch (error: any) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
