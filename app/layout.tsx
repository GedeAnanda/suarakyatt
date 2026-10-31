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
  // Tanpa SITE_URL, Next.js memakai domain Vercel (VERCEL_PROJECT_PRODUCTION_URL), atau localhost saat lokal.
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  title: { default: 'SUARAKYAT · Kenapa belum?', template: '%s · SUARAKYAT' },
  description:
    'Kanal pengaduan sudah melacak laporan. SUARAKYAT membuka alasan di balik keputusan: kenapa satu masalah kota didahulukan, dan siapa saja bisa mengujinya.',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  // Isi sampai tepi layar iPhone; tepi teks dijaga lewat env(safe-area-inset-*) di .bingkai dan footer.
  viewportFit: 'cover',
};

// Kerangka seperti situs travel: header putih di atas, menu samping berikon di kiri, isi dan footer di kanan.
// Status menu ada di atribut <html> (data-sisi, data-laci) yang diubah di browser, karena itu suppressHydrationWarning.
// data-scroll-behavior: tautan jangkar di halaman yang sama bergulir halus (globals.css), tetapi Next.js mematikannya
// sementara saat pindah halaman supaya halaman baru langsung mulai dari atas.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className={`${satoshi.variable} antialiased`} data-scroll-behavior="smooth" suppressHydrationWarning>
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
