import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WellSpeak - AI Voice & Text to Speech Tool',
  description:
    'WellSpeak is an AI voice and text-to-speech tool that lets you create natural-sounding AI voices and convert text into speech online.',
  metadataBase: new URL('https://wellspeak.vercel.app'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: 'WellSpeak - AI Voice & Text to Speech Tool',
    description:
      'WellSpeak is an AI voice and text-to-speech tool that lets you create natural-sounding AI voices and convert text into speech online.',
    url: 'https://wellspeak.vercel.app',
    siteName: 'WellSpeak',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WellSpeak - AI Voice & Text to Speech Tool',
    description:
      'WellSpeak is an AI voice and text-to-speech tool that lets you create natural-sounding AI voices and convert text into speech online.',
  },
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
