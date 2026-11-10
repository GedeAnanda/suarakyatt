// components/ui/LabelSumber.tsx — penanda sumber angka di dekat setiap angka (FR-G3, SDD 9.1), pemilik: A

import Link from 'next/link';
import type { Sumber } from '@/lib/data/laporan';

const TEKS: Record<Sumber | 'terbuka', string> = {
  db: 'Data simulasi',
  contoh: 'Data contoh',
  terbuka: 'Data terbuka',
};

const PENJELASAN: Record<Sumber | 'terbuka', string> = {
  db: 'Laporan, status, dan rating hasil generator simulasi, bukan data resmi pemerintah.',
  contoh: 'Data contoh bawaan aplikasi, dipakai sampai database berisi data simulasi.',
  terbuka: 'Diambil dari sumber data terbuka; sumber dan lisensinya ada di halaman Sumber Data.',
};

export default function LabelSumber({
  sumber,
  keterangan,
  className = '',
}: {
  sumber: Sumber | 'terbuka';
  keterangan?: string;
  className?: string;
}) {
  return (
    <Link
      href="/sumber-data"
      title={PENJELASAN[sumber]}
      className={`inline-flex items-center gap-1.5 rounded-[0.375rem] px-2 py-0.5 text-mini font-semibold transition-colors ${
        sumber === 'terbuka'
          ? 'bg-hijau-muda text-hijau hover:bg-[#d3efdd]'
          : 'bg-oranye-muda text-st-menunggu hover:bg-[#ffe8c7]'
      } ${className}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${sumber === 'terbuka' ? 'bg-hijau' : 'bg-oranye'}`} />
      {TEKS[sumber]}
      {keterangan && <span className="font-normal">{keterangan}</span>}
    </Link>
  );
}
