// components/beranda/SorotKecamatan.tsx — 42 kecamatan sebagai satu kalimat + peta (pemilik: A)
// Satu nama menyala bergantian mengikuti sepuluh isu teratas, dan kecamatannya disorot di peta.
// Berhenti bergantian kalau pengguna meminta gerak dikurangi, atau saat diarahkan kursor.

'use client';

import { useEffect, useState } from 'react';
import { KECAMATAN } from '@/lib/geo/kecamatan-svg';
import { formatPoin } from '@/lib/scoring';
import PetaKecamatan, { KeteranganKelas } from '../PetaKecamatan';
import Ikon from '../ui/Ikon';

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
      className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10"
      onMouseEnter={() => setDisentuh(true)}
      onMouseLeave={() => setDisentuh(false)}
      onFocus={() => setDisentuh(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setDisentuh(false)}
    >
      <div>
        {nyala && (
          <div key={nyala.kode_wilayah + nyala.kategori} className="ganti flex items-start gap-3 rounded-kartu bg-biru-pudar p-4" aria-live="off">
            <span className="angka flex size-10 shrink-0 items-center justify-center rounded-kontrol bg-biru text-badan font-bold text-white">
              {indeks + 1}
            </span>
            <p className="text-badan">
              <strong className="font-bold">
                {nyala.kategori} di {nyala.kecamatan}
              </strong>
              , {nyala.kota}.{' '}
              <span className="text-lembut">
                Skor {formatPoin(nyala.skor)}, peringkat {nyala.peringkat} dari semua isu.
              </span>
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Pilih kecamatan teratas untuk disorot">
          {/* Satu kecamatan satu tombol, jadi nomornya urutan kecamatan (1–10), bukan peringkat isu yang bisa loncat. */}
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
              className="angka size-10 rounded-kontrol border border-garis bg-permukaan text-kecil font-bold transition-[background-color,color,border-color,scale] hover:border-biru hover:text-biru-tua active:scale-90 aria-pressed:border-biru aria-pressed:bg-biru aria-pressed:text-white"
            >
              {i + 1}
            </button>
          ))}
          {teratas.length > 1 && (
            <button
              type="button"
              onClick={() => setKunci(!kunci)}
              className="ml-1 inline-flex min-h-10 items-center gap-1.5 rounded-kontrol px-2 text-kecil font-semibold text-biru-tua hover:bg-biru-muda"
            >
              <Ikon nama={kunci ? 'putar' : 'jeda'} className="size-4" />
              {kunci ? 'Jalankan pergantian otomatis' : 'Hentikan pergantian otomatis'}
            </button>
          )}
        </div>

        <p className="mt-6 text-kecil leading-relaxed text-lembut">
          <span className="font-semibold text-teks">Isu wilayah dinilai di 42 kecamatan: </span>
          {NAMA_URUT.map((k, i) => (
            <span key={k.kode_wilayah}>
              <span
                className={`transition-colors duration-[400ms] ${
                  k.kode_wilayah === nyala?.kode_wilayah ? 'rounded-[0.25rem] bg-biru-muda px-1 font-bold text-biru-tua' : ''
                }`}
              >
                {k.kecamatan}
              </span>
              {i < NAMA_URUT.length - 1 ? ', ' : '.'}
            </span>
          ))}
        </p>
      </div>

      <figure>
        <PetaKecamatan
          skor={skorPerKecamatan}
          sorot={nyala?.kode_wilayah}
          judul="Peta DKI Jakarta per kecamatan, diwarnai menurut skor prioritas tertinggi"
        />
        <figcaption className="mt-3">
          <KeteranganKelas />
        </figcaption>
      </figure>
    </div>
  );
}
