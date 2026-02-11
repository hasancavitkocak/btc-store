import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../index.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Btc Store - Business Software Solutions',
  description: 'Professional business software solutions',
  metadataBase: new URL('https://btcstore.com'),
  openGraph: {
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
