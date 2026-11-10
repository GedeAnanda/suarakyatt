// app/prioritas/page.tsx — Urutan prioritas (SDD 9), pemilik: A
// Operasi SDD 6: R9 priority_factors, Q5 priority_weights, Q6 v_riwayat_bobot, R10 save_weights (petugas perencana kota),
// L1 lib/scoring (di browser, lewat Simulator). Peta memakai lib/geo (dari public/data/kecamatan.geojson).
// Bahasa warga (audit 10 Nov): "masalah", "urutan ke-N", "aturan resmi", "percobaan". Penjelasan cara hitung
// (#cara-hitung, ditautkan dari halaman lain) sengaja di luar Suspense supaya tautan jangkarnya selalu ketemu.

import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import BannerSimulasi from '@/components/BannerSimulasi';
import KepalaHalaman from '@/components/KepalaHalaman';
import RiwayatBobot from '@/components/prioritas/RiwayatBobot';
import JawabanCepat from '@/components/prioritas/JawabanCepat';
import Simulator from '@/components/prioritas/Simulator';
import Ikon from '@/components/ui/Ikon';
import { kelasTautan, kelasTombol } from '@/components/ui/Tombol';
import { ambilDataPrioritas } from '@/lib/data/prioritas';
import { ambilSesi } from '@/lib/data/sesi';
import { tanggal } from '@/lib/format';
import { DEFINISI_FAKTOR, NAMA_FAKTOR } from '@/lib/konten';
import { KECAMATAN } from '@/lib/geo/kecamatan-svg';
import { FAKTOR, hitungSkor } from '@/lib/scoring';
import { WARNA_FAKTOR } from '@/components/prioritas/BarKontribusi';

export const metadata: Metadata = {
  title: 'Urutan prioritas',
  description:
    'Urutan masalah di Jakarta yang paling perlu didahulukan, alasan di balik setiap skor, dan tempat mencoba aturanmu sendiri.',
};

async function Isi() {
  const [data, sesi] = await Promise.all([ambilDataPrioritas(), ambilSesi()]);
  const resmi = hitungSkor(data.faktor.isu, data.bobotResmi);
  return (
    <>
      <BannerSimulasi
        sumber={data.sumber}
        keterangan={`Aturan resmi berlaku${data.bobotDiperbarui ? ` sejak ${tanggal(data.bobotDiperbarui)}` : ''} · angka warga kurang mampu memakai data per kota`}
      />

      {/* Ringkasan sekali lihat: 3 masalah teratas + cari kecamatan, sebelum alat dan daftar lengkap. */}
      {resmi.length > 0 && (
        <div className="mt-6">
          <JawabanCepat teratas={resmi.slice(0, 3)} total={resmi.length} kecamatan={KECAMATAN} />
        </div>
      )}

      <div className="mt-6">
        <Simulator isu={data.faktor.isu} bobotResmi={data.bobotResmi} perencana={Boolean(sesi?.perencana)} />
      </div>
    </>
  );
}

/** Daftar riwayat dimuat terpisah; ambilDataPrioritas memakai cache(), jadi datanya tetap diambil sekali. */
async function Riwayat() {
  const data = await ambilDataPrioritas();
  return <RiwayatBobot riwayat={data.riwayat} />;
}

function Kerangka() {
  // Urutan sama dengan Simulator: di HP hasil dulu, panel "Coba atur sendiri" sesudahnya; di layar lebar panel di kiri.
  return (
    <div aria-hidden="true" className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)] xl:grid-cols-[21rem_minmax(0,1fr)]">
      <div className="grid content-start gap-5 lg:col-start-2 lg:row-start-1">
        <div className="kerangka h-10 w-2/3" />
        <div className="kerangka h-80" />
        <div className="kerangka h-96" />
      </div>
      <div className="kerangka h-[36rem] lg:col-start-1 lg:row-start-1" />
    </div>
  );
}

