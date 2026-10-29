// app/error.tsx — galat tak terduga di dalam halaman (pemilik: A)
// Header, menu, dan footer tetap tampil; pengguna bisa mencoba lagi tanpa kehilangan arah.

'use client';

import Ikon from '@/components/ui/Ikon';
import { TautanTombol, Tombol } from '@/components/ui/Tombol';

export default function Galat({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="bingkai pt-10 pb-4 sm:pt-14">
      <div className="kartu mx-auto max-w-2xl p-6 text-center shadow-kartu sm:p-10">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-merah-muda text-merah-tua">
          <Ikon nama="peringatan" className="size-7" />
        </span>
        <h1 className="mt-4 text-judul font-bold">Halaman ini gagal dimuat</h1>
        <p className="mx-auto mt-2 max-w-[52ch] text-badan text-lembut">
          Ada gangguan di sisi kami, bukan kesalahan Anda. Coba muat ulang. Kalau masih gagal, kembali ke Beranda dan ulangi
          sebentar lagi.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Tombol onClick={reset}>Coba lagi</Tombol>
          <TautanTombol href="/" varian="garis">
            Ke Beranda
          </TautanTombol>
        </div>
      </div>
    </div>
  );
}
