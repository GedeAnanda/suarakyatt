import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Suspense } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Pengumuman from '@/components/Pengumuman';
import { SisiNav, SisiNavStatis } from '@/components/Sisi';
import TombolMelayang from '@/components/TombolMelayang';
import './globals.css';

// Satoshi: huruf seluruh situs (UI, judul, wordmark, kode laporan). Dari Fontshare (ITF Free Font License,
// app/fonts/LICENSE-FFL.txt), di-host sendiri.
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
  themeColor: '#ffffff',
  // Isi sampai tepi layar iPhone; tepi teks dijaga lewat env(safe-area-inset-*) di .bingkai dan footer.
  viewportFit: 'cover',
};

// Kerangka seperti situs travel: header putih di atas, menu samping berikon di kiri, isi dan footer di kanan.
// Status menu ada di atribut <html> (data-sisi, data-laci) yang diubah di browser, karena itu suppressHydrationWarning.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className={`${satoshi.variable} antialiased`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a
          href="#isi"
          className="sr-only z-2000 rounded-kontrol bg-biru px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Lewati ke isi
        </a>
        <Header />
        <div className="rangka">
          <Suspense fallback={<SisiNavStatis />}>
            <SisiNav />
          </Suspense>
          <div className="rangka-isi">
            <main id="isi" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </div>
        <TombolMelayang />
        <Pengumuman />
      </body>
    </html>
  );
}
