import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { CookieNotice } from '@/components/cookie-notice';
import './globals.css';

const manrope = localFont({ src: '../assets/fonts/Manrope.ttf', variable: '--font-manrope', weight: '200 800', display: 'swap' });
const dmSans = localFont({ src: '../assets/fonts/DMSans.ttf', variable: '--font-dm-sans', weight: '100 1000', display: 'swap' });

export const metadata: Metadata = {
  title: 'Rinjo — Drive beyond the expected',
  description: 'Rinjo is booking software in development for car rental operators in Lagos and Abuja. Explore the current planning experience.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${dmSans.variable}`}>{children}<CookieNotice /></body>
    </html>
  );
}
