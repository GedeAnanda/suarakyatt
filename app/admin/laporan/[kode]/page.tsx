// app/admin/laporan/[kode]/page.tsx — Detail dan Ubah Status (SDD 9), pemilik: A.
// Hanya untuk pengguna login (proxy.ts).
// Operasi SDD 6: Q2 v_laporan_publik + v_timeline_publik, S1 unggah foto bukti, R6 update_report_status.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import FormUbahStatus from '@/components/admin/FormUbahStatus';
import BadgeStatus from '@/components/BadgeStatus';
import IndikatorSLA from '@/components/IndikatorSLA';
import Galeri from '@/components/laporan/Galeri';
import Timeline from '@/components/laporan/Timeline';
import TombolKembali from '@/components/TombolKembali';
import Ikon from '@/components/ui/Ikon';
import LabelSumber from '@/components/ui/LabelSumber';
import { kelasTautan } from '@/components/ui/Tombol';
import { ambilLaporanAdminDetail } from '@/lib/data/admin';
import { tanggalJam } from '@/lib/format';

export const metadata: Metadata = { title: 'Ubah status laporan' };

async function Isi({ params }: { params: PageProps<'/admin/laporan/[kode]'>['params'] }) {
  const { kode: mentah } = await params;
  const kode = decodeURIComponent(mentah).toUpperCase();
  const data = await ambilLaporanAdminDetail(kode);
  if (!data) notFound();
  const { laporan: l, timeline, sekarang, sumber, milikInstansi } = data;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
      <div className="grid content-start gap-5">
        <div className="kartu p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <BadgeStatus status={l.status} besar />
            {(l.is_simulated || sumber === 'contoh') && <LabelSumber sumber={sumber} />}
          </div>
          <h1 className="font-kode angka mt-4 text-judul font-bold">{l.kode}</h1>
          <p className="mt-2 text-sub font-bold">
            {l.kategori} di {l.kecamatan}, {l.kota}
          </p>
          <p className="mt-1 text-kecil text-lembut">
            Masuk {tanggalJam(l.created_at)} · pelapor {l.inisial_pelapor || 'warga'} · {l.jumlah_upvote} dukungan
          </p>
          <div className="mt-4 rounded-kontrol bg-latar px-4 py-3">
            <IndikatorSLA laporan={l} sekarang={sekarang} />
          </div>
        </div>
        <section aria-labelledby="judul-isi" className="kartu p-5 sm:p-6">
          <h2 id="judul-isi" className="text-lead font-bold">
            Isi laporan
          </h2>
          <div className="mt-4">
            <Galeri laporan={l} />
          </div>
          <p className="mt-5 max-w-[65ch] text-lead">
            {l.deskripsi === null ? 'Isi disembunyikan (konten melanggar).' : `“${l.deskripsi}”`}
          </p>
        </section>
        <section aria-labelledby="judul-riwayat" className="kartu p-5 sm:p-6">
          <h2 id="judul-riwayat" className="text-lead font-bold">
            Riwayat
          </h2>
          <div className="mt-5">
            <Timeline item={timeline} berjalan={['menunggu', 'diverifikasi', 'diproses'].includes(l.status)} />
          </div>
        </section>
      </div>

      <aside className="grid content-start gap-4 lg:sticky lg:top-20">
        <h2 className="flex items-center gap-2 text-sub font-bold">
          <Ikon nama="koper" className="size-5 text-biru" />
          Tindak lanjut
        </h2>
        {!milikInstansi && (
          <p className="flex gap-2 rounded-kartu bg-oranye-muda p-4 text-kecil text-st-menunggu">
            <Ikon nama="info" className="mt-0.5 size-4 shrink-0" />
            {sumber === 'contoh'
              ? 'Ini laporan dari data contoh, jadi statusnya tidak bisa diubah. Formulir di bawah menunjukkan langkahnya.'
              : 'Laporan ini bukan milik instansi Anda, jadi statusnya tidak bisa diubah dari akun ini.'}
          </p>
        )}
        <FormUbahStatus kode={l.kode} status={l.status} aktif={milikInstansi} />
        <p className="text-kecil">
          <Link href={`/laporan/${l.kode}`} className={kelasTautan}>
            Lihat halaman publik laporan ini
          </Link>
        </p>
      </aside>
    </div>
  );
}

export default function AdminDetailLaporanPage({ params }: PageProps<'/admin/laporan/[kode]'>) {
  return (
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      <TombolKembali cadangan="/admin/laporan" />
      <nav aria-label="Jejak halaman">
        <ol className="flex flex-wrap items-center gap-1 text-kecil text-lembut">
          <li className="flex items-center gap-1">
            <Link href="/" className="hover:text-biru-tua hover:underline">
              Beranda
            </Link>
            <Ikon nama="kanan" className="size-3.5" />
          </li>
          <li className="flex items-center gap-1">
            <Link href="/admin/laporan" className="hover:text-biru-tua hover:underline">
              Laporan instansi
            </Link>
            <Ikon nama="kanan" className="size-3.5" />
          </li>
          <li aria-current="page" className="font-medium text-teks">
            Ubah status
          </li>
        </ol>
      </nav>
      </div>
      <Suspense fallback={<div aria-hidden="true" className="kerangka h-[36rem]" />}>
        <Isi params={params} />
      </Suspense>
    </div>
  );
}
