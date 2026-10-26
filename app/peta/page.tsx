// app/peta/page.tsx — Peta Laporan (SDD 9), pemilik: A
// Operasi SDD 6: Q1 v_laporan_publik (titik laporan). Kategori diambil dari lib/konten (sama dengan 0006).

import type { Metadata } from 'next';
import { Suspense } from 'react';
import BannerSimulasi from '@/components/BannerSimulasi';
import PetaLaporan, { STATUS_PUBLIK } from '@/components/peta/PetaLaporan';
import LabelSumber from '@/components/ui/LabelSumber';
import { ambilTitikLaporan } from '@/lib/data/laporan';
import type { StatusLaporan } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Peta laporan',
  description: 'Semua laporan warga di DKI Jakarta beserta statusnya, termasuk yang ditolak.',
};

const daftar = (x: string | string[] | undefined) => (typeof x === 'string' ? x.split(',').filter(Boolean) : []);

async function Isi({ searchParams }: { searchParams: PageProps<'/peta'>['searchParams'] }) {
  const [sp, { sumber, laporan, sekarang }] = await Promise.all([searchParams, ambilTitikLaporan()]);
  const kategoriAwal = daftar(sp.kategori).map(Number).filter((n) => n >= 1 && n <= 4);
  const statusAwal = daftar(sp.status).filter((s): s is StatusLaporan => (STATUS_PUBLIK as string[]).includes(s));
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <LabelSumber sumber={sumber} />
        <span className="text-kecil text-lembut">{laporan.length} laporan, tanpa yang dibatalkan pelapor</span>
      </div>
      <BannerSimulasi sumber={sumber} className="mt-4" />
      <div className="mt-8">
        <PetaLaporan laporan={laporan} sekarang={sekarang} kategoriAwal={kategoriAwal} statusAwal={statusAwal} />
      </div>
    </>
  );
}

export default function PetaPage({ searchParams }: PageProps<'/peta'>) {
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
          <Isi searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
