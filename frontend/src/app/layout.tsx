import type { Metadata } from 'next';
import { DataProvider } from '@/components/provider';
import { Shell } from '@/components/shell';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevJourney | Your path into tech',
  description: 'A gamified, adaptive software engineering learning platform for every background.',
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><DataProvider><Shell>{children}</Shell></DataProvider></body></html>;
}
