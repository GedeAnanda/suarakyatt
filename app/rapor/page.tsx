// app/rapor/page.tsx — Rapor Instansi (SDD 9), pemilik: A
// Operasi SDD 6: R8 agency_report_card. Sampai fungsi itu ada di database, data diambil dari
// lib/mocks/rapor.json (bentuknya sama dengan RaporResponse) dan ditandai "Data contoh".
// Satu daftar berperingkat: satu instansi satu blok selebar halaman, dipisah garis (components/rapor/KartuRapor.tsx).

import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import BannerSimulasi from '@/components/BannerSimulasi';
import KepalaHalaman from '@/components/KepalaHalaman';
import KartuRapor from '@/components/rapor/KartuRapor';
import Ikon from '@/components/ui/Ikon';
import { kelasTombol } from '@/components/ui/Tombol';
import { ambilRapor } from '@/lib/data/prioritas';
import { tanggal } from '@/lib/format';
import { KATEGORI } from '@/lib/konten';
import { DEFINISI_RAPOR, INFO_KOMPONEN, KOMPONEN, urutkanRapor } from '@/lib/konten-rapor';

export const metadata: Metadata = {
  title: 'Rapor instansi',
  description:
    'Nilai A sampai E tiap instansi dalam merespons dan menyelesaikan laporan warga, selalu bersama tingkat penolakannya.',
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
      <section aria-label="Rapor tiap instansi" className="kartu mt-6 px-4 sm:px-7" data-muncul>
        <ol>
          {urut.map((i) => (
            <KartuRapor key={i.id} i={i} kategoriId={KATEGORI.find((k) => k.instansi === i.nama)?.id} />
          ))}
        </ol>
      </section>
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
      {/* Cara membaca nilai: empat komponen dengan bobotnya, rumus, lalu batas tiap huruf. */}
      <div className="mt-4 max-w-[80ch] text-kecil text-lembut">
        <p>Nilai rapor (0 sampai 100) dihitung dari empat komponen. Setiap komponen bernilai 0 sampai 1:</p>
        <ul className="mt-2 grid gap-x-8 gap-y-1 sm:grid-cols-2">
          {KOMPONEN.map((k) => (
            <li key={k}>
              <span className="font-bold text-teks">{k}</span> · {INFO_KOMPONEN[k].nama}, bobot{' '}
              <span className="angka">{Math.round(INFO_KOMPONEN[k].bobot * 100)}%</span>
            </li>
          ))}
        </ul>
        <p className="mt-2">
          Rumusnya{' '}
          <span className="angka font-semibold whitespace-nowrap text-teks">Nilai = 100 × (0,3 R + 0,3 S + 0,2 P + 0,2 K)</span>.
          Nilai itu lalu diubah menjadi huruf A sampai E: {DEFINISI_RAPOR.huruf}
        </p>
      </div>

      <div className="mt-6">
        <Suspense
          fallback={
            <div aria-hidden="true" className="grid gap-3">
              {[0, 1, 2, 3].map((n) => (
                <div key={n} className="kerangka h-40" />
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
