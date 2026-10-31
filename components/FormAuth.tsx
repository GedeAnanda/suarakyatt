// components/FormAuth.tsx — FormMasuk, FormDaftar, lupa dan ganti password, InfoVerifikasiEmail (FR-A1, SDD 9), pemilik: A
// Memakai Server Action dari lib/supabase/aksi-auth.ts lewat useActionState. React 19 mengosongkan form setelah
// action selesai, jadi nama dan email yang dikembalikan action dipakai sebagai defaultValue (password tidak).

'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { pesanError } from '@/lib/errors';
import { daftar, gantiPassword, type HasilAuth, kirimUlangVerifikasi, lupaPassword, masuk } from '@/lib/supabase/aksi-auth';
import Ikon from './ui/Ikon';
import { kelasTautan, Tombol } from './ui/Tombol';

/** Kode galat yang menunjuk satu kolom: pesannya tampil di bawah kolom itu, bukan di bawah form. */
const KOLOM_GALAT: Record<string, string> = {
  NAMA_TIDAK_VALID: 'nama',
  EMAIL_TIDAK_VALID: 'email',
  PASSWORD_LEMAH: 'password',
};

const galatDari = (hasil: HasilAuth) => (hasil && 'error' in hasil ? hasil.error : null);
const nilaiDari = (hasil: HasilAuth) => (hasil && 'error' in hasil ? hasil.nilai : undefined);

function Isian({
  label,
  name,
  type = 'text',
  autoComplete,
  petunjuk,
  minLength,
  maxLength,
  nilaiAwal,
  galat,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete: string;
  petunjuk?: string;
  minLength?: number;
  maxLength?: number;
  nilaiAwal?: string;
  /** Kode galat untuk kolom ini (lib/errors.ts). */
  galat?: string | null;
}) {
  const id = `isian-${name}`;
  const [lihat, setLihat] = useState(false);
  const sandi = type === 'password';
  const keterangan = [petunjuk && `${id}-petunjuk`, galat && `${id}-galat`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-kecil font-bold">
        {label} <span className="text-merah" aria-hidden="true">*</span>
      </label>
      <div className="flex">
        <input
          id={id}
          name={name}
          type={sandi && lihat ? 'text' : type}
          autoComplete={autoComplete}
          spellCheck={type === 'email' ? false : undefined}
          required
          minLength={minLength}
          maxLength={maxLength}
          defaultValue={nilaiAwal}
          aria-invalid={galat ? true : undefined}
          aria-describedby={keterangan}
          className="h-12 w-0 min-w-0 flex-1 px-4 text-badan"
        />
        {sandi && (
          <button
            type="button"
            onClick={() => setLihat((x) => !x)}
            aria-pressed={lihat}
            aria-controls={id}
            className="ml-2 flex h-12 shrink-0 items-center gap-1.5 rounded-kontrol border border-garis-isian px-3 text-kecil font-semibold hover:border-biru hover:text-biru-tua"
          >
            <Ikon nama="mata" className="size-4" />
            {lihat ? 'Sembunyikan' : 'Tampilkan'}
          </button>
        )}
      </div>
      {petunjuk && (
        <p id={`${id}-petunjuk`} className="text-kecil text-lembut">
          {petunjuk}
        </p>
      )}
      {galat && (
        <p id={`${id}-galat`} className="flex items-center gap-2 text-kecil font-semibold text-merah-tua">
          <Ikon nama="peringatan" className="size-4 shrink-0" />
          {pesanError({ message: galat })}
        </p>
      )}
    </div>
  );
}

function Galat({ kode }: { kode: string }) {
  return (
    <p role="alert" className="flex gap-2 rounded-kontrol bg-merah-muda px-4 py-3 text-kecil font-semibold text-merah-tua">
      <Ikon nama="peringatan" className="mt-0.5 size-4 shrink-0" />
      {pesanError({ message: kode })}
    </p>
  );
}

function Berhasil({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <div role="status" className="grid gap-3 rounded-kartu border border-st-selesai/30 bg-hijau-muda p-5">
      <p className="flex items-center gap-2 text-lead font-bold text-hijau">
        <Ikon nama="centang" className="size-5" />
        {judul}
      </p>
      {children}
    </div>
  );
}

/** Setelah galat satu kolom, fokus ke kolom itu supaya pengguna keyboard dan pembaca layar langsung tahu. */
function useFokusGalat(hasil: HasilAuth) {
  useEffect(() => {
    const kolom = KOLOM_GALAT[galatDari(hasil) ?? ''];
    if (kolom) document.getElementById(`isian-${kolom}`)?.focus();
  }, [hasil]);
}

