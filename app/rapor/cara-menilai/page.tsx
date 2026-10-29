// app/rapor/cara-menilai/page.tsx — Cara Menilai (SDD 9), pemilik: A
// Konten statis rumus rapor dari PRD bagian 8 dan SDD 8.1. Angka contoh dihitung dengan lib/scoring/rapor.ts
// supaya selalu sama dengan rumus yang dipakai aplikasi.

import type { Metadata } from 'next';
import Link from 'next/link';
import KepalaHalaman from '@/components/KepalaHalaman';
import AngkaGulir from '@/components/ui/AngkaGulir';
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
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <KepalaHalaman judul="Cara menilai instansi" jejak={[{ href: '/rapor', label: 'Rapor instansi' }]}>
        Setiap instansi mendapat nilai 0–100 dan huruf A sampai E dari empat komponen. Laporan yang belum disentuh ikut
        dihitung, sehingga instansi yang mengabaikan laporan tidak terlihat bagus. Semua instansi dihitung dengan susunan
        bobot yang sama.
      </KepalaHalaman>

      <section aria-labelledby="judul-rumus" className="kartu mt-6 overflow-hidden">
        <h2 id="judul-rumus" className="sr-only">
          Rumus
        </h2>
        <p className="angka bg-biru-muda px-5 py-5 text-[clamp(1.375rem,1rem+2vw,2.5rem)] leading-tight font-bold tracking-[-0.02em] text-biru-tua sm:px-8">
          Nilai = 100 × (0,3 R + 0,3 S + 0,2 P + 0,2 K)
        </p>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-6 p-5 sm:p-8 md:grid-cols-2" data-muncul>
          {KOMPONEN.map((k) => (
            <div key={k} className="grid grid-cols-[3rem_1fr] gap-x-4">
              <dt className="flex size-12 items-center justify-center rounded-kontrol bg-biru text-sub font-bold text-white">{k}</dt>
              <dd>
                <p className="text-badan font-bold">
                  {INFO_KOMPONEN[k].nama} · bobot {Math.round(INFO_KOMPONEN[k].bobot * 100)}%
                </p>
                <p className="mt-1 text-kecil text-lembut">{INFO_KOMPONEN[k].rumus}</p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="judul-huruf" className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-center">
        <div>
          <h2 id="judul-huruf" className="judul-seksi">
            Dari nilai ke huruf
          </h2>
          <p className="mt-2 text-badan text-lembut">
            Instansi dengan kurang dari 10 laporan yang bisa dinilai ditulis &ldquo;Data belum cukup&rdquo;, tanpa huruf.
          </p>
        </div>
        <ul className="grid grid-cols-5 gap-2" data-muncul>
          {HURUF.map((h) => (
            <li key={h.h} className="kartu p-3 text-center sm:p-4">
              <p className="text-[clamp(2.25rem,1.5rem+3vw,4rem)] leading-none font-bold text-biru-tua">{h.h}</p>
              <p className="mt-2 text-mini text-lembut sm:text-kecil">{h.rentang}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="judul-contoh" className="mt-12">
        <h2 id="judul-contoh" className="judul-seksi">
          Contoh hitungan
        </h2>
        <p className="mt-2 max-w-[70ch] text-badan text-lembut">
          Dinas Kebersihan (simulasi) menerima 100 laporan, 10 di antaranya ditolak &ldquo;Tidak valid&rdquo;.
        </p>
        <ol className="kartu mt-5 overflow-hidden" data-muncul>
          {CONTOH.map((c) => (
            <li
              key={c.k}
              className="grid gap-3 border-b border-garis p-5 last:border-b-0 sm:grid-cols-[3rem_1fr_8rem_5rem] sm:items-center sm:gap-6"
            >
              <span className="flex size-11 items-center justify-center rounded-kontrol bg-biru-muda text-lead font-bold text-biru-tua">{c.k}</span>
              <span className="text-kecil sm:text-badan">{c.kejadian}</span>
              <span className="angka text-kecil text-lembut sm:text-right sm:text-badan">{c.hitung}</span>
              <span className="angka text-sub font-bold text-biru-tua sm:text-right">{desimal(c.nilai, 2)}</span>
            </li>
          ))}
        </ol>
        <div className="di-gelap mt-3 flex flex-wrap items-center justify-between gap-4 rounded-kartu bg-biru p-5 text-white sm:p-6">
          <p className="angka text-kecil sm:text-badan">
            100 × (0,3 × {desimal(dua(CONTOH[0].nilai), 2)} + 0,3 × {desimal(dua(CONTOH[1].nilai), 2)} + 0,2 ×{' '}
            {desimal(dua(CONTOH[2].nilai), 2)} + 0,2 × {desimal(dua(CONTOH[3].nilai), 2)})
          </p>
          <p className="angka text-judul font-bold">
            <AngkaGulir nilai={desimal(NILAI_CONTOH)} /> · {hurufDari(NILAI_CONTOH)}
          </p>
        </div>
      </section>

      <section aria-labelledby="judul-penolakan" className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div>
          <h2 id="judul-penolakan" className="judul-seksi">
            Menolak boleh, diam-diam tidak
          </h2>
          <p className="mt-2 text-badan text-lembut">{DEFINISI_RAPOR.penolakan}</p>
          <p className="mt-3 text-badan text-lembut">
            Pembandingnya median instansi lain, bukan rata-rata, supaya dua instansi yang sama-sama curang tidak saling
            menutupi. Publik bisa membuka setiap laporan yang ditolak beserta alasannya di{' '}
            <Link href="/peta?status=ditolak" className={kelasTautan}>
              peta laporan
            </Link>
            .
          </p>
        </div>
        <div className="kartu relative self-start overflow-x-auto">
          <table className="w-full min-w-[30rem] text-left text-kecil sm:text-badan">
            <caption className="border-b border-garis px-4 py-3 text-left text-kecil font-semibold">
              Dua dinas yang sama-sama menerima 100 laporan
            </caption>
            <thead>
              <tr className="bg-latar">
                <th scope="col" className="p-3 font-semibold"></th>
                <th scope="col" className="p-3 font-semibold">Dinas A, menangani laporan susah</th>
                <th scope="col" className="p-3 font-semibold">Dinas B, menolak laporan susah</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-garis">
                <th scope="row" className="p-3 font-semibold">Ditolak &ldquo;Tidak valid&rdquo;</th>
                <td className="angka p-3">5</td>
                <td className="angka p-3">35</td>
              </tr>
              <tr className="border-t border-garis">
                <th scope="row" className="p-3 font-semibold">Jika hanya huruf</th>
                <td className="p-3">B</td>
                <td className="p-3">A</td>
              </tr>
              <tr className="border-t border-garis bg-merah-muda/50">
                <th scope="row" className="p-3 font-semibold">Di suaRAkyat</th>
                <td className="p-3">B · ditolak 5%</td>
                <td className="p-3 font-bold text-merah-tua">C (angkanya setara A) · ditolak 35%, melewati batas 25%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="judul-lain" className="mt-12">
        <h2 id="judul-lain" className="judul-seksi">
          Yang tampil tapi tidak dinilai
        </h2>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2" data-muncul>
          <div className="kartu p-5">
            <dt className="text-badan font-bold">Median waktu respons</dt>
            <dd className="mt-1 text-kecil text-lembut">{DEFINISI_RAPOR.median}</dd>
          </div>
          <div className="kartu p-5">
            <dt className="text-badan font-bold">Ukuran sampel dan periode</dt>
            <dd className="mt-1 text-kecil text-lembut">{DEFINISI_RAPOR.sampel} Periode bawaan: seluruh data.</dd>
          </div>
          <div className="kartu p-5">
            <dt className="text-badan font-bold">Laporan yang tidak dihitung</dt>
            <dd className="mt-1 text-kecil text-lembut">
              Laporan yang dibatalkan pelapor, yang ditolak sebagai duplikat, dan yang dipindahkan ke instansi lain tidak
              dihitung untuk instansi ini. Laporan yang masih dalam batas waktu dan belum selesai menunggu sampai hasilnya
              bisa ditentukan.
            </dd>
          </div>
          <div className="kartu p-5">
            <dt className="text-badan font-bold">Batas rapor ini</dt>
            <dd className="mt-1 text-kecil text-lembut">
              Batas waktu tiap kategori adalah asumsi simulasi dan beban kerja tiap dinas berbeda. Rapor tidak mengklaim
              mengukur kualitas instansi secara menyeluruh.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
