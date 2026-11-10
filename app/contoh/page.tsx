// app/contoh/page.tsx — buka laporan contoh dari sumber data yang sedang tampil (pemilik: A)
// /contoh                → laporan aktif untuk alur "Kenapa belum?" (alur presentasi)
// /contoh?jenis=terlambat → laporan aktif lewat batas waktu, dengan kendala dari instansi
// /contoh?jenis=ditolak | duplikat | melanggar | selesai → skenario penolakan dan penyelesaian
// Revisi FDS 10 Nov (docs/revisi-fds-2026-11-10.md, 1.6): juri bisa membuka tiap skenario tanpa mencari kode.

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { ambilContohLaporan, JENIS_CONTOH, type JenisContoh } from '@/lib/data/laporan';

async function BukaContoh({ searchParams }: { searchParams: PageProps<'/contoh'>['searchParams'] }) {
  const { jenis: mentah } = await searchParams;
  const jenis = JENIS_CONTOH.find((j) => j === mentah) as JenisContoh | undefined;
  const contoh = await ambilContohLaporan(jenis);
  if (!contoh) redirect(jenis ? '/contoh' : '/peta');
  return redirect(`/laporan/${contoh.laporan.kode}${jenis ? '' : '#kenapa-belum'}`);
}

export default function ContohPage({ searchParams }: PageProps<'/contoh'>) {
  return (
    <Suspense fallback={<p role="status" className="bingkai py-16 text-badan text-lembut">Membuka laporan contoh…</p>}>
      <BukaContoh searchParams={searchParams} />
    </Suspense>
  );
}
