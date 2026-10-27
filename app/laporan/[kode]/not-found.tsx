// app/laporan/[kode]/not-found.tsx — kode tidak ditemukan, dengan kolom cari (SDD 11.1), pemilik: A

import Link from 'next/link';
import CariKode from '@/components/CariKode';
import { kelasTautan } from '@/components/ui/Tombol';

export default function LaporanTidakAda() {
  return (
    <div className="bingkai py-16 sm:py-24" data-awal>
      <h1 className="text-judul">Kode laporan tidak ditemukan</h1>
      <p className="mt-4 max-w-[56ch] text-badan">
        Periksa kembali kodenya: SR- lalu 6 huruf atau angka. Kode tidak memakai huruf O dan I, juga angka 0 dan 1, supaya
        tidak tertukar saat dibaca. Laporan yang dibatalkan pelapor juga tidak tampil.
      </p>
      <CariKode id="kode-tidak-ada" besar className="mt-8 max-w-xl" />
      <p className="mt-8 text-badan">
        <Link href="/peta" className={kelasTautan}>
          Cari laporan di peta
        </Link>
      </p>
    </div>
  );
}
