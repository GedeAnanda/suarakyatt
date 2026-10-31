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
import { normalisasiKode, tanggal } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Lacak laporan',
  description: 'Lacak laporan dengan kode SR: status, riwayat penanganan, batas waktu, dan posisi isunya di daftar prioritas.',
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
            &ldquo;{kutipan}&rdquo; bukan kode laporan. Kode berbentuk SR- diikuti 6 huruf atau angka, tanpa huruf O dan I serta
            angka 0 dan 1.
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
        Laporan Anda
      </h2>
      {daftar.length === 0 ? (
        <p className="kartu mt-4 p-5 text-badan">
          Anda belum pernah melapor dari akun ini.{' '}
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

// Yang tampil di halaman detail setelah kode dimasukkan.
const ISI_LACAK: { judul: string; isi: string; ikon: NamaIkon }[] = [
  { judul: 'Status sekarang', isi: 'Menunggu, diverifikasi, diproses, selesai, atau ditolak beserta alasannya.', ikon: 'info' },
  { judul: 'Riwayat dan batas waktu', isi: 'Setiap perubahan status tercatat dengan waktu dan instansinya.', ikon: 'jam' },
  { judul: 'Posisi di daftar prioritas', isi: 'Peringkat isunya dan faktor yang mendorong atau menahannya.', ikon: 'geser' },
  { judul: 'Dukungan warga', isi: 'Warga lain di sekitar lokasi bisa ikut mendukung laporan yang sama.', ikon: 'dukung' },
];

export default function LacakPage({ searchParams }: PageProps<'/lacak'>) {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <KepalaHalaman judul="Lacak laporan">
        Masukkan kode yang Anda terima saat laporan terkirim. Halaman lacak terbuka untuk siapa saja: status, riwayat
        penanganan, batas waktu, dan posisi isunya di daftar prioritas.
      </KepalaHalaman>

      <div className="kartu mt-6 max-w-3xl p-5 shadow-kartu sm:p-7">
        <Suspense fallback={<CariKode id="kode-lacak" />}>
          <Isi searchParams={searchParams} />
        </Suspense>
        <p className="mt-4 text-kecil text-lembut">
          Belum punya kode?{' '}
          <Link href="/contoh" className="font-bold text-biru-tua hover:underline">
            Buka laporan contoh
          </Link>{' '}
          untuk mencoba alurnya.
        </p>
      </div>

      <Suspense fallback={null}>
        <LaporanAnda />
      </Suspense>

      <section aria-labelledby="judul-isi-lacak" className="mt-10">
        <h2 id="judul-isi-lacak" className="judul-seksi">
          Yang Anda lihat setelah melacak
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
    </div>
  );
}
