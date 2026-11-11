// lib/supabase/muat.ts — client Supabase untuk browser yang dimuat saat dibutuhkan (pemilik: B)
// supabase-js sekitar 67 KB (gzip). Di browser ia hanya dipakai saat tombol ditekan (dukung, batal, beri nilai,
// kirim laporan, unggah foto, simpan aturan), jadi tidak ikut dimuat saat halaman dibuka. Ukur LCP 10 Nov.

import type { createClient } from './client';

export async function supabaseBrowser(): Promise<ReturnType<typeof createClient>> {
  const { createClient } = await import('./client');
  return createClient();
}
