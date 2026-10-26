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
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
      <div className="grid content-start gap-10 lg:col-span-7">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <BadgeStatus status={l.status} besar />
            {(l.is_simulated || sumber === 'contoh') && <LabelSumber sumber={sumber} />}
          </div>
          <h1 className="angka mt-4 text-judul font-semibold tracking-[-0.04em]">{l.kode}</h1>
          <p className="mt-2 text-lead">
            {l.kategori} di {l.kecamatan}, {l.kota}
          </p>
          <p className="mt-1 text-kecil text-lembut">
            Masuk {tanggalJam(l.created_at)} · pelapor {l.inisial_pelapor || 'warga'} · {l.jumlah_upvote} dukungan
          </p>
          <div className="mt-4">
            <IndikatorSLA laporan={l} sekarang={sekarang} />
          </div>
        </div>
        <Galeri laporan={l} />
        <p className="max-w-[65ch] text-pernyataan tracking-[-0.02em]">
          {l.deskripsi === null ? 'Isi disembunyikan (konten melanggar).' : `“${l.deskripsi}”`}
        </p>
        <section aria-labelledby="judul-riwayat">
          <h2 id="judul-riwayat" className="text-lead font-medium tracking-tight">
            Riwayat
          </h2>
          <div className="mt-5">
            <Timeline item={timeline} />
          </div>
        </section>
      </div>

      <aside className="grid content-start gap-4 lg:col-span-5">
        <h2 className="text-lead font-medium tracking-tight">Tindak lanjut</h2>
        {!milikInstansi && (
          <p className="bg-lapis p-4 text-kecil">
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
    <div className="bingkai pt-10 pb-24 sm:pt-14">
      <p className="mb-8 text-kecil">
        <Link href="/admin/laporan" className={kelasTautan}>
          Laporan instansi
        </Link>
        <span className="text-lembut"> / ubah status</span>
      </p>
      <Suspense fallback={<div aria-hidden="true" className="kerangka h-[36rem]" />}>
        <Isi params={params} />
      </Suspense>
    </div>
  );
}
