// app/rapor/page.tsx — Rapor Instansi (SDD 9), pemilik: A
// Operasi SDD 6: R8 agency_report_card. Sampai fungsi itu ada di database, data diambil dari
// lib/mocks/rapor.json (bentuknya sama dengan RaporResponse) dan ditandai "Data contoh".

import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import BannerSimulasi from '@/components/BannerSimulasi';
import KepalaHalaman from '@/components/KepalaHalaman';
import KartuRapor from '@/components/rapor/KartuRapor';
import Ikon from '@/components/ui/Ikon';
import { kelasTombol } from '@/components/ui/Tombol';
import { ambilRapor } from '@/lib/data/prioritas';
import { persen, tanggal } from '@/lib/format';
import { KATEGORI } from '@/lib/konten';
import { urutkanRapor } from '@/lib/konten-rapor';

export const metadata: Metadata = {
  title: 'Rapor instansi',
  description: 'Nilai A–E tiap instansi dalam merespons dan menyelesaikan laporan warga, selalu bersama tingkat penolakannya.',
};

async function Isi() {
  const { sumber, rapor } = await ambilRapor();
  const urut = urutkanRapor(rapor.instansi);
  return (
    <>
      <BannerSimulasi
        sumber={sumber}
        keterangan={`Periode ${tanggal(rapor.periode.dari)} sampai ${tanggal(rapor.periode.sampai)} · semua laporan kecuali yang dibatalkan`}
      />
      <nav aria-label="Ringkasan rapor" className="mt-6">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {urut.map((i) => (
            <li key={i.id}>
              {/* Di bawah 375 px huruf ditumpuk di atas nama: dua kolom terlalu sempit untuk "Penerangan" di sampingnya. */}
              <a
                href={`#instansi-${i.id}`}
                className="group kartu kartu-klik flex h-full items-center gap-3 p-3 max-[374px]:flex-col max-[374px]:items-start max-[374px]:gap-2 sm:p-4"
              >
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-kontrol text-[1.75rem] leading-none font-bold transition-transform duration-300 ease-pegas group-hover:scale-105 ${
                    i.huruf ? 'bg-biru text-white' : 'bg-lapis text-lembut'
                  }`}
                >
                  {i.huruf ?? '–'}
                </span>
                <span className="min-w-0 text-kecil leading-tight">
                  <span className="block font-bold">{i.nama.replace(' (simulasi)', '').replace('Dinas ', '')}</span>
                  <span
                    className={`mt-1 flex items-center gap-1 ${i.peringatan_penolakan ? 'font-semibold text-merah-tua' : 'text-lembut'}`}
                  >
                    {i.peringatan_penolakan && <Ikon nama="peringatan" className="size-3.5" />}
                    ditolak {persen(i.tingkat_penolakan)}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2" data-muncul>
        {urut.map((i) => (
          <KartuRapor key={i.id} i={i} kategoriId={KATEGORI.find((k) => k.instansi === i.nama)?.id} />
        ))}
      </div>
    </>
  );
}

export default function RaporPage() {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <KepalaHalaman
        judul="Rapor instansi"
        aksi={
          <Link href="/rapor/cara-menilai" className={kelasTombol('garis', 'text-kecil')}>
            <Ikon nama="buku" className="size-4" />
            Cara menilai
          </Link>
        }
      >
        Nilai tiap instansi dalam merespons dan menyelesaikan laporan warga. Laporan yang diabaikan ikut dihitung, dan huruf
        selalu tampil bersama tingkat penolakannya: nilai bagus hasil membuang laporan langsung terlihat.
      </KepalaHalaman>
      <p className="angka mt-4 inline-flex flex-wrap items-center gap-2 rounded-kontrol bg-biru-muda px-3 py-2 text-badan font-bold text-biru-tua">
        Nilai = 100 × (0,3 R + 0,3 S + 0,2 P + 0,2 K)
      </p>

      <div className="mt-6">
        <Suspense
          fallback={
            <div aria-hidden="true" className="grid gap-5 xl:grid-cols-2">
              {[0, 1, 2, 3].map((n) => (
                <div key={n} className="kerangka h-[30rem]" />
              ))}
            </div>
          }
        >
          <Isi />
        </Suspense>
      </div>

      <p className="mt-8 max-w-[80ch] text-kecil text-lembut">
        Batas waktu tiap kategori adalah asumsi simulasi dan beban kerja tiap dinas berbeda, jadi rapor ini tidak mengklaim
        mengukur kualitas instansi secara menyeluruh. Rapor tidak pernah memakai data nyata: prototipe ini memperagakan
        mekanisme penilaian, bukan menilai dinas sungguhan.
      </p>
    </div>
  );
}
