'use client';

import React from 'react';
import { SamplePrompt } from '@/lib/types';
import { Sparkles, BookOpen, Megaphone, Bot, Mic } from 'lucide-react';

const SAMPLE_PROMPTS: SamplePrompt[] = [
  {
    id: '1',
    title: 'AI Tech Showcase',
    category: 'Tech',
    text: 'Welcome to VoiceCraft Studio, powered by advanced Microsoft Edge Neural Text-to-Speech models. Experience crystal clear, natural human speech with customizable pitch, speed, and expression.',
  },
  {
    id: '2',
    title: 'Audiobook Storytelling',
    category: 'Story',
    text: 'Deep in the heart of the ancient forest, beneath towering oaks that had stood for centuries, a subtle glow illuminated the path ahead. Elena stepped forward, her heart racing with anticipation.',
  },
  {
    id: '3',
    title: 'Product Commercial',
    category: 'Commercial',
    text: 'Introducing the all-new UltraSound Headset. Experience pure immersive audio clarity, zero noise cancellation lag, and 48-hour continuous battery life. Upgrade your sound today!',
  },
  {
    id: '4',
    title: 'Interactive E-Learning',
    category: 'Educational',
    text: 'In today\'s chapter, we will explore quantum computing and how subatomic particles exist in multiple states simultaneously, revolutionizing cryptography and modern data processing.',
  },
  {
    id: '5',
    title: 'Casual Conversation',
    category: 'Conversational',
    text: 'Hey there! How is your day going? I was just thinking we should grab a coffee later and discuss our plans for the upcoming weekend getaway.',
  },
];

interface SamplePromptsProps {
  onSelectPrompt: (promptText: string) => void;
}

export const SamplePrompts: React.FC<SamplePromptsProps> = ({ onSelectPrompt }) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'Tech': return <Bot className="w-3.5 h-3.5 text-blue-400" />;
      case 'Story': return <BookOpen className="w-3.5 h-3.5 text-purple-400" />;
      case 'Commercial': return <Megaphone className="w-3.5 h-3.5 text-amber-400" />;
      case 'Educational': return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
      default: return <Mic className="w-3.5 h-3.5 text-pink-400" />;
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-brand-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sample Prompts</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onSelectPrompt(prompt.text)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-brand-500/50 rounded-lg text-xs text-slate-300 hover:text-white transition-all duration-200 shadow-sm"
          >
            {getIcon(prompt.category)}
            <span>{prompt.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
