// lib/supabase/aksi-auth.ts — Server Action masuk, daftar, keluar, lupa dan ganti password (FR-A1, SDD 5.1), pemilik: B
//
// Dipakai A di /masuk dengan useActionState, misalnya:
//   const [hasil, aksi, memuat] = useActionState(masuk, null);
//   <form action={aksi}> <input name="email" /> <input name="password" type="password" />
//                        <input type="hidden" name="lanjut" value={lanjut} /> </form>
//   {hasil && 'error' in hasil && <p role="alert">{pesanError({ message: hasil.error })}</p>}
// Form daftar butuh field nama, email, password. Jika berhasil, tampilkan InfoVerifikasiEmail.
// Saat gagal, nama dan email dikembalikan di `nilai`: React 19 mengosongkan form setelah action selesai,
// jadi form memakainya sebagai defaultValue supaya pengguna tidak mengetik ulang.

'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { tujuanAman } from '@/lib/tujuan-aman';
import { createClient } from './server';

export type NilaiAuth = { nama?: string; email?: string };
export type HasilAuth = { error: string; nilai?: NilaiAuth } | { ok: true } | null;

const SkemaMasuk = z.object({
  email: z.email(),
  password: z.string().min(1),
  lanjut: z.string().optional(),
});

const SkemaDaftar = z.object({
  nama: z.string().trim().min(2).max(80),
  email: z.email(),
  password: z.string().min(8),
  lanjut: z.string().optional(),
});

const SkemaEmail = z.object({ email: z.email() });
const SkemaSandi = z.object({ password: z.string().min(8) });

/** Terjemahkan kode error Supabase Auth ke kode di lib/errors.ts. */
function kodeAuth(code: string | undefined): string {
  switch (code) {
    case 'invalid_credentials':
      return 'KREDENSIAL_SALAH';
    case 'email_not_confirmed':
      return 'EMAIL_BELUM_VERIFIKASI';
    case 'weak_password':
      return 'PASSWORD_LEMAH';
    case 'same_password':
      return 'SANDI_SAMA';
    case 'over_email_send_rate_limit':
      return 'BATAS_EMAIL';
    case 'email_address_not_authorized':
      return 'EMAIL_TIDAK_TERKIRIM';
    case 'email_address_invalid':
      return 'EMAIL_TIDAK_VALID';
    default:
      return 'TERJADI_KESALAHAN';
  }
}

/** Ambil teks isian untuk dikembalikan ke form (bukan password). */
const teks = (formData: FormData, nama: string) => {
  const x = formData.get(nama);
  return typeof x === 'string' ? x.slice(0, 200) : undefined;
};

/** Asal situs untuk tautan di email (localhost atau domain Vercel). */
async function asalSitus(): Promise<string> {
  const h = await headers();
  return h.get('origin') ?? `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('host')}`;
}

/** Akun demo dipakai bersama; email reset tidak dikirim ke sana dan passwordnya tidak bisa diganti dari situs. */
const emailDemo = (email: string) =>
  [process.env.DEMO_WARGA_EMAIL, process.env.DEMO_ADMIN_EMAIL].some((d) => d && d.toLowerCase() === email.toLowerCase());

export async function masuk(_sebelumnya: HasilAuth, formData: FormData): Promise<HasilAuth> {
  const nilai = { email: teks(formData, 'email') };
  const input = SkemaMasuk.safeParse(Object.fromEntries(formData));
  if (!input.success) return { error: 'INPUT_TIDAK_VALID', nilai };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.data.email,
    password: input.data.password,
  });
  if (error) return { error: kodeAuth(error.code), nilai };

  redirect(tujuanAman(input.data.lanjut));
}

export async function daftar(_sebelumnya: HasilAuth, formData: FormData): Promise<HasilAuth> {
  const nilai = { nama: teks(formData, 'nama'), email: teks(formData, 'email') };
  const input = SkemaDaftar.safeParse(Object.fromEntries(formData));
  if (!input.success) {
    // Satu kode per kolom, sesuai urutan form, supaya form bisa menandai kolom yang salah.
    const kolom = new Set(input.error.issues.map((i) => i.path[0]));
    const kode = kolom.has('nama') ? 'NAMA_TIDAK_VALID' : kolom.has('email') ? 'EMAIL_TIDAK_VALID' : kolom.has('password') ? 'PASSWORD_LEMAH' : 'INPUT_TIDAK_VALID';
    return { error: kode, nilai };
  }

  // Setelah verifikasi, pengguna kembali ke halaman asalnya (misalnya laporan yang ingin didukung), bawaannya /lapor.
  const tujuan = tujuanAman(input.data.lanjut, '/lapor');
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: input.data.email,
    password: input.data.password,
    options: {
      data: { nama: input.data.nama }, // dibaca trigger handle_new_user (0001)
      emailRedirectTo: `${await asalSitus()}/auth/callback?lanjut=${encodeURIComponent(tujuan === '/' ? '/lapor' : tujuan)}`,
    },
  });
  // Email yang sudah terdaftar juga dijawab "ok" oleh Supabase supaya daftar email tidak bisa ditebak.
  if (error) return { error: kodeAuth(error.code), nilai };
  return { ok: true };
}

/** Kirim ulang email verifikasi pendaftaran. Selalu "ok" kecuali kena batas kirim, supaya email tidak bisa ditebak. */
export async function kirimUlangVerifikasi(_sebelumnya: HasilAuth, formData: FormData): Promise<HasilAuth> {
  const input = SkemaEmail.safeParse(Object.fromEntries(formData));
  if (!input.success) return { error: 'EMAIL_TIDAK_VALID' };
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: input.data.email,
    options: { emailRedirectTo: `${await asalSitus()}/auth/callback?lanjut=/lapor` },
  });
  if (error && error.code === 'over_email_send_rate_limit') return { error: 'BATAS_EMAIL' };
  return { ok: true };
}

/** Kirim tautan ganti password. Tautannya lewat /auth/callback lalu membuka /masuk/sandi-baru dengan sesi pemulihan. */
export async function lupaPassword(_sebelumnya: HasilAuth, formData: FormData): Promise<HasilAuth> {
  const nilai = { email: teks(formData, 'email') };
  const input = SkemaEmail.safeParse(Object.fromEntries(formData));
  if (!input.success) return { error: 'EMAIL_TIDAK_VALID', nilai };
  if (emailDemo(input.data.email)) return { ok: true };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(input.data.email, {
    redirectTo: `${await asalSitus()}/auth/callback?lanjut=/masuk/sandi-baru`,
  });
  if (error && error.code === 'over_email_send_rate_limit') return { error: 'BATAS_EMAIL', nilai };
  return { ok: true };
}

/** Ganti password pengguna yang sedang login (biasanya lewat sesi dari tautan lupa password). */
export async function gantiPassword(_sebelumnya: HasilAuth, formData: FormData): Promise<HasilAuth> {
  const input = SkemaSandi.safeParse(Object.fromEntries(formData));
  if (!input.success) return { error: 'PASSWORD_LEMAH' };

  const supabase = await createClient();
  const { data: klaim } = await supabase.auth.getClaims();
  const uid = klaim?.claims.sub;
  if (!uid) return { error: 'TIDAK_LOGIN' };
  const { data: profil } = await supabase.from('profiles').select('is_demo').eq('id', uid).maybeSingle();
  if (profil?.is_demo) return { error: 'DEMO_SANDI' };

  const { error } = await supabase.auth.updateUser({ password: input.data.password });
  if (error) return { error: kodeAuth(error.code) };
  return { ok: true };
}

export async function keluar(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
