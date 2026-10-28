// lib/supabase/proxy.ts — perbarui sesi Supabase di proxy.ts (pemilik: B)
// Mengikuti pola resmi @supabase/ssr untuk App Router.

import { createServerClient } from '@supabase/ssr';
import type { JwtPayload, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { envSupabase } from './env';

/**
 * Segarkan token sesi dari cookie. `claims` bernilai null jika tamu (atau env Supabase belum diisi).
 * `supabase` dikembalikan supaya proxy.ts bisa memeriksa peran tanpa membuat client kedua.
 */
export async function updateSession(
  request: NextRequest,
): Promise<{ response: NextResponse; claims: JwtPayload | null; supabase: SupabaseClient | null }> {
  let response = NextResponse.next({ request });

  const env = envSupabase();
  if (!env) return { response, claims: null, supabase: null };

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        // Header anti-cache agar token sesi tidak tersimpan di CDN dan tersaji ke pengguna lain.
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Jangan sisipkan kode di antara createServerClient dan getClaims (anjuran resmi Supabase).
  try {
    const { data } = await supabase.auth.getClaims();
    return { response, claims: data?.claims ?? null, supabase };
  } catch {
    // Supabase tidak terjangkau: perlakukan sebagai tamu daripada membuat semua halaman error.
    return { response, claims: null, supabase };
  }
}
