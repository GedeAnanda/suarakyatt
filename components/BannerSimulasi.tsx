// components/BannerSimulasi.tsx — pemberitahuan data simulasi (SDD 9, 9.1), pemilik: A
// Tidak bisa ditutup (PRD 11).

import Link from 'next/link';
import type { Sumber } from '@/lib/data/laporan';
import Ikon from './ui/Ikon';
import { kelasTautan } from './ui/Tombol';

export default function BannerSimulasi({ sumber, className = '' }: { sumber?: Sumber; className?: string }) {
  return (
    <aside role="note" className={`flex gap-3 rounded-(--radius-kontrol) bg-tinta-muda/70 px-4 py-3 text-kecil text-teks sm:items-center ${className}`}>
      <Ikon nama="info" className="mt-0.5 size-4 sm:mt-0" />
      <p>
        <strong className="font-semibold">Data simulasi.</strong> Laporan, instansi, dan angka kinerja di halaman ini
        dibuat untuk lomba dan bukan data resmi pemerintah.
        {sumber === 'contoh' && ' Sementara ini halaman memakai data contoh bawaan aplikasi.'}{' '}
        <Link href="/sumber-data" className={kelasTautan}>
          Lihat sumber data
        </Link>
      </p>
    </aside>
  );
}
