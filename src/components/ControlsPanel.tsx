'use client';

import React from 'react';
import { Sliders, Gauge, Music2, RotateCcw, Volume2 } from 'lucide-react';

interface ControlsPanelProps {
  rate: number; // -50 to 100
  setRate: (rate: number) => void;
  pitch: number; // -50 to 50
  setPitch: (pitch: number) => void;
  volume: number; // 0 to 100
  setVolume: (volume: number) => void;
  audioFormat: string;
  setAudioFormat: (format: string) => void;
  onReset: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  rate,
  setRate,
  pitch,
  setPitch,
  volume,
  setVolume,
  audioFormat,
  setAudioFormat,
  onReset,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Speech Tuning</h2>
            <p className="text-xs text-slate-400">Fine-tune pace, pitch, and acoustics</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          title="Reset parameters to default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Speed / Rate */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-brand-400" />
              Speaking Speed
            </span>
            <span className="font-mono text-brand-400">
              {rate > 0 ? `+${rate}%` : `${rate}%`}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="100"
            step="5"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
          />
          <div className="flex justify-between items-center gap-1 mt-2">
            {[-25, 0, 25, 50, 75].map((preset) => (
              <button
                key={preset}
                onClick={() => setRate(preset)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  rate === preset
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset === 0 ? '1.0x' : `${preset > 0 ? '+' : ''}${preset}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Pitch */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Music2 className="w-3.5 h-3.5 text-purple-400" />
              Voice Pitch
            </span>
            <span className="font-mono text-purple-400">
              {pitch > 0 ? `+${pitch}Hz` : `${pitch}Hz`}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="2"
            value={pitch}
            onChange={(e) => setPitch(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        {/* Volume */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              Audio Output Volume
            </span>
            <span className="font-mono text-emerald-400">{volume}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Format Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Audio Format & Quality
          </label>
          <select
            value={audioFormat}
            onChange={(e) => setAudioFormat(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="audio-24khz-48kbitrate-mono-mp3">MP3 Standard (24kHz, 48kbps)</option>
            <option value="audio-48khz-96kbitrate-mono-mp3">MP3 HD High Quality (48kHz, 96kbps)</option>
            <option value="webm-24khz-16bit-mono-opus">WebM Opus (24kHz)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
