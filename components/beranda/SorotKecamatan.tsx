// components/beranda/SorotKecamatan.tsx — 42 kecamatan sebagai satu kalimat + peta (pemilik: A)
// Satu nama menyala bergantian mengikuti sepuluh isu teratas, dan kecamatannya disorot di peta.
// Berhenti bergantian kalau pengguna meminta gerak dikurangi, atau saat diarahkan kursor.

'use client';

import { useEffect, useState } from 'react';
import { KECAMATAN } from '@/lib/geo/kecamatan-svg';
import { formatPoin } from '@/lib/scoring';
import PetaKecamatan from '../PetaKecamatan';

export interface IsuTeratas {
  kode_wilayah: string;
  kecamatan: string;
  kota: string;
  kategori: string;
  skor: number;
  peringkat: number;
}

const NAMA_URUT = [...KECAMATAN].sort((a, b) => a.kecamatan.localeCompare(b.kecamatan, 'id'));

export default function SorotKecamatan({
  teratas,
  skorPerKecamatan,
}: {
  teratas: IsuTeratas[];
  skorPerKecamatan: Record<string, number>;
}) {
  const [indeks, setIndeks] = useState(0);
  const [jeda, setJeda] = useState(false);

  useEffect(() => {
    if (jeda || teratas.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setIndeks((i) => (i + 1) % teratas.length), 2200);
    return () => window.clearInterval(t);
  }, [jeda, teratas.length]);

  const nyala = teratas[indeks];

  return (
    <div
      className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8"
      onMouseEnter={() => setJeda(true)}
      onMouseLeave={() => setJeda(false)}
      onFocus={() => setJeda(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setJeda(false)}
    >
      <div className="lg:col-span-7">
        <p className="text-lead text-medan-lembut">
          <span className="text-medan-tinta">Isu wilayah dinilai di 42 kecamatan: </span>
          {NAMA_URUT.map((k, i) => (
            <span key={k.kode_wilayah}>
              <span
                className={`transition-colors duration-[400ms] ${
                  k.kode_wilayah === nyala?.kode_wilayah ? 'text-medan-tinta underline decoration-2 underline-offset-4' : ''
                }`}
              >
                {k.kecamatan}
              </span>
              {i < NAMA_URUT.length - 1 ? ', ' : '.'}
            </span>
          ))}
        </p>
        {nyala && (
          <p key={nyala.kode_wilayah + nyala.kategori} className="ganti mt-8 text-badan" aria-live="off">
            <span className="angka mr-3 inline-block min-w-[3ch] bg-medan-tinta px-2 text-center font-semibold text-tinta">
              {nyala.peringkat}
            </span>
            {nyala.kategori} di {nyala.kecamatan}, {nyala.kota}. Skor {formatPoin(nyala.skor)}.
          </p>
        )}
        <p className="mt-6 text-kecil text-medan-lembut">
          Isu teratas {indeks + 1} dari {teratas.length}
          {jeda ? ' · berhenti bergantian' : ''}
        </p>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Pilih isu teratas untuk disorot">
          {teratas.map((t, i) => (
            <button
              key={t.kode_wilayah + t.kategori}
              type="button"
              aria-pressed={i === indeks}
              aria-label={`Peringkat ${t.peringkat}: ${t.kategori} di ${t.kecamatan}`}
              onClick={() => {
                setIndeks(i);
                setJeda(true);
              }}
              className="angka size-9 bg-tinta-tua text-kecil text-medan-lembut transition-[background-color,color,transform] duration-200 hover:text-medan-tinta active:scale-95 aria-pressed:bg-medan-tinta aria-pressed:text-tinta"
            >
              {t.peringkat}
            </button>
          ))}
        </div>
      </div>
      <div className="lg:col-span-5">
        <PetaKecamatan
          skor={skorPerKecamatan}
          sorot={nyala?.kode_wilayah}
          judul="Peta DKI Jakarta per kecamatan, diwarnai menurut skor prioritas tertinggi"
        />
      </div>
    </div>
  );
}
