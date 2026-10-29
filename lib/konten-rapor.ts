// lib/konten-rapor.tsx — definisi metrik Rapor Instansi (PRD 8, SDD 8.1), pemilik: A
// Dipakai di tooltip /rapor dan di halaman /rapor/cara-menilai, supaya kalimatnya selalu sama.

import type { RaporInstansi } from './types';

const URUT_HURUF = { A: 0, B: 1, C: 2, D: 3, E: 4 } as const;

/** Urutan tampil rapor (halaman Rapor dan tab Rapor di Beranda): huruf terbaik dulu, "Data belum cukup" terakhir. */
export function urutkanRapor<T extends Pick<RaporInstansi, 'huruf' | 'nilai'>>(instansi: T[]): T[] {
  return [...instansi].sort(
    (a, b) => (a.huruf ? URUT_HURUF[a.huruf] : 9) - (b.huruf ? URUT_HURUF[b.huruf] : 9) || b.nilai - a.nilai,
  );
}

export const KOMPONEN = ['R', 'S', 'P', 'K'] as const;
export type Komponen = (typeof KOMPONEN)[number];

export const INFO_KOMPONEN: Record<Komponen, { nama: string; bobot: number; rumus: string }> = {
  R: {
    nama: 'Kepatuhan batas waktu respons',
    bobot: 0.3,
    rumus:
      'Laporan yang direspons dalam batas waktu ÷ laporan yang sudah bisa dinilai (sudah direspons, atau belum direspons tapi batasnya lewat). Menolak juga dihitung sebagai respons.',
  },
  S: {
    nama: 'Kepatuhan batas waktu selesai',
    bobot: 0.3,
    rumus:
      'Laporan Selesai dalam batas waktu ÷ laporan tidak ditolak yang sudah bisa dinilai (sudah Selesai, atau belum Selesai tapi batasnya lewat).',
  },
  P: {
    nama: 'Tingkat penyelesaian',
    bobot: 0.2,
    rumus: 'Laporan Selesai ÷ laporan yang tidak ditolak.',
  },
  K: {
    nama: 'Kepuasan warga',
    bobot: 0.2,
    rumus:
      'Rata-rata rating ÷ 5, dengan rating netral 3 dari 5 sebagai titik awal: (jumlah bintang + 3 × 5) ÷ (jumlah pemberi rating + 5). Instansi tanpa rating mendapat 0,6.',
  },
};

export const DEFINISI_RAPOR = {
  penolakan:
    'Laporan yang ditolak "Tidak valid" atau "Konten melanggar" ÷ semua laporan, tanpa laporan yang ditolak sebagai duplikat atau dibatalkan pelapor. Peringatan menyala jika di atas 25%, atau lebih dari dua kali median instansi lain dengan minimal 10%. Selama menyala, huruf ditahan maksimal C.',
  sampel:
    'Jumlah laporan yang sudah bisa dinilai untuk komponen respons. Laporan yang masih dalam batas waktu dan belum selesai belum dihitung. Di bawah 10 laporan, rapor ditulis "Data belum cukup".',
  median:
    'Nilai tengah waktu dari laporan masuk sampai pertama kali direspons. Ditampilkan, tapi tidak masuk nilai: laporan yang diabaikan tidak punya waktu respons, jadi median bisa menyesatkan.',
  terlambat: 'Laporan yang masih aktif dan sudah melewati batas waktu respons atau selesai.',
  huruf: 'A untuk nilai 85 ke atas, B 70–84, C 55–69, D 40–54, dan E di bawah 40.',
};
