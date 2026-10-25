// lib/supabase/aksi-auth.ts — Server Action masuk, daftar, keluar (FR-A1, SDD 5.1), pemilik: B
//
// Dipakai A di /masuk dengan useActionState, misalnya:
//   const [hasil, aksi, memuat] = useActionState(masuk, null);
//   <form action={aksi}> <input name="email" /> <input name="password" type="password" />
//                        <input type="hidden" name="lanjut" value={lanjut} /> </form>
//   {hasil && 'error' in hasil && <p role="alert">{pesanError({ message: hasil.error })}</p>}
// Form daftar butuh field nama, email, password. Jika berhasil, tampilkan InfoVerifikasiEmail.

'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { tujuanAman } from '@/lib/tujuan-aman';
import { createClient } from './server';

export type HasilAuth = { error: string } | { ok: true } | null;

const SkemaMasuk = z.object({
  email: z.email(),
  password: z.string().min(1),
  lanjut: z.string().optional(),
});

const SkemaDaftar = z.object({
  nama: z.string().trim().min(2).max(80),
  email: z.email(),
  password: z.string().min(8),
});

/** Terjemahkan kode error Supabase Auth ke kode di lib/errors.ts. */
function kodeAuth(code: string | undefined): string {
  switch (code) {
    case 'invalid_credentials':
      return 'KREDENSIAL_SALAH';
    case 'email_not_confirmed':
      return 'EMAIL_BELUM_VERIFIKASI';
    case 'weak_password':
      return 'PASSWORD_LEMAH';
    case 'over_email_send_rate_limit':
      return 'BATAS_EMAIL';
    case 'email_address_not_authorized':
      return 'EMAIL_TIDAK_TERKIRIM';
    case 'email_address_invalid':
      return 'INPUT_TIDAK_VALID';
    default:
      return 'TERJADI_KESALAHAN';
  }
}

export async function masuk(_sebelumnya: HasilAuth, formData: FormData): Promise<HasilAuth> {
  const input = SkemaMasuk.safeParse(Object.fromEntries(formData));
  if (!input.success) return { error: 'INPUT_TIDAK_VALID' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.data.email,
    password: input.data.password,
  });
  if (error) return { error: kodeAuth(error.code) };

  redirect(tujuanAman(input.data.lanjut));
}

export async function daftar(_sebelumnya: HasilAuth, formData: FormData): Promise<HasilAuth> {
  const input = SkemaDaftar.safeParse(Object.fromEntries(formData));
  if (!input.success) {
    const kurangPanjang = input.error.issues.some((i) => i.path[0] === 'password');
    return { error: kurangPanjang ? 'PASSWORD_LEMAH' : 'INPUT_TIDAK_VALID' };
  }

  // Tautan di email verifikasi kembali ke situs yang sama (localhost atau domain Vercel).
  const h = await headers();
  const asal = h.get('origin') ?? `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('host')}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: input.data.email,
    password: input.data.password,
    options: {
      data: { nama: input.data.nama }, // dibaca trigger handle_new_user (0001)
      emailRedirectTo: `${asal}/auth/callback?lanjut=/lapor`,
    },
  });
  // Email yang sudah terdaftar juga dijawab "ok" oleh Supabase supaya daftar email tidak bisa ditebak.
  if (error) return { error: kodeAuth(error.code) };
  return { ok: true };
}

export async function keluar(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
