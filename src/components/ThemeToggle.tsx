"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse"></div>;
  }

  return (
    <div className="relative group">
      <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400">
        {theme === 'dark' ? <Moon className="w-4 h-4" /> : theme === 'light' ? <Sun className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
      </button>
      
      <div className="absolute right-0 top-12 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50 transform origin-top-right scale-95 group-hover:scale-100">
        <button onClick={() => setTheme('light')} className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${theme === 'light' ? 'text-brand-500 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
          <Sun className="w-4 h-4" /> Light
        </button>
        <button onClick={() => setTheme('dark')} className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${theme === 'dark' ? 'text-brand-500 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
          <Moon className="w-4 h-4" /> Dark
        </button>
        <button onClick={() => setTheme('system')} className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${theme === 'system' ? 'text-brand-500 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
          <Monitor className="w-4 h-4" /> System
        </button>
      </div>
    </div>
  );
}
