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
      <label htmlFor={id} className="text-kecil font-bold">
        {label} <span className="text-merah" aria-hidden="true">*</span>
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

function FormMasuk({ lanjut }: { lanjut: string }) {
  const [hasil, aksi, memuat] = useActionState(masuk, null);
  return (
    <form action={aksi} className="grid gap-5">
      <input type="hidden" name="lanjut" value={lanjut} />
      <Isian label="Email" name="email" type="email" autoComplete="email" />
      <Isian label="Password" name="password" type="password" autoComplete="current-password" />
      {hasil && 'error' in hasil && <Galat kode={hasil.error} />}
      <Tombol type="submit" disabled={memuat} className="min-h-12 w-full">
        {memuat ? 'Masuk…' : 'Masuk'}
      </Tombol>
    </form>
  );
}

function FormDaftar() {
  const [hasil, aksi, memuat] = useActionState(daftar, null);
  if (hasil && 'ok' in hasil) {
    return (
      <div role="status" className="grid gap-3 rounded-kartu border border-st-selesai/30 bg-hijau-muda p-5">
        <p className="flex items-center gap-2 text-lead font-bold text-hijau">
          <Ikon nama="centang" className="size-5" />
          Cek email Anda
        </p>
        <p className="text-badan">
          Kami mengirim tautan verifikasi. Buka tautan itu untuk mengaktifkan akun; setelah itu Anda bisa melapor,
          mendukung laporan, dan memberi rating. Verifikasi memastikan alamat email dapat diakses; satu akun mendapat satu dukungan per laporan.
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
      <Tombol type="submit" disabled={memuat} className="min-h-12 w-full">
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
          Tautan verifikasi dibuka di browser lain atau sudah kedaluwarsa. Email Anda biasanya sudah terverifikasi; silakan
          masuk di sini.
        </p>
      )}
      <div key={mode} id={`panel-${mode}`} role="tabpanel" aria-labelledby={`tab-${mode}`} className="ganti mt-6">
        {mode === 'masuk' ? <FormMasuk lanjut={lanjut} /> : <FormDaftar />}
      </div>
    </div>
  );
}
