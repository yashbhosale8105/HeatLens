import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { TopNav } from '@/components/layout/TopNav';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'HeatLens 🌡️📡 - Thane City Heat Risk Analytics',
  description: 'Satellite-powered Land Surface Temperature monitoring and micro-grid heat analytics platform for Thane City, Maharashtra.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
        <Providers>
          <TopNav />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
