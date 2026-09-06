"use client";

import React from "react";
import { Mic2, User, LogOut, AudioWaveform } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hidden md:flex flex-col shrink-0">
      <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm">
            <Mic2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Wellspeak</span>
        </Link>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-8">
          <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Create</p>
          <nav className="space-y-1">
            <Link href="/">
              <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                pathname === '/' 
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white'
              }`}>
                <AudioWaveform className="w-5 h-5" />
                Text to Speech
              </button>
            </Link>
          </nav>
        </div>

        <div>
          <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Account</p>
          <nav className="space-y-1">
            <Link href="/profile">
              <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === '/profile' 
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white'
              }`}>
                <User className="w-5 h-5" />
                Profile
              </button>
            </Link>
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl text-sm font-medium transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </aside>
  );
}
