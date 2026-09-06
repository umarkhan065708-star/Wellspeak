"use client";

import React from "react";
import { Mic2, User, Settings, Type, Waves, UploadCloud, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  provider?: 'edge' | 'elevenlabs';
  setProvider?: (provider: 'edge' | 'elevenlabs') => void;
}

export function Sidebar({ provider = 'elevenlabs', setProvider }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between py-6 sticky top-0 shrink-0">
      <div>
        <div className="px-6 mb-8 flex items-center gap-2">
          <div className="bg-brand-500 p-1.5 rounded-lg text-white">
            <Mic2 className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">Wellspeak</span>
        </div>

        <div className="px-4">
          <p className="text-xs font-bold text-slate-400 mb-3 px-2 uppercase tracking-wider">Create</p>
          <div className="space-y-1">
            {setProvider ? (
              <>
                <button 
                  onClick={() => setProvider('edge')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${provider === 'edge' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                >
                  <Type className="w-5 h-5" />
                  Edge TTS
                </button>
                <button 
                  onClick={() => setProvider('elevenlabs')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${provider === 'elevenlabs' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                >
                  <div className="flex items-center gap-3">
                    <Waves className="w-5 h-5" />
                    Eleven Labs
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">PRO</span>
                </button>
              </>
            ) : (
              <Link href="/">
                <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${pathname === '/' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                  <Waves className="w-5 h-5" />
                  Text to Speech
                </button>
              </Link>
            )}
            
            <Link href="/clone">
              <button className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors mt-1 ${pathname === '/clone' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                <div className="flex items-center gap-3">
                  <UploadCloud className="w-5 h-5" />
                  Voice Cloning
                </div>
              </button>
            </Link>
          </div>
        </div>

        <div className="px-4 mt-8">
          <p className="text-xs font-semibold text-slate-400 mb-3 px-2 uppercase tracking-wider">Account</p>
          <div className="space-y-1">
            <Link href="/profile">
              <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${pathname === '/profile' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                <User className="w-5 h-5" />
                Profile
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-1">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl font-medium transition-colors mt-4"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </div>
  );
}
