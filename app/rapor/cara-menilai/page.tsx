// app/rapor/cara-menilai/page.tsx — Cara Menilai (SDD 9), pemilik: A
// Konten statis rumus rapor dari PRD bagian 8 dan SDD 8.1. Angka contoh dihitung dengan lib/scoring/rapor.ts
// supaya selalu sama dengan rumus yang dipakai aplikasi.

import type { Metadata } from 'next';
import Link from 'next/link';
import { kelasTautan } from '@/components/ui/Tombol';
import { desimal } from '@/lib/format';
import { DEFINISI_RAPOR, INFO_KOMPONEN, KOMPONEN } from '@/lib/konten-rapor';
import { hurufDari, kepuasan, nilaiRapor } from '@/lib/scoring/rapor';

export const metadata: Metadata = {
  title: 'Cara menilai',
  description: 'Rumus Rapor Instansi suaRAkyat: komponen, bobot, contoh hitungan, dan aturan peringatan penolakan.',
};

// Contoh PRD 8: Dinas Kebersihan (simulasi), 100 laporan, 10 ditolak "Tidak valid".
const K_CONTOH = kepuasan(228, 60);
const CONTOH = [
  { k: 'R', kejadian: '80 direspons tepat waktu (termasuk penolakan), 10 telat, 5 diabaikan sampai lewat batas, 5 baru masuk dan belum bisa dinilai.', hitung: '80 ÷ 95', nilai: 80 / 95 },
  { k: 'S', kejadian: 'Dari 90 laporan yang tidak ditolak: 50 selesai tepat waktu, 15 selesai telat, 15 belum selesai padahal lewat batas, 10 masih dalam batas.', hitung: '50 ÷ 80', nilai: 50 / 80 },
  { k: 'P', kejadian: '65 selesai dari 90 laporan yang tidak ditolak.', hitung: '65 ÷ 90', nilai: 65 / 90 },
  { k: 'K', kejadian: 'Rating rata-rata 3,8 bintang dari 60 pemberi rating; dengan titik awal netral menjadi (228 + 15) ÷ 65 = 3,74.', hitung: '3,74 ÷ 5', nilai: K_CONTOH },
] as const;
const dua = (x: number) => Math.round(x * 100) / 100;
const NILAI_CONTOH = nilaiRapor(dua(CONTOH[0].nilai), dua(CONTOH[1].nilai), dua(CONTOH[2].nilai), dua(CONTOH[3].nilai));

const HURUF = [
  { h: 'A', rentang: '85 ke atas' },
  { h: 'B', rentang: '70–84' },
  { h: 'C', rentang: '55–69' },
  { h: 'D', rentang: '40–54' },
  { h: 'E', rentang: 'di bawah 40' },
];

