// app/rapor/cara-menilai/page.tsx — Cara rapor dihitung (SDD 9), pemilik: A
// Konten statis rumus rapor dari PRD bagian 8 dan SDD 8.1. Urutan (audit bahasa awam D41): cerita contoh dulu,
// baru rumus, lalu huruf, batas penolakan, dan angka yang tampil tapi tidak dinilai. Satu-satunya halaman yang
// boleh memakai kode R/S/P/K. Angka contoh dihitung dengan lib/scoring/rapor.ts supaya selalu sama dengan rumus aplikasi.

import type { Metadata } from 'next';
import Link from 'next/link';
import KepalaHalaman from '@/components/KepalaHalaman';
import AngkaGulir from '@/components/ui/AngkaGulir';
import { kelasTautan } from '@/components/ui/Tombol';
import { desimal } from '@/lib/format';
import { ARTI_HURUF, DATA_BUATAN } from '@/lib/kamus';
import { DEFINISI_RAPOR, hurufDanArti, INFO_KOMPONEN, KOMPONEN, seratus, type Komponen } from '@/lib/konten-rapor';
import { hurufDari, kepuasan, nilaiRapor, SAMPEL_MIN } from '@/lib/scoring/rapor';
import type { Huruf } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Cara rapor dihitung',
  description:
    'Cara SUARAKYAT menghitung rapor dinas: contoh hitungan, empat hal yang dinilai, bobotnya, dan batas wajar penolakan.',
};

// Contoh PRD 8: Dinas Kebersihan, 100 laporan, 10 ditolak karena dianggap tidak benar.
const K_CONTOH = kepuasan(228, 60);
const BINTANG_CONTOH = desimal(K_CONTOH * 5, 2);
const CONTOH: { k: Komponen; kejadian: string; hitung: string; nilai: number }[] = [
  {
    k: 'R',
    kejadian:
      '80 laporan ditanggapi sebelum batas waktunya, termasuk yang ditolak. 10 telat ditanggapi dan 5 didiamkan sampai lewat batas. 5 laporan baru belum dihitung.',
    hitung: '80 ÷ 95',
    nilai: 80 / 95,
  },
  {
    k: 'S',
    kejadian:
      'Dari 90 laporan yang tidak ditolak, 50 selesai tepat waktu. 15 selesai telat dan 15 belum selesai padahal lewat batas. 10 masih dalam batas, belum dihitung.',
    hitung: '50 ÷ 80',
    nilai: 50 / 80,
  },
  {
    k: 'P',
    kejadian: 'Dari 90 laporan yang tidak ditolak, 65 sudah selesai, cepat atau lambat.',
    hitung: '65 ÷ 90',
    nilai: 65 / 90,
  },
  {
    k: 'K',
    kejadian: `60 pelapor memberi rata-rata 3,8 bintang. Ditambah 5 rating bintang 3, rata-ratanya menjadi ${BINTANG_CONTOH} bintang.`,
    hitung: `${BINTANG_CONTOH} ÷ 5`,
    nilai: K_CONTOH,
  },
];
const dua = (x: number) => Math.round(x * 100) / 100;
const NILAI_CONTOH = nilaiRapor(dua(CONTOH[0].nilai), dua(CONTOH[1].nilai), dua(CONTOH[2].nilai), dua(CONTOH[3].nilai));
const HURUF_CONTOH = hurufDari(NILAI_CONTOH);

const HURUF: { h: Huruf; rentang: string }[] = [
  { h: 'A', rentang: '85 ke atas' },
  { h: 'B', rentang: '70 sampai 84' },
  { h: 'C', rentang: '55 sampai 69' },
  { h: 'D', rentang: '40 sampai 54' },
  { h: 'E', rentang: 'di bawah 40' },
];

// Dua dinas yang sama-sama menerima 100 laporan: tanpa batas penolakan, dinas yang menolak laporan susah tampak lebih baik.
const BANDING: { nama: string; cara: string; ditolak: number; hanyaAngka: Huruf; akhir: Huruf; catatan: string; merah: boolean }[] = [
  {
    nama: 'Dinas A',
    cara: 'menangani laporan yang susah',
    ditolak: 5,
    hanyaAngka: 'B',
    akhir: 'B',
    catatan: 'Menolak 5%, masih di bawah batas wajar 25%.',
    merah: false,
  },
  {
    nama: 'Dinas B',
    cara: 'menolak laporan yang susah',
    ditolak: 35,
    hanyaAngka: 'A',
    akhir: 'C',
    catatan: 'Turun dari A, karena menolak 35%, melebihi batas wajar 25%.',
    merah: true,
  },
];

