// app/lacak/page.tsx — cari laporan dengan kode (FR-C2), pemilik: A
// Tujuan form cari kode di header dan Beranda. Kode yang sah langsung diarahkan ke halaman detail.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import CariKode from '@/components/CariKode';
import Ikon from '@/components/ui/Ikon';
import { normalisasiKode } from '@/lib/format';

export const metadata: Metadata = { title: 'Lacak laporan' };

async function Isi({ searchParams }: { searchParams: PageProps<'/lacak'>['searchParams'] }) {
  const { kode } = await searchParams;
  const masukan = typeof kode === 'string' ? kode.trim() : '';
  const sah = masukan ? normalisasiKode(masukan) : null;
  if (sah) redirect(`/laporan/${sah}`);

  return (
    <>
      {masukan && (
        <p role="alert" className="goyang mt-6 flex max-w-xl gap-3 rounded-(--radius-kartu) bg-tinta px-4 py-3 text-badan text-kertas sm:px-5 sm:py-4">
          <Ikon nama="peringatan" className="mt-1 size-5 shrink-0" />
          <span>
          &ldquo;{masukan}&rdquo; bukan kode laporan. Kode berbentuk SR- diikuti 6 huruf atau angka, tanpa huruf O dan I serta
          angka 0 dan 1.
          </span>
        </p>
      )}
      <CariKode id="kode-lacak" besar nilaiAwal={masukan} className="mt-8 max-w-xl" />
    </>
  );
}

// Yang tampil di halaman detail setelah kode dimasukkan; mengisi kolom kanan di layar lebar
// dan turun ke bawah form di ponsel dan tablet.
const ISI_LACAK = [
  { judul: 'Status sekarang', isi: 'Menunggu, diverifikasi, diproses, selesai, atau ditolak beserta alasannya.' },
  { judul: 'Riwayat dan batas waktu', isi: 'Setiap perubahan status tercatat dengan waktu dan instansinya.' },
  { judul: 'Posisi di daftar prioritas', isi: 'Peringkat isunya dan faktor yang mendorong atau menahannya.' },
  { judul: 'Dukungan warga', isi: 'Warga lain di sekitar lokasi bisa ikut mendukung laporan yang sama.' },
] as const;

export default function LacakPage({ searchParams }: PageProps<'/lacak'>) {
  return (
    <div className="bingkai grid grid-cols-1 gap-12 py-16 sm:py-24 lg:grid-cols-12 lg:items-center lg:gap-8">
      <div className="lg:col-span-6">
        <h1 data-pembuka="judul" className="text-judul">Lacak laporan</h1>
        <p data-pembuka="teks" className="mt-4 max-w-[52ch] text-badan">
          Masukkan kode yang Anda terima saat laporan terkirim. Halaman lacak terbuka untuk siapa saja: status, riwayat
          penanganan, batas waktu, dan posisi isunya di daftar prioritas.
        </p>
        <Suspense fallback={<CariKode id="kode-lacak" besar className="mt-8 max-w-xl" />}>
          <Isi searchParams={searchParams} />
        </Suspense>
        <p className="mt-6 text-badan text-lembut">Belum punya kode? <Link href="/contoh" className="font-medium text-tinta underline underline-offset-4">Buka laporan contoh</Link> untuk mencoba alurnya.</p>
      </div>

      <aside aria-labelledby="judul-isi-lacak" className="lg:col-span-5 lg:col-start-8">
        <h2 id="judul-isi-lacak" className="text-lead font-medium tracking-tight">Yang Anda lihat setelah melacak</h2>
        <dl className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1" data-muncul>
          {ISI_LACAK.map((b) => (
            <div key={b.judul}>
              <dt className="text-lead leading-tight font-semibold tracking-tight text-tinta">{b.judul}</dt>
              <dd className="mt-1 text-badan">{b.isi}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  );
}
