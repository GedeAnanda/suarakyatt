// app/lacak/page.tsx — cari laporan dengan kode (FR-C2), pemilik: A
// Tujuan form cari kode di header dan Beranda. Kode yang sah langsung diarahkan ke halaman detail.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import CariKode from '@/components/CariKode';
import { normalisasiKode } from '@/lib/format';

export const metadata: Metadata = { title: 'Lacak laporan' };

async function Isi({ searchParams }: { searchParams: PageProps<'/lacak'>['searchParams'] }) {
  const { kode } = await searchParams;
  const masukan = typeof kode === 'string' ? kode.trim() : '';
  const sah = masukan ? normalisasiKode(masukan) : null;
  if (sah) redirect(`/laporan/${sah}`);

  return (
    <>
      {masukan && (
        <p role="alert" className="mt-6 bg-tinta px-4 py-3 text-badan text-kertas">
          &ldquo;{masukan}&rdquo; bukan kode laporan. Kode berbentuk SR- diikuti 6 huruf atau angka, tanpa huruf O dan I serta
          angka 0 dan 1.
        </p>
      )}
      <CariKode id="kode-lacak" besar nilaiAwal={masukan} className="mt-8 max-w-xl" />
    </>
  );
}

export default function LacakPage({ searchParams }: PageProps<'/lacak'>) {
  return (
    <div className="bingkai py-16 sm:py-24">
      <h1 className="text-judul">Lacak laporan</h1>
      <p className="mt-4 max-w-[52ch] text-badan">
        Masukkan kode yang Anda terima saat laporan terkirim. Halaman lacak terbuka untuk siapa saja: status, riwayat
        penanganan, batas waktu, dan posisi isunya di daftar prioritas.
      </p>
      <Suspense fallback={<CariKode id="kode-lacak" besar className="mt-8 max-w-xl" />}>
        <Isi searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
