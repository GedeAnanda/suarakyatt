// components/rapor/KartuRapor.tsx — satu instansi: huruf besar, nilai, empat komponen (PRD 11), pemilik: A
// Huruf dalam kotak biru seperti kotak skor ulasan di situs travel, selalu bersama tingkat penolakan,
// ukuran sampel, dan periode (PRD 1). Huruf tetap terbaca dalam grayscale: dibedakan oleh bentuk hurufnya.

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

  return (
    <article id={`instansi-${i.id}`} aria-labelledby={`rapor-${i.id}`} className="kartu flex scroll-mt-24 flex-col overflow-hidden">
      {i.peringatan_penolakan && (
        <div className="flex gap-3 border-b border-[#f6c4c7] bg-merah-muda px-5 py-3 text-kecil text-merah-tua">
          <Ikon nama="peringatan" className="mt-0.5 size-5 shrink-0" />
          <p>
            <strong className="font-bold">Tingkat penolakan {persen(i.tingkat_penolakan)}</strong>, melewati batas. Huruf
            ditahan maksimal C walau angkanya setara {i.huruf_asli}.{' '}
            <Link
              href={`/peta?status=ditolak${kategoriId ? `&kategori=${kategoriId}` : ''}`}
              className="font-bold underline underline-offset-4"
            >
              Baca laporan yang ditolak
            </Link>
          </p>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-5 p-5 sm:flex-row sm:gap-6">
        <div className="flex items-center gap-4 sm:flex-col sm:items-start">
          <p
            className={`flex size-24 shrink-0 items-center justify-center rounded-besar text-[3.75rem] leading-none font-bold tracking-[-0.04em] ${
              kurang ? 'bg-lapis text-lembut' : 'bg-biru text-white'
            }`}
            aria-label={kurang ? 'Data belum cukup' : `Huruf ${i.huruf}${tertahan ? `, ditahan dari ${i.huruf_asli}` : ''}`}
          >
            {kurang ? '–' : i.huruf}
          </p>
          <p className="max-w-24 text-kecil text-lembut">
            {kurang ? 'Data belum cukup' : tertahan ? `angka setara ${i.huruf_asli}` : 'huruf rapor'}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <h2 id={`rapor-${i.id}`} className="text-sub font-bold">
            {nama} <span className="text-kecil font-normal text-lembut">(simulasi)</span>
          </h2>
          <p className="angka mt-0.5 text-judul font-bold text-biru-tua">
            {desimal(i.nilai)}
            <span className="text-badan font-medium text-lembut"> / 100</span>
          </p>

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
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-garis bg-latar px-5 py-4 text-kecil sm:grid-cols-4">
        <div>
          <dt className="text-lembut">
            <Istilah id={`istilah-${i.id}-tolak`} judul="Tingkat penolakan" definisi={DEFINISI_RAPOR.penolakan}>
              Ditolak
            </Istilah>
          </dt>
          <dd className={`angka mt-1 text-lead font-bold ${i.peringatan_penolakan ? 'text-merah-tua' : ''}`}>
            {persen(i.tingkat_penolakan)}
          </dd>
        </div>
        <div>
          <dt className="text-lembut">
            <Istilah id={`istilah-${i.id}-sampel`} judul="Ukuran sampel" definisi={DEFINISI_RAPOR.sampel}>
              Sampel
            </Istilah>
          </dt>
          <dd className="angka mt-1 text-lead font-bold">{i.sampel}</dd>
        </div>
        <div>
          <dt className="text-lembut">
            <Istilah id={`istilah-${i.id}-median`} judul="Median waktu respons" definisi={DEFINISI_RAPOR.median}>
              Median respons
            </Istilah>
          </dt>
          <dd className="angka mt-1 text-lead font-bold">
            {i.median_respons_jam === null ? '–' : `${desimal(i.median_respons_jam)} jam`}
          </dd>
        </div>
        <div>
          <dt className="text-lembut">
            <Istilah id={`istilah-${i.id}-terlambat`} judul="Laporan aktif terlambat" definisi={DEFINISI_RAPOR.terlambat}>
              Aktif terlambat
            </Istilah>
          </dt>
          <dd className="angka mt-1 text-lead font-bold">{i.terlambat_aktif}</dd>
        </div>
      </dl>

      <details className="group border-t border-garis px-5 py-3">
        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 text-kecil font-bold text-biru-tua marker:hidden [&::-webkit-details-marker]:hidden">
          Rincian per kategori
          <Ikon nama="turun" className="size-4 transition-transform duration-300 group-open:rotate-180" />
        </summary>
        <div className="turun-panel relative mt-2 overflow-x-auto pb-2">
          <table className="w-full min-w-[26rem] text-left text-kecil">
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
    </article>
  );
}
