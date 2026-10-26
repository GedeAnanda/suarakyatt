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
      className={`inline-flex items-center gap-1.5 bg-lapis px-2 py-0.5 text-kecil font-medium text-tinta hover:bg-lapis-2 ${className}`}
    >
      <span aria-hidden="true" className={`size-2 ${sumber === 'terbuka' ? 'bg-st-selesai' : 'bg-tinta'}`} />
      {TEKS[sumber]}
      {keterangan && <span className="font-normal text-lembut">{keterangan}</span>}
    </Link>
  );
}
