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
}

export function VoiceModal({ isOpen, onClose, voices, onSelectVoice, selectedVoiceId }: VoiceModalProps) {
  const [search, setSearch] = useState("");
  const [filterLang, setFilterLang] = useState("All");

  if (!isOpen) return null;

  // Extract unique languages for filter
  const languages = Array.from(new Set(voices.map(v => getLanguageName(v.Locale)))).sort();

  const filteredVoices = voices.filter(voice => {
    const nameMatch = voice.FriendlyName.toLowerCase().includes(search.toLowerCase()) || voice.ShortName.toLowerCase().includes(search.toLowerCase());
    const langMatch = filterLang === "All" || getLanguageName(voice.Locale) === filterLang;
    return nameMatch && langMatch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Select premium voice</h2>
            <p className="text-sm text-slate-500">Search, filter, and choose a voice for this generation.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search voices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <div className="relative">
              <select
                value={filterLang}
                onChange={(e) => setFilterLang(e.target.value)}
                className="appearance-none pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all text-slate-700 font-medium cursor-pointer"
              >
                <option value="All">All Languages</option>
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
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredVoices.map(voice => {
              const cleanName = voice.ShortName.split('-').pop()?.replace('Neural', '') || voice.ShortName;
              const isSelected = selectedVoiceId === voice.ShortName;
              
              return (
                <div
                  key={voice.ShortName}
                  onClick={() => {
                    onSelectVoice(voice);
                    onClose();
                  }}
                  className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                    isSelected 
                      ? 'bg-slate-100 border-slate-300 shadow-sm' 
                      : 'bg-white border-transparent hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900">{cleanName}</h3>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                        Premium
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {getLanguageName(voice.Locale)} - {voice.Gender}
                    </p>
                  </div>
                  
                  <button className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-200 hover:text-slate-900">
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
