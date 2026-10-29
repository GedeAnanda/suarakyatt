// components/beranda/AlurLapor.tsx — dari mana datanya: lapor, dinas menjawab, warga menilai (pemilik: A)
// Tiga kartu langkah, masing-masing dengan potongan antarmuka asli aplikasi (badge, riwayat, rapor),
// supaya pengunjung langsung melihat seperti apa layarnya.

import type { ReactNode } from 'react';
import { desimal, persen } from '@/lib/format';
import type { RaporInstansi } from '@/lib/types';
import BadgeStatus from '../BadgeStatus';
import Ikon from '../ui/Ikon';

function Langkah({ n, judul, isi, children }: { n: number; judul: string; isi: string; children: ReactNode }) {
  return (
    <li className="flex">
      <article className="kartu flex min-w-0 flex-1 flex-col p-5">
        <p className="inline-flex items-center gap-2 self-start rounded-full bg-biru-muda py-1 pr-3 pl-1 text-mini font-bold text-biru-tua">
          <span className="angka flex size-5 items-center justify-center rounded-full bg-biru text-white">{n}</span>
          Langkah {n}
        </p>
        <h3 className="mt-3 text-sub font-bold">{judul}</h3>
        <p className="mt-1.5 text-kecil text-lembut">{isi}</p>
        <div className="mt-5 flex-1" data-ui>
          {children}
        </div>
      </article>
    </li>
  );
}

function BarisRapor({ i }: { i: RaporInstansi }) {
  const tertahan = i.huruf !== i.huruf_asli;
  return (
    <div className="flex items-center gap-3 rounded-kontrol border border-garis p-3">
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-kontrol text-[1.5rem] leading-none font-bold ${
          i.huruf ? 'bg-biru text-white' : 'bg-lapis text-lembut'
        }`}
      >
        {i.huruf ?? '–'}
      </span>
      <div className="min-w-0 text-kecil leading-snug">
        <p className="truncate font-bold">{i.nama.replace(' (simulasi)', '')}</p>
        <p className="text-lembut">
          Nilai <span className="angka">{desimal(i.nilai)}</span>
          {tertahan && `, setara ${i.huruf_asli}`}
        </p>
        <p className={`flex items-center gap-1 ${i.peringatan_penolakan ? 'font-semibold text-merah-tua' : 'text-lembut'}`}>
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
    // Tiga kolom hanya kalau wadahnya ≥ 48rem: di tablet dan di iPad miring dengan menu terbuka, kolom 230 px
    // terlalu sempit untuk potongan antarmuka di dalam kartu.
    <div className="@container">
    <ol className="grid grid-cols-1 gap-4 @3xl:grid-cols-3" data-muncul>
      <Langkah n={1} judul="Warga melapor" isi="Foto, titik di peta, dan cerita singkat. Kecamatan dan dinasnya ditentukan otomatis.">
        <div className="grid gap-3 rounded-kontrol bg-latar p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-[0.375rem] bg-biru px-2 py-0.5 text-mini font-bold text-white">Jalan rusak</span>
            <span className="inline-flex items-center gap-1 text-kecil text-lembut">
              <Ikon nama="lokasi" className="size-3.5" />
              Cipayung, Jakarta Timur
            </span>
          </div>
          <p className="text-kecil">&ldquo;Lubang besar di lajur kiri, motor sering oleng saat malam.&rdquo;</p>
          <p className="inline-flex items-center gap-1.5 text-kecil text-lembut">
            <Ikon nama="kamera" className="size-4" />2 foto terlampir
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-kontrol border border-garis p-3">
          <div>
            <p className="text-mini text-lembut">Kode lacak</p>
            <p className="font-kode angka text-lead font-bold tracking-wide text-biru-tua">{kodeContoh}</p>
          </div>
          <BadgeStatus status="menunggu" />
        </div>
      </Langkah>

      <Langkah n={2} judul="Dinas menjawab terbuka" isi="Setiap perubahan status tercatat publik. Laporan yang ditolak tetap tampil, lengkap dengan alasannya.">
        <ol className="grid rounded-kontrol bg-latar p-4">
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
                className={`relative mt-1 size-5 rounded-full border-4 border-latar bg-biru text-biru ${i === semua.length - 1 ? 'cincin' : ''}`}
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
        <p className="mt-3 flex items-center gap-2 rounded-kontrol bg-biru-muda px-3 py-2.5 text-kecil text-biru-tua">
          <Ikon nama="jam" className="size-4 shrink-0" />
          Sisa 4 hari menuju batas waktu selesai
        </p>
      </Langkah>

      <Langkah n={3} judul="Warga menilai, rapor berubah" isi="Rating, ketepatan waktu, dan tingkat penolakan menjadi Rapor Instansi A–E.">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-kontrol bg-latar p-3">
          <span role="img" className="flex gap-0.5 text-oranye" aria-label="4 dari 5 bintang">
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
    </div>
  );
}
