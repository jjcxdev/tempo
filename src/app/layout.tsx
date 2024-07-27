"use client";

import { useEffect } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Head from 'next/head';
import SessionProviderWrapper from '@/app/providers/SessionProviderWrapper';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.log('Service Worker registration failed', error);
        });
    }
  }, []);

  return (
    <html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body className={inter.className}>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
