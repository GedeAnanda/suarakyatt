// components/PetaKecamatan.tsx — choropleth 42 kecamatan sebagai SVG (PRD 9, SDD 9.1), pemilik: A
// Lima kelas tetap (bukan kuantil), jadi warna hanya berubah kalau skornya memang berubah.
// Kecamatan tanpa laporan aktif digambar dengan arsiran dan keterangan "Tidak ada laporan aktif".

import { KECAMATAN, VIEWBOX } from '@/lib/geo/kecamatan-svg';

export const KELAS = [
  { dari: 0, sampai: 20, warna: 'var(--color-k1)' },
  { dari: 20, sampai: 40, warna: 'var(--color-k2)' },
  { dari: 40, sampai: 60, warna: 'var(--color-k3)' },
  { dari: 60, sampai: 80, warna: 'var(--color-k4)' },
  { dari: 80, sampai: 100, warna: 'var(--color-k5)' },
];

export function warnaSkor(skor: number | undefined): string {
  if (skor === undefined) return 'url(#arsir-kosong)';
  return KELAS[Math.min(4, Math.floor(skor / 20))].warna;
}

export default function PetaKecamatan({
  skor,
  sorot,
  onPilih,
  judul,
  className = '',
}: {
  /** Skor tertinggi per kode_wilayah; kecamatan yang tidak ada di sini = tidak ada laporan aktif. */
  skor: Record<string, number>;
  sorot?: string | null;
  onPilih?: (kodeWilayah: string) => void;
  judul: string;
  className?: string;
}) {
  return (
    <svg viewBox={VIEWBOX} role="img" aria-label={judul} className={`block h-auto w-full ${className}`}>
      <defs>
        <pattern id="arsir-kosong" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="10" fill="var(--color-terang)" />
          <path d="M0 0v10" stroke="var(--color-lapis-2)" strokeWidth="3" />
        </pattern>
      </defs>
      {KECAMATAN.map((k) => {
        const nilai = skor[k.kode_wilayah];
        const label = `${k.kecamatan}, ${k.kota}: ${
          nilai === undefined ? 'tidak ada laporan aktif' : `skor tertinggi ${Math.round(nilai)}`
        }`;
        return (
          <path
            key={k.kode_wilayah}
            d={k.d}
            fill={warnaSkor(nilai)}
            stroke="var(--color-kertas)"
            strokeWidth={sorot === k.kode_wilayah ? 0 : 2}
            strokeLinejoin="round"
            className={`transition-[fill] duration-500 ${onPilih ? 'cursor-pointer hover:opacity-85' : ''}`}
            onClick={onPilih ? () => onPilih(k.kode_wilayah) : undefined}
          >
            <title>{label}</title>
          </path>
        );
      })}
      {sorot &&
        KECAMATAN.filter((k) => k.kode_wilayah === sorot).map((k) => (
          <path
            key="sorot"
            d={k.d}
            fill="none"
            stroke="var(--color-tinta)"
            strokeWidth={7}
            strokeLinejoin="round"
            pointerEvents="none"
            className="[.di-medan_&]:stroke-[var(--color-medan-tinta)]"
          />
        ))}
    </svg>
  );
}

export function KeteranganKelas({ className = '' }: { className?: string }) {
  return (
    <div className={`text-kecil ${className}`}>
      <p className="mb-2">Skor prioritas tertinggi di kecamatan</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {KELAS.map((k) => (
          <li key={k.dari} className="flex items-center gap-1.5 angka">
            <span aria-hidden="true" className="size-3.5" style={{ background: k.warna }} />
            {k.dari}–{k.sampai}
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <svg aria-hidden="true" className="size-3.5" viewBox="0 0 14 14">
            <rect width="14" height="14" fill="var(--color-terang)" />
            <path d="M-2 6 6 -2M0 14 14 0M8 16 16 8" stroke="var(--color-lapis-2)" strokeWidth="2.5" />
          </svg>
          Tidak ada laporan aktif
        </li>
      </ul>
    </div>
  );
}
