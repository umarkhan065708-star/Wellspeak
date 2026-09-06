export interface Voice {
  // Edge TTS specific
  ShortName: string;
  FriendlyName: string;
  Gender: 'Male' | 'Female' | string;
  Locale: string;
  
  // ElevenLabs specific
  voice_id?: string;
  name?: string;
  category?: string;
  labels?: {
    accent?: string;
    description?: string;
    age?: string;
    gender?: string;
    use_case?: string;
  };
  preview_url?: string;
}

export interface TTSRequest {
  text: string;
  voice: string;
  rate?: string; // e.g. "+0%", "+20%", "-10%"
  pitch?: string; // e.g. "+0Hz", "+10Hz", "-5Hz"
  volume?: string; // e.g. "+0%", "+20%"
  format?: string;
}

export interface HistoryItem {
  id: string;
  text: string;
  voiceShortName: string;
  voiceFriendlyName: string;
  locale: string;
  timestamp: number;
  audioUrl: string;
  duration?: number;
  rate: string;
  pitch: string;
  format: string;
}

export interface SamplePrompt {
  id: string;
  title: string;
  category: 'Story' | 'Commercial' | 'Educational' | 'Conversational' | 'Tech';
  text: string;
}
