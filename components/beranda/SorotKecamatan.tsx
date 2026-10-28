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
  // Berhenti sementara selama kursor atau fokus keyboard ada di bagian ini.
  const [disentuh, setDisentuh] = useState(false);
  // Dihentikan lewat tombol atau dengan memilih isu: tetap berhenti sampai dijalankan lagi (WCAG 2.2.2).
  const [kunci, setKunci] = useState(false);
  const jeda = disentuh || kunci;

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
      onMouseEnter={() => setDisentuh(true)}
      onMouseLeave={() => setDisentuh(false)}
      onFocus={() => setDisentuh(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setDisentuh(false)}
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
              {indeks + 1}
            </span>
            {nyala.kategori} di {nyala.kecamatan}, {nyala.kota}. Skor {formatPoin(nyala.skor)}, peringkat {nyala.peringkat} dari
            semua isu.
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-kecil text-medan-lembut">
          {/* Satu kecamatan satu tombol, jadi nomornya urutan kecamatan (1–10), bukan peringkat isu yang bisa loncat. */}
          <span className="angka">
            Kecamatan teratas {indeks + 1} dari {teratas.length}
          </span>
          {teratas.length > 1 && (
            <button
              type="button"
              onClick={() => setKunci(!kunci)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-medan-tinta underline decoration-2 underline-offset-4 hover:decoration-transparent"
            >
              {kunci ? 'Jalankan pergantian otomatis' : 'Hentikan pergantian otomatis'}
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Pilih kecamatan teratas untuk disorot">
          {teratas.map((t, i) => (
            <button
              key={t.kode_wilayah + t.kategori}
              type="button"
              aria-pressed={i === indeks}
              aria-label={`${i + 1}. ${t.kecamatan}: ${t.kategori}, peringkat isu ${t.peringkat}`}
              onClick={() => {
                setIndeks(i);
                setKunci(true);
              }}
              className="angka size-11 rounded-(--radius-kontrol) bg-tinta-tua text-kecil text-medan-lembut transition-[background-color,color,scale] duration-200 hover:text-medan-tinta active:scale-90 aria-pressed:bg-medan-tinta aria-pressed:text-tinta"
            >
              {i + 1}
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
