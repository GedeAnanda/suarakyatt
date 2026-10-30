// lib/types.ts — kontrak data bersama (SDD v1.0 bagian 7)
// Ubah hanya dengan persetujuan pemilik kedua sisi (frontend dan backend/data).

export type StatusLaporan =
  | 'menunggu'
  | 'diverifikasi'
  | 'diproses'
  | 'selesai'
  | 'ditolak'
  | 'dibatalkan';
export type AlasanTolak = 'duplikat' | 'tidak_valid' | 'konten_melanggar';
export type Faktor = 'urgensi' | 'volume' | 'dukungan' | 'umur' | 'kerentanan' | 'kepadatan';
export type Bobot = Record<Faktor, number>;
export type Huruf = 'A' | 'B' | 'C' | 'D' | 'E';

export interface LaporanPublik {
  kode: string;
  kategori: string;
  instansi: string;
  kecamatan: string;
  kota: string;
  status: StatusLaporan;
  lat: number;
  lng: number;
  deskripsi: string | null; // null jika konten_melanggar
  foto: string[]; // kosong jika konten_melanggar
  foto_bukti: string | null; // hanya jika selesai
  alasan_tolak: AlasanTolak | null;
  inisial_pelapor: string;
  jumlah_upvote: number;
  created_at: string;
  responded_at: string | null;
  resolved_at: string | null;
  perkiraan_selesai: string | null;
  batas_respons: string;
  batas_selesai: string;
  is_simulated: boolean;
}

export interface TimelineItem {
  kode: string;
  status_baru: StatusLaporan;
  alasan_tolak: AlasanTolak | null;
  catatan: string | null;
  bukti_url: string | null;
  pelaku: string; // "Pelapor" atau "Admin · <instansi>"
  created_at: string;
}

export interface RaporInstansi {
  id: number;
  nama: string;
  sampel: number;
  R: number; // 0 sampai 1
  S: number;
  P: number;
  K: number;
  nilai: number; // 0 sampai 100, satu desimal
  huruf_asli: Huruf; // huruf sebelum batas maksimal C
  huruf: Huruf | null; // null = data belum cukup
  tingkat_penolakan: number;
  peringatan_penolakan: boolean;
  median_respons_jam: number | null;
  terlambat_aktif: number;
  keberatan_diterima: number;
  per_kategori: { kategori: string; sampel: number; R: number; S: number; P: number }[];
}

export interface RaporResponse {
  periode: { dari: string; sampai: string };
  is_simulated: boolean;
  instansi: RaporInstansi[];
}

export interface FaktorIsu {
  id: string; // "<region_id>-<category_id>"
  kode_wilayah: string;
  kecamatan: string;
  kota: string;
  category_id: number;
  kategori: string;
  laporan_aktif: number;
  laporan_terverifikasi: number;
  mentah: Record<Faktor, number | null>; // umur null di mode crm
}

export interface PriorityFactorsResponse {
  sumber: 'simulasi' | 'crm';
  waktu_acuan: string;
  isu: FaktorIsu[];
}

// Hasil lib/scoring di browser
export interface SkorIsu extends FaktorIsu {
  nilai01: Record<Faktor, number>; // setelah diubah ke skala 0 sampai 1
  kontribusi: Record<Faktor, number>; // poin; jumlahnya sama dengan skor
  skor: number; // 0 sampai 100
  peringkat: number; // 1 = paling prioritas
  faktor_tidak_membedakan: Faktor[];
  penjelasan: string;
}

export interface KenapaBelum {
  peringkat: number;
  total: number;
  pendorong: { faktor: Faktor; poin: number };
  penahan: { faktor: Faktor; poin: number; maksimal: number };
  per_preset: { preset: string; peringkat: number }[];
  catatan: string | null;
}
