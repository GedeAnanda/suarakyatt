// lib/supabase/aksi-status.ts — Server Action ubah status laporan oleh admin instansi (R6, SDD 6.3), pemilik: B
// Dipanggil dari components/admin/FormUbahStatus.tsx. Aturan transisi dan hak akses tetap di RPC
// update_report_status, yang dipanggil dengan sesi admin itu sendiri (bukan service role).
// Tambahannya: laporan yang ditolak karena konten melanggar langsung dipindah fotonya ke bucket privat
// "karantina". View publik sudah menyembunyikan URL-nya, tetapi berkas di bucket publik tetap bisa dibuka
// oleh siapa saja yang pernah menyimpan URL tersebut.

'use server';

import type { AlasanTolak, StatusLaporan } from '@/lib/types';
import { createAdminClient } from './admin';
import { createClient } from './server';

export interface InputUbahStatus {
  p_kode: string;
  p_status: StatusLaporan;
  p_catatan: string | null;
  p_bukti_url: string | null;
  p_alasan: AlasanTolak | null;
  p_duplikat_kode: string | null;
  p_perkiraan: string | null;
}

export type HasilUbahStatus = { ok: true } | { error: string };

const AWALAN_FOTO = '/storage/v1/object/public/foto-laporan/';

export async function ubahStatusLaporan(input: InputUbahStatus): Promise<HasilUbahStatus> {
  const supabase = await createClient();
  const { error } = await supabase.rpc('update_report_status', input);
  if (error) return { error: error.message };

  if (input.p_status === 'ditolak' && input.p_alasan === 'konten_melanggar') {
    try {
      await karantinaFoto(input.p_kode);
    } catch (err) {
      console.error('[ubah-status] karantina foto gagal:', err instanceof Error ? err.message : err);
      return { error: 'KARANTINA_GAGAL' };
    }
  }
  return { ok: true };
}

/** Pindahkan semua foto laporan dari foto-laporan ke karantina (path sama). Hanya setelah RPC berhasil. */
async function karantinaFoto(kode: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.from('reports').select('foto').eq('kode', kode).single();
  if (error) throw error;

  for (const url of (data.foto ?? []) as string[]) {
    const i = url.indexOf(AWALAN_FOTO);
    if (i < 0) continue; // foto data contoh yang tidak disimpan di Storage
    const path = decodeURIComponent(url.slice(i + AWALAN_FOTO.length));
    const { error: galat } = await admin.storage.from('foto-laporan').move(path, path, { destinationBucket: 'karantina' });
    // Sudah dipindah sebelumnya (misalnya percobaan ulang): bukan galat.
    if (galat && !/not.?found/i.test(galat.message)) throw galat;
  }
}
