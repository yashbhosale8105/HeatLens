import './globals.css';
import type { Metadata } from 'next';
import { Fraunces, Source_Sans_3 } from 'next/font/google';
import { Providers } from './providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollReset } from '@/components/ScrollReset';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

const sans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'HeatLens — Thane City heat watch',
  description: 'Surface temperature, weather, and neighbourhood heat ranks for Thane City.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.addEventListener('keydown',function(e){if(e.key!=='Escape')return;document.querySelectorAll('.nav-toggle-input:checked').forEach(function(el){el.checked=false;});},true);",
          }}
        />
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <Providers>
          <ScrollReset />
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
