// components/ui/LabelSumber.tsx — penanda sumber angka di dekat setiap angka (FR-G3, SDD 9.1), pemilik: A
// Satu label untuk semua data yang dibuat tim: "Data buatan" (audit bahasa awam 10 Nov). Penjelasannya TAMPIL sebagai
// teks, bukan title=, karena title tidak muncul di HP. `ringkas` hanya label: dipakai kalau kalimat yang sama sudah
// tampil di dekatnya (misalnya pita di atas Beranda).

import Link from 'next/link';
import type { Sumber } from '@/lib/data/laporan';
import { DATA_BUATAN } from '@/lib/kamus';

const TEKS: Record<Sumber | 'terbuka', string> = {
  db: 'Data buatan',
  contoh: 'Data buatan',
  terbuka: 'Data asli',
};

const PENJELASAN: Record<Sumber | 'terbuka', string> = {
  db: DATA_BUATAN,
  contoh: DATA_BUATAN,
  terbuka: 'Angka ini diambil dari sumber nyata yang disebutkan di halaman Sumber data.',
};

export default function LabelSumber({
  sumber,
  keterangan,
  ringkas = false,
  className = '',
}: {
  sumber: Sumber | 'terbuka';
  keterangan?: string;
  /** Hanya label, tanpa kalimat penjelas. Pakai hanya kalau kalimatnya sudah tampil di dekatnya. */
  ringkas?: boolean;
  className?: string;
}) {
  const asli = sumber === 'terbuka';
  const label = (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-[0.375rem] px-2 py-0.5 text-kecil font-semibold ${
        asli ? 'bg-hijau-muda text-hijau' : 'bg-oranye-muda text-st-menunggu'
      }`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${asli ? 'bg-hijau' : 'bg-oranye'}`} />
      {TEKS[sumber]}
      {keterangan && <span className="font-normal">{keterangan}</span>}
    </span>
  );

  if (ringkas) {
    return (
      <Link href="/sumber-data" className={`inline-flex rounded-[0.375rem] transition-opacity hover:opacity-80 ${className}`}>
        {label}
        <span className="sr-only">. {PENJELASAN[sumber]} Lihat data apa yang asli.</span>
      </Link>
    );
  }

  return (
    <span className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-kecil ${className}`}>
      {label}
      <span className="text-lembut">{PENJELASAN[sumber]}</span>
      <Link href="/sumber-data" className="font-semibold text-biru-tua underline-offset-4 hover:underline">
        Lihat data apa yang asli
      </Link>
    </span>
  );
}
