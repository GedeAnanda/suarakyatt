// app/masuk/page.tsx — Masuk / Daftar (SDD 9), pemilik: A
// Operasi: Supabase Auth lewat Server Action (lib/supabase/aksi-auth.ts), FR-A1; akun demo lewat A1.
// proxy.ts mengirim tamu ke sini dengan ?lanjut=<rute asal>; setelah login, pengguna dikembalikan ke sana.

import type { Metadata } from 'next';
import { Suspense } from 'react';
import FormAuth from '@/components/FormAuth';
import TombolDemo from '@/components/TombolDemo';
import { tujuanAman } from '@/lib/tujuan-aman';

export const metadata: Metadata = { title: 'Masuk' };

async function Isi({ searchParams }: { searchParams: PageProps<'/masuk'>['searchParams'] }) {
  const sp = await searchParams;
  const lanjut = tujuanAman(typeof sp.lanjut === 'string' ? sp.lanjut : null);
  return (
    <FormAuth lanjut={lanjut} modeAwal={sp.mode === 'daftar' ? 'daftar' : 'masuk'} verifikasiGagal={sp.verifikasi === 'gagal'} />
  );
}

export default function MasukPage({ searchParams }: PageProps<'/masuk'>) {
  return (
    <div className="bingkai grid grid-cols-1 gap-14 pt-12 pb-24 sm:pt-16 lg:grid-cols-12 lg:gap-8" data-awal>
      <div className="lg:col-span-6">
        <h1 data-pembuka="judul" className="text-judul">Masuk untuk melapor</h1>
        <p data-pembuka="teks" className="mt-4 max-w-[52ch] text-badan">
          Melihat peta, rapor, dan dashboard prioritas tidak perlu akun. Akun warga dengan email terverifikasi dibutuhkan
          untuk melapor, mendukung laporan warga lain, dan memberi rating.
        </p>
        <div className="mt-10">
          <Suspense fallback={<div className="kerangka h-80 max-w-md" />}>
            <Isi searchParams={searchParams} />
          </Suspense>
        </div>
      </div>

      <aside className="lg:col-span-5 lg:col-start-8">
        <div className="di-medan rounded-(--radius-kartu) bg-medan p-6 text-medan-tinta shadow-[0_24px_48px_-24px_rgb(125_12_20/0.6)] sm:p-8">
          <h2 className="text-lead font-medium tracking-tight">Coba tanpa daftar</h2>
          <p className="mt-3 text-badan text-medan-lembut">
            Akun demo bersama untuk juri dan pengunjung. Warga demo bisa melapor dan mendukung laporan; admin demo mengelola
            laporan Dinas Bina Jalan (simulasi). Data demo dikembalikan ke awal setiap malam.
          </p>
          <TombolDemo className="mt-6" varianWarga="medan" varianAdmin="medan-garis" />
        </div>
        <p className="mt-6 text-kecil text-lembut">
          Akun admin instansi dan Perencana dibuat oleh tim, tanpa pendaftaran publik. Laporan di suaRAkyat tidak diteruskan
          ke instansi resmi.
        </p>
      </aside>
    </div>
  );
}
