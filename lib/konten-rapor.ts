// lib/konten-rapor.ts — teks dan pembanding tampilan Rapor dinas (PRD 8, SDD 8.1), pemilik: A
// Dipakai di /rapor, /rapor/cara-menilai, dan tab Rapor di Beranda, supaya kalimatnya selalu sama.
// Kamus baku (lib/kamus.ts): dinas, huruf A Sangat baik … E Buruk, angka "84 dari 100", nilai tengah (bukan median),
// laporan yang dinilai (bukan sampel). Kode R/S/P/K hanya tampil di /rapor/cara-menilai.
// File ini hanya menyusun kalimat; rumus nilai dan huruf tetap di lib/scoring/rapor.ts dan fungsi SQL.

import { desimal, persen } from './format';
import { ARTI_HURUF } from './kamus';
import { AMBANG_TOLAK_MIN, AMBANG_TOLAK_TETAP, SAMPEL_MIN } from './scoring/rapor';
import type { Huruf, RaporInstansi } from './types';

const URUT_HURUF = { A: 0, B: 1, C: 2, D: 3, E: 4 } as const;

/** Urutan tampil rapor (halaman Rapor dan tab Rapor di Beranda): huruf terbaik dulu, "Belum dinilai" terakhir. */
export function urutkanRapor<T extends Pick<RaporInstansi, 'huruf' | 'nilai'>>(instansi: T[]): T[] {
  return [...instansi].sort(
    (a, b) => (a.huruf ? URUT_HURUF[a.huruf] : 9) - (b.huruf ? URUT_HURUF[b.huruf] : 9) || b.nilai - a.nilai,
  );
}

/** Nama dinas tanpa akhiran "(simulasi)" dari data buatan. */
export const namaDinas = (nama: string) => nama.replace(/\s*\(simulasi\)$/, '');

/** 0,84 → 84. */
export const seratus = (x: number) => Math.round(x * 100);

/** 0,84 → "84 dari 100". */
export const dariSeratus = (x: number) => `${seratus(x)} dari 100`;

/** "B · Baik". */
export const hurufDanArti = (h: Huruf) => `${h} · ${ARTI_HURUF[h]}`;

export const KOMPONEN = ['R', 'S', 'P', 'K'] as const;
export type Komponen = (typeof KOMPONEN)[number];

export interface InfoKomponen {
  /** Nama baku untuk warga, dipakai sebagai label. */
  nama: string;
  /** Bentuk di tengah kalimat: "Paling kuat: cepat menanggapi (84 dari 100)". */
  kata: string;
  bobot: number;
  /** Arti tanpa rumus, untuk popover di /rapor. */
  arti: string;
  /** Rumus lengkap, hanya untuk /rapor/cara-menilai. */
  rumus: string;
  /** Makna nilai 0–1 dalam satu kalimat, tanpa titik: "84 dari 100 laporan ditanggapi tepat waktu". */
  makna: (x: number) => string;
  /** Pembanding rata-rata dinas lain dalam satu kalimat, tanpa titik. */
  lain: (x: number) => string;
}

const rataLain = (x: number) => `Dinas lain rata-rata ${dariSeratus(x)}`;

