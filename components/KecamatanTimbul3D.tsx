// components/KecamatanTimbul3D.tsx — tampilan fokus: kecamatan terpilih bergerak ke tengah peta, timbul 3D, dan
// beberapa laporannya muncul sebagai titik (pemilik: A)
// Dipakai PetaKecamatan dengan efek="fokus" (dashboard Beranda). Lapisan hiasan: aria-hidden dan tidak menangkap klik.
// Kotak lapisan sudah berukuran akhir di tengah peta (SVG dipotong ke kotak wilayah), jadi di posisi akhir gambarnya
// tetap tajam; animasinya berangkat dari tempat asal wilayah dalam ukuran asli lalu bergerak ke tengah.
// Tebal 3D = tumpukan salinan bentuk yang makin gelap ke bawah, lalu dimiringkan (rotateX). Gerak dikurangi: langsung
// di posisi akhir, titik langsung tampil.

import { Fragment, type CSSProperties } from 'react';
import { VIEWBOX } from '@/lib/geo/kecamatan-svg';
import type { TitikPeta } from '@/lib/geo/proyeksi';
import { WARNA_TITIK } from './BadgeStatus';

const [, , LEBAR, TINGGI] = VIEWBOX.split(' ').map(Number);
const LAPIS = 8; // jumlah salinan untuk sisi tebal
const TEBAL = 14; // tebal sisi di layar, px
const UKURAN = 0.45; // wilayah diperbesar sampai ±45% lebar atau tinggi peta
const SKALA_MAKS = 4;

/** Kotak pembatas dari data jalur: semua koordinat absolut (M/L/Z), jadi cukup pasangan angkanya. */
function kotak(d: string) {
  const angka = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (let i = 0; i + 1 < angka.length; i += 2) {
    x0 = Math.min(x0, angka[i]);
    x1 = Math.max(x1, angka[i]);
    y0 = Math.min(y0, angka[i + 1]);
    y1 = Math.max(y1, angka[i + 1]);
  }
  return { x0, y0, lebar: Math.max(1, x1 - x0), tinggi: Math.max(1, y1 - y0) };
}

export default function KecamatanTimbul3D({ d, warna, titik = [] }: { d: string; warna: string; titik?: TitikPeta[] }) {
  const b = kotak(d);
  const skala = Math.min(SKALA_MAKS, (LEBAR * UKURAN) / b.lebar, (TINGGI * UKURAN) / b.tinggi);
  const lebarPersen = ((b.lebar * skala) / LEBAR) * 100;
  const tinggiPersen = ((b.tinggi * skala) / TINGGI) * 100;
  const cx = b.x0 + b.lebar / 2;
  const cy = b.y0 + b.tinggi / 2;

  const gaya = {
    left: `${50 - lebarPersen / 2}%`,
    top: `${50 - tinggiPersen / 2}%`,
    width: `${lebarPersen}%`,
    height: `${tinggiPersen}%`,
    // Posisi awal animasi: kotak mengecil ke ukuran asli dan bergeser ke tempat asal wilayah (persen dari kotak).
    '--asal-x': `${((cx - LEBAR / 2) / (b.lebar * skala)) * 100}%`,
    '--asal-y': `${((cy - TINGGI / 2) / (b.tinggi * skala)) * 100}%`,
    '--asal-skala': 1 / skala,
  } as CSSProperties;

  const kotakView = `${b.x0} ${b.y0} ${b.lebar} ${b.tinggi}`;
  const langkah = TEBAL / LAPIS;
  // Satu unit viewBox ≈ 0,55 px × skala di layar; jari-jari titik ±5 px.
  const jariJari = 9 / skala;

  const lapis = (isi: string, z: number, kecerahan?: number, kelas?: string) => (
    <svg
      viewBox={kotakView}
      className={kelas}
      style={{ transform: `translateZ(${z}px)`, filter: kecerahan ? `brightness(${kecerahan})` : undefined }}
    >
      <path d={d} fill={isi} />
    </svg>
  );

  return (
    <div aria-hidden="true" className="t3d">
      <div className="t3d-kotak" style={gaya}>
        {lapis('#0f2a33', -langkah, undefined, 't3d-bayang')}
        {Array.from({ length: LAPIS }, (_, i) => (
          <Fragment key={i}>{lapis(warna, i * langkah, 0.6 + (0.25 * i) / LAPIS)}</Fragment>
        ))}
        <svg viewBox={kotakView} style={{ transform: `translateZ(${LAPIS * langkah}px)` }}>
          <path d={d} fill={warna} stroke="var(--color-permukaan)" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {titik.map((t, i) => (
            <circle
              key={t.kode}
              cx={t.x}
              cy={t.y}
              r={jariJari}
              fill={WARNA_TITIK[t.status]}
              stroke="#fff"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              className="t3d-titik"
              style={{ animationDelay: `${900 + i * 90}ms` }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
