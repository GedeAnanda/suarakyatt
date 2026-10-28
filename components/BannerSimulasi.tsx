// components/BannerSimulasi.tsx — pemberitahuan data simulasi (SDD 9, 9.1), pemilik: A
// Tidak bisa ditutup (PRD 11). Satu-satunya label sumber di kepala halaman: keterangan halaman (periode,
// jumlah laporan, bobot yang berlaku) ikut di dalamnya, bukan di chip terpisah.

import Link from 'next/link';
import type { Sumber } from '@/lib/data/laporan';
import Ikon from './ui/Ikon';
import { kelasTautan } from './ui/Tombol';

export default function BannerSimulasi({
  sumber,
  keterangan,
  className = '',
}: {
  sumber?: Sumber;
  keterangan?: string;
  className?: string;
}) {
  return (
    <aside role="note" className={`flex gap-3 rounded-(--radius-kontrol) bg-tinta-muda/70 px-4 py-3 text-kecil text-teks ${className}`}>
      <Ikon nama="info" className="mt-0.5 size-4 shrink-0" />
      <div>
        <p>
          <strong className="font-semibold">{sumber === 'contoh' ? 'Data contoh.' : 'Data simulasi.'}</strong> Laporan,
          instansi, dan angka kinerja di halaman ini dibuat untuk lomba dan bukan data resmi pemerintah.
          {sumber === 'contoh' && ' Sementara ini halaman memakai data contoh bawaan aplikasi.'}{' '}
          <Link href="/sumber-data" className={kelasTautan}>
            Lihat sumber data
          </Link>
        </p>
        {keterangan && <p className="mt-1 text-lembut">{keterangan}</p>}
      </div>
    </aside>
  );
}