export const INFO_KOMPONEN: Record<Komponen, InfoKomponen> = {
  R: {
    nama: 'Cepat menanggapi',
    kata: 'cepat menanggapi',
    bobot: 0.3,
    arti: 'Dari laporan yang sudah bisa dinilai, berapa yang ditanggapi sebelum batas waktunya. Menolak juga terhitung menanggapi.',
    rumus:
      'Laporan yang ditanggapi sebelum batas waktunya ÷ laporan yang sudah bisa dinilai. Yang sudah bisa dinilai: sudah ditanggapi, atau belum ditanggapi padahal batasnya lewat.',
    makna: (x) => `${dariSeratus(x)} laporan ditanggapi tepat waktu`,
    lain: rataLain,
  },
  S: {
    nama: 'Selesai tepat waktu',
    kata: 'selesai tepat waktu',
    bobot: 0.3,
    arti: 'Dari laporan yang tidak ditolak dan sudah bisa dinilai, berapa yang selesai sebelum batas waktunya.',
    rumus:
      'Laporan yang selesai sebelum batas waktunya ÷ laporan tidak ditolak yang sudah bisa dinilai. Yang sudah bisa dinilai: sudah selesai, atau belum selesai padahal batasnya lewat.',
    makna: (x) => `${dariSeratus(x)} laporan selesai tepat waktu`,
    lain: rataLain,
  },
  P: {
    nama: 'Banyak yang diselesaikan',
    kata: 'banyak yang diselesaikan',
    bobot: 0.2,
    arti: 'Dari laporan yang tidak ditolak, berapa yang sudah selesai, cepat atau lambat.',
    rumus: 'Laporan yang sudah selesai ÷ laporan yang tidak ditolak.',
    makna: (x) => `${dariSeratus(x)} laporan sudah diselesaikan`,
    lain: rataLain,
  },
  K: {
    nama: 'Warga puas',
    kata: 'kepuasan warga',
    bobot: 0.2,
    arti: 'Rata-rata bintang dari pelapor. Supaya 1–2 rating tidak terlalu menentukan, tiap dinas dianggap sudah punya 5 rating bintang 3.',
    rumus:
      '(Jumlah bintang + 5 × 3) ÷ (jumlah pemberi rating + 5), lalu dibagi 5 bintang. Dinas tanpa rating mendapat 60 dari 100.',
    makna: (x) => `Pelapor memberi rata-rata ${desimal(x * 5)} dari 5 bintang`,
    lain: (x) => `Dinas lain rata-rata ${desimal(x * 5)} bintang`,
  },
};

/** Satu baris cara membaca rapor, di atas daftar /rapor. */
export const CARA_BACA_RAPOR =
  'Huruf A = sangat baik, B = baik, C = cukup, D = kurang, E = buruk. Huruf dihitung dari empat hal: cepat menanggapi, selesai tepat waktu, banyak yang diselesaikan, dan kepuasan warga.';

export const DEFINISI_RAPOR = {
  penolakan:
    'Persen laporan yang ditolak karena dianggap tidak benar atau melanggar aturan. Laporan dobel tidak dihitung. Batas wajarnya 25%, atau dua kali lipat dinas lain pada umumnya. Kalau lewat batas, nilainya paling tinggi C.',
  penolakanRinci:
    'Tepatnya, batas terlewati kalau lebih dari 25% laporan ditolak. Atau, kalau minimal 10% ditolak dan angkanya lebih dari dua kali nilai tengah dinas lain.',
  sampel: `Laporan yang sudah bisa dinilai: sudah ditanggapi, atau belum ditanggapi padahal batas waktunya lewat. Laporan baru yang masih dalam batas waktu belum dihitung. Kalau kurang dari ${SAMPEL_MIN}, dinas belum dinilai.`,
  median:
    'Nilai tengah waktu dari laporan masuk sampai pertama kali ditanggapi. Separuh laporan lebih cepat dari ini, separuh lebih lambat. Angka ini tidak ikut dinilai, karena laporan yang didiamkan tidak punya waktu tanggapan.',
  terlambat: 'Laporan yang belum selesai dan sudah melewati batas waktu ditanggapi atau batas waktu selesai.',
  /** Penjelas dalam kurung, huruf kecil tanpa titik. */
  keberatan: 'warga membantah penolakan atau klaim selesai, dan terbukti benar',
  belumDinilai: `Belum dinilai: kurang dari ${SAMPEL_MIN} laporan.`,
};

/** Satu kesimpulan dari komponen terkuat dan terlemah. */
export function kesimpulanRapor(i: Pick<RaporInstansi, Komponen>): string {
  const urut = [...KOMPONEN].sort((a, b) => i[b] - i[a]);
  const kuat = urut[0];
  const lemah = urut[urut.length - 1];
  if (i[kuat] - i[lemah] < 0.05) {
    const rata = KOMPONEN.reduce((n, k) => n + i[k], 0) / KOMPONEN.length;
    return `Keempat hal nilainya mirip, sekitar ${dariSeratus(rata)}.`;
  }
  return `Paling kuat: ${INFO_KOMPONEN[kuat].kata} (${dariSeratus(i[kuat])}). Paling lemah: ${INFO_KOMPONEN[lemah].kata} (${dariSeratus(i[lemah])}).`;
}

