import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

// Fraunces is variable: omit `weight` so all weights load, then expose extra axes.
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  axes: ['opsz', 'SOFT', 'WONK'],
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Treepoint Consultants. Considered arboriculture for considered places',
  description:
    'Treepoint Consultants is an independent arboricultural practice based in London, working across the south of England and south Wales. BSc (Hons), Tech Cert (ArborA).',
  authors: [{ name: 'Treepoint Consultants' }],
  openGraph: {
    title: 'Treepoint Consultants',
    description:
      'Considered arboriculture for considered places. London-based arboricultural consultancy.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f2620',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
