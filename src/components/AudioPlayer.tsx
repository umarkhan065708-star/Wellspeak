"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string | null;
  textSnippet: string;
  voiceName: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  textSnippet,
  voiceName,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handlePlaybackRateChange = () => {
    if (!audioRef.current) return;
    const rates = [1.0, 1.25, 1.5, 2.0, 0.75];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    audioRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    const cleanSnippet = textSnippet.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `Wellspeak_${voiceName.split(' ')[0]}_${cleanSnippet}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!audioUrl) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-500 dark:text-slate-400">
        <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600 animate-pulse" />
        <p className="text-xs">Audio output player will appear here once generated.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
      <audio ref={audioRef} src={audioUrl} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-end gap-1 h-6 w-8 px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className={`w-1 bg-slate-800 dark:bg-brand-500 rounded-full transition-all ${isPlaying ? 'animate-equalizer-1' : 'h-1.5'}`} />
            <span className={`w-1 bg-slate-800 dark:bg-brand-500 rounded-full transition-all ${isPlaying ? 'animate-equalizer-2' : 'h-3'}`} />
            <span className={`w-1 bg-slate-800 dark:bg-brand-500 rounded-full transition-all ${isPlaying ? 'animate-equalizer-3' : 'h-2'}`} />
            <span className={`w-1 bg-slate-800 dark:bg-brand-500 rounded-full transition-all ${isPlaying ? 'animate-equalizer-4' : 'h-1'}`} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{voiceName}</span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold">
                Neural Output
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs md:max-w-md">
              "{textSnippet}"
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs rounded-xl transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download MP3</span>
        </button>
      </div>

      <div className="space-y-1.5 mb-4">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-brand-500"
        />
        <div className="flex justify-between text-[11px] font-bold text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-500 text-white flex items-center justify-center shadow-sm transition-all transform active:scale-95"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={handlePlaybackRateChange}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors"
          >
            {playbackRate}x
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
