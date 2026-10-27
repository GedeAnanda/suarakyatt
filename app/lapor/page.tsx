// app/lapor/page.tsx — Buat Laporan (SDD 9), pemilik: A. Hanya untuk pengguna login (proxy.ts).
// Operasi SDD 6: Q4 (kategori, dari lib/konten yang sama dengan 0006), S1 unggah foto, R2 similar_reports,
// R3 create_report. Semua ada di components/lapor/FormLaporan.tsx.

import type { Metadata } from 'next';
import FormLaporan from '@/components/lapor/FormLaporan';
import Ikon from '@/components/ui/Ikon';
import { KANAL_RESMI } from '@/lib/konten';

export const metadata: Metadata = { title: 'Lapor masalah' };

export default function LaporPage() {
  return (
    <div className="bingkai pt-12 pb-24 sm:pt-16">
      <div className="grid gap-6 lg:grid-cols-12">
        <h1 data-pembuka="judul" className="text-judul lg:col-span-6">Lapor masalah</h1>
        <p data-pembuka="teks" className="max-w-[60ch] text-badan lg:col-span-6">
          Laporkan masalah kota dengan foto dan titik lokasi. Anda akan mendapat kode untuk melacak penanganannya, dan
          laporan Anda ikut menentukan posisi isu wilayahnya di daftar prioritas.
        </p>
      </div>

      <aside role="note" className="mt-10 flex gap-3 rounded-(--radius-kartu) bg-st-ditolak-bg p-4 text-badan text-st-ditolak sm:p-5">
        <Ikon nama="info" className="mt-1 size-5" />
        <p>
          <strong className="font-semibold">suaRAkyat bukan kanal pengaduan resmi.</strong> Laporan di sini tidak diteruskan
          ke instansi. Untuk pengaduan resmi ke Pemprov DKI Jakarta, gunakan{' '}
          {KANAL_RESMI.map((k, i) => (
            <span key={k.nama}>
              {i > 0 && ' atau '}
              <a href={k.url} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-4">
                {k.nama}
              </a>
            </span>
          ))}
          .
        </p>
      </aside>

      <div className="mt-14">
        <FormLaporan />
      </div>
    </div>
  );
}
