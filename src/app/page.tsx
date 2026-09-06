"use client";

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { VoiceModal } from '@/components/VoiceModal';
import { Voice, TTSRequest } from '@/lib/types';
import { getLanguageName, LOCALE_TO_LANGUAGE } from '@/lib/languages';
import { 
  Sparkles, 
  Settings, 
  History, 
  X, 
  ChevronRight, 
  AlertCircle, 
  Loader2, 
  User, 
  LogOut, 
  ChevronDown, 
  Video, 
  Presentation, 
  AudioWaveform, 
  Speech, 
  Library, 
  Mic2, 
  Volume2, 
  Zap 
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [text, setText] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [speed, setSpeed] = useState('1.0');
  const [pitch, setPitch] = useState('0');
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');
  const [history, setHistory] = useState<{id: string, url: string, text: string, voice: string, date: Date}[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedHistory.length === history.length) {
      setSelectedHistory([]);
    } else {
      setSelectedHistory(history.map(h => h.id));
    }
  };

  const deleteSelectedHistory = () => {
    setHistory(prev => prev.filter(h => !selectedHistory.includes(h.id)));
    setSelectedHistory([]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
    setSelectedHistory(prev => prev.filter(s => s !== id));
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    setVoices([]);
    setSelectedVoice(null);

    fetch('/api/voices')
      .then((res) => res.json())
      .then((data: any) => {
        const voicesArray = Array.isArray(data) ? data : (data.voices || []);
        setVoices(voicesArray);
        if (voicesArray.length > 0) {
          const defaultV = voicesArray.find((v: Voice) => v.ShortName?.includes('en-US-Aria')) || voicesArray[0];
          setSelectedVoice(defaultV);
        }
      })
      .catch((err) => console.error('Failed to load voices:', err));
  }, []);

  const isArabicScript = /[\u0600-\u06FF]/.test(text);
  const showLanguageWarning = selectedVoice ? (isArabicScript && !selectedVoice.Locale.startsWith('ar') && !selectedVoice.Locale.startsWith('ur')) : false;

  const handleGenerate = async () => {
    if (!text.trim() || !selectedVoice) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      const speedNum = parseFloat(speed);
      const rateStr = speedNum === 1 ? '+0%' : (speedNum > 1 ? `+${Math.round((speedNum - 1) * 100)}%` : `${Math.round((speedNum - 1) * 100)}%`);
      const pitchStr = parseInt(pitch) >= 0 ? `+${pitch}Hz` : `${pitch}Hz`;

      const reqBody: TTSRequest = {
        text,
        voice: selectedVoice.ShortName,
        rate: rateStr,
        pitch: pitchStr,
      };

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      });

      if (!res.ok) throw new Error(await res.text());
      const audioBlob = await res.blob();
      const url = URL.createObjectURL(audioBlob);
      const newHistoryItem = {
        id: Date.now().toString(),
        url,
        text,
        voice: getCleanName(),
        date: new Date()
      };
      setHistory(prev => [newHistoryItem, ...prev]);
      setActiveTab('history');
    } catch (err: any) {
      console.error('Generation Error:', err);
      setError(err.message || 'Unable to generate audio.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getCleanName = (): string => {
    if (!selectedVoice) return 'Select Voice';
    const short = selectedVoice.ShortName || "";
    return short.split('-').pop()?.replace('Neural', '') || short || 'Unknown';
  };

  const getSubtitle = () => {
    if (!selectedVoice) return 'Click to choose';
    return `${getLanguageName(selectedVoice.Locale || "")} - ${selectedVoice.Gender}`;
  };

  const samplePrompts = [
    { icon: <Video className="w-3.5 h-3.5" />, label: "YouTube intro", text: "Hey guys, welcome back to the channel! Today we have something truly special to show you." },
    { icon: <Presentation className="w-3.5 h-3.5" />, label: "Anime voiceover", text: "I won't let you hurt them! My power comes from my desire to protect my friends!" },
    { icon: <Library className="w-3.5 h-3.5" />, label: "Story narration", text: "The ancient forest was quiet, save for the crunch of dry leaves beneath her boots as she ventured deeper into the unknown." },
    { icon: <Mic2 className="w-3.5 h-3.5" />, label: "Podcast intro", text: "Welcome to Deep Dives, the podcast where we explore the hidden stories behind everyday technology." },
    { icon: <Speech className="w-3.5 h-3.5" />, label: "Language practice", text: "Hello, my name is Alex. It is very nice to meet you today. Could you tell me how to get to the train station?" },
    { icon: <Volume2 className="w-3.5 h-3.5" />, label: "Meditation guidance", text: "Take a deep breath in... hold it for a moment... and gently exhale, letting go of all the tension in your body." },
    { icon: <Sparkles className="w-3.5 h-3.5" />, label: "Product demo", text: "Introducing the all-new WellSpeak. The fastest, most realistic AI voice generator built for creators." },
    { icon: <Zap className="w-3.5 h-3.5" />, label: "Game character", text: "Victory is within our reach! Stand your ground, champions, and fight for glory!" },
  ];

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 md:h-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 bg-white dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm">
              <Mic2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">WellSpeak</span>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4 relative">
            <ThemeToggle />
            
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 p-1 rounded-full transition-colors"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center font-bold overflow-hidden border-2 border-white dark:border-slate-950 shadow-sm text-xs md:text-base">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  session?.user?.name?.[0] || 'U'
                )}
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute top-12 md:top-14 right-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
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

        {/* 2-Column Responsive Layout */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-white dark:bg-slate-950">
          
          {/* Main Text Area Panel */}
          <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto custom-scrollbar">
            
            {showLanguageWarning && (
              <div className="mb-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-4 py-3 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Language Mismatch Detected</p>
                  <p className="text-xs mt-0.5">You pasted Urdu/Arabic text, but an English voice is selected. Please click the voice button and select an <b>Urdu</b> or <b>Arabic</b> voice.</p>
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

            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mb-4 md:mb-6 min-h-[300px] md:min-h-[400px]">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write or paste your script..."
                maxLength={3000}
                className="flex-1 w-full p-4 md:p-6 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 bg-transparent focus:outline-none resize-none text-base md:text-lg leading-relaxed"
              />
              <div className="px-4 md:px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-900">
                
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Get started with</p>
                  <div className="flex flex-wrap gap-2">
                    {samplePrompts.map(pill => (
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

                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>{text.length} / 3,000</span>
                </div>
              </div>
            </div>

            {/* Mobile Bottom Controls (famespeak.online layout) */}
            <div className="md:hidden flex flex-col gap-2.5 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="flex-1 flex items-center justify-between p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 rounded-xl text-left shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-amber-500 text-xs">👑</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {getCleanName()}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                </button>

                <button
                  onClick={() => setIsMobileSettingsOpen(true)}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shrink-0"
                  title="Settings"
                >
                  <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>

                <button
                  onClick={() => setIsMobileHistoryOpen(true)}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shrink-0 relative"
                  title="History"
                >
                  <History className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  {history.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                      {history.length}
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className="w-full py-3.5 bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
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

          {/* Desktop Right Sidebar: Settings / History Panel */}
          <div className="hidden md:flex w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex-col overflow-y-auto shrink-0">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex gap-6">
              <button 
                onClick={() => setActiveTab('settings')}
                className={`text-sm font-bold pb-1 border-b-2 ${activeTab === 'settings' ? 'text-slate-900 dark:text-white border-slate-900 dark:border-white' : 'text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                Settings
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`text-sm font-bold pb-1 border-b-2 ${activeTab === 'history' ? 'text-slate-900 dark:text-white border-slate-900 dark:border-white' : 'text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                History {history.length > 0 && <span className="ml-1 bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded-full text-[10px]">{history.length}</span>}
              </button>
            </div>

            {activeTab === 'settings' ? (
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
                      {Array.from(new Set(Object.values(LOCALE_TO_LANGUAGE))).sort().map(lang => (
                        <option key={lang} value={lang as string}>{lang as string}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">Emotion</label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-brand-500 cursor-pointer"
                    >
                      <option>Neutral</option>
                      <option>Happy</option>
                      <option>Sad</option>
                      <option>Angry</option>
                      <option>Excited</option>
                      <option>Whisper</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

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

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Pitch</label>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{pitch}Hz</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-brand-500"
                  />
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                {history.length > 0 && (
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
                    <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-300">
                      <input 
                        type="checkbox" 
                        checked={selectedHistory.length === history.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded text-brand-500 border-slate-300 focus:ring-brand-500 cursor-pointer"
                      />
                      Select All
                    </label>
                    {selectedHistory.length > 0 && (
                      <button 
                        onClick={deleteSelectedHistory}
                        className="text-xs font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-lg hover:bg-rose-200 transition-colors"
                      >
                        Delete ({selectedHistory.length})
                      </button>
                    )}
                  </div>
                )}
                
                {history.length === 0 ? (
                  <div className="text-center text-slate-500 dark:text-slate-400 mt-10">
                    <AudioWaveform className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No generated audio yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4 flex-1 overflow-y-auto pr-1 pb-4">
                    {history.map((item) => {
                      const isSelected = selectedHistory.includes(item.id);
                      return (
                        <div key={item.id} className={`bg-white dark:bg-slate-900 border ${isSelected ? 'border-brand-500 dark:border-brand-500 shadow-md' : 'border-slate-200 dark:border-slate-800 shadow-sm'} rounded-2xl p-4 relative transition-all`}>
                          <div className="flex items-start gap-3 mb-3">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setSelectedHistory(prev => prev.filter(id => id !== item.id));
                                } else {
                                  setSelectedHistory(prev => [...prev, item.id]);
                                }
                              }}
                              className="mt-1 w-4 h-4 rounded text-brand-500 border-slate-300 focus:ring-brand-500 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                <span className="truncate pr-2">{item.voice}</span>
                                <span className="text-[10px] text-slate-400 font-normal shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                  {item.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3 line-clamp-2">"{item.text}"</p>
                              <audio src={item.url} controls className="w-full h-8" />
                              
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 justify-end">
                                <a 
                                  href={item.url} 
                                  download={`wellspeak-${item.voice.toLowerCase()}-${Date.now()}.mp3`}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                  title="Download"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                </a>
                                <button 
                                  onClick={() => setText(item.text)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                  title="Reuse Script"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button 
                                  onClick={() => deleteHistoryItem(item.id)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        voices={voices}
        onSelectVoice={setSelectedVoice}
        selectedVoiceId={selectedVoice?.ShortName}
      />

      {/* Mobile Settings Drawer */}
      {isMobileSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-6 animate-in slide-in-from-bottom border-t sm:border border-slate-200 dark:border-slate-800 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-500" />
                Voice Settings
              </h3>
              <button onClick={() => setIsMobileSettingsOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">Language</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-brand-500"
                  >
                    <option>Auto</option>
                    {Array.from(new Set(Object.values(LOCALE_TO_LANGUAGE))).sort().map(lang => (
                      <option key={lang} value={lang as string}>{lang as string}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">Emotion</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option>Neutral</option>
                    <option>Happy</option>
                    <option>Sad</option>
                    <option>Angry</option>
                    <option>Excited</option>
                    <option>Whisper</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

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
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Pitch</label>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{pitch}Hz</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="1"
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>
            </div>

            <button
              onClick={() => setIsMobileSettingsOpen(false)}
              className="w-full py-3 bg-brand-500 text-white font-bold rounded-xl shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Mobile History Drawer */}
      {isMobileHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom border-t sm:border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-brand-500" />
                Audio History ({history.length})
              </h3>
              <button onClick={() => setIsMobileHistoryOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {history.length > 0 && (
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm">
                  <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={selectedHistory.length === history.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded text-brand-500 border-slate-300 focus:ring-brand-500 cursor-pointer"
                    />
                    Select All
                  </label>
                  {selectedHistory.length > 0 && (
                    <button 
                      onClick={deleteSelectedHistory}
                      className="text-xs font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-lg hover:bg-rose-200 transition-colors"
                    >
                      Delete ({selectedHistory.length})
                    </button>
                  )}
                </div>
              )}

              {history.length === 0 ? (
                <div className="text-center text-slate-500 dark:text-slate-400 py-10">
                  <AudioWaveform className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No generated audio yet.</p>
                </div>
              ) : (
                history.map((item) => {
                  const isSelected = selectedHistory.includes(item.id);
                  return (
                    <div key={item.id} className={`bg-white dark:bg-slate-950 border ${isSelected ? 'border-brand-500 shadow-md' : 'border-slate-200 dark:border-slate-800 shadow-sm'} rounded-2xl p-4 relative transition-all`}>
                      <div className="flex items-start gap-3 mb-3">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedHistory(prev => prev.filter(id => id !== item.id));
                            } else {
                              setSelectedHistory(prev => [...prev, item.id]);
                            }
                          }}
                          className="mt-1 w-4 h-4 rounded text-brand-500 border-slate-300 focus:ring-brand-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                            <span className="truncate pr-2">{item.voice}</span>
                            <span className="text-[10px] text-slate-400 font-normal shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              {item.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3 line-clamp-2">"{item.text}"</p>
                          <audio src={item.url} controls className="w-full h-8" />
                          
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 justify-end">
                            <a 
                              href={item.url} 
                              download={`wellspeak-${item.voice.toLowerCase()}-${Date.now()}.mp3`}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                              title="Download"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            </a>
                            <button 
                              onClick={() => { setText(item.text); setIsMobileHistoryOpen(false); }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                              title="Reuse Script"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button 
                              onClick={() => deleteHistoryItem(item.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
