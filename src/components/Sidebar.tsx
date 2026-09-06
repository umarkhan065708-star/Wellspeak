"use client";

import React from "react";
import { Mic2, User, HelpCircle, Code, LogOut, Settings, MessageSquare, Volume2 } from "lucide-react";
import { signOut } from "next-auth/react";

export function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col justify-between py-6 sticky top-0">
      <div>
        <div className="px-6 mb-8 flex items-center gap-2">
          <Mic2 className="w-7 h-7 text-slate-900" />
          <span className="font-bold text-xl text-slate-900 tracking-tight">Wellspeak</span>
        </div>

        <div className="px-4">
          <p className="text-xs font-semibold text-slate-400 mb-3 px-2 uppercase tracking-wider">Create</p>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-slate-100 text-slate-900 rounded-xl font-medium transition-colors">
              <Volume2 className="w-5 h-5" />
              Text to Speech
            </button>
            <button className="w-full flex items-center justify-between px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <Mic2 className="w-5 h-5" />
                Voice Cloning
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">BETA</span>
            </button>
          </div>
        </div>

        <div className="px-4 mt-8">
          <p className="text-xs font-semibold text-slate-400 mb-3 px-2 uppercase tracking-wider">Account</p>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
              <User className="w-5 h-5" />
              Profile
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
          <HelpCircle className="w-5 h-5" />
          Support
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
          <Code className="w-5 h-5" />
          API Keys
        </button>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors mt-4"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </div>
  );
}
