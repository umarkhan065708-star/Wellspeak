"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { VoiceModal } from '@/components/VoiceModal';
import { Voice, TTSRequest } from '@/lib/types';
import { getLanguageName } from '@/lib/languages';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Sparkles, Play, Settings2, ChevronRight, AlertCircle, Loader2, User, LogOut, ChevronDown, Video, Presentation, AudioWaveform, Speech, PlayCircle, Library, Mic2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [provider, setProvider] = useState<'edge' | 'elevenlabs'>('elevenlabs');
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  
  const [speed, setSpeed] = useState('1.0');
  const [intensity, setIntensity] = useState('75');
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const endpoint = provider === 'elevenlabs' ? '/api/elevenlabs/voices' : '/api/voices';
    setVoices([]);
    setSelectedVoice(null);

    fetch(endpoint)
      .then((res) => res.json())
      .then((data: Voice[]) => {
        setVoices(data);
        if (data.length > 0) {
          if (provider === 'elevenlabs') {
            const defaultV = data.find(v => v.name?.includes('Rachel') || v.name?.includes('Adam')) || data[0];
            setSelectedVoice(defaultV);
          } else {
            const defaultV = data.find(v => v.ShortName.includes('en-US-Aria')) || data[0];
            setSelectedVoice(defaultV);
          }
        }
      })
      .catch((err) => console.error('Failed to load voices:', err));
  }, [provider]);

  const isArabicScript = /[\u0600-\u06FF]/.test(text);
  let showLanguageWarning = false;
  if (provider === 'edge' && selectedVoice) {
    showLanguageWarning = isArabicScript && !selectedVoice.Locale.startsWith('ar') && !selectedVoice.Locale.startsWith('ur');
  }

  const handleGenerate = async () => {
    if (!text.trim() || !selectedVoice) return;

    setIsGenerating(true);
    setCurrentAudioUrl(null);
    setError(null);

    try {
      let res;
      if (provider === 'elevenlabs') {
        res = await fetch('/api/elevenlabs/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice_id: selectedVoice.voice_id,
            similarity_boost: parseInt(intensity) / 100,
            stability: 0.5,
          }),
        });
      } else {
        const requestBody: TTSRequest = {
          text,
          voice: selectedVoice.ShortName,
          rate: speed === '1.0' ? '+0%' : `${speed > '1.0' ? '+' : ''}${Math.round((parseFloat(speed) - 1) * 100)}%`,
        };
        res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || await res.text() || 'An unknown error occurred');
      }

      const audioBlob = await res.blob();
      const url = URL.createObjectURL(audioBlob);
      setCurrentAudioUrl(url);

    } catch (err: any) {
      console.error('Generation Error:', err);
      // Clean up the error message if it contains nested JSON stringification
      let msg = err.message || 'Unable to generate audio.';
      try {
        if (msg.includes('ElevenLabs API error:')) {
          const jsonStr = msg.replace('ElevenLabs API error: ', '');
          const parsed = JSON.parse(jsonStr);
          msg = parsed.detail?.message || parsed.message || msg;
        }
      } catch (e) {}
      
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const getCleanName = (): string => {
    if (!selectedVoice) return 'Select Voice';
    if (provider === 'elevenlabs') return selectedVoice.name || 'Unknown';
    const short = selectedVoice.ShortName || "";
    return short.split('-').pop()?.replace('Neural', '') || short || 'Unknown';
  };

  const getSubtitle = () => {
    if (!selectedVoice) return 'Click to choose';
    if (provider === 'elevenlabs') {
      const accent = selectedVoice.labels?.accent || "English";
      const gender = selectedVoice.labels?.gender || "Unknown";
      return `${accent} - ${gender}`;
    }
    return `${getLanguageName(selectedVoice.Locale || "")} - ${selectedVoice.Gender}`;
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar provider={provider} setProvider={setProvider} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white dark:bg-slate-950 shrink-0">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Text to Speech</h1>
          
          <div className="flex items-center gap-4 relative">
            <ThemeToggle />
            
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 p-1 rounded-full transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center font-bold overflow-hidden border-2 border-white dark:border-slate-950 shadow-sm">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  session?.user?.name?.[0] || 'U'
                )}
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute top-14 right-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-slate-900 dark:text-white truncate">{session?.user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session?.user?.email}</p>
                </div>
                
                <div className="p-2">
                  <Link href="/profile">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                  </Link>
                </div>
                
                <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* 2-Column Layout */}
        <div className="flex-1 overflow-hidden flex bg-white dark:bg-slate-950">
          
          {/* Left: Text Area */}
          <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar">
            
            {showLanguageWarning && (
              <div className="mb-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-4 py-3 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Language Mismatch Detected</p>
                  <p className="text-xs mt-0.5">You pasted Urdu/Arabic text, but an English voice is selected. Please click the voice button on the right and select an <b>Urdu</b> or <b>Arabic</b> voice.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Generation Error</p>
                  <p className="text-xs mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mb-6 min-h-[400px]">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write or paste your script..."
                maxLength={provider === 'elevenlabs' ? 10000 : 60000}
                className="flex-1 w-full p-6 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 bg-transparent focus:outline-none resize-none text-lg leading-relaxed"
              />
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-900">
                
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Get started with</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { icon: <Video className="w-3.5 h-3.5" />, label: "YouTube intro", text: "Hey guys, welcome back to the channel! Today we have something truly special to show you." },
                      { icon: <Presentation className="w-3.5 h-3.5" />, label: "Anime voiceover", text: "I won't let you hurt them! My power comes from my desire to protect my friends!" },
                      { icon: <Library className="w-3.5 h-3.5" />, label: "Story narration", text: "The ancient forest was quiet, save for the crunch of dry leaves beneath her boots as she ventured deeper into the unknown." },
                      { icon: <Mic2 className="w-3.5 h-3.5" />, label: "Podcast intro", text: "Welcome to Deep Dives, the podcast where we explore the hidden stories behind everyday technology." },
                      { icon: <Speech className="w-3.5 h-3.5" />, label: "Language practice", text: "Hello, my name is Alex. It is very nice to meet you today. Could you tell me how to get to the train station?" },
                    ].map(pill => (
                      <button 
                        key={pill.label}
                        onClick={() => setText(pill.text)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm transition-all"
                      >
                        {pill.icon}
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  {text.length} / {provider === 'elevenlabs' ? '10,000' : '60,000'}
                </div>
              </div>
            </div>

            {currentAudioUrl && selectedVoice && (
              <div className="mt-auto">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Generated Audio</h3>
                <AudioPlayer
                  audioUrl={currentAudioUrl}
                  textSnippet={text}
                  voiceName={getCleanName()}
                />
              </div>
            )}
          </div>

          {/* Right: Settings Panel */}
          <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex flex-col overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex gap-6">
              <button className="text-sm font-bold text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white pb-1">Settings</button>
              <button className="text-sm font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 pb-1">History</button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">Voice</label>
                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl hover:border-amber-400 dark:hover:border-amber-700 hover:shadow-md transition-all group text-left"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-amber-500">👑</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {getCleanName()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {getSubtitle()}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-amber-500 transition-colors" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">Language</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  >
                    <option>Auto</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {provider === 'elevenlabs' ? (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Similarity Boost</label>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{intensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={intensity}
                      onChange={(e) => setIntensity(e.target.value)}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-brand-500"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Speed</label>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{speed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-brand-500"
                  />
                </div>
              )}

            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className="w-full py-4 bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        voices={voices}
        onSelectVoice={setSelectedVoice}
        selectedVoiceId={provider === 'elevenlabs' ? selectedVoice?.voice_id : selectedVoice?.ShortName}
        provider={provider}
      />
    </div>
  );
}
