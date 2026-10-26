import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Pengumuman from '@/components/Pengumuman';
import './globals.css';

// Plus Jakarta Sans: huruf yang dibuat untuk identitas kota Jakarta (PRD 11).
const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'suaRAkyat · Kenapa belum?', template: '%s · suaRAkyat' },
  description:
    'Kanal pengaduan sudah melacak laporan. suaRAkyat membuka alasan di balik keputusan: kenapa satu masalah kota didahulukan, dan siapa saja bisa mengujinya.',
};

export const viewport: Viewport = {
  themeColor: '#ececeb',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`}>
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
        <Pengumuman />
      </body>
    </html>
  );
}
