// app/lacak/page.tsx — cari laporan dengan kode (FR-C2), pemilik: A
// Tujuan form cari kode di header dan Beranda. Kode yang sah langsung diarahkan ke halaman detail.
// Seperti halaman "cari pemesanan": satu kotak cari di tengah, lalu apa yang akan terlihat setelahnya.

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import BadgeStatus from '@/components/BadgeStatus';
import CariKode from '@/components/CariKode';
import KepalaHalaman from '@/components/KepalaHalaman';
import Ikon, { type NamaIkon } from '@/components/ui/Ikon';
import { kelasTautan } from '@/components/ui/Tombol';
import { ambilLaporanSaya } from '@/lib/data/laporan';
import { ARTI_STATUS } from '@/lib/kamus';
import { normalisasiKode, tanggal } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Lacak laporan',
  description: 'Lacak laporan dengan kode SR: status, riwayat penanganan, batas waktu, dan urutan masalahnya di daftar prioritas.',
};

async function Isi({ searchParams }: { searchParams: PageProps<'/lacak'>['searchParams'] }) {
  const { kode } = await searchParams;
  const masukan = typeof kode === 'string' ? kode.trim().slice(0, 64) : '';
  const sah = masukan ? normalisasiKode(masukan) : null;
  if (sah) redirect(`/laporan/${sah}`);
  // Masukan panjang tanpa spasi (misalnya tempelan teks) dipendekkan supaya pesan tidak melebarkan layar ponsel.
  const kutipan = masukan.length > 24 ? `${masukan.slice(0, 24)}…` : masukan;

  return (
    <>
      {masukan && (
        <p role="alert" className="goyang mb-4 flex gap-3 rounded-kontrol bg-merah-muda px-4 py-3 text-kecil text-merah-tua sm:text-badan">
          <Ikon nama="peringatan" className="mt-0.5 size-5 shrink-0" />
          <span className="min-w-0 [overflow-wrap:anywhere]">
            &ldquo;{kutipan}&rdquo; tidak dikenali sebagai kode laporan. Contoh kode: SR-ABC234. Lupa kodenya? Masuk, lalu
            lihat daftar &ldquo;Laporanmu&rdquo; di halaman ini.
          </span>
        </p>
      )}
      <CariKode id="kode-lacak" nilaiAwal={masukan} />
    </>
  );
}

