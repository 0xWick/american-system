import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import Provider from './provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL('https://wasuli.umarkhatana.com'),
  title: { default: 'Wasuli Bhai: settle up with friends', template: '%s · Wasuli Bhai' },
  description:
    'Keep a khata with every friend, send receipts for what they owe, and let your reputation do the asking. Try it instantly as a test user.',
  openGraph: {
    title: 'Wasuli Bhai: settle up with friends',
    description: 'Keep a khata with every friend, send receipts, and see who pays up in the rankings.',
    images: ['/1647338689295.jpeg'],
  },
};

export const viewport: Viewport = { themeColor: '#6441A5' };

export default function RootLayout({ children }: { children: ReactNode }) {
  // The provider sits inside <body>: wrapping <body> breaks hydration.
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
