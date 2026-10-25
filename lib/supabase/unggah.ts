// lib/supabase/unggah.ts — S1 · unggah foto laporan/bukti ke Storage (SDD 5.4, 6.6), pemilik: B
// Dipanggil dari Client Component SETELAH foto dikompres dan EXIF-nya dibuang (tugas A, SDD 5.4).
// URL hasilnya dikirim ke create_report (p_foto) atau update_report_status (p_bukti_url).

import { createClient } from './client';

export type BucketFoto = 'foto-laporan' | 'bukti';

const EKSTENSI: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' };
const UKURAN_MAKS = 5 * 1024 * 1024; // sama dengan batas bucket

/**
 * Unggah satu foto ke `<bucket>/<uid>/<uuid>.<ext>` dan kembalikan URL publiknya.
 * Melempar Error berisi kode di lib/errors.ts (tampilkan dengan pesanError).
 */
export async function unggahFoto(bucket: BucketFoto, foto: Blob): Promise<string> {
  const ekstensi = EKSTENSI[foto.type];
  if (!ekstensi || foto.size === 0 || foto.size > UKURAN_MAKS) throw new Error('INPUT_TIDAK_VALID');

  const supabase = createClient();
  const { data } = await supabase.auth.getClaims();
  const uid = data?.claims.sub;
  if (!uid) throw new Error('TIDAK_LOGIN');

  // Nama file acak (bukan nama asli dari perangkat) sesuai SDD 5.4.
  const path = `${uid}/${crypto.randomUUID()}.${ekstensi}`;
  const { error } = await supabase.storage.from(bucket).upload(path, foto, { contentType: foto.type, upsert: false });
  if (error) throw new Error('UNGGAH_GAGAL');

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