function nilaiTengah(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export interface PembandingRapor {
  /** Rata-rata tiap komponen dinas lain yang sudah dinilai; null kalau tidak ada. */
  rata: Record<Komponen, number> | null;
  /** Nilai tengah persen laporan ditolak dinas lain; null kalau tidak ada dinas lain. */
  tolakTengah: number | null;
}

/** Pembanding untuk satu dinas, dihitung dari dinas lain di halaman yang sama. */
export function pembandingRapor(semua: RaporInstansi[], id: number): PembandingRapor {
  const lain = semua.filter((d) => d.id !== id);
  const dinilai = lain.filter((d) => d.huruf !== null);
  const rata = dinilai.length
    ? (Object.fromEntries(
        KOMPONEN.map((k) => [k, dinilai.reduce((n, d) => n + d[k], 0) / dinilai.length]),
      ) as Record<Komponen, number>)
    : null;
  return { rata, tolakTengah: nilaiTengah(lain.map((d) => d.tingkat_penolakan)) };
}

/**
 * Batas penolakan yang ditampilkan: 25%, kecuali peringatan menyala karena aturan "dua kali lipat dinas lain"
 * (persennya di bawah 25%); saat itu batasnya dua kali nilai tengah dinas lain, minimal 10%. Peringatannya sendiri
 * tetap dari data (kolom peringatan_penolakan), bukan dihitung ulang di sini.
 */
export function batasTolak(
  i: Pick<RaporInstansi, 'tingkat_penolakan' | 'peringatan_penolakan'>,
  tolakTengah: number | null,
): { batas: number; lipat: boolean } {
  if (i.peringatan_penolakan && i.tingkat_penolakan <= AMBANG_TOLAK_TETAP && tolakTengah !== null) {
    return { batas: Math.max(AMBANG_TOLAK_MIN, 2 * tolakTengah), lipat: true };
  }
  return { batas: AMBANG_TOLAK_TETAP, lipat: false };
}

/** "Dinas ini menolak 35% laporan, melebihi batas wajar 25%. Karena itu nilainya paling tinggi C, walau angkanya cukup untuk A." */
export function kalimatPeringatanTolak(
  i: Pick<RaporInstansi, 'tingkat_penolakan' | 'peringatan_penolakan' | 'huruf' | 'huruf_asli'>,
  tolakTengah: number | null,
): string {
  const { batas, lipat } = batasTolak(i, tolakTengah);
  const lewat =
    lipat && tolakTengah !== null
      ? `lebih dari dua kali lipat dinas lain pada umumnya (${persen(tolakTengah)})`
      : `melebihi batas wajar ${persen(batas)}`;
  const awal = `Dinas ini menolak ${persen(i.tingkat_penolakan)} laporan, ${lewat}.`;
  if (i.huruf === null) return awal;
  const walau = i.huruf_asli === 'A' || i.huruf_asli === 'B' ? `, walau angkanya cukup untuk ${i.huruf_asli}` : '';
  return `${awal} Karena itu nilainya paling tinggi C${walau}.`;
}

/** Dinas terbaik dan yang paling perlu diperbaiki, dari dinas yang sudah dinilai. */
export function ringkasanRapor<T extends Pick<RaporInstansi, 'huruf' | 'nilai'>>(
  instansi: T[],
): { baik: T & { huruf: Huruf }; buruk: (T & { huruf: Huruf }) | null } | null {
  const dinilai = urutkanRapor(instansi).filter((i): i is T & { huruf: Huruf } => i.huruf !== null);
  if (dinilai.length === 0) return null;
  return { baik: dinilai[0], buruk: dinilai.length > 1 ? dinilai[dinilai.length - 1] : null };
}
