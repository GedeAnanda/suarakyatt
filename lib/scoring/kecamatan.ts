// lib/scoring/kecamatan.ts — skor per kecamatan dan kalimat untuk warga awam (pemilik: C)
// Revisi FDS 10 Nov (docs/revisi-fds-2026-11-10.md, 2.1–2.3): skor dinilai per isu (kecamatan × kategori),
// tetapi warga bertanya "kecamatanku bagaimana?". Modul ini merangkum hasil hitungSkor per kecamatan
// tanpa rumus baru: skor kecamatan = skor isu tertingginya, sama dengan warna peta di Beranda dan Prioritas.
// Murni (tanpa jaringan), jadi bisa dites.

import type { Bobot, Faktor, SkorIsu } from '../types';
import { FAKTOR, formatPoin, LABEL_FAKTOR, PENAHAN_FAKTOR, penahanUtama } from './index';

/** Potongan kalimat "terutama karena …" (satu sumber: LABEL_FAKTOR). Nama hal yang dinilai: NAMA_FAKTOR di lib/konten. */
export const ALASAN_AWAM: Record<Faktor, string> = LABEL_FAKTOR;

export type Tingkat = 'paling' | 'tinggi' | 'sedang' | 'rendah';

export const LABEL_TINGKAT: Record<Tingkat, string> = {
  paling: 'Paling didahulukan',
  tinggi: 'Didahulukan',
  sedang: 'Menengah',
  rendah: 'Belum didahulukan',
};

/** Posisi relatif, bukan ambang skor: 10% teratas, sepertiga teratas, sepertiga tengah, sisanya. */
export function tingkatDari(peringkat: number, total: number): Tingkat {
  if (total <= 0) return 'rendah';
  const p = peringkat / total;
  if (p <= 0.1) return 'paling';
  if (p <= 1 / 3) return 'tinggi';
  if (p <= 2 / 3) return 'sedang';
  return 'rendah';
}

/** Dua faktor dengan poin terbesar (faktor bernilai 0 tidak disebut). */
export function alasanUtama(isu: Pick<SkorIsu, 'kontribusi'>, n = 2): Faktor[] {
  return [...FAKTOR]
    .filter((f) => isu.kontribusi[f] > 0.05)
    .sort((a, b) => isu.kontribusi[b] - isu.kontribusi[a])
    .slice(0, n);
}

function gabung(xs: string[]): string {
  if (xs.length <= 1) return xs.join('');
  return `${xs.slice(0, -1).join(', ')} dan ${xs.at(-1)}`;
}

/**
 * "Jalan rusak di Setiabudi ada di urutan ke-4 dari 91 masalah. Alasan utamanya: …"
 * Untuk sepertiga bawah, yang disebut adalah hal yang paling MENAHAN (audit 10 Nov, D3): warga di urutan bawah
 * bertanya "kenapa belum?", bukan "kenapa naik?".
 */
export function kalimatIsu(isu: SkorIsu, total: number, bobot: Bobot): string {
  const awal = `${isu.kategori} di ${isu.kecamatan} ada di urutan ke-${isu.peringkat} dari ${total} masalah`;
  if (isu.peringkat > (total * 2) / 3) {
    return `${awal}. Belum didahulukan terutama karena ${PENAHAN_FAKTOR[penahanUtama(isu, bobot)]}.`;
  }
  const alasan = alasanUtama(isu).map((f) => ALASAN_AWAM[f]);
  return alasan.length ? `${awal}. Alasan utamanya: ${gabung(alasan)}.` : `${awal}.`;
}

export interface RingkasanKecamatan {
  kode_wilayah: string;
  kecamatan: string;
  kota: string;
  /** Skor isu tertinggi; null = tidak ada laporan aktif yang dinilai. */
  skor: number | null;
  /** Urutan di antara kecamatan yang punya isu (1 = paling didahulukan); null jika tidak ada isu. */
  urutan: number | null;
  isu: SkorIsu[];
}

export interface RingkasanJakarta {
  kecamatan: RingkasanKecamatan[];
  /** Jumlah kecamatan yang punya isu aktif. */
  dinilai: number;
  /** Median skor tertinggi antar kecamatan yang dinilai. */
  median: number;
  /** Jumlah isu (kecamatan × kategori) yang dinilai. */
  totalIsu: number;
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * Ringkas skor semua isu menjadi satu baris per kecamatan.
 * `semua` = daftar 42 kecamatan (dari peta), supaya kecamatan tanpa isu aktif tetap muncul.
 */
export function ringkasJakarta(
  skor: SkorIsu[],
  semua: { kode_wilayah: string; kecamatan: string; kota: string }[],
): RingkasanJakarta {
  const perKode = new Map<string, SkorIsu[]>();
  for (const s of skor) perKode.set(s.kode_wilayah, [...(perKode.get(s.kode_wilayah) ?? []), s]);

  const baris: RingkasanKecamatan[] = semua.map((k) => {
    const isu = (perKode.get(k.kode_wilayah) ?? []).sort((a, b) => a.peringkat - b.peringkat);
    return { ...k, skor: isu[0]?.skor ?? null, urutan: null, isu };
  });
  // Urutan antar kecamatan: skor tertinggi, lalu peringkat isu terbaiknya (pemecah seri yang sama dengan hitungSkor).
  const dinilai = baris
    .filter((b) => b.skor !== null)
    .sort((a, b) => b.skor! - a.skor! || a.isu[0].peringkat - b.isu[0].peringkat);
  dinilai.forEach((b, i) => {
    b.urutan = i + 1;
  });
  return {
    kecamatan: baris,
    dinilai: dinilai.length,
    median: median(dinilai.map((b) => b.skor!)),
    totalIsu: skor.length,
  };
}

/**
 * Kalimat pembuka halaman kecamatan, tiga kalimat pendek (audit 10 Nov, D2):
 * posisi → masalah terberat dengan skor dibanding nilai tengah → alasan (menaikkan di atas nilai tengah, menahan di bawahnya).
 */
export function kalimatKecamatan(k: RingkasanKecamatan, ringkas: RingkasanJakarta, bobot: Bobot): string {
  if (k.skor === null || k.urutan === null) {
    return `Kecamatan ${k.kecamatan} sedang tidak punya laporan yang belum selesai, jadi tidak masuk daftar urutan prioritas.`;
  }
  const atas = k.isu[0];
  const diAtas = k.skor > ringkas.median + 0.05;
  const diBawah = k.skor < ringkas.median - 0.05;
  const banding = diAtas
    ? 'lebih tinggi dari kebanyakan kecamatan'
    : diBawah
      ? 'lebih rendah dari kebanyakan kecamatan'
      : 'sama dengan nilai tengah Jakarta';
  const alasan = diBawah
    ? `Yang paling menahan: ${PENAHAN_FAKTOR[penahanUtama(atas, bobot)]}.`
    : (() => {
        const a = alasanUtama(atas).map((f) => ALASAN_AWAM[f]);
        return a.length ? `Alasan utamanya: ${gabung(a)}.` : '';
      })();
  return [
    `Kecamatan ${k.kecamatan} ada di urutan ke-${k.urutan} dari ${ringkas.dinilai} kecamatan yang punya laporan belum selesai.`,
    `Masalah terberatnya ${atas.kategori.toLowerCase()}: skor ${formatPoin(atas.skor)} dari 100, ${banding}.`,
    alasan,
  ]
    .filter(Boolean)
    .join(' ');
}
