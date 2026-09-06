import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API Key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `ElevenLabs API error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data.voices);
  } catch (error: any) {
    console.error('Error fetching ElevenLabs voices:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
