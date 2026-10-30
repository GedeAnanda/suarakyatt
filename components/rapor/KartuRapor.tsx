// components/rapor/KartuRapor.tsx — satu instansi sebagai satu blok selebar halaman (PRD 11), pemilik: A
// Kiri: huruf besar tanpa kotak. Tengah: nama, nilai, dan empat komponen (nama lengkap, angka, bar). Kanan: tingkat
// penolakan, sampel, median respons, dan laporan aktif terlambat. Antarinstansi hanya dipisah garis. Huruf selalu tampil
// bersama tingkat penolakan dan ukuran sampel (PRD 1); periodenya di banner di atas daftar.

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { desimal, persen } from '@/lib/format';
import { DEFINISI_RAPOR, INFO_KOMPONEN, KOMPONEN } from '@/lib/konten-rapor';
import type { RaporInstansi } from '@/lib/types';
import Ikon from '../ui/Ikon';
import Istilah from '../ui/Istilah';

export default function KartuRapor({ i, kategoriId }: { i: RaporInstansi; kategoriId?: number }) {
  const kurang = i.huruf === null;
  const tertahan = !kurang && i.huruf !== i.huruf_asli;
  const nama = i.nama.replace(' (simulasi)', '');

  const angka = [
    {
      id: 'tolak',
      label: 'Ditolak',
      judul: 'Tingkat penolakan',
      definisi: DEFINISI_RAPOR.penolakan,
      nilai: persen(i.tingkat_penolakan),
      merah: i.peringatan_penolakan,
    },
    { id: 'sampel', label: 'Sampel', judul: 'Ukuran sampel', definisi: DEFINISI_RAPOR.sampel, nilai: String(i.sampel) },
    {
      id: 'median',
      label: 'Median respons',
      judul: 'Median waktu respons',
      definisi: DEFINISI_RAPOR.median,
      nilai: i.median_respons_jam === null ? 'Belum ada' : `${desimal(i.median_respons_jam)} jam`,
    },
    {
      id: 'terlambat',
      label: 'Aktif terlambat',
      judul: 'Laporan aktif terlambat',
      definisi: DEFINISI_RAPOR.terlambat,
      nilai: String(i.terlambat_aktif),
    },
  ];

  return (
    <li
      id={`instansi-${i.id}`}
      aria-labelledby={`rapor-${i.id}`}
      className="grid scroll-mt-24 grid-cols-[3.5rem_minmax(0,1fr)] gap-x-5 gap-y-5 border-b border-garis py-6 last:border-b-0 sm:grid-cols-[4.5rem_minmax(0,1fr)] lg:grid-cols-[4.5rem_minmax(0,1fr)_16rem] lg:gap-x-8"
    >
      {/* Huruf */}
      <div>
        <p
          className={`text-[3rem] leading-none font-bold sm:text-[3.75rem] ${kurang ? 'text-lembut' : 'text-biru'}`}
          aria-label={kurang ? 'Data belum cukup' : `Huruf ${i.huruf}${tertahan ? `, ditahan dari ${i.huruf_asli}` : ''}`}
        >
          {kurang ? '?' : i.huruf}
        </p>
        <p className="mt-1.5 text-mini text-lembut">{kurang ? 'belum cukup' : tertahan ? `setara ${i.huruf_asli}` : 'huruf rapor'}</p>
      </div>

      {/* Nama, nilai, empat komponen */}
      <div className="min-w-0">
        <h2 id={`rapor-${i.id}`} className="text-sub font-bold">
          {nama} <span className="text-kecil font-normal text-lembut">(simulasi)</span>
        </h2>
        <p className="angka mt-0.5 text-lead font-bold">
          {desimal(i.nilai)}
          <span className="text-kecil font-normal text-lembut"> / 100</span>
        </p>
        {i.peringatan_penolakan && (
          <p className="mt-1 text-kecil text-merah-tua">
            Penolakan {persen(i.tingkat_penolakan)} melewati batas, jadi huruf ditahan C walau angkanya setara {i.huruf_asli}.{' '}
            <Link
              href={`/peta?status=ditolak${kategoriId ? `&kategori=${kategoriId}` : ''}`}
              className="font-semibold underline underline-offset-4"
            >
              Baca laporan yang ditolak
            </Link>
          </p>
        )}

        {/* Empat komponen seperti versi awal: nama lengkap, angka di kanan, bar selebar kolom di bawahnya. */}
        <dl className="mt-4 grid gap-3">
          {KOMPONEN.map((k) => (
            <div key={k} className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1">
              <dt className="text-kecil">
                <Istilah
                  id={`istilah-${i.id}-${k}`}
                  judul={`${k} · ${INFO_KOMPONEN[k].nama} (bobot ${Math.round(INFO_KOMPONEN[k].bobot * 100)}%)`}
                  definisi={INFO_KOMPONEN[k].rumus}
                >
                  <span className="font-bold">{k}</span> · {INFO_KOMPONEN[k].nama}
                </Istilah>
              </dt>
              <dd className="angka text-right text-kecil font-bold">{desimal(i[k], 2)}</dd>
              <dd aria-hidden="true" className="relative col-span-2 h-2 overflow-hidden rounded-full bg-lapis">
                <span
                  className="bar-isi absolute inset-y-0 left-0 w-full rounded-full bg-biru"
                  style={{ '--isi': i[k] } as CSSProperties}
                />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Angka pendamping: di layar lebar kolom kanan, di layar kecil berjajar di bawah. */}
      <dl className="col-span-full grid grid-cols-2 gap-x-6 gap-y-3 text-kecil sm:grid-cols-4 lg:col-span-1 lg:grid-cols-2 lg:border-l lg:border-garis lg:pl-8">
        {angka.map((a) => (
          <div key={a.id}>
            <dt className="text-lembut">
              <Istilah id={`istilah-${i.id}-${a.id}`} judul={a.judul} definisi={a.definisi}>
                {a.label}
              </Istilah>
            </dt>
            <dd className={`angka text-lead font-bold ${a.merah ? 'text-merah-tua' : ''}`}>{a.nilai}</dd>
          </div>
        ))}
      </dl>

      <details className="group col-span-full sm:col-start-2">
        <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-1.5 text-kecil font-semibold text-biru-tua marker:hidden [&::-webkit-details-marker]:hidden">
          Rincian per kategori
          <Ikon nama="turun" className="size-4 transition-transform duration-300 group-open:rotate-180" />
        </summary>
        <div className="turun-panel mt-2 overflow-x-auto pb-1">
          <table className="w-full max-w-xl min-w-[22rem] text-left text-kecil">
            <thead className="text-lembut">
              <tr>
                <th scope="col" className="py-1.5 pr-3 font-medium">Kategori</th>
                <th scope="col" className="py-1.5 pr-3 text-right font-medium">Sampel</th>
                <th scope="col" className="py-1.5 pr-3 text-right font-medium">R</th>
                <th scope="col" className="py-1.5 pr-3 text-right font-medium">S</th>
                <th scope="col" className="py-1.5 text-right font-medium">P</th>
              </tr>
            </thead>
            <tbody>
              {i.per_kategori.map((k) => (
                <tr key={k.kategori} className="border-t border-garis">
                  <th scope="row" className="py-1.5 pr-3 font-semibold">{k.kategori}</th>
                  <td className="angka py-1.5 pr-3 text-right">{k.sampel}</td>
                  <td className="angka py-1.5 pr-3 text-right">{desimal(k.R, 2)}</td>
                  <td className="angka py-1.5 pr-3 text-right">{desimal(k.S, 2)}</td>
                  <td className="angka py-1.5 text-right">{desimal(k.P, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {i.keberatan_diterima > 0 && <p className="mt-2 text-kecil">Keberatan warga yang diterima: {i.keberatan_diterima}</p>}
        </div>
      </details>
    </li>
  );
}
