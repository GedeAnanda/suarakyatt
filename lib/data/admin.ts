// lib/data/admin.ts — Q3 v_laporan_admin untuk halaman admin instansi (pemilik: A)
// RLS membatasi baris ke instansi admin yang login. Selama database belum berisi laporan sama sekali,
// halaman menampilkan laporan contoh Dinas Bina Jalan (simulasi) sebagai pratinjau hanya-baca.

import 'server-only';
import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { LaporanPublik, TimelineItem } from '@/lib/types';
import { ambilDetailLaporan, ambilTitikLaporan, terlambat, type Sumber } from './laporan';
import { ambilSesi, type Sesi } from './sesi';

export type LaporanAdmin = Pick<
  LaporanPublik,
  | 'kode' | 'kategori' | 'kecamatan' | 'kota' | 'status' | 'created_at' | 'responded_at' | 'resolved_at'
  | 'batas_respons' | 'batas_selesai' | 'perkiraan_selesai' | 'is_simulated'
> & { terlambat: boolean };

const KOLOM =
  'kode,kategori,kecamatan,kota,status,created_at,responded_at,resolved_at,batas_respons,batas_selesai,perkiraan_selesai,is_simulated,terlambat';

/** Urutan bawaan FR-D1: terlambat di atas, lalu yang paling dekat batas selesai. */
function urutkan(xs: LaporanAdmin[]) {
  return xs.sort((a, b) => Number(b.terlambat) - Number(a.terlambat) || a.batas_selesai.localeCompare(b.batas_selesai));
}

// Hak baca juga bisa berasal dari kepemilikan laporan atau peran Perencana.
// Antrean dan tombol tindak lanjut tetap dibatasi ke instansi, sama seperti RPC.
async function kategoriInstansi(sesi: Sesi | null): Promise<{ id: number; nama: string }[]> {
  if (sesi?.peran !== 'admin' || sesi.instansiId === null) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from('categories').select('id,nama').eq('instansi_id', sesi.instansiId);
  if (error) throw new Error('Kategori instansi belum dapat dimuat. Coba lagi.');
  return data ?? [];
}

export async function ambilLaporanAdmin(sesi: Sesi | null): Promise<{ sumber: Sumber; laporan: LaporanAdmin[]; sekarang: number }> {
  await connection();
  const kategori = await kategoriInstansi(sesi);
  if (!kategori.length) return { sumber: 'db', laporan: [], sekarang: Date.now() };
  const supabase = await createClient();
  const { data, error } = await supabase.from('v_laporan_admin').select(KOLOM)
    .in('category_id', kategori.map((k) => k.id)).neq('status', 'dibatalkan')
    .order('terlambat', { ascending: false }).order('batas_selesai').limit(500);
  if (!error && data && data.length > 0) {
    return { sumber: 'db', laporan: urutkan(data as LaporanAdmin[]), sekarang: Date.now() };
  }
  // Database kosong: cek apakah memang belum ada laporan sama sekali sebelum memakai contoh.
  const titik = await ambilTitikLaporan();
  if (titik.sumber === 'db') return { sumber: 'db', laporan: [], sekarang: titik.sekarang };
  const laporan = titik.laporan
    .filter((l) => kategori.some((k) => k.nama === l.kategori))
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
  const [detail, sesi] = await Promise.all([ambilDetailLaporan(kode), ambilSesi()]);
  if (!detail) return null;
  if (detail.sumber === 'contoh') return { ...detail, milikInstansi: false };
  const kategori = await kategoriInstansi(sesi);
  if (!kategori.length) return { ...detail, milikInstansi: false };
  const supabase = await createClient();
  const { data } = await supabase.from('v_laporan_admin').select('kode').eq('kode', kode).in('category_id', kategori.map((k) => k.id)).maybeSingle();
  return { ...detail, milikInstansi: Boolean(data) };
}
