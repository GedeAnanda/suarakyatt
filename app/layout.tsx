import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import './globals.css';

// Author: huruf utama seluruh situs. Satoshi: hanya wordmark di header.
// Keduanya dari Fontshare (ITF Free Font License, app/fonts/LICENSE-FFL.txt), di-host sendiri.
const author = localFont({
  src: './fonts/Author-Variable.woff2',
  variable: '--font-author',
  weight: '200 700',
  display: 'swap',
});

const satoshi = localFont({
  src: './fonts/Satoshi-Variable.woff2',
  variable: '--font-satoshi',
  weight: '300 900',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'suaRAkyat · Kenapa belum?', template: '%s · suaRAkyat' },
  description:
    'Kanal pengaduan sudah melacak laporan. suaRAkyat membuka alasan di balik keputusan: kenapa satu masalah kota didahulukan, dan siapa saja bisa mengujinya.',
};

export const viewport: Viewport = {
  themeColor: '#e2e2e2',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className={`${author.variable} ${satoshi.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <a
          href="#isi"
          className="sr-only z-2000 bg-tinta px-4 py-3 text-kertas focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Lewati ke isi
        </a>
        <Header />
        <main id="isi" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
