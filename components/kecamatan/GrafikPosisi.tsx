// components/kecamatan/GrafikPosisi.tsx — posisi satu kecamatan di antara 42 kecamatan (pemilik: A)
// Revisi FDS 10 Nov (2.1): satu grafik batang yang terbaca tanpa rumus. Batang = skor isu tertinggi tiap kecamatan,
// diurutkan dari yang paling didahulukan. Kecamatan ini disorot, garis putus-putus = median Jakarta.
// Kecamatan tanpa laporan aktif digambar sebagai batang abu-abu pendek di ujung kanan.
// Semua teks di HTML (bukan di SVG) supaya tetap terbaca di HP; SVG-nya direntangkan ke tinggi tetap.

import type { CSSProperties } from 'react';
import { formatPoin } from '@/lib/scoring';
import type { RingkasanJakarta } from '@/lib/scoring/kecamatan';

// Lima kelas warna yang sama dengan PetaKecamatan (KELAS). Tidak diimpor dari sana karena file itu 'use client':
// nilai dari file klien hanya berupa referensi di Server Component.
const warnaSkor = (skor: number) => `var(--color-k${Math.min(5, Math.floor(skor / 20) + 1)})`;

export default function GrafikPosisi({ ringkas, kode }: { ringkas: RingkasanJakarta; kode: string }) {
  const urut = [...ringkas.kecamatan].sort(
    (a, b) => (a.urutan ?? Number.POSITIVE_INFINITY) - (b.urutan ?? Number.POSITIVE_INFINITY) || a.kecamatan.localeCompare(b.kecamatan, 'id'),
  );
  const n = urut.length;
  const indeks = urut.findIndex((k) => k.kode_wilayah === kode);
  const ini = urut[indeks];
  const posisi = `${((indeks + 0.5) / n) * 100}%`;

  const label = ini?.urutan
    ? `Grafik batang ${n} kecamatan. ${ini.kecamatan} di urutan ${ini.urutan} dari ${ringkas.dinilai} kecamatan yang dinilai, skor ${formatPoin(ini.skor!)}; median Jakarta ${formatPoin(ringkas.median)}.`
    : `Grafik batang ${n} kecamatan. ${ini?.kecamatan ?? 'Kecamatan ini'} tidak punya laporan aktif yang dinilai.`;

  return (
    <figure className="grid gap-3">
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-kecil">
        {ini && (
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 rounded-[0.2rem] bg-teks" />
            <span>
              <span className="font-bold">{ini.kecamatan}</span>
              {ini.skor !== null ? ` · skor ${formatPoin(ini.skor)}` : ' · tidak dinilai'}
            </span>
          </li>
        )}
        {ringkas.dinilai > 0 && (
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="w-4 border-t-2 border-dashed border-teks" />
            Median Jakarta {formatPoin(ringkas.median)}
          </li>
        )}
      </ul>

      <div className="relative">
        <svg
          viewBox={`0 0 ${n} 100`}
          preserveAspectRatio="none"
          role="img"
          aria-label={label}
          className="block h-40 w-full sm:h-48"
        >
          {[0, 50, 100].map((s) => (
            <line key={s} x1={0} x2={n} y1={100 - s} y2={100 - s} stroke="var(--color-garis)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          ))}
          {urut.map((k, i) => {
            const dinilai = k.skor !== null;
            const sorot = i === indeks;
            const tinggi = dinilai ? Math.max(1, k.skor!) : 2;
            return (
              <rect
                key={k.kode_wilayah}
                x={i + 0.14}
                width={0.72}
                y={100 - tinggi}
                height={tinggi}
                fill={sorot ? 'var(--color-teks)' : dinilai ? warnaSkor(k.skor!) : 'var(--color-lapis-2)'}
              />
            );
          })}
          {ringkas.dinilai > 0 && (
            <line
              x1={0}
              x2={n}
              y1={100 - ringkas.median}
              y2={100 - ringkas.median}
              stroke="var(--color-teks)"
              strokeDasharray="5 4"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
        <span aria-hidden="true" className="absolute -top-0.5 right-0 bg-permukaan pl-1 text-mini text-lembut">
          100
        </span>
        <span aria-hidden="true" className="absolute right-0 bottom-0 bg-permukaan pl-1 text-mini text-lembut">
          0
        </span>
        {ini && (
          <span
            aria-hidden="true"
            className="absolute top-full mt-1 -translate-x-1/2 text-[0.75rem] leading-none font-bold whitespace-nowrap"
            style={{ left: `clamp(2.5rem, ${posisi}, calc(100% - 2.5rem))` } as CSSProperties}
          >
            ▲ {ini.kecamatan}
          </span>
        )}
      </div>

      <figcaption className="mt-5 flex flex-wrap justify-between gap-x-4 gap-y-1 text-mini text-lembut">
        <span>← paling didahulukan</span>
        {n - ringkas.dinilai > 0 && <span>{n - ringkas.dinilai} kecamatan tanpa laporan aktif (abu-abu)</span>}
        <span>belum didahulukan →</span>
      </figcaption>
    </figure>
  );
}
