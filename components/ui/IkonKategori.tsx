// components/ui/IkonKategori.tsx — ikon dan warna identitas tiap kategori masalah (pemilik: A)
// Jalan rusak oranye, saluran tersumbat sian, sampah hijau zaitun, lampu jalan kuning tua (token kt-* di
// globals.css). Kategori selalu juga ditulis dengan teks, jadi ikonnya aria-hidden.

import Ikon, { type NamaIkon } from './Ikon';

const GAYA: Record<string, { ikon: NamaIkon; teks: string; latar: string }> = {
  'Jalan rusak': { ikon: 'jalan', teks: 'text-kt-jalan', latar: 'bg-kt-jalan-bg' },
  'Saluran tersumbat': { ikon: 'saluran', teks: 'text-kt-saluran', latar: 'bg-kt-saluran-bg' },
  'Sampah menumpuk': { ikon: 'sampah', teks: 'text-kt-sampah', latar: 'bg-kt-sampah-bg' },
  'Lampu jalan mati': { ikon: 'lampu', teks: 'text-kt-lampu', latar: 'bg-kt-lampu-bg' },
};

export function gayaKategori(nama: string) {
  return GAYA[nama] ?? { ikon: 'info' as NamaIkon, teks: 'text-biru-tua', latar: 'bg-biru-muda' };
}

const UKURAN = {
  kecil: { kotak: 'size-6 rounded-[0.375rem]', ikon: 'size-3.5' },
  sedang: { kotak: 'size-10 rounded-kontrol', ikon: 'size-5' },
  besar: { kotak: 'size-12 rounded-kartu', ikon: 'size-6' },
};

export default function IkonKategori({
  nama,
  ukuran = 'sedang',
  className = '',
}: {
  nama: string;
  ukuran?: keyof typeof UKURAN;
  className?: string;
}) {
  const g = gayaKategori(nama);
  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center ${UKURAN[ukuran].kotak} ${g.latar} ${g.teks} ${className}`}>
      <Ikon nama={g.ikon} className={UKURAN[ukuran].ikon} />
    </span>
  );
}
