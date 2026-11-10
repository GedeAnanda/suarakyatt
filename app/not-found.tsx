// app/not-found.tsx — halaman tidak ditemukan (pemilik: A)

import CariKode from '@/components/CariKode';
import Ikon from '@/components/ui/Ikon';
import { TautanTombol } from '@/components/ui/Tombol';

export default function TidakDitemukan() {
  return (
    <div className="bingkai pt-10 pb-4 sm:pt-14">
      <div className="kartu mx-auto max-w-2xl p-6 text-center shadow-kartu sm:p-10">
        <p className="angka text-[clamp(4.5rem,3rem+6vw,8rem)] leading-none font-bold tracking-[-0.04em] text-biru">404</p>
        <h1 className="mt-3 text-judul font-bold">Halaman ini tidak ada</h1>
        <p className="mx-auto mt-2 max-w-[52ch] text-badan text-lembut">
          Tautannya mungkin salah ketik atau sudah dipindah. Kalau Anda mencari laporan, masukkan kodenya di bawah.
        </p>
        <CariKode id="kode-404" className="mt-6 text-left" />
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <TautanTombol href="/">
            <Ikon nama="rumah" className="size-4" />
            Ke Beranda
          </TautanTombol>
          <TautanTombol href="/prioritas" varian="garis">
            Dashboard prioritas
          </TautanTombol>
        </div>
      </div>
    </div>
  );
}
