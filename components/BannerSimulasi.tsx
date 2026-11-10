// components/BannerSimulasi.tsx — pita "Data buatan" (SDD 9, 9.1), pemilik: A
// Tidak bisa ditutup (PRD 11). Satu label, satu kalimat (DATA_BUATAN di lib/kamus.ts), satu tautan. Keterangan halaman
// (periode, jumlah laporan, aturan yang berlaku) ikut di dalamnya, bukan di chip terpisah.

import Link from 'next/link';
import type { Sumber } from '@/lib/data/laporan';
import { DATA_BUATAN } from '@/lib/kamus';
import Ikon from './ui/Ikon';
import { kelasTautan } from './ui/Tombol';

export default function BannerSimulasi({
  keterangan,
  className = '',
}: {
  /** Dipertahankan supaya pemanggil lama tetap jalan; db dan contoh sama-sama "Data buatan". */
  sumber?: Sumber;
  keterangan?: string;
  className?: string;
}) {
  return (
    <aside
      role="note"
      aria-label="Data buatan"
      className={`flex gap-3 rounded-kartu border border-[#ffd9a3] bg-oranye-muda px-4 py-3 text-kecil text-teks ${className}`}
    >
      <Ikon nama="info" className="mt-0.5 size-4.5 shrink-0 text-oranye" />
      <div>
        <p>
          <strong className="font-bold">Data buatan.</strong> {DATA_BUATAN}{' '}
          <Link href="/sumber-data" className={kelasTautan}>
            Lihat data apa yang asli
          </Link>
        </p>
        {keterangan && <p className="mt-0.5 text-lembut">{keterangan}</p>}
      </div>
    </aside>
  );
}
