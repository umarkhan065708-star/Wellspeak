import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Wellspeak - Next-Gen Neural TTS',
  description: 'Give your words a famous voice. Turn any script into stunning, lifelike speech with Wellspeak.',
  verification: {
    google: 'XJNi2kvEKYGdyoZs4ABZRVQemOtBiP8w0I_CdLC1LK8',
  },
};

import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/AuthProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased selection:bg-brand-500 selection:text-white`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
