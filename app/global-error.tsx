// app/global-error.tsx — galat di layout akar; menggantikan seluruh halaman (pemilik: A)
// Layout akar tidak tersedia di sini, jadi gaya dimuat ulang dan tombol memakai elemen dasar.

'use client';

import './globals.css';

export default function GalatGlobal({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body className="bingkai py-16 sm:py-24">
        <div className="kartu mx-auto max-w-xl p-8 text-center">
          <h1 className="text-judul font-bold">SUARAKYAT sedang bermasalah</h1>
          <p className="mt-3 text-badan text-lembut">
            Ada gangguan di sisi kami, bukan kesalahanmu. Muat ulang halaman. Kalau masih gagal, coba lagi beberapa menit lagi.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={reset} className="min-h-12 rounded-kontrol bg-biru px-6 font-bold text-white hover:bg-biru-tua">
              Coba lagi
            </button>
            {/* Tautan biasa, bukan <Link>: muat penuh supaya layout akar yang gagal ikut dimuat ulang. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="inline-flex min-h-12 items-center rounded-kontrol border border-garis-isian bg-permukaan px-6 font-bold text-teks hover:border-biru hover:text-biru-tua"
            >
              Ke Beranda
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
