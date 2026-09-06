"use client";

import React, { useState } from "react";
import { Voice } from "@/lib/types";
import { getLanguageName } from "@/lib/languages";
import { Search, X, Play, Filter } from "lucide-react";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: Voice[];
  onSelectVoice: (voice: Voice) => void;
  selectedVoiceId?: string;
  provider: 'edge' | 'elevenlabs';
}

export function VoiceModal({ isOpen, onClose, voices, onSelectVoice, selectedVoiceId, provider }: VoiceModalProps) {
  const [search, setSearch] = useState("");
  const [filterLang, setFilterLang] = useState("All");

  if (!isOpen) return null;

  // Extract unique languages/accents for filter
  const languages = Array.from(new Set(
    voices.map(v => provider === 'elevenlabs' ? (v.labels?.accent || "English") : getLanguageName(v.Locale || ""))
  )).sort();

  const filteredVoices = voices.filter(voice => {
    if (provider === 'elevenlabs') {
      const nameMatch = (voice.name || "").toLowerCase().includes(search.toLowerCase());
      const accent = voice.labels?.accent || "English";
      const langMatch = filterLang === "All" || accent === filterLang;
      return nameMatch && langMatch;
    } else {
      const friendlyName = voice.FriendlyName || "";
      const shortName = voice.ShortName || "";
      const nameMatch = friendlyName.toLowerCase().includes(search.toLowerCase()) || shortName.toLowerCase().includes(search.toLowerCase());
      const langMatch = filterLang === "All" || getLanguageName(voice.Locale || "") === filterLang;
      return nameMatch && langMatch;
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border dark:border-slate-800">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select {provider === 'elevenlabs' ? 'ElevenLabs' : 'Edge'} Voice</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Search, filter, and choose a voice for this generation.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search voices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
            <div className="relative">
              <select
                value={filterLang}
                onChange={(e) => setFilterLang(e.target.value)}
                className="appearance-none pl-10 pr-10 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
              >
                <option value="All">All {provider === 'elevenlabs' ? 'Accents' : 'Languages'}</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          
          <p className="text-xs font-medium text-slate-400">
            Showing {filteredVoices.length} of {voices.length} voices
          </p>
        </div>

        {/* Voice List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-950">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredVoices.map(voice => {
              
              let cleanName = "";
              let isSelected = false;
              let subtitle = "";
              let key = "";

              if (provider === 'elevenlabs') {
                cleanName = voice.name || "Unknown";
                isSelected = selectedVoiceId === voice.voice_id;
                key = voice.voice_id || cleanName;
                const accent = voice.labels?.accent || "English";
                const gender = voice.labels?.gender || "Unknown";
                subtitle = `${accent} - ${gender}`;
              } else {
                const shortName = voice.ShortName || "";
                cleanName = shortName.split('-').pop()?.replace('Neural', '') || shortName || "Unknown Voice";
                isSelected = selectedVoiceId === shortName;
                key = shortName;
                subtitle = `${getLanguageName(voice.Locale || "")} - ${voice.Gender}`;
              }
              
              return (
                <div
                  key={key}
                  onClick={() => {
                    onSelectVoice(voice);
                    onClose();
                  }}
                  className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                    isSelected 
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm' 
                      : 'bg-white dark:bg-slate-900 border-transparent dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white">{cleanName}</h3>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${provider === 'elevenlabs' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                        {provider === 'elevenlabs' ? 'PRO' : 'Premium'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {subtitle}
                    </p>
                  </div>
                  
                  <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white">
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </button>
                </div>
              );
            })}
          </div>
          
          {filteredVoices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No voices found matching your criteria.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
