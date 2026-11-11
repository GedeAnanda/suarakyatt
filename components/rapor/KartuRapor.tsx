// components/rapor/KartuRapor.tsx — satu dinas sebagai satu blok selebar halaman (PRD 11), pemilik: A
// Urutan baca (audit bahasa awam, C3): huruf dan artinya → satu kesimpulan → peringatan penolakan → empat bar
// "x dari 100" dengan garis rata-rata dinas lain → angka pendamping → rincian per kategori. Huruf selalu tampil
// bersama persen laporan ditolak dan jumlah laporan yang dinilai (PRD 1); periodenya di banner di atas daftar.
// Pembanding (rata-rata dan nilai tengah dinas lain) dihitung halaman dari daftar yang sama.

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { desimal, durasi, persen, ribuan } from '@/lib/format';
import {
  batasTolak,
  DEFINISI_RAPOR,
  dariSeratus,
  hurufDanArti,
  INFO_KOMPONEN,
  kalimatPeringatanTolak,
  kesimpulanRapor,
  KOMPONEN,
  namaDinas,
  type PembandingRapor,
} from '@/lib/konten-rapor';
import type { RaporInstansi } from '@/lib/types';
import Ikon from '../ui/Ikon';
import Istilah from '../ui/Istilah';

export default function KartuRapor({
  i,
  kategoriId,
  pembanding,
}: {
  i: RaporInstansi;
  kategoriId?: number;
  pembanding: PembandingRapor;
}) {
  const huruf = i.huruf;
  const tertahan = huruf !== null && huruf !== i.huruf_asli;
  const { batas } = batasTolak(i, pembanding.tolakTengah);

  const angka = [
    {
      id: 'tolak',
      label: 'Ditolak',
      judul: 'Persen laporan ditolak',
      definisi: DEFINISI_RAPOR.penolakan,
      nilai: persen(i.tingkat_penolakan),
      tambahan: `(batas ${persen(batas)})`,
      merah: i.peringatan_penolakan,
    },
    {
      id: 'dinilai',
      label: 'Laporan yang dinilai',
      judul: 'Laporan yang dinilai',
      definisi: DEFINISI_RAPOR.sampel,
      nilai: ribuan(i.sampel),
    },
    {
      id: 'tengah',
      label: 'Biasanya ditanggapi dalam',
      judul: 'Biasanya ditanggapi dalam',
      definisi: DEFINISI_RAPOR.median,
      nilai: i.median_respons_jam === null ? 'Belum ada' : durasi(i.median_respons_jam * 3_600_000),
    },
    {
      id: 'terlambat',
      label: 'Masih terlambat sekarang',
      judul: 'Masih terlambat sekarang',
      definisi: DEFINISI_RAPOR.terlambat,
      nilai: ribuan(i.terlambat_aktif),
    },
  ];

  return (
    <li
      id={`instansi-${i.id}`}
      aria-labelledby={`rapor-${i.id}`}
      className="grid scroll-mt-24 gap-y-6 border-b border-garis py-6 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-x-8"
    >
      <div className="min-w-0">
        {/* 1. Huruf dan artinya. Huruf besar hanya hiasan; pembaca layar membaca "B · Baik" di sebelahnya. */}
        <div className="flex items-center gap-4">
          <p
            aria-hidden="true"
            className={`w-12 shrink-0 text-center text-[3rem] leading-none font-bold sm:w-16 sm:text-[3.75rem] ${huruf ? 'text-biru' : 'text-lembut'}`}
          >
            {huruf ?? '–'}
          </p>
          <div className="min-w-0">
            <h2 id={`rapor-${i.id}`} className="text-sub font-bold">
              {namaDinas(i.nama)} <span className="text-kecil font-normal text-lembut">(data buatan)</span>
            </h2>
            {huruf ? (
              <p className="mt-0.5 text-badan">
                <strong className="font-bold">{hurufDanArti(huruf)}</strong>
                <span className="angka text-lembut"> · nilai {desimal(i.nilai)} dari 100</span>
              </p>
            ) : (
              <p className="mt-0.5 text-badan font-semibold">{DEFINISI_RAPOR.belumDinilai}</p>
            )}
            {tertahan && <p className="text-kecil font-semibold text-merah-tua">Turun dari {hurufDanArti(i.huruf_asli)}</p>}
          </div>
        </div>

        {/* 2. Satu kesimpulan: komponen terkuat dan terlemah. */}
        {huruf && <p className="mt-4 text-badan">{kesimpulanRapor(i)}</p>}

        {/* 3. Peringatan penolakan. */}
        {i.peringatan_penolakan && (
          <p className="mt-3 flex gap-2 rounded-kontrol bg-merah-muda px-3 py-2.5 text-kecil text-merah-tua">
            <Ikon nama="peringatan" className="mt-0.5 size-4 shrink-0" />
            <span>
              {kalimatPeringatanTolak(i, pembanding.tolakTengah)}{' '}
              <Link
                href={`/peta?status=ditolak${kategoriId ? `&kategori=${kategoriId}` : ''}`}
                className="font-semibold underline underline-offset-4"
              >
                Baca laporan yang ditolak
              </Link>
            </span>
          </p>
        )}

        {/* 4. Empat bar "x dari 100", garis gelap = rata-rata dinas lain. */}
        {pembanding.rata && (
          <p className="mt-5 flex items-center gap-2 text-kecil text-lembut">
            <span aria-hidden="true" className="h-4 w-0.5 rounded-full bg-navy" />
            Garis gelap di batang: rata-rata dinas lain
          </p>
        )}
        <dl className={`grid gap-4 ${pembanding.rata ? 'mt-3' : 'mt-5'}`}>
          {KOMPONEN.map((k) => {
            const info = INFO_KOMPONEN[k];
            const lain = pembanding.rata?.[k];
            return (
              <div key={k} className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1.5">
                <dt className="text-kecil font-semibold">
                  <Istilah
                    id={`istilah-${i.id}-${k}`}
                    judul={info.nama}
                    definisi={`${info.arti} Bobotnya ${persen(info.bobot)} dari nilai.`}
                  >
                    {info.nama}
                  </Istilah>
                </dt>
                <dd className="angka text-right text-kecil font-bold">{dariSeratus(i[k])}</dd>
                <dd aria-hidden="true" className="relative col-span-2 py-1">
                  <div className="relative h-2 overflow-hidden rounded-full bg-lapis">
                    <span
                      className="bar-isi absolute inset-y-0 left-0 w-full rounded-full bg-biru"
                      style={{ '--isi': i[k] } as CSSProperties}
                    />
                  </div>
                  {lain !== undefined && (
                    <span
                      className="absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-navy"
                      style={{ left: `${lain * 100}%` }}
                    />
                  )}
                </dd>
                <dd className="col-span-2 text-kecil text-lembut">
                  {info.makna(i[k])}.{lain !== undefined && ` ${info.lain(lain)}.`}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      {/* 5. Angka pendamping: di layar lebar kolom kanan, di layar kecil berjajar di bawah. */}
      <dl className="grid grid-cols-2 content-start gap-x-6 gap-y-4 text-kecil sm:grid-cols-4 lg:grid-cols-1 lg:border-l lg:border-garis lg:pl-8">
        {angka.map((a) => (
          <div key={a.id}>
            <dt className="text-lembut">
              <Istilah id={`istilah-${i.id}-${a.id}`} judul={a.judul} definisi={a.definisi}>
                {a.label}
              </Istilah>
            </dt>
            <dd className="mt-0.5">
              <span className={`angka text-lead font-bold ${a.merah ? 'text-merah-tua' : ''}`}>{a.nilai}</span>
              {a.tambahan && <span className="text-kecil text-lembut"> {a.tambahan}</span>}
            </dd>
          </div>
        ))}
      </dl>

      {/* 6. Rincian per kategori, tertutup sampai dibuka. */}
      <details className="group lg:col-span-2">
        <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-kecil font-semibold text-biru-tua marker:hidden [&::-webkit-details-marker]:hidden">
          Rincian per kategori
          <Ikon nama="turun" className="size-4 transition-transform duration-300 group-open:rotate-180" />
        </summary>
        <div className="turun-panel mt-1 max-w-2xl">
          <ul className="grid gap-2">
            {i.per_kategori.map((k) => (
              <li key={k.kategori} className="rounded-kontrol bg-latar p-3">
                <p className="text-kecil font-bold">{k.kategori}</p>
                <dl className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-2 text-kecil sm:grid-cols-4">
                  {[
                    ['Laporan dinilai', ribuan(k.sampel)],
                    ['Ditanggapi tepat waktu', persen(k.R)],
                    ['Selesai tepat waktu', persen(k.S)],
                    ['Diselesaikan', persen(k.P)],
                  ].map(([label, nilai]) => (
                    <div key={label}>
                      <dt className="text-lembut">{label}</dt>
                      <dd className="angka font-bold">{nilai}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
          {i.keberatan_diterima > 0 && (
            <p className="mt-3 text-kecil">
              Keberatan warga yang dikabulkan: <strong className="angka">{ribuan(i.keberatan_diterima)}</strong>{' '}
              <span className="text-lembut">({DEFINISI_RAPOR.keberatan})</span>
            </p>
          )}
        </div>
      </details>
    </li>
  );
}
