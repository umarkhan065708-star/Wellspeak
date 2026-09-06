import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API Key not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { text, voice_id, similarity_boost, stability, style } = body;

    if (!text || !voice_id) {
      return NextResponse.json({ error: 'Text and voice_id are required' }, { status: 400 });
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          similarity_boost: similarity_boost || 0.75,
          stability: stability || 0.5,
          style: style || 0.0,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `ElevenLabs API error: ${errorText}` }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    return new NextResponse(audioBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="elevenlabs_tts.mp3"',
      },
    });
  } catch (error: any) {
    console.error('Error generating ElevenLabs TTS:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
