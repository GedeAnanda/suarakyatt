// app/admin/laporan/page.tsx — Laporan Instansi (SDD 9), pemilik: A. Hanya untuk pengguna login (proxy.ts).
// Operasi SDD 6: Q3 v_laporan_admin (RLS otomatis membatasi ke instansi admin).

import type { Metadata } from 'next';
import { Suspense } from 'react';
import TabelLaporanAdmin from '@/components/admin/TabelLaporanAdmin';
import KepalaHalaman from '@/components/KepalaHalaman';
import AngkaGulir from '@/components/ui/AngkaGulir';
import Ikon, { type NamaIkon } from '@/components/ui/Ikon';
import LabelSumber from '@/components/ui/LabelSumber';
import { ambilLaporanAdmin } from '@/lib/data/admin';
import { ambilSesi } from '@/lib/data/sesi';
import { KATEGORI } from '@/lib/konten';

export const metadata: Metadata = { title: 'Laporan instansi' };

async function Isi() {
  const [{ sumber, laporan, sekarang }, sesi] = await Promise.all([ambilLaporanAdmin(), ambilSesi()]);
  const instansi = KATEGORI.find((k) => k.id === sesi?.instansiId)?.instansi ?? (sumber === 'contoh' ? KATEGORI[0].instansi : null);
  const aktif = laporan.filter((l) => ['menunggu', 'diverifikasi', 'diproses'].includes(l.status));
  const angka: { nilai: number; label: string; ikon: NamaIkon; gaya: string }[] = [
    { nilai: aktif.length, label: 'laporan perlu ditangani', ikon: 'koper', gaya: 'bg-biru-muda text-biru-tua' },
    { nilai: aktif.filter((l) => l.terlambat).length, label: 'sudah melewati batas waktu', ikon: 'peringatan', gaya: 'bg-merah-muda text-merah-tua' },
    { nilai: laporan.filter((l) => l.status === 'menunggu').length, label: 'menunggu respons pertama', ikon: 'jam', gaya: 'bg-oranye-muda text-st-menunggu' },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {instansi && (
          <p className="flex items-center gap-2 text-lead font-bold">
            <Ikon nama="gedung" className="size-5 text-biru" />
            {instansi}
          </p>
        )}
        <LabelSumber sumber={sumber} />
        {sesi?.demo && (
          <span className="rounded-[0.375rem] bg-lapis px-2 py-0.5 text-mini font-semibold text-lembut">
            Akun demo: hanya bisa mengubah laporan simulasi
          </span>
        )}
      </div>
      {sumber === 'contoh' && (
        <p className="mt-4 flex gap-2 rounded-kartu bg-oranye-muda p-4 text-kecil text-st-menunggu">
          <Ikon nama="info" className="mt-0.5 size-4 shrink-0" />
          Database belum berisi laporan, jadi halaman ini menampilkan laporan contoh Dinas Bina Jalan (simulasi) sebagai
          pratinjau. Ubah status aktif setelah data seed dimuat.
        </p>
      )}
      <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {angka.map((a) => (
          <div key={a.label} className="kartu flex items-center gap-4 p-4">
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${a.gaya}`}>
              <Ikon nama={a.ikon} className="size-5" />
            </span>
            <div className="flex flex-col-reverse">
              <dt className="text-kecil text-lembut">{a.label}</dt>
              <dd className="angka text-judul leading-none font-bold">
                <AngkaGulir nilai={String(a.nilai)} />
              </dd>
            </div>
          </div>
        ))}
      </dl>
      <div className="mt-6">
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
    <div className="bingkai pt-6 pb-4 sm:pt-8">
      <KepalaHalaman judul="Laporan instansi">
        Laporan untuk instansi Anda. Yang melewati batas waktu ada di urutan teratas. Setiap perubahan status tercatat publik
        di halaman lacak, lengkap dengan nama instansi dan catatannya.
      </KepalaHalaman>
      <div className="mt-6">
        <Suspense fallback={<div aria-hidden="true" className="kerangka h-[30rem]" />}>
          <Isi />
        </Suspense>
      </div>
    </div>
  );
}
