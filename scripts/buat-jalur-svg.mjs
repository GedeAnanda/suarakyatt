// scripts/buat-jalur-svg.mjs — ubah public/data/kecamatan.geojson menjadi jalur SVG (pemilik: A)
//
// Choropleth di Beranda dan Dashboard Prioritas digambar sebagai SVG, bukan lapisan Leaflet,
// supaya warnanya bisa berubah setiap slider digeser tanpa memuat ubin peta.
// Proyeksi equirectangular dengan koreksi cos(lintang); cukup untuk satu kota.
//
// Jalankan setelah kecamatan.geojson berubah: node scripts/buat-jalur-svg.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const geo = JSON.parse(readFileSync('public/data/kecamatan.geojson', 'utf8'));
const LEBAR = 1000;

const poligon = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
const semua = geo.features.flatMap((f) => poligon(f.geometry).flat(2));
const minX = Math.min(...semua.map((p) => p[0]));
const maxX = Math.max(...semua.map((p) => p[0]));
const minY = Math.min(...semua.map((p) => p[1]));
const maxY = Math.max(...semua.map((p) => p[1]));
const kx = Math.cos((((minY + maxY) / 2) * Math.PI) / 180);
const skala = LEBAR / ((maxX - minX) * kx);
const TINGGI = Math.round((maxY - minY) * skala);

const proyeksi = ([x, y]) => [((x - minX) * kx * skala).toFixed(1), ((maxY - y) * skala).toFixed(1)];

// Titik label: pusat kotak cincin terluar terbesar.
function pusat(g) {
  const terbesar = poligon(g)
    .map((p) => p[0])
    .sort((a, b) => b.length - a.length)[0];
  const xs = terbesar.map((p) => p[0]);
  const ys = terbesar.map((p) => p[1]);
  return proyeksi([(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]).map(Number);
}

const kecamatan = geo.features
  .map((f) => ({
    kode_wilayah: f.properties.kode_wilayah,
    kecamatan: f.properties.kecamatan,
    kota: f.properties.kota,
    d: poligon(f.geometry)
      .flatMap((p) => p.map((cincin) => 'M' + cincin.map((t) => proyeksi(t).join(',')).join('L') + 'Z'))
      .join(''),
    pusat: pusat(f.geometry),
  }))
  .sort((a, b) => a.kode_wilayah.localeCompare(b.kode_wilayah));

const isi = `// lib/geo/kecamatan-svg.ts — DIBUAT OTOMATIS oleh scripts/buat-jalur-svg.mjs, jangan diedit.
// Sumber: public/data/kecamatan.geojson (HDX COD-AB Indonesia, BPS 2020, CC BY-IGO).

export interface JalurKecamatan {
  kode_wilayah: string;
  kecamatan: string;
  kota: string;
  d: string;
  pusat: [number, number];
}

export const VIEWBOX = '0 0 ${LEBAR} ${TINGGI}';

export const KECAMATAN: JalurKecamatan[] = ${JSON.stringify(kecamatan)};
`;

writeFileSync('lib/geo/kecamatan-svg.ts', isi);
console.log(`${kecamatan.length} kecamatan, viewBox 0 0 ${LEBAR} ${TINGGI}, ${(isi.length / 1024).toFixed(0)} KB`);