export default function PrioritasPage() {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <KepalaHalaman
        judul="Urutan prioritas"
        aksi={
          <Link href="/sumber-data" className={kelasTombol('garis', 'text-kecil')}>
            <Ikon nama="data" className="size-4" />
            Sumber data
          </Link>
        }
      >
        Setiap masalah di satu kecamatan, misalnya jalan rusak di Setiabudi, diberi skor 0–100. Makin tinggi skornya, makin
        perlu didahulukan. Ketuk satu masalah untuk melihat alasannya.
      </KepalaHalaman>

      <div className="mt-6">
        {/* Pembungkus `masuk`: isi yang datang lewat streaming memudar masuk menggantikan kerangka, tidak muncul tiba-tiba. */}
        <Suspense fallback={<Kerangka />}>
          <div className="masuk">
            <Isi />
          </div>
        </Suspense>
      </div>

      <section id="cara-hitung" aria-labelledby="judul-cara-hitung" className="mt-12 scroll-mt-24">
        <h2 id="judul-cara-hitung" className="judul-seksi">
          Bagaimana urutan ini dihitung?
        </h2>
        <div className="mt-2 grid max-w-[72ch] gap-2 text-badan text-lembut">
          <p>
            Tiap hal memberi poin. Poin terbanyak untuk tiap hal = tingkat kepentingannya (misalnya mendesaknya masalah
            paling banyak 30 poin). Semua poin dijumlah menjadi skor.
          </p>
          <p>
            Tiap hal dibandingkan dengan masalah lain di Jakarta: yang tertinggi dapat poin penuh, yang terendah dapat 0.
            Jadi skor adalah perbandingan, bukan nilai baik-buruk.
          </p>
        </div>

        <h3 className="mt-6 text-lead font-bold">6 hal yang dinilai</h3>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-muncul>
          {FAKTOR.map((f) => (
            <div key={f} className="kartu p-5">
              <dt className="flex items-center gap-2 text-lead font-bold">
                <span aria-hidden="true" className="size-3 shrink-0 rounded-full" style={{ background: WARNA_FAKTOR[f] }} />
                {NAMA_FAKTOR[f]}
              </dt>
              <dd className="mt-1.5 text-kecil text-lembut">{DEFINISI_FAKTOR[f]}</dd>
            </div>
          ))}
        </dl>

        <details className="group mt-5 max-w-[80ch]">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-badan font-semibold text-biru-tua marker:hidden [&::-webkit-details-marker]:hidden">
            Rumus lengkap
            <Ikon nama="turun" className="size-4 transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <div className="mt-2 grid gap-2 text-kecil text-lembut">
            <p className="angka font-semibold text-teks">Skor = 100 × jumlah dari (tingkat kepentingan × nilai tiap hal).</p>
            <p>
              Nilai tiap hal selalu antara 0 dan 1. Tingkat kepentingan keenam hal berjumlah 100%, jadi poin semua hal
              selalu sama dengan skornya.
            </p>
            <p>
              Banyaknya laporan, dukungan warga, warga kurang mampu, dan kepadatan penduduk dibandingkan antarmasalah:
              nilai = (angka masalah ini − angka terendah) ÷ (angka tertinggi − angka terendah).
            </p>
            <p>
              Dua hal tidak dibandingkan. Mendesaknya masalah bernilai 1 untuk jalan rusak dan saluran tersumbat, 0,6 untuk
              sampah dan lampu mati. Lama menunggu = lama menunggu ÷ (2 × batas waktu selesai), paling tinggi 1.
            </p>
            <p>Hanya masalah yang masih punya laporan belum selesai yang diberi urutan.</p>
            <p>
              Asal setiap angka ada di{' '}
              <Link href="/sumber-data" className={kelasTautan}>
                halaman sumber data
              </Link>
              .
            </p>
          </div>
        </details>
      </section>

      <section
        aria-labelledby="judul-riwayat"
        className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[21rem_minmax(0,1fr)]"
      >
        <div>
          <h2 id="judul-riwayat" className="judul-seksi scroll-mt-24">
            Riwayat perubahan aturan
          </h2>
          <p className="mt-2 text-badan text-lembut">
            Setiap perubahan aturan resmi oleh petugas perencana kota tercatat di sini: siapa, kapan, apa yang berubah, dan
            alasannya. Tidak ada aturan yang cocok untuk semua orang, jadi aturannya dibuat terbuka.
          </p>
        </div>
        <Suspense fallback={<div aria-hidden="true" className="kerangka h-32" />}>
          <div className="masuk">
            <Riwayat />
          </div>
        </Suspense>
      </section>
    </div>
  );
}
