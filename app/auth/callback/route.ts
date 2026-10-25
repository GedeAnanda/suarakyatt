// app/auth/callback/route.ts — tujuan tautan verifikasi email (FR-A1, SDD 5.1), pemilik: B
// Menerima ?code= (alur PKCE bawaan) atau ?token_hash=&type= (template email kustom setelah SMTP dipasang).

import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tujuanAman } from '@/lib/tujuan-aman';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const lanjut = tujuanAman(searchParams.get('lanjut'));

  try {
    const supabase = await createClient();
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(lanjut, origin));
    } else if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (!error) return NextResponse.redirect(new URL(lanjut, origin));
    }
  } catch (err) {
    console.error('[auth/callback]', err instanceof Error ? err.message : err);
  }

  // Sesi gagal dibuat, misalnya tautan dibuka di browser lain. Email biasanya sudah
  // terverifikasi oleh Supabase, jadi arahkan ke /masuk untuk login manual.
  return NextResponse.redirect(new URL(`/masuk?verifikasi=gagal&lanjut=${encodeURIComponent(lanjut)}`, origin));
}
