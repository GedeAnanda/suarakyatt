// lib/scoring/rapor.ts — rumus Rapor Instansi versi TypeScript (pemilik: C)
// Acuan: SDD v1.0 bagian 8.1 dan PRD v0.3 bagian 8.
// Dipakai untuk tes dan untuk mencocokkan hasil fungsi SQL agency_report_card.

import type { Huruf } from '../types';

export const BOBOT_RAPOR = { R: 0.3, S: 0.3, P: 0.2, K: 0.2 } as const;
export const AMBANG_TOLAK_TETAP = 0.25;
export const AMBANG_TOLAK_MIN = 0.1;
export const SAMPEL_MIN = 10;

/** K dengan rating netral 3/5 sebagai titik awal (setara 5 rating bayangan bernilai 3). */
export function kepuasan(jumlahBintang: number, jumlahPemberiRating: number): number {
  return (jumlahBintang + 3 * 5) / (jumlahPemberiRating + 5) / 5;
}

/** Nilai 0 sampai 100, satu desimal. */
export function nilaiRapor(R: number, S: number, P: number, K: number): number {
  const n = 100 * (BOBOT_RAPOR.R * R + BOBOT_RAPOR.S * S + BOBOT_RAPOR.P * P + BOBOT_RAPOR.K * K);
  return Math.round(n * 10) / 10;
}

export function hurufDari(nilai: number): Huruf {
  if (nilai >= 85) return 'A';
  if (nilai >= 70) return 'B';
  if (nilai >= 55) return 'C';
  if (nilai >= 40) return 'D';
  return 'E';
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Peringatan jika > 25%, atau ≥ 10% dan > 2 × median tingkat penolakan instansi lain. */
export function peringatanPenolakan(tingkat: number, tingkatInstansiLain: number[]): boolean {
  if (tingkat > AMBANG_TOLAK_TETAP) return true;
  return tingkat >= AMBANG_TOLAK_MIN && tingkat > 2 * median(tingkatInstansiLain);
}

/** Huruf akhir: null jika sampel kurang; maksimal C selama peringatan menyala. */
export function hurufAkhir(hurufAsli: Huruf, peringatan: boolean, sampel: number): Huruf | null {
  if (sampel < SAMPEL_MIN) return null;
  if (peringatan && (hurufAsli === 'A' || hurufAsli === 'B')) return 'C';
  return hurufAsli;
}
