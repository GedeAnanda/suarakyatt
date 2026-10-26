// app/peta/page.tsx — Peta Laporan (SDD 9), pemilik: A
// Operasi SDD 6: Q1 v_laporan_publik (titik laporan). Kategori diambil dari lib/konten (sama dengan 0006).

import type { Metadata } from 'next';
import { Suspense } from 'react';
import BannerSimulasi from '@/components/BannerSimulasi';
import PetaLaporan from '@/components/peta/PetaLaporan';
import LabelSumber from '@/components/ui/LabelSumber';
import { ambilTitikLaporan } from '@/lib/data/laporan';

export const metadata: Metadata = {
  title: 'Peta laporan',
  description: 'Semua laporan warga di DKI Jakarta beserta statusnya, termasuk yang ditolak.',
};

async function Isi() {
  const { sumber, laporan, sekarang } = await ambilTitikLaporan();
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <LabelSumber sumber={sumber} />
        <span className="text-kecil text-lembut">{laporan.length} laporan, tanpa yang dibatalkan pelapor</span>
      </div>
      <BannerSimulasi sumber={sumber} className="mt-4" />
      <div className="mt-8">
        <PetaLaporan laporan={laporan} sekarang={sekarang} />
      </div>
    </>
  );
}

export default function PetaPage() {
  return (
    <div className="bingkai pt-12 pb-24 sm:pt-16">
      <div className="grid gap-6 lg:grid-cols-12">
        <h1 className="text-judul lg:col-span-6">Peta laporan</h1>
        <p className="max-w-[60ch] text-badan lg:col-span-6">
          Semua laporan warga di DKI Jakarta daratan beserta statusnya. Saring menurut kategori dan status, lalu buka
          laporannya untuk melihat riwayat penanganan dan posisinya di daftar prioritas.
        </p>
      </div>
      <div className="mt-10">
        <Suspense
          fallback={
            <div aria-hidden="true" className="grid gap-6">
              <div className="kerangka h-12 w-2/3" />
              <div className="kerangka h-[min(72svh,44rem)]" />
            </div>
          }
        >
          <Isi />
        </Suspense>
      </div>
    </div>
  );
}
