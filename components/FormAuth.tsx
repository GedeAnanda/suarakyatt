// components/FormAuth.tsx — FormMasuk, FormDaftar, InfoVerifikasiEmail (FR-A1, SDD 9), pemilik: A
// Memakai Server Action masuk/daftar dari lib/supabase/aksi-auth.ts lewat useActionState.

'use client';

import { useActionState, useState } from 'react';
import { pesanError } from '@/lib/errors';
import { daftar, masuk } from '@/lib/supabase/aksi-auth';
import Ikon from './ui/Ikon';
import { Tombol } from './ui/Tombol';

function Isian({
  label,
  name,
  type = 'text',
  autoComplete,
  petunjuk,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete: string;
  petunjuk?: string;
  minLength?: number;
}) {
  const id = `isian-${name}`;
  const [lihat, setLihat] = useState(false);
  const sandi = type === 'password';
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-badan font-medium">
        {label} <span className="text-tinta" aria-hidden="true">*</span>
      </label>
      <div className="flex">
        <input
          id={id}
          name={name}
          type={sandi && lihat ? 'text' : type}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          aria-describedby={petunjuk ? `${id}-petunjuk` : undefined}
          className="h-12 min-w-0 flex-1 px-4 text-badan"
        />
        {sandi && (
          <button
            type="button"
            onClick={() => setLihat((x) => !x)}
            aria-pressed={lihat}
            aria-controls={id}
            className="ml-2 h-12 shrink-0 rounded-(--radius-kontrol) bg-lapis px-4 text-kecil font-semibold hover:bg-lapis-2"
          >
            {lihat ? 'Sembunyikan' : 'Tampilkan'}
          </button>
        )}
      </div>
      {petunjuk && (
        <p id={`${id}-petunjuk`} className="text-kecil text-lembut">
          {petunjuk}
        </p>
      )}
    </div>
  );
}

function Galat({ kode }: { kode: string }) {
  return (
    <p role="alert" className="flex gap-2 bg-tinta px-4 py-3 text-badan text-kertas">
      <Ikon nama="peringatan" className="mt-1 size-4" />
      {pesanError({ message: kode })}
    </p>
  );
}

function FormMasuk({ lanjut }: { lanjut: string }) {
  const [hasil, aksi, memuat] = useActionState(masuk, null);
  return (
    <form action={aksi} className="grid gap-5">
      <input type="hidden" name="lanjut" value={lanjut} />
      <Isian label="Email" name="email" type="email" autoComplete="email" />
      <Isian label="Password" name="password" type="password" autoComplete="current-password" />
      {hasil && 'error' in hasil && <Galat kode={hasil.error} />}
      <Tombol type="submit" disabled={memuat} className="justify-self-start">
        {memuat ? 'Masuk…' : 'Masuk'}
      </Tombol>
    </form>
  );
}

function FormDaftar() {
  const [hasil, aksi, memuat] = useActionState(daftar, null);
  if (hasil && 'ok' in hasil) {
    return (
      <div role="status" className="kartu grid gap-3 p-6">
        <p className="text-lead font-medium tracking-tight">Cek email Anda</p>
        <p className="text-badan">
          Kami mengirim tautan verifikasi. Buka tautan itu untuk mengaktifkan akun; setelah itu Anda bisa melapor,
          mendukung laporan, dan memberi rating. Email wajib diverifikasi supaya satu orang punya satu suara.
        </p>
        <p className="text-kecil text-lembut">Tidak menerima email? Periksa folder spam, atau coba lagi beberapa menit lagi.</p>
      </div>
    );
  }
  return (
    <form action={aksi} className="grid gap-5">
      <Isian label="Nama" name="nama" autoComplete="name" petunjuk="Publik hanya melihat inisialnya, misalnya AS." />
      <Isian label="Email" name="email" type="email" autoComplete="email" />
      <Isian label="Password" name="password" type="password" autoComplete="new-password" minLength={8} petunjuk="Minimal 8 karakter." />
      {hasil && 'error' in hasil && <Galat kode={hasil.error} />}
      <Tombol type="submit" disabled={memuat} className="justify-self-start">
        {memuat ? 'Mendaftar…' : 'Daftar'}
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
  modeAwal: 'masuk' | 'daftar';
  verifikasiGagal: boolean;
}) {
  const [mode, setMode] = useState(modeAwal);
  return (
    <div>
      <div role="tablist" aria-label="Masuk atau daftar" className="inline-flex gap-1 rounded-(--radius-kontrol) bg-lapis p-1">
        {(['masuk', 'daftar'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            id={`tab-${m}`}
            aria-selected={mode === m}
            aria-controls={`panel-${m}`}
            onClick={() => setMode(m)}
            className="min-h-11 rounded-[0.5rem] px-5 text-badan font-semibold text-lembut transition-colors hover:text-teks aria-selected:bg-permukaan aria-selected:text-tinta aria-selected:shadow-[0_1px_3px_rgb(42_19_22/0.15)]"
          >
            {m === 'masuk' ? 'Masuk' : 'Daftar akun warga'}
          </button>
        ))}
      </div>
      {verifikasiGagal && (
        <p role="status" className="panel mt-6 p-4 text-badan">
          Tautan verifikasi dibuka di browser lain atau sudah kedaluwarsa. Email Anda biasanya sudah terverifikasi; silakan
          masuk di sini.
        </p>
      )}
      <div id={`panel-${mode}`} role="tabpanel" aria-labelledby={`tab-${mode}`} className="mt-8 max-w-md">
        {mode === 'masuk' ? <FormMasuk lanjut={lanjut} /> : <FormDaftar />}
      </div>
    </div>
  );
}
