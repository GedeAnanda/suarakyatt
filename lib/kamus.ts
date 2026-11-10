// lib/kamus.ts — kamus bahasa warga (audit bahasa awam 10 Nov, docs/audit-awam-2026-11-10.md)
// Satu tempat untuk arti status, alasan tolak, alasan tunda, dan istilah yang tampil ke warga.
// Label pendek untuk admin dan dashboard tetap di lib/konten.ts; teks di sini adalah penjelasan satu kalimat.
//
// Istilah baku di teks warga (lihat juga docs/audit-awam-2026-11-10.md, bagian Kamus):
//   sapaan "kamu" · dinas (bukan instansi) · diperiksa (bukan diverifikasi) · laporan = satu kiriman,
//   masalah = laporan sejenis di satu kecamatan (bukan isu wilayah) · urutan ke-N dari M (bukan peringkat; 1 = paling
//   didahulukan) · skor prioritas 0–100 · 6 hal yang dinilai (NAMA_FAKTOR) · aturan resmi / pilihan cepat / percobaan
//   (bukan bobot acuan / preset / simulasi) · nilai tengah (bukan median) · batas waktu ditanggapi / batas waktu selesai
//   (bukan respons/SLA) · Data buatan (bukan data simulasi/contoh/prototipe) · rapor dinas A Sangat baik … E Buruk

import type { AlasanTolak, AlasanTunda, StatusLaporan } from './types';

/** Arti tiap status dalam satu kalimat, untuk teks bantuan di bawah badge dan di halaman Lacak. */
export const ARTI_STATUS: Record<StatusLaporan, string> = {
  menunggu: 'Laporan sudah masuk, tetapi belum diperiksa dinas.',
  diverifikasi: 'Dinas sudah memeriksa dan memastikan masalahnya ada. Laporan masuk antrean perbaikan.',
  diproses: 'Dinas sedang menjadwalkan atau mengerjakan perbaikannya.',
  selesai: 'Dinas menyatakan masalahnya sudah diperbaiki. Bandingkan foto sebelum dan sesudahnya.',
  ditolak: 'Dinas tidak akan menindaklanjuti laporan ini. Alasannya tertulis di halaman laporan.',
  dibatalkan: 'Pelapor menarik laporan ini sebelum diperiksa, jadi laporan tidak tampil di peta.',
};

/** Arti alasan penolakan, dari sudut pandang warga. */
export const ARTI_ALASAN: Record<AlasanTolak, string> = {
  duplikat: 'Masalah yang sama di lokasi yang sama sudah dilaporkan orang lain.',
  tidak_valid: 'Dinas menilai laporan ini tidak bisa ditindaklanjuti, misalnya foto tidak menunjukkan masalah atau titiknya keliru.',
  konten_melanggar: 'Foto atau ceritanya berisi hal yang tidak pantas atau data pribadi orang lain, jadi disembunyikan.',
};

/** Alasan penolakan sebagai kalimat pendek: "Ditolak karena …". */
export const KARENA_ALASAN: Record<AlasanTolak, string> = {
  duplikat: 'masalah yang sama sudah dilaporkan orang lain',
  tidak_valid: 'laporannya tidak bisa ditindaklanjuti',
  konten_melanggar: 'isinya melanggar aturan',
};

/** Arti alasan tunda (kendala) untuk warga. */
export const ARTI_TUNDA: Record<AlasanTunda, string> = {
  antre_jadwal: 'Petugas dan alatnya sedang dipakai di lokasi lain yang lebih didahulukan.',
  menunggu_anggaran: 'Perbaikannya lebih besar dari perawatan biasa, jadi perlu dana khusus dulu.',
  menunggu_material: 'Bahan atau suku cadangnya belum tersedia.',
  koordinasi_instansi: 'Lokasi atau barangnya milik pihak lain (misalnya PLN), jadi dinas harus bekerja sama dulu.',
  cuaca: 'Hujan atau air yang tinggi membuat pekerjaan belum aman dilakukan.',
  lainnya: 'Dinas menuliskan alasannya sendiri di catatan.',
};

/** Satu kalimat jujur tentang ke mana laporan pergi. Dipakai di Lapor, banner sukses, dan halaman Lacak. */
export const BUKAN_KANAL_RESMI =
  'SUARAKYAT adalah proyek lomba, bukan layanan pengaduan pemerintah. Laporanmu tampil di peta umum dan ikut dihitung dalam urutan prioritas, tetapi tidak dikirim ke dinas sungguhan.';

/** Satu kalimat untuk label "Data buatan". */
export const DATA_BUATAN = 'Laporan, dinas, dan nilai di sini dibuat tim untuk lomba, bukan data pemerintah.';

/** Arti huruf rapor dinas. */
export const ARTI_HURUF = { A: 'Sangat baik', B: 'Baik', C: 'Cukup', D: 'Kurang', E: 'Buruk' } as const;

/** "urutan ke-12 dari 91" + penjelas arah urutan. */
export function urutanKe(urutan: number, total: number): string {
  return `urutan ke-${urutan} dari ${total}`;
}
export const ARAH_URUTAN = 'urutan 1 = paling didahulukan';
