// lib/data/klien.ts — client Supabase untuk lapisan data halaman, dengan batas waktu (pemilik: A)
// Sama dengan lib/supabase/server.ts (B), ditambah pengaman supaya halaman tidak menunggu lama kalau
// database tidak terjangkau (misalnya .env menunjuk project yang sudah tidak ada):
// - tanpa pengulangan otomatis: postgrest-js mengulang GET yang gagal 3 kali dengan jeda 1 + 2 + 4 detik,
//   jadi satu permintaan gagal baru selesai setelah ±7 detik; di sini kegagalan langsung jatuh ke data contoh;
// - tiap permintaan dibatasi 4 detik (koneksi yang menggantung);
// - setelah satu kegagalan jaringan, permintaan berikutnya selama 30 detik langsung gagal.
// Kalau database sehat, hasilnya sama dengan client B.

import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { wajibEnvSupabase } from '@/lib/supabase/env';

const BATAS_MS = 4000;
const JEDA_MS = 30_000;
let tidakTerjangkauSampai = 0;

async function fetchBerbatas(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (Date.now() < tidakTerjangkauSampai) {
    throw new TypeError('Database tidak terjangkau; dicoba lagi setelah jeda.');
  }
  const batas = AbortSignal.timeout(BATAS_MS);
  const sinyal = init?.signal ? AbortSignal.any([init.signal, batas]) : batas;
  try {
    return await fetch(input, { ...init, signal: sinyal });
  } catch (err) {
    // Dibatalkan pemanggilnya sendiri bukan tanda database mati.
    if (!init?.signal?.aborted) tidakTerjangkauSampai = Date.now() + JEDA_MS;
    throw err;
  }
}

export async function createClient() {
  const { url, anonKey } = wajibEnvSupabase();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    global: { fetch: fetchBerbatas },
    db: { retry: false },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Dipanggil dari Server Component (cookie tidak bisa ditulis di sana).
          // Aman diabaikan karena proxy.ts sudah memperbarui sesi di setiap request.
        }
      },
    },
  });
}
