"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@/components/Sidebar';
import { User, Mail, CreditCard, Clock, Activity, Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Please sign in</h1>
        <Link href="/">
          <button className="px-4 py-2 bg-brand-500 text-white rounded-lg">Go Home</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white dark:bg-slate-950 shrink-0">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Profile</h1>
          <ThemeToggle />
        </header>

        <div className="p-8 max-w-4xl w-full mx-auto space-y-8">
          
          <div className="flex items-center gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-brand-100 dark:bg-brand-900/30 border-4 border-white dark:border-slate-800 shadow-lg">
              {session?.user?.image ? (
                <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-brand-600 dark:text-brand-400">
                  {session?.user?.name?.[0] || 'U'}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{session?.user?.name}</h2>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-1">
                <Mail className="w-4 h-4" />
                <span>{session?.user?.email}</span>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-lg border border-amber-200 dark:border-amber-800/50">
                <Zap className="w-3.5 h-3.5" /> Pro Plan
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">Generated</h3>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">124</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">audio files created</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">Time Saved</h3>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">4.2h</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">reading equivalent</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
