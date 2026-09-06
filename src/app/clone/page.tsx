"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ClonePage() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleClone = async () => {
    if (!file || !name.trim()) return;

    setIsCloning(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('files', file);
      // We can also add description if needed
      formData.append('description', 'Cloned via Wellspeak UI');

      const res = await fetch('/api/elevenlabs/clone', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to clone voice');
      }

      setSuccess(true);
      setFile(null);
      setName('');
    } catch (err: any) {
      if (err.message?.includes('missing_permissions') || err.message?.includes('unauthorized')) {
        setError('Your ElevenLabs API key does not have permission to clone voices (voices_write). Please upgrade your plan or use an API key with correct permissions.');
      } else {
        setError(err.message || 'Failed to clone voice');
      }
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 md:p-12">
          
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Clone a Voice</h1>
            <p className="text-slate-500 dark:text-slate-400">Upload a clean audio sample of a voice to instantly clone it using ElevenLabs AI. Ensure the audio has no background noise.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">Voice Cloned Successfully!</p>
                <p className="text-sm mt-1">Your new cloned voice is now available in the ElevenLabs Premium voices list on the dashboard.</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Voice Name</label>
              <input
                type="text"
                placeholder="e.g. My Custom Voice"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Audio Sample (MP3/WAV)</label>
              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <input
                  type="file"
                  accept="audio/mp3, audio/wav, audio/mpeg"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {file ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                    <p className="font-medium text-slate-900 dark:text-white">{file.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center pointer-events-none">
                    <UploadCloud className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
                    <p className="font-medium text-slate-900 dark:text-slate-300">Click or drag audio file here</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Max file size: 10MB</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleClone}
              disabled={!file || !name.trim() || isCloning}
              className="w-full py-4 bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              {isCloning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cloning Voice...
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  Clone Voice Now
                </>
              )}
            </button>
            
            <div className="text-center">
              <Link href="/" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                &larr; Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
