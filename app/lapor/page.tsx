// app/lapor/page.tsx — Buat Laporan (SDD 9), pemilik: A. Hanya untuk pengguna login (proxy.ts).
// Operasi SDD 6: Q4 (kategori, dari lib/konten yang sama dengan 0006), S1 unggah foto, R2 similar_reports,
// R3 create_report. Semua ada di components/lapor/FormLaporan.tsx.

import type { Metadata } from 'next';
import KepalaHalaman from '@/components/KepalaHalaman';
import FormLaporan from '@/components/lapor/FormLaporan';
import Ikon from '@/components/ui/Ikon';
import { KANAL_RESMI } from '@/lib/konten';

export const metadata: Metadata = {
  title: 'Lapor masalah',
  description: 'Laporkan masalah kota di DKI Jakarta dengan foto dan titik lokasi, lalu lacak penanganannya dengan kode SR.',
};

export default function LaporPage() {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <KepalaHalaman judul="Lapor masalah">
        Laporkan masalah kota dengan foto dan titik lokasi. Anda akan mendapat kode untuk melacak penanganannya, dan laporan
        Anda ikut menentukan posisi isu wilayahnya di daftar prioritas.
      </KepalaHalaman>

      <aside role="note" className="mt-5 flex gap-3 rounded-kartu border border-garis bg-permukaan px-4 py-3 text-kecil sm:text-badan">
        <Ikon nama="info" className="mt-0.5 size-5 shrink-0 text-biru" />
        <p>
          <strong className="font-bold">SUARAKYAT bukan kanal pengaduan resmi.</strong> Laporan di sini tidak diteruskan ke
          instansi. Untuk pengaduan resmi ke Pemprov DKI Jakarta, gunakan{' '}
          {KANAL_RESMI.map((k, i) => (
            <span key={k.nama}>
              {i > 0 && ' atau '}
              <a href={k.url} target="_blank" rel="noreferrer" className="font-bold text-biru-tua underline underline-offset-4">
                {k.nama}
              </a>
            </span>
          ))}
          .
        </p>
      </aside>

      <div className="mt-6">
        <FormLaporan />
      </div>
    </div>
  );
}
