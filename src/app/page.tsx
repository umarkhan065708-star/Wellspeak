'use client';

import React, { useState, useEffect } from 'react';
import { Voice, HistoryItem } from '@/lib/types';
import { DEFAULT_VOICES } from '@/lib/tts';
import { VoiceSelector } from '@/components/VoiceSelector';
import { ControlsPanel } from '@/components/ControlsPanel';
import { AudioPlayer } from '@/components/AudioPlayer';
import { HistoryList } from '@/components/HistoryList';
import { SamplePrompts } from '@/components/SamplePrompts';
import {
  Mic,
  Sparkles,
  Play,
  Loader2,
  Trash2,
  Copy,
  Check,
  Volume2,
  Radio,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function Home() {
  const [voices, setVoices] = useState<Voice[]>(DEFAULT_VOICES);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(DEFAULT_VOICES[0]);
  const [text, setText] = useState<string>(
    'Welcome to VoiceCraft Studio! Select your preferred voice actor, adjust speaking speed and pitch, and generate natural AI speech instantly.'
  );

  // Controls state
  const [rate, setRate] = useState<number>(0);
  const [pitch, setPitch] = useState<number>(0);
  const [volume, setVolume] = useState<number>(100);
  const [audioFormat, setAudioFormat] = useState<string>('audio-24khz-48kbitrate-mono-mp3');

  // Synthesis & Audio state
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isLoadingVoices, setIsLoadingVoices] = useState<boolean>(true);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Fetch live voices from API
  useEffect(() => {
    async function fetchVoices() {
      try {
        setIsLoadingVoices(true);
        const res = await fetch('/api/voices');
        const data = await res.json();
        if (data?.voices && Array.isArray(data.voices) && data.voices.length > 0) {
          setVoices(data.voices);
          // Default to Aria if present
          const defaultV = data.voices.find((v: Voice) => v.ShortName === 'en-US-AriaNeural') || data.voices[0];
          setSelectedVoice(defaultV);
        }
      } catch (err) {
        console.warn('Failed to load online voices list, using defaults:', err);
      } finally {
        setIsLoadingVoices(false);
      }
    }

    fetchVoices();
  }, []);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('voicecraft_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read history from localStorage:', e);
    }
  }, []);

  // Save history to localStorage on change
  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('voicecraft_history', JSON.stringify(newHistory));
    } catch (e) {
      console.warn('Could not save history:', e);
    }
  };

  const handleSynthesize = async () => {
    if (!text.trim() || !selectedVoice) return;
    setErrorMessage(null);
    setIsSynthesizing(true);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: selectedVoice.ShortName,
          rate,
          pitch,
          volume,
          format: audioFormat,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Speech synthesis failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setCurrentAudioUrl(url);

      // Add to history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        text: text.trim().slice(0, 100) + (text.length > 100 ? '...' : ''),
        voiceShortName: selectedVoice.ShortName,
        voiceFriendlyName: selectedVoice.FriendlyName,
        locale: selectedVoice.Locale,
        timestamp: Date.now(),
        audioUrl: url,
        rate: `${rate > 0 ? '+' : ''}${rate}%`,
        pitch: `${pitch > 0 ? '+' : ''}${pitch}Hz`,
        format: audioFormat,
      };

      saveHistory([newItem, ...history.slice(0, 19)]);
    } catch (err: any) {
      console.error('Synthesis Error:', err);
      setErrorMessage(err.message || 'Error generating speech. Please try again.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleResetControls = () => {
    setRate(0);
    setPitch(0);
    setVolume(100);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePlayHistoryItem = (item: HistoryItem) => {
    setCurrentAudioUrl(item.audioUrl);
  };

  const handleDeleteHistoryItem = (id: string) => {
    saveHistory(history.filter((h) => h.id !== id));
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Background Subtle Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                VoiceCraft Studio
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30 font-semibold">
                  Edge TTS v1.1
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Next-Gen Neural Text-to-Speech Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/andresayac/edge-tts"
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors hidden sm:flex items-center gap-1.5"
            >
              <span>Powered by edge-tts</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Voice Selector & Speech Tuning */}
          <div className="lg:col-span-5 space-y-6">
            <VoiceSelector
              voices={voices}
              selectedVoice={selectedVoice}
              onSelectVoice={setSelectedVoice}
              isLoadingVoices={isLoadingVoices}
            />

            <ControlsPanel
              rate={rate}
              setRate={setRate}
              pitch={pitch}
              setPitch={setPitch}
              volume={volume}
              setVolume={setVolume}
              audioFormat={audioFormat}
              setAudioFormat={setAudioFormat}
              onReset={handleResetControls}
            />
          </div>

          {/* Right Column: Text Input, Sample Prompts, Player & History */}
          <div className="lg:col-span-7 space-y-6">
            {/* Text Editor Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-400" />
                  <span className="text-sm font-bold text-white">Input Script</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyText}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    title="Copy text"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setText('')}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    title="Clear editor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Text Area */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste text here to convert into natural neural speech..."
                rows={6}
                maxLength={60000}
                className="w-full p-4 bg-slate-950/90 border border-slate-800/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none transition-colors custom-scrollbar"
              />

              {/* Footer info & Action button */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-slate-500 font-mono">
                  {text.length} / 60000 characters
                </div>

                <button
                  onClick={handleSynthesize}
                  disabled={isSynthesizing || !text.trim() || !selectedVoice}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition-all transform active:scale-98 cursor-pointer"
                >
                  {isSynthesizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Speech</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sample Prompts */}
            <SamplePrompts onSelectPrompt={(promptText) => setText(promptText)} />

            <AudioPlayer
              audioUrl={currentAudioUrl}
              textSnippet={text}
              voiceName={selectedVoice ? (selectedVoice.ShortName.split('-').pop()?.replace('Neural', '') || selectedVoice.ShortName) : 'Selected Voice'}
            />

            {/* History List */}
            <HistoryList
              history={history}
              onPlayHistoryItem={handlePlayHistoryItem}
              onDeleteItem={handleDeleteHistoryItem}
              onClearAll={handleClearHistory}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} VoiceCraft Studio. Built with Next.js, Tailwind CSS, & edge-tts.</p>
        </div>
      </footer>
    </div>
  );
}
