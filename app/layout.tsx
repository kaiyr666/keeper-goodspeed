'use client';
import { SessionProvider } from 'next-auth/react';
import { TopNav } from '@/components/layout/TopNav';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <TopNav />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
