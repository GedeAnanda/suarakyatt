// components/KecamatanTimbul3D.tsx — tampilan fokus: kecamatan terpilih bergerak ke tengah peta, timbul 3D, dan
// beberapa laporannya muncul sebagai titik (pemilik: A)
// Dipakai PetaKecamatan dengan efek="fokus" (dashboard Beranda). Lapisan hiasan: aria-hidden dan tidak menangkap klik.
// Kotak lapisan sudah berukuran akhir di tengah peta (SVG dipotong ke kotak wilayah), jadi di posisi akhir gambarnya
// tetap tajam; animasinya berangkat dari tempat asal wilayah dalam ukuran asli lalu bergerak ke tengah.
// Tebal 3D = tumpukan salinan bentuk yang makin gelap ke bawah, lalu dimiringkan (rotateX). Gerak dikurangi: langsung
// di posisi akhir, titik langsung tampil.

import { Fragment, useId, type CSSProperties } from 'react';
import { VIEWBOX } from '@/lib/geo/kecamatan-svg';
import type { TitikPeta } from '@/lib/geo/proyeksi';
import { WARNA_TITIK } from './BadgeStatus';

const [, , LEBAR, TINGGI] = VIEWBOX.split(' ').map(Number);
const LAPIS = 8; // jumlah salinan untuk sisi tebal
const TEBAL = 14; // tebal sisi di layar, px
const UKURAN = 0.45; // wilayah diperbesar sampai ±45% lebar atau tinggi peta
const SKALA_MAKS = 4;
const MIRING = 32; // derajat, sama dengan rotateX .t3d-kotak di globals.css
// Pin lokasi (viewBox 0 0 24 32, ujung bawah di 12,31) ditumpuk beberapa lapis supaya tampak tebal saat berputar.
const PIN = 'M12 31C12 31 2.5 19.6 2.5 12a9.5 9.5 0 0 1 19 0C21.5 19.6 12 31 12 31Z';
const PIN_LAPIS = 4;
const TITIK_MAKS = 4; // hanya beberapa laporan sebagai contoh
// Titik dan pin mulai muncul saat wilayah hampir mendarat (animasi masuk 1600 ms, t3d-masuk di globals.css).
const MUNCUL_TITIK = 1350;
const JARAK_MIN = 26; // px di layar; titik yang lebih dekat dari ini dianggap berdempetan, cukup satu yang tampil

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

/** Beberapa titik saja sebagai contoh, sesuai urutan dari server (laporan yang masih berjalan dulu); dari titik yang
 *  berdempetan di layar hanya yang pertama diambil. Dipakai peta (pin) dan daftar contoh di sampingnya. */
export function pilihContoh(d: string, titik: TitikPeta[]): TitikPeta[] {
  const b = kotak(d);
  const skala = Math.min(SKALA_MAKS, (LEBAR * UKURAN) / b.lebar, (TINGGI * UKURAN) / b.tinggi);
  // Satu unit viewBox ≈ 0,55 px × skala di layar.
  const jarakMin = JARAK_MIN / (0.55 * skala);
  const contoh: TitikPeta[] = [];
  for (const t of titik) {
    if (contoh.length === TITIK_MAKS) break;
    if (contoh.every((c) => Math.hypot(c.x - t.x, c.y - t.y) >= jarakMin)) contoh.push(t);
  }
  return contoh;
}

export default function KecamatanTimbul3D({ d, warna, titik = [] }: { d: string; warna: string; titik?: TitikPeta[] }) {
  const idGradasi = `pin${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
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

  const contoh = pilihContoh(d, titik);

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
      {contoh.length > 0 && (
        <svg width="0" height="0" className="absolute">
          <defs>
            {/* Merah membulat dengan kilau di kiri atas, seperti pin lokasi 3D. */}
            <radialGradient id={idGradasi} cx="35%" cy="25%" r="80%">
              <stop offset="0" stopColor="#ff9da1" />
              <stop offset="0.45" stopColor="#ef4b52" />
              <stop offset="1" stopColor="#b8232a" />
            </radialGradient>
          </defs>
        </svg>
      )}
      <div className="t3d-kotak" style={gaya}>
        {lapis('#0f2a33', -langkah, undefined, 't3d-bayang')}
        {Array.from({ length: LAPIS }, (_, i) => (
          <Fragment key={i}>{lapis(warna, i * langkah, 0.6 + (0.25 * i) / LAPIS)}</Fragment>
        ))}
        <svg viewBox={kotakView} style={{ transform: `translateZ(${LAPIS * langkah}px)` }}>
          <path d={d} fill={warna} stroke="var(--color-permukaan)" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {contoh.map((t, i) => (
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
              style={{ animationDelay: `${MUNCUL_TITIK + i * 110}ms` }}
            />
          ))}
        </svg>
        {/* Pin di atas tiap titik: berdiri tegak menghadap layar (rotateX dibalik), naik-turun dan berputar pelan
            seperti penanda di game. Iramanya digeser per pin supaya tidak bergerak serempak. */}
        {contoh.map((t, i) => (
          <div
            key={`pin-${t.kode}`}
            className="t3d-pin"
            style={{
              left: `${((t.x - b.x0) / b.lebar) * 100}%`,
              top: `${((t.y - b.y0) / b.tinggi) * 100}%`,
              transform: `translateZ(${LAPIS * langkah + 1}px) rotateX(-${MIRING}deg)`,
              // Sama dengan jeda titik di bawahnya, jadi pin dan titiknya muncul bersamaan.
              animationDelay: `${MUNCUL_TITIK + i * 110}ms`,
            }}
          >
            <div className="t3d-pin-naik" style={{ animationDelay: `${-i * 0.37}s` }}>
              <div className="t3d-pin-putar" style={{ animationDelay: `${-i * 0.6}s` }}>
                {Array.from({ length: PIN_LAPIS }, (_, j) => {
                  const muka = j === 0 || j === PIN_LAPIS - 1;
                  return (
                    <svg key={j} viewBox="0 0 24 32" style={{ transform: `translateZ(${j - (PIN_LAPIS - 1) / 2}px)` }}>
                      <path d={PIN} fill={muka ? `url(#${idGradasi})` : '#a11d23'} />
                      {muka && <circle cx="12" cy="11.5" r="4.3" fill="#fff" />}
                    </svg>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
