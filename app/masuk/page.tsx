// app/masuk/page.tsx — Masuk / Daftar (SDD 9), pemilik: A
// Operasi: Supabase Auth lewat Server Action (lib/supabase/aksi-auth.ts), FR-A1; akun demo lewat A1.
// proxy.ts mengirim tamu ke sini dengan ?lanjut=<rute asal>; setelah login, pengguna dikembalikan ke sana.

import type { Metadata } from 'next';
import { Suspense } from 'react';
import FormAuth from '@/components/FormAuth';
import TombolDemo from '@/components/TombolDemo';
import TombolKembali from '@/components/TombolKembali';
import Ikon from '@/components/ui/Ikon';
import Wordmark from '@/components/Wordmark';
import { tujuanAman } from '@/lib/tujuan-aman';

export const metadata: Metadata = { title: 'Masuk' };

async function Isi({ searchParams }: { searchParams: PageProps<'/masuk'>['searchParams'] }) {
  const sp = await searchParams;
  const lanjut = tujuanAman(typeof sp.lanjut === 'string' ? sp.lanjut : null);
  // Tautan ganti password yang gagal juga kembali ke sini (auth/callback): tawarkan tautan baru, dan setelah masuk
  // biasa jangan arahkan ke halaman ganti password.
  const reset = lanjut.startsWith('/masuk/sandi-baru');
  const gagal = sp.verifikasi === 'gagal' ? (reset ? 'lupa' : 'daftar') : null;
  const mode = sp.mode === 'daftar' || sp.mode === 'lupa' ? sp.mode : gagal === 'lupa' ? 'lupa' : 'masuk';
  return <FormAuth lanjut={reset ? '/' : lanjut} modeAwal={mode} verifikasiGagal={gagal} />;
}

export default function MasukPage({ searchParams }: PageProps<'/masuk'>) {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <div className="mx-auto mb-4 max-w-5xl">
        <TombolKembali />
      </div>
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-besar border border-garis bg-permukaan shadow-kartu lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="p-6 sm:p-10">
          <h1 className="text-judul font-bold">Masuk untuk melapor</h1>
          <p className="mt-2 text-badan text-lembut">
            Melihat peta, rapor, dan dashboard prioritas tidak perlu akun. Akun warga dengan email terverifikasi dibutuhkan
            untuk melapor, mendukung laporan warga lain, dan memberi rating.
          </p>
          <div className="mt-6">
            <Suspense fallback={<div className="kerangka h-80 max-w-md" />}>
              <Isi searchParams={searchParams} />
            </Suspense>
          </div>
        </div>

        <aside className="di-gelap flex flex-col bg-[linear-gradient(150deg,#0f766e_0%,#115e59_50%,#134e4a_100%)] p-6 text-white sm:p-10">
          <Wordmark className="text-sub" />
          <h2 className="mt-6 flex items-center gap-2 text-sub font-bold">
            <Ikon nama="kunci" className="size-5" />
            Coba tanpa daftar
          </h2>
          <p className="mt-2 text-badan text-white/90">
            Akun demo bersama untuk juri dan pengunjung. Warga demo bisa melapor dan mendukung laporan; admin demo mengelola
            laporan Dinas Bina Jalan (simulasi). Data demo dikembalikan ke awal setiap malam.
          </p>
          <TombolDemo className="mt-6" varianWarga="terang" varianAdmin="terang-garis" />
          <p className="mt-auto pt-8 text-kecil text-white/80">
            Akun admin instansi dan Perencana dibuat oleh tim, tanpa pendaftaran publik. Laporan di SUARAKYAT tidak
            diteruskan ke instansi resmi.
          </p>
        </aside>
      </div>
    </div>
  );
}
