// app/not-found.tsx — halaman tidak ditemukan (pemilik: A)

import CariKode from '@/components/CariKode';
import TeksRakit from '@/components/ui/TeksRakit';
import { TautanTombol } from '@/components/ui/Tombol';

export default function TidakDitemukan() {
  return (
    <div className="bingkai py-16 sm:py-24" data-awal>
      {/* Angka 404 dirakit seperti judul Beranda: halamannya hilang, hurufnya mencari tempat. */}
      <p aria-hidden="true" className="text-tinta angka text-[clamp(6rem,4rem+10vw,14rem)] leading-[0.8] font-semibold tracking-[-0.06em]">
        <TeksRakit teks="404" sebar={0.7} />
      </p>
      <h1 className="mt-6 text-judul">Halaman ini tidak ada</h1>
      <p className="mt-4 max-w-[52ch] text-badan">
        Tautannya mungkin salah ketik atau sudah dipindah. Kalau Anda mencari laporan, masukkan kodenya di bawah.
      </p>
      <CariKode id="kode-404" besar className="mt-8 max-w-xl" />
      <div className="mt-8 flex flex-wrap gap-3">
        <TautanTombol href="/">Ke Beranda</TautanTombol>
        <TautanTombol href="/prioritas" varian="kedua">
          Dashboard prioritas
        </TautanTombol>
      </div>
    </div>
  );
}
