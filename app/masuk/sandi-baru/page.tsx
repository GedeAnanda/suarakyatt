// app/masuk/sandi-baru/page.tsx — buat password baru setelah membuka tautan lupa password (FR-A1), pemilik: A
// auth/callback menukar kode dari email menjadi sesi, lalu mengarahkan ke sini. Tanpa sesi, tautannya sudah tidak berlaku.

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FormSandiBaru } from '@/components/FormAuth';
import KepalaHalaman from '@/components/KepalaHalaman';
import { TautanTombol } from '@/components/ui/Tombol';
import { ambilSesi } from '@/lib/data/sesi';

export const metadata: Metadata = { title: 'Ganti password', robots: { index: false } };

async function Isi() {
  const sesi = await ambilSesi();
  if (!sesi) {
    return (
      <div className="grid max-w-md gap-4">
        <p className="text-badan">
          Tautan ganti password sudah tidak berlaku, atau dibuka di browser lain. Minta tautan baru, lalu buka di browser ini.
        </p>
        <TautanTombol href="/masuk?mode=lupa" className="justify-self-start">
          Minta tautan baru
        </TautanTombol>
      </div>
    );
  }
  return (
    <>
      <p className="mb-5 text-badan">
        Masuk sebagai <strong className="font-bold">{sesi.nama}</strong>. Buat password baru untuk akun ini.
      </p>
      <FormSandiBaru />
    </>
  );
}

export default function SandiBaruPage() {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <KepalaHalaman judul="Ganti password" jejak={[{ href: '/masuk', label: 'Masuk' }]} />
      <div className="kartu mt-6 max-w-2xl p-6 sm:p-8">
        <Suspense fallback={<div aria-hidden="true" className="kerangka h-48 max-w-md" />}>
          <Isi />
        </Suspense>
      </div>
    </div>
  );
}