function KirimUlangVerifikasi({ email }: { email?: string }) {
  const [hasil, aksi, memuat] = useActionState(kirimUlangVerifikasi, null);
  if (hasil && 'ok' in hasil) {
    return (
      <p role="status" className="text-kecil font-semibold text-hijau">
        Tautan verifikasi dikirim ulang. Periksa juga folder spam.
      </p>
    );
  }
  return (
    <form action={aksi} className="grid gap-2">
      <input type="hidden" name="email" value={email ?? ''} />
      <Tombol type="submit" varian="garis" disabled={memuat || !email} className="w-full">
        {memuat && <Ikon nama="muat" className="putar size-4" />}
        {memuat ? 'Mengirim…' : 'Kirim ulang email verifikasi'}
      </Tombol>
      {galatDari(hasil) && <Galat kode={galatDari(hasil)!} />}
    </form>
  );
}

function FormLupa({ emailAwal, onKembali }: { emailAwal?: string; onKembali: () => void }) {
  const [hasil, aksi, memuat] = useActionState(lupaPassword, null);
  useFokusGalat(hasil);
  const kembali = (
    <button type="button" onClick={onKembali} className={`min-h-6 justify-self-start text-kecil ${kelasTautan}`}>
      Kembali ke masuk
    </button>
  );
  if (hasil && 'ok' in hasil) {
    return (
      <div className="grid gap-4">
        <Berhasil judul="Cek email Anda">
          <p className="text-badan">
            Kalau email itu terdaftar, tautan untuk mengganti password sudah dikirim. Buka tautannya di browser ini.
          </p>
          <p className="text-kecil text-lembut">Tidak menerima email? Periksa folder spam, atau coba lagi beberapa menit lagi.</p>
        </Berhasil>
        {kembali}
      </div>
    );
  }
  const galat = galatDari(hasil);
  return (
    <form action={aksi} className="grid gap-5">
      <p className="text-badan">Masukkan email akun Anda. Kami kirim tautan untuk membuat password baru.</p>
      <Isian
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        nilaiAwal={nilaiDari(hasil)?.email ?? emailAwal}
        galat={galat && KOLOM_GALAT[galat] === 'email' ? galat : null}
      />
      {galat && !KOLOM_GALAT[galat] && <Galat kode={galat} />}
      <Tombol type="submit" disabled={memuat} className="min-h-12 w-full">
        {memuat && <Ikon nama="muat" className="putar size-4" />}
        {memuat ? 'Mengirim…' : 'Kirim tautan ganti password'}
      </Tombol>
      {kembali}
    </form>
  );
}

function FormMasuk({ lanjut, lupaAwal }: { lanjut: string; lupaAwal: boolean }) {
  const [hasil, aksi, memuat] = useActionState(masuk, null);
  const [lupa, setLupa] = useState(lupaAwal);
  const galat = galatDari(hasil);
  const email = nilaiDari(hasil)?.email;
  if (lupa) return <FormLupa emailAwal={email} onKembali={() => setLupa(false)} />;
  return (
    <div className="grid gap-5">
      <form action={aksi} className="grid gap-5">
        <input type="hidden" name="lanjut" value={lanjut} />
        <Isian label="Email" name="email" type="email" autoComplete="email" nilaiAwal={email} />
        <div className="grid gap-2">
          <Isian label="Password" name="password" type="password" autoComplete="current-password" />
          <button type="button" onClick={() => setLupa(true)} className={`min-h-6 justify-self-start text-kecil ${kelasTautan}`}>
            Lupa password?
          </button>
        </div>
        {galat && <Galat kode={galat} />}
        <Tombol type="submit" disabled={memuat} className="min-h-12 w-full">
          {memuat && <Ikon nama="muat" className="putar size-4" />}
          {memuat ? 'Masuk…' : 'Masuk'}
        </Tombol>
      </form>
      {galat === 'EMAIL_BELUM_VERIFIKASI' && <KirimUlangVerifikasi email={email} />}
    </div>
  );
}

function FormDaftar({ lanjut }: { lanjut: string }) {
  const [hasil, aksi, memuat] = useActionState(daftar, null);
  useFokusGalat(hasil);
  if (hasil && 'ok' in hasil) {
    return (
      <Berhasil judul="Cek email Anda">
        <p className="text-badan">
          Kami mengirim tautan verifikasi. Buka tautan itu untuk mengaktifkan akun; setelah itu Anda bisa melapor,
          mendukung laporan, dan memberi rating. Verifikasi memastikan alamat email dapat diakses; satu akun mendapat satu dukungan per laporan.
        </p>
        <p className="text-kecil text-lembut">Tidak menerima email? Periksa folder spam, atau coba lagi beberapa menit lagi.</p>
      </Berhasil>
    );
  }
  const galat = galatDari(hasil);
  const nilai = nilaiDari(hasil);
  const galatKolom = (kolom: string) => (galat && KOLOM_GALAT[galat] === kolom ? galat : null);
  return (
    <form action={aksi} className="grid gap-5">
      <input type="hidden" name="lanjut" value={lanjut} />
      <Isian
        label="Nama"
        name="nama"
        autoComplete="name"
        minLength={2}
        maxLength={80}
        petunjuk="Publik hanya melihat inisialnya, misalnya AS."
        nilaiAwal={nilai?.nama}
        galat={galatKolom('nama')}
      />
      <Isian label="Email" name="email" type="email" autoComplete="email" nilaiAwal={nilai?.email} galat={galatKolom('email')} />
      <Isian
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        petunjuk="Minimal 8 karakter."
        galat={galatKolom('password')}
      />
      {galat && !KOLOM_GALAT[galat] && <Galat kode={galat} />}
      <Tombol type="submit" disabled={memuat} className="min-h-12 w-full">
        {memuat && <Ikon nama="muat" className="putar size-4" />}
        {memuat ? 'Mendaftar…' : 'Daftar'}
      </Tombol>
    </form>
  );
}