export default function CaraMenilaiPage() {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <KepalaHalaman judul="Cara rapor dihitung" jejak={[{ href: '/rapor', label: 'Rapor dinas' }]}>
        Tiap dinas mendapat nilai 0 sampai 100 dan huruf A sampai E. Laporan yang didiamkan ikut dihitung, jadi dinas
        yang mengabaikan laporan tidak terlihat bagus. Semua dinas dinilai dengan aturan yang sama.
      </KepalaHalaman>

      {/* 1. Cerita contoh dulu, baru rumus. */}
      <section aria-labelledby="judul-contoh" className="mt-8">
        <h2 id="judul-contoh" className="judul-seksi">
          Contoh: Dinas Kebersihan
        </h2>
        <p className="mt-2 max-w-[70ch] text-badan text-lembut">
          Dinas Kebersihan menerima 100 laporan. 10 di antaranya ditolak karena dianggap tidak benar. Begini rapornya
          dihitung.
        </p>
        <ol className="kartu mt-5 overflow-hidden" data-muncul>
          {CONTOH.map((c) => (
            <li
              key={c.k}
              className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-4 gap-y-2 border-b border-garis p-5 last:border-b-0 sm:grid-cols-[3rem_minmax(0,1fr)_6rem_8rem] sm:items-center sm:gap-x-6"
            >
              <span className="flex size-11 items-center justify-center rounded-kontrol bg-biru-muda text-lead font-bold text-biru-tua">
                {c.k}
              </span>
              <div>
                <p className="text-badan font-bold">{INFO_KOMPONEN[c.k].nama}</p>
                <p className="mt-0.5 text-kecil text-lembut sm:text-badan">{c.kejadian}</p>
              </div>
              <div className="col-start-2 flex flex-wrap items-baseline justify-between gap-x-4 sm:contents">
                <span className="angka text-kecil text-lembut sm:text-right sm:text-badan">{c.hitung}</span>
                <span className="angka sm:text-right">
                  <span className="text-sub font-bold text-biru-tua">{seratus(c.nilai)}</span>
                  <span className="text-kecil text-lembut"> dari 100</span>
                </span>
              </div>
            </li>
          ))}
        </ol>
        <div className="di-gelap mt-3 flex flex-wrap items-end justify-between gap-4 rounded-kartu bg-biru p-5 text-white sm:p-6">
          <div>
            <p className="text-kecil font-semibold sm:text-badan">Nilai akhir, dengan bobot tiap hal:</p>
            <p className="angka mt-1 text-kecil sm:text-badan">
              0,3 × {seratus(dua(CONTOH[0].nilai))} + 0,3 × {seratus(dua(CONTOH[1].nilai))} + 0,2 ×{' '}
              {seratus(dua(CONTOH[2].nilai))} + 0,2 × {seratus(dua(CONTOH[3].nilai))}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="angka text-judul font-bold">
              <AngkaGulir nilai={desimal(NILAI_CONTOH)} />
              <span className="text-badan font-semibold"> dari 100</span>
            </p>
            <p className="text-badan font-bold">Huruf {hurufDanArti(HURUF_CONTOH)}</p>
          </div>
        </div>
      </section>

      {/* 2. Rumus lengkap. */}
      <section aria-labelledby="judul-rumus" className="mt-12">
        <h2 id="judul-rumus" className="judul-seksi">
          Rumusnya
        </h2>
        <p className="mt-2 max-w-[70ch] text-badan text-lembut">
          Empat hal masing-masing bernilai 0 sampai 100, lalu dijumlah dengan bobot. Menanggapi dan menyelesaikan tepat
          waktu paling berat bobotnya.
        </p>
        <div className="kartu mt-5 overflow-hidden">
          <p className="angka bg-biru-muda px-5 py-5 text-[clamp(1.375rem,1rem+2vw,2.5rem)] leading-tight font-bold tracking-[-0.02em] text-biru-tua sm:px-8">
            Nilai = 0,3 R + 0,3 S + 0,2 P + 0,2 K
          </p>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-6 p-5 sm:p-8 md:grid-cols-2" data-muncul>
            {KOMPONEN.map((k) => (
              <div key={k} className="grid grid-cols-[3rem_1fr] gap-x-4">
                <dt className="flex size-12 items-center justify-center rounded-kontrol bg-biru text-sub font-bold text-white">
                  {k}
                </dt>
                <dd>
                  <p className="text-badan font-bold">
                    {INFO_KOMPONEN[k].nama} · bobot {Math.round(INFO_KOMPONEN[k].bobot * 100)}%
                  </p>
                  <p className="mt-1 text-kecil text-lembut">{INFO_KOMPONEN[k].arti}</p>
                  <p className="mt-1.5 text-kecil">
                    <span className="font-semibold">Hitungannya:</span> {INFO_KOMPONEN[k].rumus}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 3. Dari nilai ke huruf, tiap huruf dengan artinya. */}
      <section
        aria-labelledby="judul-huruf"
        className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-center"
      >
        <div>
          <h2 id="judul-huruf" className="judul-seksi">
            Dari nilai ke huruf
          </h2>
          <p className="mt-2 text-badan text-lembut">
            Kalau laporan yang bisa dinilai kurang dari {SAMPEL_MIN}, dinas ditulis &ldquo;Belum dinilai&rdquo; tanpa
            huruf.
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-5" data-muncul>
          {HURUF.map((h) => (
            <li key={h.h} className="kartu flex items-center gap-4 px-4 py-3 sm:block sm:p-4 sm:text-center">
              <p className="w-10 shrink-0 text-center text-[clamp(2.25rem,1.5rem+3vw,4rem)] leading-none font-bold text-biru-tua sm:w-auto">
                {h.h}
              </p>
              <div className="sm:mt-2">
                <p className="text-badan font-bold">{ARTI_HURUF[h.h]}</p>
                <p className="text-kecil text-lembut">{h.rentang}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. Batas penolakan, dengan dua dinas sebagai contoh (kartu bertumpuk di HP). */}
      <section
        aria-labelledby="judul-penolakan"
        className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
      >
        <div>
          <h2 id="judul-penolakan" className="judul-seksi">
            Boleh menolak, asal wajar
          </h2>
          <p className="mt-2 text-badan text-lembut">{DEFINISI_RAPOR.penolakan}</p>
          <p className="mt-3 text-badan text-lembut">{DEFINISI_RAPOR.penolakanRinci}</p>
          <p className="mt-3 text-badan text-lembut">
            Nilai tengah adalah angka di urutan tengah, bukan rata-rata. Jadi satu dinas yang menolak sangat banyak tidak
            ikut menaikkan batas dinas lain. Semua laporan yang ditolak beserta alasannya bisa kamu baca di{' '}
            <Link href="/peta?status=ditolak" className={kelasTautan}>
              peta laporan
            </Link>
            .
          </p>
        </div>
        <div className="self-start">
          <p className="text-kecil font-semibold">Dua dinas sama-sama menerima 100 laporan:</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {BANDING.map((d) => (
              <article key={d.nama} className={`kartu p-4 sm:p-5 ${d.merah ? 'border-merah' : ''}`}>
                <h3 className="text-badan font-bold">
                  {d.nama} <span className="font-normal text-lembut">· {d.cara}</span>
                </h3>
                <dl className="mt-3 grid gap-2 text-kecil">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-lembut">Ditolak karena dianggap tidak benar</dt>
                    <dd className="angka shrink-0 font-semibold">{d.ditolak} dari 100</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-lembut">Kalau hanya dilihat dari angka</dt>
                    <dd className="shrink-0 font-semibold">{hurufDanArti(d.hanyaAngka)}</dd>
                  </div>
                  <div
                    className={`flex items-baseline justify-between gap-3 rounded-kontrol px-2 py-1.5 ${d.merah ? 'bg-merah-muda' : 'bg-biru-pudar'}`}
                  >
                    <dt className="font-semibold">Di SUARAKYAT</dt>
                    <dd className={`shrink-0 font-bold ${d.merah ? 'text-merah-tua' : ''}`}>{hurufDanArti(d.akhir)}</dd>
                  </div>
                </dl>
                <p className={`mt-2 text-kecil ${d.merah ? 'font-semibold text-merah-tua' : 'text-lembut'}`}>{d.catatan}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Angka yang tampil di rapor tapi tidak ikut dinilai. */}
      <section aria-labelledby="judul-lain" className="mt-12">
        <h2 id="judul-lain" className="judul-seksi">
          Yang tampil tapi tidak dinilai
        </h2>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2" data-muncul>
          <div className="kartu p-5">
            <dt className="text-badan font-bold">Biasanya ditanggapi dalam</dt>
            <dd className="mt-1 text-kecil text-lembut">{DEFINISI_RAPOR.median}</dd>
          </div>
          <div className="kartu p-5">
            <dt className="text-badan font-bold">Laporan yang dinilai</dt>
            <dd className="mt-1 text-kecil text-lembut">
              {DEFINISI_RAPOR.sampel} Rapor memakai laporan dari seluruh periode data.
            </dd>
          </div>
          <div className="kartu p-5">
            <dt className="text-badan font-bold">Laporan yang tidak dihitung</dt>
            <dd className="mt-1 text-kecil text-lembut">
              Laporan yang dibatalkan pelapor, laporan dobel, dan laporan yang dipindah ke dinas lain tidak dihitung untuk
              dinas ini. Laporan yang belum selesai tapi masih dalam batas waktu ditunggu sampai hasilnya jelas.
            </dd>
          </div>
          <div className="kartu p-5">
            <dt className="text-badan font-bold">Batas rapor ini</dt>
            <dd className="mt-1 text-kecil text-lembut">
              Batas waktu tiap kategori ditentukan tim, dan beban kerja tiap dinas berbeda. Jadi rapor ini tidak mengukur
              mutu dinas secara menyeluruh. {DATA_BUATAN}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
