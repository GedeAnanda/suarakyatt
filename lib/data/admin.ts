// lib/data/admin.ts — Q3 v_laporan_admin untuk halaman admin instansi (pemilik: A)
// RLS membatasi baris ke instansi admin yang login. Selama database belum berisi laporan sama sekali,
// halaman menampilkan laporan contoh Dinas Bina Jalan (simulasi) sebagai pratinjau hanya-baca.

import 'server-only';
import { connection } from 'next/server';
import { createClient } from './klien';
import type { LaporanPublik, TimelineItem } from '@/lib/types';
import { ambilDetailLaporan, ambilTitikLaporan, terlambat, type Sumber } from './laporan';

export type LaporanAdmin = Pick<
  LaporanPublik,
  | 'kode' | 'kategori' | 'kecamatan' | 'kota' | 'status' | 'created_at' | 'responded_at' | 'resolved_at'
  | 'batas_respons' | 'batas_selesai' | 'perkiraan_selesai' | 'is_simulated'
> & { terlambat: boolean };

const KOLOM =
  'kode,kategori,kecamatan,kota,status,created_at,responded_at,resolved_at,batas_respons,batas_selesai,perkiraan_selesai,is_simulated,terlambat';
const INSTANSI_CONTOH = 'Jalan rusak';

/** Urutan bawaan FR-D1: terlambat di atas, lalu yang paling dekat batas selesai. */
function urutkan(xs: LaporanAdmin[]) {
  return xs.sort((a, b) => Number(b.terlambat) - Number(a.terlambat) || a.batas_selesai.localeCompare(b.batas_selesai));
}

export async function ambilLaporanAdmin(): Promise<{ sumber: Sumber; laporan: LaporanAdmin[]; sekarang: number }> {
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.from('v_laporan_admin').select(KOLOM).neq('status', 'dibatalkan').limit(500);
  if (!error && data && data.length > 0) {
    return { sumber: 'db', laporan: urutkan(data as LaporanAdmin[]), sekarang: Date.now() };
  }
  // Database kosong: cek apakah memang belum ada laporan sama sekali sebelum memakai contoh.
  const titik = await ambilTitikLaporan();
  if (titik.sumber === 'db') return { sumber: 'db', laporan: [], sekarang: titik.sekarang };
  const laporan = titik.laporan
    .filter((l) => l.kategori === INSTANSI_CONTOH)
    .map((l) => ({
      ...l,
      responded_at: null,
      resolved_at: null,
      perkiraan_selesai: null,
      is_simulated: true,
      terlambat: terlambat(l, titik.sekarang),
    }));
  return { sumber: 'contoh', laporan: urutkan(laporan), sekarang: titik.sekarang };
}

export async function ambilLaporanAdminDetail(
  kode: string,
): Promise<{ sumber: Sumber; laporan: LaporanPublik; timeline: TimelineItem[]; sekarang: number; milikInstansi: boolean } | null> {
  await connection();
  const detail = await ambilDetailLaporan(kode);
  if (!detail) return null;
  if (detail.sumber === 'contoh') return { ...detail, milikInstansi: false };
  // Baris di v_laporan_admin hanya kembali jika laporan ini milik instansi admin (RLS).
  const supabase = await createClient();
  const { data } = await supabase.from('v_laporan_admin').select('kode').eq('kode', kode).maybeSingle();
  return { ...detail, milikInstansi: Boolean(data) };
}
