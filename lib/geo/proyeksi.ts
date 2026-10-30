// lib/geo/proyeksi.ts — lintang/bujur ke koordinat peta SVG kecamatan (pemilik: A)
// Proyeksi yang sama dengan scripts/buat-jalur-svg.mjs (equirectangular, koreksi cos lintang). Konstantanya diturunkan
// dari titik awal jalur Kalideres, Cilincing, dan Jagakarsa: koordinat di public/data/kecamatan.geojson dibanding
// lib/geo/kecamatan-svg.ts (galat < 0,1 unit dari viewBox selebar 1000). Kalau geojson diganti, hitung ulang dari
// pasangan titik yang sama.

import type { StatusLaporan } from '@/lib/types';

const X0 = 67.1;
const BUJUR0 = 106.70544;
const KX = 3489.07;
const Y0 = 24.0;
const LINTANG0 = -6.09588;
const KY = 3509.66;

/** [x, y] di viewBox peta kecamatan untuk satu titik lintang/bujur. */
export function keTitikPeta(lat: number, lng: number): [number, number] {
  return [X0 + (lng - BUJUR0) * KX, Y0 + (LINTANG0 - lat) * KY];
}

/** Satu laporan yang digambar sebagai titik di peta kecamatan. */
export interface TitikPeta {
  kode: string;
  status: StatusLaporan;
  x: number;
  y: number;
}
