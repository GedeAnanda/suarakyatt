// app/laporan/[kode]/not-found.tsx — kode tidak ditemukan, dengan kolom cari (SDD 11.1), pemilik: A

import Link from 'next/link';
import CariKode from '@/components/CariKode';
import Ikon from '@/components/ui/Ikon';
import { kelasTombol } from '@/components/ui/Tombol';

export default function LaporanTidakAda() {
  return (
    <div className="bingkai pt-10 pb-4 sm:pt-14">
      <div className="kartu mx-auto max-w-2xl p-6 text-center shadow-kartu sm:p-10">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-biru-muda text-biru-tua">
          <Ikon nama="lacak" className="size-7" />
        </span>
        <h1 className="mt-4 text-judul font-bold">Kode laporan tidak ditemukan</h1>
        <p className="mx-auto mt-2 max-w-[56ch] text-badan text-lembut">
          Periksa kembali kodenya: SR- lalu 6 huruf atau angka. Kode tidak memakai huruf O dan I, juga angka 0 dan 1, supaya
          tidak tertukar saat dibaca. Laporan yang dibatalkan pelapor juga tidak tampil.
        </p>
        <CariKode id="kode-tidak-ada" className="mt-6 text-left" />
        <Link href="/peta" className={kelasTombol('garis', 'mt-5')}>
          <Ikon nama="peta" className="size-4" />
          Cari laporan di peta
        </Link>
      </div>
    </div>
  );
}
