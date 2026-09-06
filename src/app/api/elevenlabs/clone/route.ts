import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API Key not configured' }, { status: 500 });
    }

    const formData = await req.formData();
    
    // Validate required fields
    const name = formData.get('name');
    const file = formData.get('files'); // The UI must append 'files'

    if (!name || !file) {
      return NextResponse.json({ error: 'Name and audio file are required' }, { status: 400 });
    }

    // Forward the formData to ElevenLabs
    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: formData, // FormData sends multipart automatically
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `ElevenLabs API error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error cloning ElevenLabs voice:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
