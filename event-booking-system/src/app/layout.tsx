import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Zen_Kaku_Gothic_New } from 'next/font/google';
import './globals.css';

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ÉVÉNEMENTS — イベント予約',
  description: 'プレミアムイベントの予約・管理システム',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={zenKaku.variable}>
      <body>{children}</body>
    </html>
  );
}
