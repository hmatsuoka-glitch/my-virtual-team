import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Shippori_Mincho, Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const display = Shippori_Mincho({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ÉVÉNEMENTS — イベント予約',
  description: 'プレミアムイベントの予約・管理システム',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
