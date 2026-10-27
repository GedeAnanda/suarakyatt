// app/admin/laporan/page.tsx — Laporan Instansi (SDD 9), pemilik: A. Hanya untuk pengguna login (proxy.ts).
// Operasi SDD 6: Q3 v_laporan_admin (RLS otomatis membatasi ke instansi admin).

import type { Metadata } from 'next';
import { Suspense } from 'react';
import TabelLaporanAdmin from '@/components/admin/TabelLaporanAdmin';
import AngkaGulir from '@/components/ui/AngkaGulir';
import LabelSumber from '@/components/ui/LabelSumber';
import { ambilLaporanAdmin } from '@/lib/data/admin';
import { ambilSesi } from '@/lib/data/sesi';
import { KATEGORI } from '@/lib/konten';

export const metadata: Metadata = { title: 'Laporan instansi' };

async function Isi() {
  const [{ sumber, laporan, sekarang }, sesi] = await Promise.all([ambilLaporanAdmin(), ambilSesi()]);
  const instansi = KATEGORI.find((k) => k.id === sesi?.instansiId)?.instansi ?? (sumber === 'contoh' ? KATEGORI[0].instansi : null);
  const aktif = laporan.filter((l) => ['menunggu', 'diverifikasi', 'diproses'].includes(l.status));
  const angka = [
    { nilai: aktif.length, label: 'laporan perlu ditangani' },
    { nilai: aktif.filter((l) => l.terlambat).length, label: 'sudah melewati batas waktu' },
    { nilai: laporan.filter((l) => l.status === 'menunggu').length, label: 'menunggu respons pertama' },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {instansi && <p className="text-lead font-medium tracking-tight">{instansi}</p>}
        <LabelSumber sumber={sumber} />
        {sesi?.demo && <span className="rounded-full bg-lapis px-2.5 py-0.5 text-kecil">Akun demo: hanya bisa mengubah laporan simulasi</span>}
      </div>
      {sumber === 'contoh' && (
        <p className="kartu mt-4 p-4 text-badan">
          Database belum berisi laporan, jadi halaman ini menampilkan laporan contoh Dinas Bina Jalan (simulasi) sebagai
          pratinjau. Ubah status aktif setelah data seed dimuat.
        </p>
      )}
      <dl className="mt-8 grid grid-cols-3 gap-4 sm:max-w-3xl">
        {angka.map((a) => (
          <div key={a.label} className="flex flex-col-reverse">
            <dt className="text-kecil text-lembut">{a.label}</dt>
            <dd className="text-tinta angka text-judul font-medium tracking-[-0.04em]">
              <AngkaGulir nilai={String(a.nilai)} />
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-10">
        {laporan.length === 0 ? (
          <p className="kartu p-5 text-badan">Belum ada laporan untuk instansi Anda.</p>
        ) : (
          <TabelLaporanAdmin laporan={laporan} sekarang={sekarang} />
        )}
      </div>
    </>
  );
}

export default function AdminLaporanPage() {
  return (
    <div className="bingkai pt-12 pb-24 sm:pt-16">
      <div className="grid gap-6 lg:grid-cols-12">
        <h1 data-pembuka="judul" className="text-judul lg:col-span-6">Laporan instansi</h1>
        <p data-pembuka="teks" className="max-w-[60ch] text-badan lg:col-span-6">
          Laporan untuk instansi Anda. Yang melewati batas waktu ada di urutan teratas. Setiap perubahan status tercatat
          publik di halaman lacak, lengkap dengan nama instansi dan catatannya.
        </p>
      </div>
      <div className="mt-10">
        <Suspense fallback={<div aria-hidden="true" className="kerangka h-[30rem]" />}>
          <Isi />
        </Suspense>
      </div>
    </div>
  );
}
