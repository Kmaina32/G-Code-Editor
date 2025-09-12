'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { useStore } from '@/lib/store';
import { useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

// No longer exporting metadata as this is a client component.
// You can move this to a layout file further up if needed.
// export const metadata: Metadata = {
//   title: 'CodePilot',
//   description: 'A web-based code editor app.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { extensions } = useStore();
  const activeTheme = useMemo(() => {
    const installedTheme = extensions.find(
      (ext) => ext.type === 'theme' && ext.installed
    );
    return installedTheme ? installedTheme.id : 'dark';
  }, [extensions]);

  useEffect(() => {
    document.documentElement.className = '';
    document.documentElement.classList.add(activeTheme);
  }, [activeTheme]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>CodePilot</title>
        <meta name="description" content="A web-based code editor app." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased', activeTheme)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
