"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { VoiceModal } from '@/components/VoiceModal';
import { Voice, TTSRequest, HistoryItem } from '@/lib/types';
import { getLanguageName } from '@/lib/languages';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Sparkles, Play, Settings2, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [speed, setSpeed] = useState('1.0');
  
  // Ref for audio element used for previews
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load voices
  useEffect(() => {
    fetch('/api/voices')
      .then((res) => res.json())
      .then((data: Voice[]) => {
        setVoices(data);
        if (data.length > 0) {
          // Default to an English voice
          const defaultVoice = data.find(v => v.ShortName.includes('en-US-Aria')) || data[0];
          setSelectedVoice(defaultVoice);
        }
      })
      .catch((err) => console.error('Failed to load voices:', err));
  }, []);

  // Simple auto-warning for Urdu/Arabic text if English voice is selected
  const isArabicScript = /[\u0600-\u06FF]/.test(text);
  const showLanguageWarning = isArabicScript && selectedVoice && !selectedVoice.Locale.startsWith('ar') && !selectedVoice.Locale.startsWith('ur');

  const handleGenerate = async () => {
    if (!text.trim() || !selectedVoice) return;

    setIsGenerating(true);
    setCurrentAudioUrl(null);

    try {
      const requestBody: TTSRequest = {
        text,
        voice: selectedVoice.ShortName,
        rate: speed === '1.0' ? '+0%' : `${speed > '1.0' ? '+' : ''}${Math.round((parseFloat(speed) - 1) * 100)}%`,
      };

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const audioBlob = await res.blob();
      const url = URL.createObjectURL(audioBlob);
      setCurrentAudioUrl(url);

    } catch (err) {
      alert('Error generating speech: ' + (err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-20 border-b border-slate-200 flex items-center justify-between px-8 bg-white shrink-0">
          <h1 className="text-xl font-bold text-slate-900">Text to Speech</h1>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-sm uppercase">
              {session?.user?.name?.[0] || 'U'}
            </div>
          </div>
        </header>

        {/* 2-Column Layout for Main Content */}
        <div className="flex-1 overflow-hidden flex">
          
          {/* Left: Text Area */}
          <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar">
            
            {showLanguageWarning && (
              <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Language Mismatch Detected</p>
                  <p className="text-xs mt-0.5">You pasted Urdu/Arabic text, but an English voice is selected. The voice may sound corrupted. Please click the voice button on the right and select an <b>Urdu</b> or <b>Arabic</b> voice.</p>
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mb-6 min-h-[400px]">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write or paste your script..."
                maxLength={60000}
                className="flex-1 w-full p-6 text-slate-700 placeholder-slate-400 focus:outline-none resize-none text-lg leading-relaxed"
              />
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="text-xs text-slate-400 font-medium">
                  {text.length} / 60,000
                </div>
              </div>
            </div>

            {currentAudioUrl && selectedVoice && (
              <div className="mt-auto">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Generated Audio</h3>
                <AudioPlayer
                  audioUrl={currentAudioUrl}
                  textSnippet={text}
                  voiceName={selectedVoice.ShortName.split('-').pop()?.replace('Neural', '') || selectedVoice.ShortName}
                />
              </div>
            )}
          </div>

          {/* Right: Settings Panel */}
          <div className="w-80 border-l border-slate-200 bg-slate-50/50 flex flex-col overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex gap-6">
              <button className="text-sm font-bold text-slate-900 border-b-2 border-slate-900 pb-1">Settings</button>
              <button className="text-sm font-medium text-slate-400 hover:text-slate-600 pb-1">History</button>
            </div>

            <div className="p-6 space-y-8 flex-1">
              {/* Voice Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Voice</label>
                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="w-full flex items-center justify-between p-4 bg-white border border-amber-200 rounded-2xl hover:border-amber-400 hover:shadow-md transition-all group text-left"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-amber-500">👑</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {selectedVoice ? (selectedVoice.ShortName.split('-').pop()?.replace('Neural', '') || selectedVoice.ShortName) : 'Select Voice'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {selectedVoice ? `${getLanguageName(selectedVoice.Locale)} - ${selectedVoice.Gender}` : 'Click to choose'}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                </button>
              </div>

              {/* Language Display (Readonly for now as it's tied to Voice) */}
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Language</label>
                <div className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium">
                  {selectedVoice ? getLanguageName(selectedVoice.Locale) : 'Auto'}
                </div>
              </div>

              {/* Speed Control */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Speed</label>
                  <span className="text-xs font-bold text-slate-500">{speed}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
              </div>

            </div>

            {/* Generate Button Fixed at Bottom of Sidebar */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 mt-auto">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
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

      {/* Voice Selection Modal */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        voices={voices}
        onSelectVoice={setSelectedVoice}
        selectedVoiceId={selectedVoice?.ShortName}
      />
    </div>
  );
}
