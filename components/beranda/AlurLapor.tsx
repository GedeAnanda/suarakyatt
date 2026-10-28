// components/beranda/AlurLapor.tsx — dari mana datanya: lapor, dinas menjawab, warga menilai (pemilik: A)
// Tiga kartu sejajar, masing-masing dengan potongan antarmuka asli aplikasi (badge, timeline, rapor),
// supaya pengunjung langsung melihat seperti apa layarnya.

import type { ReactNode } from 'react';
import { desimal, persen } from '@/lib/format';
import type { RaporInstansi } from '@/lib/types';
import BadgeStatus from '../BadgeStatus';
import Ikon from '../ui/Ikon';

function Langkah({
  nomor,
  judul,
  isi,
  children,
  terakhir = false,
}: {
  nomor: number;
  judul: string;
  isi: string;
  children: ReactNode;
  terakhir?: boolean;
}) {
  return (
    <li className="relative flex">
      <article className="kartu flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="angka flex size-9 shrink-0 items-center justify-center rounded-full bg-tinta text-badan font-semibold text-white">
            {nomor}
          </span>
          <h3 className="text-lead leading-tight font-semibold tracking-tight">{judul}</h3>
        </div>
        <p className="mt-3 text-badan text-lembut">{isi}</p>
        <div className="mt-6 flex-1">{children}</div>
      </article>
      {!terakhir && (
        <span
          aria-hidden="true"
          className="absolute top-1/2 -right-5 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-batas bg-permukaan text-tinta shadow-(--shadow-kartu) lg:flex"
        >
          <Ikon nama="naik" className="size-4 rotate-90" />
        </span>
      )}
    </li>
  );
}

function BarisRapor({ i }: { i: RaporInstansi }) {
  const tertahan = i.huruf !== i.huruf_asli;
  return (
    <div className="panel flex items-center gap-4 p-3">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-(--radius-kontrol) bg-permukaan text-[1.75rem] leading-none font-bold text-tinta shadow-(--shadow-kartu)">
        {i.huruf ?? '–'}
      </span>
      <div className="min-w-0 text-kecil leading-snug">
        <p className="truncate font-semibold">{i.nama.replace(' (simulasi)', '')}</p>
        <p className="text-lembut">
          Nilai <span className="angka">{desimal(i.nilai)}</span>
          {tertahan && `, setara ${i.huruf_asli}`}
        </p>
        <p className={`flex items-center gap-1 ${i.peringatan_penolakan ? 'font-semibold text-tinta' : 'text-lembut'}`}>
          {i.peringatan_penolakan && <Ikon nama="peringatan" className="size-3.5" />}
          Ditolak {persen(i.tingkat_penolakan)}
          {i.peringatan_penolakan && ', huruf ditahan C'}
        </p>
      </div>
    </div>
  );
}

export default function AlurLapor({ rapor, kodeContoh }: { rapor: RaporInstansi[]; kodeContoh: string }) {
  const baik = rapor.find((r) => !r.peringatan_penolakan && r.huruf === 'A') ?? rapor[0];
  const tertahan = rapor.find((r) => r.peringatan_penolakan) ?? rapor[1];

  return (
    <ol className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10" data-muncul>
      <Langkah nomor={1} judul="Warga melapor" isi="Foto, titik di peta, dan cerita singkat. Kecamatan dan dinasnya ditentukan otomatis.">
        <div className="panel grid gap-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-tinta px-3 py-1 text-kecil font-semibold text-white">Jalan rusak</span>
            <span className="inline-flex items-center gap-1 text-kecil text-lembut">
              <Ikon nama="lokasi" className="size-3.5" />
              Cipayung, Jakarta Timur
            </span>
          </div>
          <p className="text-kecil">&ldquo;Lubang besar di lajur kiri, motor sering oleng saat malam.&rdquo;</p>
          <div className="flex gap-2">
            {[0, 1].map((n) => (
              <span
                key={n}
                className="flex size-14 items-center justify-center rounded-(--radius-kontrol) border border-dashed border-lapis-2 bg-permukaan text-lembut"
              >
                <Ikon nama="kamera" className="size-5" />
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-(--radius-kontrol) border border-batas p-4">
          <div>
            <p className="text-kecil text-lembut">Kode lacak</p>
            <p className="font-kode angka text-lead font-bold tracking-tight text-tinta">{kodeContoh}</p>
          </div>
          <BadgeStatus status="menunggu" />
        </div>
      </Langkah>

      <Langkah nomor={2} judul="Dinas menjawab terbuka" isi="Setiap perubahan status tercatat publik. Laporan yang ditolak tetap tampil, lengkap dengan alasannya.">
        <ol className="panel grid gap-0 p-4">
          {[
            { status: 'menunggu' as const, waktu: 'Senin 08.12', siapa: 'Pelapor' },
            { status: 'diverifikasi' as const, waktu: 'Senin 15.40', siapa: 'Dinas Bina Jalan' },
            { status: 'diproses' as const, waktu: 'Selasa 09.05', siapa: 'Petugas sudah di lokasi' },
          ].map((t, i, semua) => (
            <li key={t.status} className="relative grid grid-cols-[1.25rem_1fr] gap-x-3 pb-4 last:pb-0">
              {i < semua.length - 1 && (
                <span aria-hidden="true" className="absolute top-5 bottom-0 left-[0.5625rem] w-0.5 rounded-full bg-lapis-2" />
              )}
              {/* Status terakhir (masih diproses) memancarkan cincin, seperti di halaman lacak. */}
              <span
                aria-hidden="true"
                className={`relative mt-1 size-5 rounded-full border-4 border-permukaan bg-tinta text-tinta ${i === semua.length - 1 ? 'cincin' : ''}`}
              />
              <div>
                <BadgeStatus status={t.status} />
                <p className="mt-1 text-kecil text-lembut">
                  {t.waktu} · {t.siapa}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-3 flex items-center gap-2 rounded-(--radius-kontrol) bg-tinta-muda px-4 py-3 text-kecil">
          <Ikon nama="info" className="size-4 shrink-0 text-tinta" />
          Sisa 4 hari menuju batas waktu selesai
        </p>
      </Langkah>

      <Langkah
        nomor={3}
        judul="Warga menilai, rapor berubah"
        isi="Rating, ketepatan waktu, dan tingkat penolakan menjadi Rapor Instansi A–E."
        terakhir
      >
        <div className="panel flex items-center justify-between gap-3 p-4">
          <span className="flex gap-0.5 text-tinta" aria-label="4 dari 5 bintang">
            {[1, 2, 3, 4, 5].map((n) => (
              <Ikon key={n} nama="bintang" isi={n <= 4} className="size-5" />
            ))}
          </span>
          <span className="text-kecil text-lembut">&ldquo;Rapi, tapi enam hari.&rdquo;</span>
        </div>
        <div className="mt-3 grid gap-2">
          <BarisRapor i={baik} />
          <BarisRapor i={tertahan} />
        </div>
      </Langkah>
    </ol>
  );
}
