'use client';

import React from 'react';
import { HistoryItem } from '@/lib/types';
import { History, Play, Trash2, Download, Clock } from 'lucide-react';

interface HistoryListProps {
  history: HistoryItem[];
  onPlayHistoryItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onPlayHistoryItem,
  onDeleteItem,
  onClearAll,
}) => {
  if (history.length === 0) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Generation History</h2>
            <p className="text-xs text-slate-400">Recently synthesized voiceovers</p>
          </div>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors"
        >
          Clear History
        </button>
      </div>

      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => onPlayHistoryItem(item)}
                className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500 hover:text-white flex items-center justify-center transition-all shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {item.voiceShortName.split('-').pop()?.replace('Neural', '') || item.voiceShortName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {item.text}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <a
                href={item.audioUrl}
                download={`EdgeTTS_${item.voiceShortName}.mp3`}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => onDeleteItem(item.id)}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
