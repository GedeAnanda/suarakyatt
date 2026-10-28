// app/rapor/page.tsx — Rapor Instansi (SDD 9), pemilik: A
// Operasi SDD 6: R8 agency_report_card. Sampai fungsi itu ada di database, data diambil dari
// lib/mocks/rapor.json (bentuknya sama dengan RaporResponse) dan ditandai "Data contoh".

import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import BannerSimulasi from '@/components/BannerSimulasi';
import KartuRapor from '@/components/rapor/KartuRapor';
import { kelasTautan } from '@/components/ui/Tombol';
import { ambilRapor } from '@/lib/data/prioritas';
import Ikon from '@/components/ui/Ikon';
import { persen, tanggal } from '@/lib/format';
import { KATEGORI } from '@/lib/konten';

export const metadata: Metadata = {
  title: 'Rapor instansi',
  description: 'Nilai A–E tiap instansi dalam merespons dan menyelesaikan laporan warga, selalu bersama tingkat penolakannya.',
};

const URUT_HURUF = { A: 0, B: 1, C: 2, D: 3, E: 4 } as const;

async function Isi() {
  const { sumber, rapor } = await ambilRapor();
  const urut = [...rapor.instansi].sort(
    (a, b) => (a.huruf ? URUT_HURUF[a.huruf] : 9) - (b.huruf ? URUT_HURUF[b.huruf] : 9) || b.nilai - a.nilai,
  );
  return (
    <>
      <BannerSimulasi
        sumber={sumber}
        keterangan={`Periode ${tanggal(rapor.periode.dari)} sampai ${tanggal(rapor.periode.sampai)} · semua laporan kecuali yang dibatalkan`}
      />
      <nav aria-label="Ringkasan rapor" className="mt-10">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-muncul>
          {urut.map((i) => (
            <li key={i.id}>
              <a
                href={`#instansi-${i.id}`}
                className="group flex h-full items-center gap-3 rounded-(--radius-kartu) p-3 transition-colors duration-200 hover:bg-permukaan sm:p-4"
              >
                <span
                  className={`text-[2.75rem] leading-none font-semibold tracking-[-0.05em] transition-transform duration-300 ease-(--ease-pegas) group-hover:-rotate-6 group-hover:scale-110 ${i.huruf ? 'text-tinta' : 'text-lembut'}`}
                >
                  {i.huruf ?? '–'}
                </span>
                <span className="min-w-0 text-kecil leading-tight">
                  <span className="block font-semibold">{i.nama.replace(' (simulasi)', '').replace('Dinas ', '')}</span>
                  <span className={`flex items-center gap-1 ${i.peringatan_penolakan ? 'font-semibold text-tinta' : 'text-lembut'}`}>
                    {i.peringatan_penolakan && <Ikon nama="peringatan" className="size-3.5" />}
                    ditolak {persen(i.tingkat_penolakan)}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2" data-muncul>
        {urut.map((i) => (
          <KartuRapor key={i.id} i={i} kategoriId={KATEGORI.find((k) => k.instansi === i.nama)?.id} />
        ))}
      </div>
    </>
  );
}

export default function RaporPage() {
  return (
    <div className="bingkai pt-12 pb-24 sm:pt-16">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12" data-awal>
        <h1 className="text-judul lg:col-span-6">Rapor instansi</h1>
        <div className="lg:col-span-6">
          <p className="max-w-[60ch] text-badan">
            Nilai tiap instansi dalam merespons dan menyelesaikan laporan warga. Laporan yang diabaikan ikut dihitung, dan
            huruf selalu tampil bersama tingkat penolakannya: nilai bagus hasil membuang laporan langsung terlihat.
          </p>
          <p className="text-tinta mt-4 angka text-lead font-medium tracking-tight">Nilai = 100 × (0,3 R + 0,3 S + 0,2 P + 0,2 K)</p>
          <p className="mt-3 text-badan">
            <Link href="/rapor/cara-menilai" className={kelasTautan}>
              Cara menilai, lengkap dengan contoh hitungan
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-12">
        <Suspense
          fallback={
            <div aria-hidden="true" className="grid gap-6 lg:grid-cols-2">
              {[0, 1, 2, 3].map((n) => (
                <div key={n} className="kerangka h-[30rem]" />
              ))}
            </div>
          }
        >
          <Isi />
        </Suspense>
      </div>

      <p className="mt-12 max-w-[70ch] text-kecil text-lembut">
        Batas waktu tiap kategori adalah asumsi simulasi dan beban kerja tiap dinas berbeda, jadi rapor ini tidak mengklaim
        mengukur kualitas instansi secara menyeluruh. Rapor tidak pernah memakai data nyata: prototipe ini memperagakan
        mekanisme penilaian, bukan menilai dinas sungguhan.
      </p>
    </div>
  );
}
