// lib/format.ts — format angka, tanggal, dan durasi untuk UI (pemilik: A)
// Semua tanggal ditampilkan dalam zona Asia/Jakarta, bahasa Indonesia.

const ZONA = 'Asia/Jakarta';

/** 73,5 · satu desimal, koma desimal. */
export const desimal = (x: number, digit = 1) =>
  x.toLocaleString('id-ID', { minimumFractionDigits: digit, maximumFractionDigits: digit });

/** 18.221 · pemisah ribuan titik. */
export const ribuan = (x: number) => Math.round(x).toLocaleString('id-ID');

/** 0,32 → "32%". */
export const persen = (x: number) => `${Math.round(x * 100)}%`;

/** "1 November 2026". */
export const tanggal = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: ZONA });

/**
 * Akhir hari sebuah tanggal (kolom `date`, "2026-11-01") di Jakarta, dalam milidetik. Date.parse("2026-11-01")
 * jatuh pada pukul 07.00 WIB hari itu, padahal janji "selesai 1 November" baru lewat setelah hari itu habis.
 */
export const akhirHari = (tgl: string) => Date.parse(`${tgl.slice(0, 10)}T23:59:59.999+07:00`);

/** Tanggal hari ini di Jakarta dalam bentuk "2026-11-01", untuk atribut min pada <input type="date">. */
export const hariIni = (sekarang = Date.now()) => new Date(sekarang).toLocaleDateString('en-CA', { timeZone: ZONA });

/** "1 Nov 2026, 14.05". */
export const tanggalJam = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ZONA,
  });

/** "18 jam", "3 hari", "2 hari 4 jam" dari selisih milidetik (selalu positif). */
export function durasi(ms: number): string {
  const jam = Math.max(0, Math.round(Math.abs(ms) / 3_600_000));
  if (jam < 1) return 'kurang dari 1 jam';
  if (jam < 48) return `${jam} jam`;
  const hari = Math.floor(jam / 24);
  const sisa = jam % 24;
  return sisa && hari < 7 ? `${hari} hari ${sisa} jam` : `${hari} hari`;
}

/** "3 hari lalu" untuk waktu lampau. */
export function lalu(iso: string, sekarang: number): string {
  const ms = sekarang - Date.parse(iso);
  if (ms < 3_600_000) return 'baru saja';
  return `${durasi(ms)} lalu`;
}

/** Ubah "sr k7w3pa" menjadi "SR-K7W3PA"; null jika bukan bentuk kode yang sah (FR-B4). */
export function normalisasiKode(masukan: string): string | null {
  const bersih = masukan.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const inti = bersih.startsWith('SR') ? bersih.slice(2) : bersih;
  return /^[A-HJ-NP-Z2-9]{6}$/.test(inti) ? `SR-${inti}` : null;
}
