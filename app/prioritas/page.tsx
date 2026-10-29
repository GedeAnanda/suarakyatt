// app/prioritas/page.tsx — Dashboard Prioritas (SDD 9), pemilik: A
// Operasi SDD 6: R9 priority_factors, Q5 priority_weights, Q6 v_riwayat_bobot, R10 save_weights (Perencana),
// L1 lib/scoring (di browser, lewat Simulator). Peta memakai lib/geo (dari public/data/kecamatan.geojson).

import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import BannerSimulasi from '@/components/BannerSimulasi';
import KepalaHalaman from '@/components/KepalaHalaman';
import RiwayatBobot from '@/components/prioritas/RiwayatBobot';
import Simulator from '@/components/prioritas/Simulator';
import Ikon from '@/components/ui/Ikon';
import { kelasTombol } from '@/components/ui/Tombol';
import { ambilDataPrioritas } from '@/lib/data/prioritas';
import { ambilSesi } from '@/lib/data/sesi';
import { tanggal } from '@/lib/format';
import { DEFINISI_FAKTOR, NAMA_FAKTOR } from '@/lib/konten';
import { FAKTOR } from '@/lib/scoring';
import { WARNA_FAKTOR } from '@/components/prioritas/BarKontribusi';

export const metadata: Metadata = {
  title: 'Dashboard prioritas',
  description: 'Urutan isu wilayah Jakarta, alasan di balik setiap skor, dan simulator untuk menguji bobot lain.',
};

async function Isi() {
  const [data, sesi] = await Promise.all([ambilDataPrioritas(), ambilSesi()]);
  return (
    <>
      <BannerSimulasi
        sumber={data.sumber}
        keterangan={`Bobot resmi berlaku${data.bobotDiperbarui ? ` sejak ${tanggal(data.bobotDiperbarui)}` : ''} · kerentanan dari data kemiskinan level kota`}
      />

      <div className="mt-6">
        <Simulator isu={data.faktor.isu} bobotResmi={data.bobotResmi} perencana={Boolean(sesi?.perencana)} />
      </div>

      <section aria-labelledby="judul-riwayat" className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[21rem_minmax(0,1fr)]">
        <div>
          <h2 id="judul-riwayat" className="judul-seksi scroll-mt-24">
            Riwayat keputusan
          </h2>
          <p className="mt-2 text-badan text-lembut">
            Setiap perubahan bobot resmi oleh Perencana tercatat di sini: siapa, kapan, dari berapa ke berapa, dan alasannya.
            Tidak ada bobot yang objektif; karena itu bobot dibuat terbuka.
          </p>
        </div>
        <RiwayatBobot riwayat={data.riwayat} />
      </section>
    </>
  );
}

function Kerangka() {
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)] xl:grid-cols-[21rem_minmax(0,1fr)]">
      <div className="kerangka h-[36rem]" />
      <div className="grid content-start gap-5">
        <div className="kerangka h-10 w-2/3" />
        <div className="kerangka h-80" />
        <div className="kerangka h-96" />
      </div>
    </div>
  );
}

export default function PrioritasPage() {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <KepalaHalaman
        judul="Dashboard prioritas"
        aksi={
          <Link href="/sumber-data" className={kelasTombol('garis', 'text-kecil')}>
            <Ikon nama="data" className="size-4" />
            Sumber data faktor
          </Link>
        }
      >
        Setiap isu wilayah (satu kecamatan × satu kategori yang punya laporan aktif) mendapat skor 0–100 dari enam faktor.
        Pilih isu untuk melihat faktor yang mendorong dan menahannya, atau geser bobotnya sendiri.
      </KepalaHalaman>

      <div className="mt-6">
        <Suspense fallback={<Kerangka />}>
          <Isi />
        </Suspense>
      </div>

      <section aria-labelledby="judul-faktor" className="mt-12">
        <h2 id="judul-faktor" className="judul-seksi">
          Enam faktor
        </h2>
        <p className="mt-2 max-w-[80ch] text-badan text-lembut">
          Skor = 100 × jumlah (bobot × nilai faktor). Nilai faktor diubah ke skala 0–1; kontribusi semua faktor selalu
          berjumlah sama dengan skornya. Isu tanpa laporan aktif tidak diberi peringkat.
        </p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-muncul>
          {FAKTOR.map((f) => (
            <div key={f} className="kartu p-5">
              <dt className="flex items-center gap-2 text-lead font-bold">
                <span aria-hidden="true" className="size-3 rounded-full" style={{ background: WARNA_FAKTOR[f] }} />
                {NAMA_FAKTOR[f]}
              </dt>
              <dd className="mt-1.5 text-kecil text-lembut">{DEFINISI_FAKTOR[f]}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
