import type { Metadata } from 'next';
import './globals.css';
import { NavBar } from '@/components/NavBar';
import { SyntheticDataBanner } from '@/components/SyntheticDataBanner';

export const metadata: Metadata = {
  title: 'Compensation Intelligence System',
  description: 'Structured, comparable compensation data by company, role, level, and location.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans text-ink antialiased">
        <SyntheticDataBanner />
        <NavBar />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
