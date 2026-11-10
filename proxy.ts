// proxy.ts — pengganti middleware.ts sejak Next.js 16 (pemilik: B)
// SDD 9.1: proteksi rute ini hanya kenyamanan; keamanan sebenarnya tetap di RLS dan RPC.

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';
import { tujuanAman } from '@/lib/tujuan-aman';

const RUTE_PERLU_LOGIN = ['/lapor', '/admin'];

/** Dicocokkan per segmen supaya /laporan/[kode] (publik) tidak ikut terkunci oleh /lapor. */
function cocokRute(pathname: string, rute: string): boolean {
  return pathname === rute || pathname.startsWith(`${rute}/`);
}

/** Redirect ke path internal (boleh dengan query) sambil membawa cookie sesi yang baru diperbarui (atau dihapus). */
function alihkan(request: NextRequest, response: NextResponse, tujuan: string) {
  const redirect = NextResponse.redirect(new URL(tujuan, request.url));
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export async function proxy(request: NextRequest) {
  const { response, claims, supabase } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (!claims && RUTE_PERLU_LOGIN.some((rute) => cocokRute(pathname, rute))) {
    return alihkan(request, response, `/masuk?lanjut=${encodeURIComponent(pathname + search)}`);
  }

  // Sudah login tapi membuka /masuk (misalnya lewat redirect lama di cache router): langsung ke tujuannya.
  if (claims && pathname === '/masuk') {
    return alihkan(request, response, tujuanAman(request.nextUrl.searchParams.get('lanjut')));
  }

  // Non-admin yang membuka /admin/* diarahkan ke Beranda. is_admin() ada di 0002_views_rls.sql.
  if (claims && supabase && cocokRute(pathname, '/admin')) {
    const { data: admin } = await supabase.rpc('is_admin');
    if (admin !== true) return alihkan(request, response, '/');
  }

  return response;
}

export const config = {
  // Lewati aset statis dan file data (misalnya /data/kecamatan.geojson).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|data/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|geojson)$).*)'],
};
