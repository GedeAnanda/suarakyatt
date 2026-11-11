// app/rapor/page.tsx — Rapor dinas (SDD 9), pemilik: A
// Operasi SDD 6: R8 agency_report_card. Sampai fungsi itu ada di database, data diambil dari
// lib/mocks/rapor.json (bentuknya sama dengan RaporResponse) dan ditandai data buatan.
// Urutan di HP (audit bahasa awam D4): satu baris cara membaca huruf → banner data → ringkasan terbaik dan
// terburuk → daftar berperingkat, satu dinas satu blok selebar halaman (components/rapor/KartuRapor.tsx).
// Rumus lengkap hanya di /rapor/cara-menilai.

import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import BannerSimulasi from '@/components/BannerSimulasi';
import KepalaHalaman from '@/components/KepalaHalaman';
import KartuRapor from '@/components/rapor/KartuRapor';
import { kelasTautan } from '@/components/ui/Tombol';
import { ambilRapor } from '@/lib/data/prioritas';
import { tanggal } from '@/lib/format';
import { DATA_BUATAN } from '@/lib/kamus';
import { KATEGORI } from '@/lib/konten';
import {
  CARA_BACA_RAPOR,
  hurufDanArti,
  namaDinas,
  pembandingRapor,
  ringkasanRapor,
  urutkanRapor,
} from '@/lib/konten-rapor';

export const metadata: Metadata = {
  title: 'Rapor dinas',
  description:
    'Huruf A sampai E tiap dinas dalam menanggapi dan menyelesaikan laporan warga, selalu bersama persen laporan yang ditolak.',
};

async function Isi() {
  const { sumber, rapor } = await ambilRapor();
  const urut = urutkanRapor(rapor.instansi);
  const ringkas = ringkasanRapor(urut);
  return (
    <>
      <BannerSimulasi
        sumber={sumber}
        keterangan={`Laporan ${tanggal(rapor.periode.dari)} sampai ${tanggal(rapor.periode.sampai)}, kecuali yang dibatalkan pelapor`}
      />
      {ringkas && (
        <p className="mt-5 text-badan">
          <strong className="font-bold">Paling baik:</strong>{' '}
          <a href={`#instansi-${ringkas.baik.id}`} className={kelasTautan}>
            {namaDinas(ringkas.baik.nama)}
          </a>{' '}
          ({hurufDanArti(ringkas.baik.huruf)}).
          {ringkas.buruk && (
            <>
              {' '}
              <strong className="font-bold">Paling perlu diperbaiki:</strong>{' '}
              <a href={`#instansi-${ringkas.buruk.id}`} className={kelasTautan}>
                {namaDinas(ringkas.buruk.nama)}
              </a>{' '}
              ({hurufDanArti(ringkas.buruk.huruf)}).
            </>
          )}
        </p>
      )}
      {/* data-muncul di <ol>, bukan di section: tiap dinas muncul sendiri. Di section, seluruh daftar (±1.200 px)
          menjadi satu elemen yang masih pudar sampai hampir setengahnya tergulir. */}
      <section aria-label="Rapor tiap dinas" className="kartu mt-4 px-4 sm:px-7">
        <ol data-muncul>
          {urut.map((i) => (
            <KartuRapor
              key={i.id}
              i={i}
              kategoriId={KATEGORI.find((k) => k.instansi === i.nama)?.id}
              pembanding={pembandingRapor(urut, i.id)}
            />
          ))}
        </ol>
      </section>
    </>
  );
}

export default function RaporPage() {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <KepalaHalaman judul="Rapor dinas">
        Rapor ini menunjukkan seberapa baik tiap dinas menanggapi dan menyelesaikan laporan warga. Persen laporan yang
        ditolak selalu tampil, jadi nilai bagus hasil menolak laporan langsung ketahuan.
      </KepalaHalaman>

      {/* Satu baris cara membaca huruf; rumus lengkap di halaman Cara menilai. */}
      <p className="mt-3 max-w-[80ch] text-kecil text-lembut">
        {CARA_BACA_RAPOR}{' '}
        <Link href="/rapor/cara-menilai" className={`${kelasTautan} inline-flex min-h-11 items-center`}>
          Cara rapor dihitung
        </Link>
      </p>

      <div className="mt-3">
        <Suspense
          fallback={
            <div aria-hidden="true" className="grid gap-3">
              {[0, 1, 2, 3].map((n) => (
                <div key={n} className="kerangka h-40" />
              ))}
            </div>
          }
        >
          <div className="masuk">
            <Isi />
          </div>
        </Suspense>
      </div>

      <p className="mt-8 max-w-[80ch] text-kecil text-lembut">
        Batas waktu tiap kategori ditentukan tim, dan beban kerja tiap dinas berbeda. Jadi rapor ini tidak mengukur mutu
        dinas secara menyeluruh. {DATA_BUATAN}
      </p>
    </div>
  );
}
