"use client";

import React, { useState, useRef } from "react";
import { Voice } from "@/lib/types";
import { getLanguageName } from "@/lib/languages";
import { Search, X, Play, Filter, Globe, ChevronDown, Star, Loader2, Square } from "lucide-react";

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
  const [filterGender, setFilterGender] = useState("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('favoriteVoices');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('favoriteVoices', JSON.stringify(newFavs));
  };
  
  if (!isOpen) return null;

  // Extract unique languages for filter
  const languages = Array.from(new Set(
    voices.map(v => getLanguageName(v.Locale || ""))
  )).sort();

  const filteredVoices = voices.filter(voice => {
    const friendlyName = voice.FriendlyName || "";
    const shortName = voice.ShortName || "";
    const matchesSearch = friendlyName.toLowerCase().includes(search.toLowerCase()) || shortName.toLowerCase().includes(search.toLowerCase());
    const matchesLang = filterLang === "All" || getLanguageName(voice.Locale || "") === filterLang;
    const matchesGender = filterGender === "All" || (voice.Gender || "").toLowerCase() === filterGender.toLowerCase();

    if (showFavoritesOnly && !favorites.includes(shortName)) return false;
    
    return matchesSearch && matchesLang && matchesGender;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border dark:border-slate-800">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select Voice</h2>
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
              <Globe className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={filterLang}
                onChange={e => setFilterLang(e.target.value)}
                className="w-full md:w-48 appearance-none pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 cursor-pointer"
              >
                <option value="All">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={filterGender}
                onChange={e => setFilterGender(e.target.value)}
                className="w-full md:w-40 appearance-none pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 cursor-pointer"
              >
                <option value="All">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center justify-center p-3 w-12 rounded-xl transition-all border ${showFavoritesOnly ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700/50 text-amber-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              title="Show Favorites Only"
            >
              <Star className={`w-5 h-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Voice List */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Showing {filteredVoices.length} of {voices.length} voices
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredVoices.map(voice => {
              const shortName = voice.ShortName || "";
              const cleanName = shortName.split('-').pop()?.replace('Neural', '') || shortName || "Unknown Voice";
              const isSelected = selectedVoiceId === shortName;
              const subtitle = `${getLanguageName(voice.Locale || "")} - ${voice.Gender}`;
              const isFav = favorites.includes(shortName);

              return (
                <div
                  key={shortName}
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
                      <button onClick={(e) => toggleFavorite(shortName, e)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Star className={`w-3.5 h-3.5 ${isFav ? 'text-amber-500 fill-current opacity-100' : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'}`} />
                      </button>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                        Premium
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{subtitle}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current = null;
                        }
                        if (playingId === shortName) {
                          setPlayingId(null);
                          return;
                        }
                        setPlayingId(shortName);
                        try {
                          const res = await fetch('/api/tts', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              text: 'Hello! This is a preview of this voice.',
                              voice: shortName,
                              rate: '+0%',
                              pitch: '+0Hz',
                            }),
                          });
                          if (!res.ok) throw new Error('Failed');
                          const blob = await res.blob();
                          const url = URL.createObjectURL(blob);
                          const audio = new Audio(url);
                          audioRef.current = audio;
                          audio.onended = () => setPlayingId(null);
                          audio.onerror = () => setPlayingId(null);
                          audio.play();
                        } catch {
                          setPlayingId(null);
                        }
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-brand-500 text-white shadow-md' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-brand-500 group-hover:text-white group-hover:shadow-md'
                      }`}
                    >
                      {playingId === shortName 
                        ? <Square className="w-3.5 h-3.5" /> 
                        : <Play className="w-4 h-4 ml-0.5" />
                      }
                    </button>
                  </div>
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