/** Halaman /masuk/sandi-baru: dibuka lewat tautan lupa password, jadi pengguna sudah punya sesi pemulihan. */
export function FormSandiBaru() {
  const [hasil, aksi, memuat] = useActionState(gantiPassword, null);
  useFokusGalat(hasil);
  if (hasil && 'ok' in hasil) {
    return (
      <Berhasil judul="Password sudah diganti">
        <p className="text-badan">Anda sudah masuk dengan password baru.</p>
        <p className="flex flex-wrap gap-x-5 gap-y-2 text-badan">
          <Link href="/lapor" className={kelasTautan}>
            Lapor masalah
          </Link>
          <Link href="/lacak#laporan-saya" className={kelasTautan}>
            Lihat laporan saya
          </Link>
        </p>
      </Berhasil>
    );
  }
  const galat = galatDari(hasil);
  return (
    <form action={aksi} className="grid max-w-md gap-5">
      <Isian
        label="Password baru"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        petunjuk="Minimal 8 karakter."
        galat={galat && KOLOM_GALAT[galat] === 'password' ? galat : null}
      />
      {galat && !KOLOM_GALAT[galat] && <Galat kode={galat} />}
      <Tombol type="submit" disabled={memuat} className="min-h-12 w-full">
        {memuat && <Ikon nama="muat" className="putar size-4" />}
        {memuat ? 'Menyimpan…' : 'Simpan password baru'}
      </Tombol>
    </form>
  );
}

export default function FormAuth({
  lanjut,
  modeAwal,
  verifikasiGagal,
}: {
  lanjut: string;
  modeAwal: 'masuk' | 'daftar' | 'lupa';
  /** Tautan dari email gagal membuat sesi: 'daftar' (verifikasi) atau 'lupa' (ganti password). */
  verifikasiGagal: 'daftar' | 'lupa' | null;
}) {
  const [mode, setMode] = useState<'masuk' | 'daftar'>(modeAwal === 'daftar' ? 'daftar' : 'masuk');
  return (
    <div className="max-w-md">
      <div role="tablist" aria-label="Masuk atau daftar" className="flex border-b border-garis">
        {(['masuk', 'daftar'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            id={`tab-${m}`}
            tabIndex={mode === m ? 0 : -1}
            aria-selected={mode === m}
            aria-controls={`panel-${m}`}
            onClick={() => setMode(m)}
            onKeyDown={(e) => {
              const MODE = ['masuk', 'daftar'] as const;
              const geser = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
              const tujuan = e.key === 'Home' ? 0 : e.key === 'End' ? 1 : geser ? (MODE.indexOf(m) + geser + 2) % 2 : -1;
              if (tujuan < 0) return;
              e.preventDefault();
              setMode(MODE[tujuan]);
              document.getElementById(`tab-${MODE[tujuan]}`)?.focus();
            }}
            className="tab h-12 text-badan"
          >
            {m === 'masuk' ? 'Masuk' : 'Daftar akun warga'}
          </button>
        ))}
      </div>
      {verifikasiGagal && (
        <p role="status" className="mt-5 flex gap-2 rounded-kontrol bg-biru-muda p-4 text-kecil text-biru-tua">
          <Ikon nama="info" className="mt-0.5 size-4 shrink-0" />
          {verifikasiGagal === 'lupa'
            ? 'Tautan ganti password sudah kedaluwarsa atau dibuka di browser lain. Minta tautan baru di bawah, lalu buka di browser ini.'
            : 'Tautan verifikasi dibuka di browser lain atau sudah kedaluwarsa. Email Anda biasanya sudah terverifikasi; silakan masuk di sini.'}
        </p>
      )}
      <div key={mode} id={`panel-${mode}`} role="tabpanel" aria-labelledby={`tab-${mode}`} className="ganti mt-6">
        {mode === 'masuk' ? <FormMasuk lanjut={lanjut} lupaAwal={modeAwal === 'lupa'} /> : <FormDaftar lanjut={lanjut} />}
      </div>
    </div>
  );
}
