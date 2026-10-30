// app/peta/page.tsx — Peta Laporan (SDD 9), pemilik: A
// Operasi SDD 6: Q1 v_laporan_publik (titik laporan). Kategori diambil dari lib/konten (sama dengan 0006).

import type { Metadata } from 'next';
import { Suspense } from 'react';
import BannerSimulasi from '@/components/BannerSimulasi';
import KepalaHalaman from '@/components/KepalaHalaman';
import PetaLaporan, { STATUS_PUBLIK } from '@/components/peta/PetaLaporan';
import { ambilTitikLaporan } from '@/lib/data/laporan';
import type { StatusLaporan } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Peta laporan',
  description: 'Semua laporan warga di DKI Jakarta beserta statusnya, termasuk yang ditolak.',
};

// null = parameter tidak ada (tampilkan semua); daftar kosong = semua pilihan sengaja dimatikan.
const daftar = (x: string | string[] | undefined) => (typeof x === 'string' ? x.split(',').filter(Boolean) : null);

async function Isi({ searchParams }: { searchParams: PageProps<'/peta'>['searchParams'] }) {
  const [sp, { sumber, laporan, sekarang }] = await Promise.all([searchParams, ambilTitikLaporan()]);
  const kategoriAwal = daftar(sp.kategori)?.map(Number).filter((n) => n >= 1 && n <= 4) ?? null;
  const statusAwal = daftar(sp.status)?.filter((s): s is StatusLaporan => (STATUS_PUBLIK as string[]).includes(s)) ?? null;
  return (
    <>
      <BannerSimulasi sumber={sumber} keterangan={`${laporan.length} laporan, tanpa yang dibatalkan pelapor`} />
      <div className="mt-6">
        <PetaLaporan laporan={laporan} sekarang={sekarang} kategoriAwal={kategoriAwal} statusAwal={statusAwal} />
      </div>
    </>
  );
}

export default function PetaPage({ searchParams }: PageProps<'/peta'>) {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <KepalaHalaman judul="Peta laporan">
        Semua laporan warga di DKI Jakarta daratan beserta statusnya. Saring menurut kategori dan status, lalu buka
        laporannya untuk melihat riwayat penanganan dan posisinya di daftar prioritas.
      </KepalaHalaman>
      <div className="mt-6">
        <Suspense
          fallback={
            <div aria-hidden="true" className="grid gap-5">
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
