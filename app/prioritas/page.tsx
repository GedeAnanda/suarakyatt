// app/prioritas/page.tsx — Dashboard Prioritas (SDD 9), pemilik: A
// Operasi SDD 6: R9 priority_factors, Q5 priority_weights, Q6 v_riwayat_bobot, R10 save_weights (Perencana),
// L1 lib/scoring (di browser, lewat Simulator). Peta memakai lib/geo (dari public/data/kecamatan.geojson).

import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import BannerSimulasi from '@/components/BannerSimulasi';
import RiwayatBobot from '@/components/prioritas/RiwayatBobot';
import Simulator from '@/components/prioritas/Simulator';
import LabelSumber from '@/components/ui/LabelSumber';
import { kelasTautan } from '@/components/ui/Tombol';
import { ambilDataPrioritas } from '@/lib/data/prioritas';
import { ambilSesi } from '@/lib/data/sesi';
import { tanggal } from '@/lib/format';
import { DEFINISI_FAKTOR, NAMA_FAKTOR } from '@/lib/konten';
import { FAKTOR } from '@/lib/scoring';

export const metadata: Metadata = {
  title: 'Dashboard prioritas',
  description: 'Urutan isu wilayah Jakarta, alasan di balik setiap skor, dan simulator untuk menguji bobot lain.',
};

async function Isi() {
  const [data, sesi] = await Promise.all([ambilDataPrioritas(), ambilSesi()]);
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <LabelSumber sumber={data.sumber} />
        <span className="text-kecil text-lembut">
          Bobot acuan berlaku{data.bobotDiperbarui ? ` sejak ${tanggal(data.bobotDiperbarui)}` : ''} · kerentanan memakai asumsi kemiskinan level kota dalam simulasi
        </span>
      </div>
      <BannerSimulasi sumber={data.sumber} className="mt-4" />

      <div className="mt-6">
        <Simulator isu={data.faktor.isu} bobotResmi={data.bobotResmi} perencana={Boolean(sesi?.perencana)} />
      </div>

      <section aria-labelledby="judul-riwayat" className="mt-24 grid grid-cols-1 gap-8 lg:grid-cols-12" data-muncul>
        <div className="lg:col-span-4">
          <h2 id="judul-riwayat" className="text-judul">
            Riwayat keputusan
          </h2>
          <p className="mt-4 max-w-[42ch] text-badan">
            Setiap perubahan bobot acuan oleh Perencana tercatat di sini: siapa, kapan, dari berapa ke berapa, dan alasannya.
            Tidak ada bobot yang objektif; karena itu bobot dibuat terbuka.
          </p>
        </div>
        <div className="lg:col-span-8">
          <RiwayatBobot riwayat={data.riwayat} />
        </div>
      </section>
    </>
  );
}

function Kerangka() {
  return (
    <div aria-hidden="true" className="grid gap-8 lg:grid-cols-12">
      <div className="kerangka h-[36rem] lg:col-span-4" />
      <div className="grid content-start gap-6 lg:col-span-8">
        <div className="kerangka h-10 w-2/3" />
        <div className="kerangka h-80" />
        <div className="kerangka h-96" />
      </div>
    </div>
  );
}

export default function PrioritasPage() {
  return (
    <div className="bingkai pt-12 pb-24 sm:pt-16">
      <div className="grid gap-6 lg:grid-cols-12">
        <h1 data-pembuka="judul" className="text-judul lg:col-span-6">Dashboard prioritas</h1>
        <p data-pembuka="teks" className="max-w-[60ch] text-badan lg:col-span-6">
          Setiap isu wilayah (satu kecamatan × satu kategori yang punya laporan aktif) mendapat skor 0–100 dari enam
          faktor. Pilih isu untuk melihat faktor yang mendorong dan menahannya, atau geser bobotnya sendiri. Hitungannya
          dijelaskan di bawah.
        </p>
      </div>

      <details className="mt-5 text-badan">
        <summary className="w-fit cursor-pointer py-2 font-medium text-tinta">Cara mencoba simulator</summary>
        <ol className="mt-2 max-w-[65ch] list-decimal space-y-2 pl-5">
          <li>Pilih kecamatan di peta atau isu di daftar peringkat.</li>
          <li>Baca faktor yang mendorong dan menahan skornya.</li>
          <li>Ubah bobot, lalu bagikan tautan untuk membuka skenario yang sama.</li>
        </ol>
      </details>

      <div className="mt-6">
        <Suspense fallback={<Kerangka />}>
          <Isi />
        </Suspense>
      </div>

      <section aria-labelledby="judul-faktor" className="mt-24 grid grid-cols-1 gap-8 lg:grid-cols-12" data-muncul>
        <div className="lg:col-span-4">
          <h2 id="judul-faktor" className="text-judul">
            Enam faktor
          </h2>
          <p className="mt-4 max-w-[42ch] text-badan">
            Skor = 100 × jumlah (bobot × nilai faktor). Nilai faktor diubah ke skala 0–1; kontribusi semua faktor selalu
            berjumlah sama dengan skornya. Isu tanpa laporan aktif tidak diberi peringkat.
          </p>
          <p className="mt-4 text-badan">
            <Link href="/sumber-data" className={kelasTautan}>
              Sumber data setiap faktor
            </Link>
          </p>
        </div>
        <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:col-span-8">
          {FAKTOR.map((f) => (
            <div key={f}>
              <dt className="text-badan font-semibold">{NAMA_FAKTOR[f]}</dt>
              <dd className="mt-1 text-badan">{DEFINISI_FAKTOR[f]}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