/** Daftar laporan milik pengguna yang login, supaya kode yang hilang tetap bisa ditemukan. Tamu tidak melihat apa-apa. */
async function LaporanAnda() {
  const daftar = await ambilLaporanSaya();
  if (daftar === null) return null;
  return (
    <section id="laporan-saya" aria-labelledby="judul-laporan-saya" className="masuk mt-10 max-w-3xl scroll-mt-24">
      <h2 id="judul-laporan-saya" className="judul-seksi">
        Laporanmu
      </h2>
      {daftar.length === 0 ? (
        <p className="kartu mt-4 p-5 text-badan">
          Kamu belum pernah melapor dari akun ini.{' '}
          <Link href="/lapor" className={kelasTautan}>
            Lapor masalah
          </Link>
        </p>
      ) : (
        <ul className="kartu mt-4 divide-y divide-garis">
          {daftar.map((l) => (
            <li key={l.kode} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5">
              {/* Laporan yang dibatalkan tidak punya halaman publik, jadi kodenya tidak ditautkan. */}
              {l.status === 'dibatalkan' ? (
                <span className="font-kode angka font-bold text-lembut">{l.kode}</span>
              ) : (
                <Link href={`/laporan/${l.kode}`} className="font-kode angka font-bold text-biru-tua hover:underline">
                  {l.kode}
                </Link>
              )}
              <BadgeStatus status={l.status} />
              <span className="text-kecil text-lembut">
                {l.kategori}
                {l.kecamatan && ` · Kec. ${l.kecamatan}`} · {tanggal(l.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Skenario contoh (revisi FDS 10 Nov, 1.6): satu ketukan ke tiap keadaan yang biasa ditanyakan warga.
const SKENARIO = [
  { href: '/contoh', label: 'Masih ditangani', titik: 'bg-st-diproses' },
  { href: '/contoh?jenis=terlambat', label: 'Terlambat, ada kendala', titik: 'bg-st-menunggu' },
  { href: '/contoh?jenis=ditolak', label: 'Ditolak', titik: 'bg-st-ditolak-bg' },
  { href: '/contoh?jenis=duplikat', label: 'Ditolak karena duplikat', titik: 'bg-st-ditolak-bg' },
  { href: '/contoh?jenis=selesai', label: 'Selesai', titik: 'bg-st-selesai' },
];

// Yang tampil di halaman detail setelah kode dimasukkan.
const ISI_LACAK: { judul: string; isi: string; ikon: NamaIkon }[] = [
  { judul: 'Status dan alasannya', isi: 'Status sekarang, alasan kalau ditolak, dan kendala dari dinas kalau tertunda.', ikon: 'info' },
  { judul: 'Riwayat dan batas waktu', isi: 'Setiap perubahan tercatat dengan waktu dan dinasnya, plus batas waktu jenis masalahnya.', ikon: 'jam' },
  { judul: 'Urutan prioritasnya', isi: 'Seberapa didahulukan masalah ini dibanding masalah lain di Jakarta, dan alasannya.', ikon: 'geser' },
  { judul: 'Dukungan warga', isi: 'Warga lain yang juga terdampak bisa ikut mendukung laporan yang sama.', ikon: 'dukung' },
];

export default function LacakPage({ searchParams }: PageProps<'/lacak'>) {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <KepalaHalaman judul="Lacak laporan">
        Masukkan kode yang kamu dapat setelah melapor. Siapa pun bisa melacak tanpa akun: status, alasan, riwayat, batas
        waktu, dan urutan masalahnya.
      </KepalaHalaman>

      <div className="kartu mt-6 max-w-3xl p-5 shadow-kartu sm:p-7">
        <Suspense fallback={<CariKode id="kode-lacak" />}>
          <Isi searchParams={searchParams} />
        </Suspense>
        <div className="mt-5 border-t border-garis pt-4">
          <p className="text-kecil text-lembut">Belum punya kode? Coba lacak laporan contoh:</p>
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {SKENARIO.map((k) => (
              <li key={k.href}>
                <Link href={k.href} className="chip text-kecil">
                  <span aria-hidden="true" className={`size-2 rounded-full ${k.titik}`} />
                  {k.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Suspense fallback={null}>
        <LaporanAnda />
      </Suspense>

      <section aria-labelledby="judul-isi-lacak" className="mt-10">
        <h2 id="judul-isi-lacak" className="judul-seksi">
          Yang kamu lihat setelah melacak
        </h2>
        <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" data-muncul>
          {ISI_LACAK.map((b) => (
            <div key={b.judul} className="kartu p-5">
              <dt className="flex items-center gap-3 text-lead font-bold">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-biru-muda text-biru-tua">
                  <Ikon nama={b.ikon} className="size-5" />
                </span>
                {b.judul}
              </dt>
              <dd className="mt-3 text-kecil text-lembut">{b.isi}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Arti tiap status (audit 10 Nov, W34 + lampiran B): warga tidak perlu menebak arti "Sudah diperiksa" dst. */}
      <section aria-labelledby="judul-arti-status" className="mt-10">
        <h2 id="judul-arti-status" className="judul-seksi">
          Arti status laporan
        </h2>
        <dl className="kartu mt-5 divide-y divide-garis">
          {(['menunggu', 'diverifikasi', 'diproses', 'selesai', 'ditolak'] as const).map((s) => (
            <div key={s} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[12rem_1fr] sm:gap-4">
              <dt>
                <BadgeStatus status={s} besar />
              </dt>
              <dd className="text-kecil">{ARTI_STATUS[s]}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
