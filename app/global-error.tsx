// app/global-error.tsx — galat di layout akar; menggantikan seluruh halaman (pemilik: A)
// Layout akar tidak tersedia di sini, jadi gaya dimuat ulang dan tombol memakai elemen dasar.

'use client';

import './globals.css';

export default function GalatGlobal({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body className="bingkai py-16 sm:py-24">
        <h1 className="text-judul">suaRAkyat sedang bermasalah</h1>
        <p className="mt-4 max-w-[52ch] text-badan">Muat ulang halaman. Kalau masih gagal, coba lagi beberapa menit lagi.</p>
        <button type="button" onClick={reset} className="mt-8 min-h-12 rounded-(--radius-kontrol) bg-tinta px-6 font-semibold text-kertas">
          Coba lagi
        </button>
      </body>
    </html>
  );
}