export default function CaraMenilaiPage() {
  return (
    <div className="bingkai pt-12 pb-24 sm:pt-16">
      <div className="grid gap-6 lg:grid-cols-12">
        <h1 className="text-judul lg:col-span-6">Cara menilai instansi</h1>
        <p className="max-w-[60ch] text-badan lg:col-span-6">
          Setiap instansi mendapat nilai 0–100 dan huruf A sampai E dari empat komponen. Laporan yang belum disentuh ikut
          dihitung, sehingga instansi yang mengabaikan laporan tidak terlihat bagus. Semua instansi dihitung dengan susunan
          bobot yang sama.
        </p>
      </div>

      <section aria-labelledby="judul-rumus" className="mt-16 bg-lapis p-6 sm:mt-20 sm:p-10">
        <h2 id="judul-rumus" className="sr-only">
          Rumus
        </h2>
        <p className="text-tinta angka text-[clamp(1.75rem,1rem+3.4vw,4rem)] leading-tight font-medium tracking-[-0.04em]">
          Nilai = 100 × (0,3 R + 0,3 S + 0,2 P + 0,2 K)
        </p>
        <dl className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {KOMPONEN.map((k) => (
            <div key={k} className="grid grid-cols-[3rem_1fr] gap-x-4">
              <dt className="text-tinta text-judul leading-none font-semibold">{k}</dt>
              <dd>
                <p className="text-badan font-semibold">
                  {INFO_KOMPONEN[k].nama} · bobot {Math.round(INFO_KOMPONEN[k].bobot * 100)}%
                </p>
                <p className="mt-1 text-badan">{INFO_KOMPONEN[k].rumus}</p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="judul-huruf" className="mt-20 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="judul-huruf" className="text-judul">
            Dari nilai ke huruf
          </h2>
          <p className="mt-4 max-w-[42ch] text-badan">
            Instansi dengan kurang dari 10 laporan yang bisa dinilai ditulis &ldquo;Data belum cukup&rdquo;, tanpa huruf.
          </p>
        </div>
        <ul className="grid grid-cols-5 gap-2 lg:col-span-8">
          {HURUF.map((h) => (
            <li key={h.h} className="bg-lapis p-4">
              <p className="text-tinta text-[clamp(3rem,2rem+4vw,6rem)] leading-none font-semibold tracking-[-0.05em]">{h.h}</p>
              <p className="mt-2 text-kecil">{h.rentang}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="judul-contoh" className="mt-24">
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 id="judul-contoh" className="text-judul lg:col-span-6">
            Contoh hitungan
          </h2>
          <p className="max-w-[60ch] text-badan lg:col-span-6">
            Dinas Kebersihan (simulasi) menerima 100 laporan, 10 di antaranya ditolak &ldquo;Tidak valid&rdquo;.
          </p>
        </div>
        <ol className="mt-10 grid gap-2">
          {CONTOH.map((c) => (
            <li key={c.k} className="grid gap-3 bg-lapis p-5 sm:grid-cols-[3rem_1fr_9rem_5rem] sm:items-baseline sm:gap-6">
              <span className="text-tinta text-judul leading-none font-semibold">{c.k}</span>
              <span className="text-badan">{c.kejadian}</span>
              <span className="angka text-badan text-lembut sm:text-right">{c.hitung}</span>
              <span className="text-tinta angka text-lead font-semibold sm:text-right">{desimal(c.nilai, 2)}</span>
            </li>
          ))}
        </ol>
        <div className="di-medan mt-2 flex flex-wrap items-baseline justify-between gap-4 bg-medan p-5 text-medan-tinta sm:p-6">
          <p className="angka text-badan">
            100 × (0,3 × {desimal(dua(CONTOH[0].nilai), 2)} + 0,3 × {desimal(dua(CONTOH[1].nilai), 2)} + 0,2 ×{' '}
            {desimal(dua(CONTOH[2].nilai), 2)} + 0,2 × {desimal(dua(CONTOH[3].nilai), 2)})
          </p>
          <p className="angka text-judul font-medium tracking-[-0.04em]">
            {desimal(NILAI_CONTOH)} · {hurufDari(NILAI_CONTOH)}
          </p>
        </div>
      </section>

      <section aria-labelledby="judul-penolakan" className="mt-24 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 id="judul-penolakan" className="text-judul">
            Menolak boleh, menolak diam-diam tidak
          </h2>
          <p className="mt-6 max-w-[48ch] text-badan">{DEFINISI_RAPOR.penolakan}</p>
          <p className="mt-4 max-w-[48ch] text-badan">
            Pembandingnya median instansi lain, bukan rata-rata, supaya dua instansi yang sama-sama curang tidak saling
            menutupi. Publik bisa membuka setiap laporan yang ditolak beserta alasannya di{' '}
            <Link href="/peta?status=ditolak" className={kelasTautan}>
              peta laporan
            </Link>
            .
          </p>
        </div>
        <div className="overflow-x-auto lg:col-span-7">
          <table className="w-full min-w-[30rem] text-left text-badan">
            <caption className="mb-3 text-left text-kecil text-lembut">
              Dua dinas yang sama-sama menerima 100 laporan
            </caption>
            <thead>
              <tr className="bg-lapis-2">
                <th scope="col" className="p-3 font-medium"></th>
                <th scope="col" className="p-3 font-medium">Dinas A, menangani laporan susah</th>
                <th scope="col" className="p-3 font-medium">Dinas B, menolak laporan susah</th>
              </tr>
            </thead>
            <tbody className="bg-lapis">
              <tr className="border-t border-kertas">
                <th scope="row" className="p-3 font-medium">Ditolak &ldquo;Tidak valid&rdquo;</th>
                <td className="angka p-3">5</td>
                <td className="angka p-3">35</td>
              </tr>
              <tr className="border-t border-kertas">
                <th scope="row" className="p-3 font-medium">Jika hanya huruf</th>
                <td className="p-3">B</td>
                <td className="p-3">A</td>
              </tr>
              <tr className="border-t border-kertas">
                <th scope="row" className="p-3 font-medium">Di suaRAkyat</th>
                <td className="p-3">B · ditolak 5%</td>
                <td className="p-3 font-semibold">C (angkanya setara A) · ditolak 35%, melewati batas 25%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="judul-lain" className="mt-24 grid gap-8 lg:grid-cols-12">
        <h2 id="judul-lain" className="text-judul lg:col-span-4">
          Yang tampil tapi tidak dinilai
        </h2>
        <dl className="grid gap-6 sm:grid-cols-2 lg:col-span-8">
          <div>
            <dt className="text-badan font-semibold">Median waktu respons</dt>
            <dd className="mt-1 text-badan">{DEFINISI_RAPOR.median}</dd>
          </div>
          <div>
            <dt className="text-badan font-semibold">Ukuran sampel dan periode</dt>
            <dd className="mt-1 text-badan">{DEFINISI_RAPOR.sampel} Periode bawaan: seluruh data.</dd>
          </div>
          <div>
            <dt className="text-badan font-semibold">Laporan yang tidak dihitung</dt>
            <dd className="mt-1 text-badan">
              Laporan yang dibatalkan pelapor, yang ditolak sebagai duplikat, dan yang dipindahkan ke instansi lain tidak
              dihitung untuk instansi ini. Laporan yang masih dalam batas waktu dan belum selesai menunggu sampai hasilnya
              bisa ditentukan.
            </dd>
          </div>
          <div>
            <dt className="text-badan font-semibold">Batas rapor ini</dt>
            <dd className="mt-1 text-badan">
              Batas waktu tiap kategori adalah asumsi simulasi dan beban kerja tiap dinas berbeda. Rapor tidak mengklaim
              mengukur kualitas instansi secara menyeluruh.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
