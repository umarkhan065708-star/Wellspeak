'use client';

import React, { useState, useMemo } from 'react';
import { Voice } from '@/lib/types';
import { Search, Filter, Mic, User, Globe, Play, Loader2 } from 'lucide-react';

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoice: Voice | null;
  onSelectVoice: (voice: Voice) => void;
  isLoadingVoices: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoice,
  onSelectVoice,
  isLoadingVoices,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [selectedLocale, setSelectedLocale] = useState<string>('ALL');
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);

  // Extract unique locales
  const availableLocales = useMemo(() => {
    const locales = new Set<string>();
    voices.forEach((v) => {
      if (v.Locale) locales.add(v.Locale);
    });
    return Array.from(locales).sort();
  }, [voices]);

  // Filter voices based on search, gender, locale
  const filteredVoices = useMemo(() => {
    return voices.filter((v) => {
      const matchesSearch =
        v.FriendlyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.ShortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.Locale.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGender =
        selectedGender === 'ALL' ||
        v.Gender.toLowerCase() === selectedGender.toLowerCase();

      const matchesLocale =
        selectedLocale === 'ALL' || v.Locale === selectedLocale;

      return matchesSearch && matchesGender && matchesLocale;
    });
  }, [voices, searchTerm, selectedGender, selectedLocale]);

  // Handle Quick Voice Preview Synthesis
  const handlePreviewVoice = async (voice: Voice, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewingVoice === voice.ShortName) return;

    try {
      setPreviewingVoice(voice.ShortName);
      const sampleText = `Hello, this is a sample preview of ${voice.FriendlyName.split(' ')[1] || 'this voice'}.`;
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText, voice: voice.ShortName }),
      });

      if (!res.ok) throw new Error('Preview synthesis failed');

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.onended = () => setPreviewingVoice(null);
      await audio.play();
    } catch (err) {
      console.error('Error previewing voice:', err);
    } finally {
      setPreviewingVoice(null);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Select Voice Model</h2>
            <p className="text-xs text-slate-400">Choose from 300+ Microsoft Neural Voices</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 bg-slate-800 text-brand-400 border border-brand-500/20 rounded-full font-mono">
          {filteredVoices.length} Voices
        </span>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search voice, language, or accent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Gender Filter */}
          <div className="relative">
            <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-500 appearance-none cursor-pointer"
            >
              <option value="ALL">All Genders</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>

          {/* Locale Filter */}
          <div className="relative">
            <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedLocale}
              onChange={(e) => setSelectedLocale(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-500 appearance-none cursor-pointer"
            >
              <option value="ALL">All Languages ({availableLocales.length})</option>
              {availableLocales.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Voice Cards List */}
      <div className="flex-1 overflow-y-auto max-h-[460px] pr-1 space-y-2 custom-scrollbar">
        {isLoadingVoices ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-400 mb-2" />
            <p className="text-xs">Loading neural voices...</p>
          </div>
        ) : filteredVoices.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No voices found matching your criteria.
          </div>
        ) : (
          filteredVoices.map((voice) => {
            const isSelected = selectedVoice?.ShortName === voice.ShortName;
            const isPreviewing = previewingVoice === voice.ShortName;

            return (
              <div
                key={voice.ShortName}
                onClick={() => onSelectVoice(voice)}
                className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-brand-500/10 border-brand-500/60 shadow-md shadow-brand-500/5'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      voice.Gender.toLowerCase() === 'female'
                        ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {voice.Gender === 'Female' ? 'F' : 'M'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-200 truncate group-hover:text-white">
                        {voice.ShortName.split('-').pop()?.replace('Neural', '') || voice.ShortName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {voice.Locale}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preview Button */}
                <button
                  onClick={(e) => handlePreviewVoice(voice, e)}
                  title="Preview Voice"
                  className={`p-2 rounded-lg transition-colors shrink-0 ${
                    isPreviewing
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {isPreviewing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
