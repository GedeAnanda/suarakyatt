// app/api/cron/reset-demo/route.ts — A2 · GET /api/cron/reset-demo (SDD 6.6, pemilik: B)
// Dipicu Vercel Cron (vercel.json) yang otomatis mengirim header Authorization: Bearer <CRON_SECRET>.

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
  return NextResponse.json({ reset_at: new Date().toISOString() });
}
