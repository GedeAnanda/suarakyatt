// app/api/cron/reset-demo/route.ts — A2 · GET /api/cron/reset-demo (SDD 6.6, pemilik: B)
// Dipicu Vercel Cron (vercel.json) yang otomatis mengirim header Authorization: Bearer <CRON_SECRET>.
// Dua langkah: kembalikan email dan password akun demo ke nilai di env, lalu RPC reset_demo_data() untuk datanya.

import { timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/** Bandingkan dengan waktu konstan supaya rahasia tidak bisa ditebak dari lama respons. */
function headerSah(header: string | null, secret: string): boolean {
  if (!header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Akun demo dipakai bersama, dan siapa pun yang masuk ke sana bisa memanggil auth.updateUser dari browser.
 * Email dan password-nya dikembalikan ke nilai di env supaya akun demo tidak terkunci lebih dari sehari.
 * Akun dicari lewat profiles.is_demo + role, bukan email, karena emailnya pun bisa sudah diganti.
 * Mengembalikan peran yang gagal dipulihkan.
 */
async function pulihkanAkunDemo(supabase: ReturnType<typeof createAdminClient>): Promise<string[]> {
  const akun = [
    { peran: 'warga', email: process.env.DEMO_WARGA_EMAIL, password: process.env.DEMO_WARGA_PASSWORD },
    { peran: 'admin', email: process.env.DEMO_ADMIN_EMAIL, password: process.env.DEMO_ADMIN_PASSWORD },
  ];
  const { data: profil, error } = await supabase.from('profiles').select('id,role').eq('is_demo', true);
  if (error || !profil) return akun.map((a) => a.peran);

  const gagal: string[] = [];
  for (const a of akun) {
    const cocok = profil.filter((p) => p.role === a.peran);
    // Tepat satu akun demo per peran; selain itu lebih aman tidak menyentuh apa pun.
    if (!a.email || !a.password || cocok.length !== 1) {
      gagal.push(a.peran);
      continue;
    }
    const { error: galat } = await supabase.auth.admin.updateUserById(cocok[0].id, {
      email: a.email,
      password: a.password,
      email_confirm: true,
    });
    if (galat) {
      console.error(`[reset-demo] akun demo ${a.peran}: ${galat.code ?? galat.message}`);
      gagal.push(a.peran);
    }
  }
  return gagal;
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !headerSah(request.headers.get('authorization'), secret)) {
    return NextResponse.json({ error: 'TIDAK_BERWENANG' }, { status: 401 });
  }

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (err) {
    console.error('[reset-demo]', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'KONFIGURASI_SERVER_KOSONG' }, { status: 500 });
  }

  // Lebih dulu dari reset data, supaya tetap jalan walaupun RPC gagal (misalnya SEED_BELUM_ADA).
  const akunGagal = await pulihkanAkunDemo(supabase);
  if (akunGagal.length) console.error(`[reset-demo] akun demo belum dipulihkan: ${akunGagal.join(', ')}`);

  const { data, error } = await supabase.rpc('reset_demo_data');
  if (error) {
    // PGRST202: PostgREST tidak menemukan fungsinya. 42883: fungsi tidak ada di Postgres.
    if (error.code === 'PGRST202' || error.code === '42883') {
      return NextResponse.json(
        {
          error: 'FUNGSI_RESET_BELUM_ADA',
          pesan: 'RPC reset_demo_data() belum dibuat. Lihat TODO di supabase/migrations/0003_fn_laporan.sql (R11).',
        },
        { status: 501 },
      );
    }
    // P0001: error yang sengaja dilempar RPC, misalnya SEED_BELUM_ADA sebelum seed dimuat.
    if (error.code === 'P0001') {
      console.error(`[reset-demo] ${error.message}`);
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error(`[reset-demo] RPC gagal: ${error.code} ${error.message}`);
    return NextResponse.json({ error: 'RESET_GAGAL', kode: error.code }, { status: 500 });
  }

  // SDD 11.2: catat jumlah baris yang dihapus dan disalin ulang (tanpa email, nama, atau isi laporan).
  console.log('[reset-demo] selesai', JSON.stringify(data));
  const reset_at = new Date().toISOString();
  // Data sudah direset, tapi akun demo bisa masih terkunci: 500 supaya terlihat di log Vercel Cron.
  if (akunGagal.length) {
    return NextResponse.json({ error: 'PULIHKAN_AKUN_DEMO_GAGAL', peran: akunGagal, reset_at }, { status: 500 });
  }
  return NextResponse.json({ reset_at });
}
