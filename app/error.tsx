// app/error.tsx — galat tak terduga di dalam halaman (pemilik: A)
// Header dan footer tetap tampil; pengguna bisa mencoba lagi tanpa kehilangan arah.

'use client';

import { TautanTombol, Tombol } from '@/components/ui/Tombol';

export default function Galat({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="bingkai py-16 sm:py-24" data-awal>
      <h1 className="text-judul">Halaman ini gagal dimuat</h1>
      <p className="mt-4 max-w-[52ch] text-badan">
        Ada gangguan di sisi kami, bukan kesalahan Anda. Coba muat ulang. Kalau masih gagal, kembali ke Beranda dan ulangi
        sebentar lagi.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Tombol onClick={reset}>Coba lagi</Tombol>
        <TautanTombol href="/" varian="kedua">
          Ke Beranda
        </TautanTombol>
      </div>
    </div>
  );
}
