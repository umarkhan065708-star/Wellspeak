import { Voice } from './types';

// Fallback voice list for instant loading
export const DEFAULT_VOICES: Voice[] = [
  { ShortName: 'en-US-AriaNeural', FriendlyName: 'Microsoft Aria (English - US, Female)', Gender: 'Female', Locale: 'en-US' },
  { ShortName: 'en-US-GuyNeural', FriendlyName: 'Microsoft Guy (English - US, Male)', Gender: 'Male', Locale: 'en-US' },
  { ShortName: 'en-US-JennyNeural', FriendlyName: 'Microsoft Jenny (English - US, Female)', Gender: 'Female', Locale: 'en-US' },
  { ShortName: 'en-US-ChristopherNeural', FriendlyName: 'Microsoft Christopher (English - US, Male)', Gender: 'Male', Locale: 'en-US' },
  { ShortName: 'en-US-EricNeural', FriendlyName: 'Microsoft Eric (English - US, Male)', Gender: 'Male', Locale: 'en-US' },
  { ShortName: 'en-US-MichelleNeural', FriendlyName: 'Microsoft Michelle (English - US, Female)', Gender: 'Female', Locale: 'en-US' },
  { ShortName: 'en-GB-SoniaNeural', FriendlyName: 'Microsoft Sonia (English - UK, Female)', Gender: 'Female', Locale: 'en-GB' },
  { ShortName: 'en-GB-RyanNeural', FriendlyName: 'Microsoft Ryan (English - UK, Male)', Gender: 'Male', Locale: 'en-GB' },
  { ShortName: 'en-AU-NatashaNeural', FriendlyName: 'Microsoft Natasha (English - Australia, Female)', Gender: 'Female', Locale: 'en-AU' },
  { ShortName: 'en-IN-NeerjaNeural', FriendlyName: 'Microsoft Neerja (English - India, Female)', Gender: 'Female', Locale: 'en-IN' },
  { ShortName: 'es-ES-ElviraNeural', FriendlyName: 'Microsoft Elvira (Spanish - Spain, Female)', Gender: 'Female', Locale: 'es-ES' },
  { ShortName: 'es-MX-DaliaNeural', FriendlyName: 'Microsoft Dalia (Spanish - Mexico, Female)', Gender: 'Female', Locale: 'es-MX' },
  { ShortName: 'fr-FR-DeniseNeural', FriendlyName: 'Microsoft Denise (French - France, Female)', Gender: 'Female', Locale: 'fr-FR' },
  { ShortName: 'de-DE-KatjaNeural', FriendlyName: 'Microsoft Katja (German - Germany, Female)', Gender: 'Female', Locale: 'de-DE' },
  { ShortName: 'it-IT-ElsaNeural', FriendlyName: 'Microsoft Elsa (Italian - Italy, Female)', Gender: 'Female', Locale: 'it-IT' },
  { ShortName: 'ja-JP-NanamiNeural', FriendlyName: 'Microsoft Nanami (Japanese - Japan, Female)', Gender: 'Female', Locale: 'ja-JP' },
  { ShortName: 'zh-CN-XiaoxiaoNeural', FriendlyName: 'Microsoft Xiaoxiao (Chinese - Mandarin, Female)', Gender: 'Female', Locale: 'zh-CN' },
  { ShortName: 'hi-IN-SwaraNeural', FriendlyName: 'Microsoft Swara (Hindi - India, Female)', Gender: 'Female', Locale: 'hi-IN' },
  { ShortName: 'pt-BR-FranciscaNeural', FriendlyName: 'Microsoft Francisca (Portuguese - Brazil, Female)', Gender: 'Female', Locale: 'pt-BR' },
  { ShortName: 'ar-SA-ZariyahNeural', FriendlyName: 'Microsoft Zariyah (Arabic - Saudi Arabia, Female)', Gender: 'Female', Locale: 'ar-SA' },
];

export async function getVoicesFromEdge(): Promise<Voice[]> {
  try {
    const { EdgeTTS } = await import('@andresaya/edge-tts');
    const tts = new EdgeTTS();
    const voices = await tts.getVoices();
    if (Array.isArray(voices) && voices.length > 0) {
      return voices.map((v: any) => ({
        ShortName: v.ShortName || v.shortName || v.Name,
        FriendlyName: v.FriendlyName || v.friendlyName || v.ShortName || v.Name,
        Gender: v.Gender || v.gender || 'Unknown',
        Locale: v.Locale || v.locale || 'en-US',
      }));
    }
  } catch (error) {
    console.warn('Could not fetch live voices from edge-tts, using default list:', error);
  }
  return DEFAULT_VOICES;
}

export async function synthesizeSpeechEdge(
  text: string,
  voiceShortName: string,
  options?: { rate?: string; pitch?: string; volume?: string }
): Promise<Buffer> {
  const { EdgeTTS } = await import('@andresaya/edge-tts');
  const tts = new EdgeTTS();
  
  await tts.synthesize(text, voiceShortName, {
    rate: options?.rate || '0%',
    pitch: options?.pitch || '0Hz',
    volume: options?.volume || '0%',
  });

  return tts.toBuffer();
}
