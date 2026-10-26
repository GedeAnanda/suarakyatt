// components/rapor/KartuRapor.tsx — satu instansi: huruf besar, nilai, empat komponen (PRD 11), pemilik: A
// Huruf selalu tampil bersama tingkat penolakan, ukuran sampel, dan periode (PRD 1).
// Huruf tetap terbaca dalam grayscale: dibedakan oleh bentuk hurufnya, bukan warna.

import Link from 'next/link';
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
    <article aria-labelledby={`rapor-${i.id}`} className="flex flex-col bg-lapis">
      {i.peringatan_penolakan && (
        <div className="di-medan flex gap-3 bg-medan px-5 py-3 text-badan text-medan-tinta sm:px-6">
          <Ikon nama="peringatan" className="mt-1 size-5" />
          <p>
            <strong className="font-semibold">Tingkat penolakan {persen(i.tingkat_penolakan)}</strong>, melewati batas.
            Huruf ditahan maksimal C walau angkanya setara {i.huruf_asli}.{' '}
            <Link href={`/peta?status=ditolak${kategoriId ? `&kategori=${kategoriId}` : ''}`} className="underline underline-offset-4">
              Baca laporan yang ditolak
            </Link>
          </p>
        </div>
      )}

      <div className="grid flex-1 gap-6 p-5 sm:grid-cols-[auto_1fr] sm:gap-8 sm:p-6">
        <div className="flex items-end gap-4 sm:block">
          <p
            className={`text-[clamp(6rem,4rem+8vw,10rem)] leading-[0.78] font-semibold tracking-[-0.06em] ${kurang ? 'text-lembut' : ''}`}
            aria-label={kurang ? 'Data belum cukup' : `Huruf ${i.huruf}${tertahan ? `, ditahan dari ${i.huruf_asli}` : ''}`}
          >
            {kurang ? '–' : i.huruf}
          </p>
          <p className="pb-2 text-kecil text-lembut sm:mt-3 sm:pb-0">
            {kurang ? 'Data belum cukup' : tertahan ? `angka setara ${i.huruf_asli}` : 'huruf rapor'}
          </p>
        </div>

        <div className="min-w-0">
          <h2 id={`rapor-${i.id}`} className="text-lead font-medium tracking-tight">
            {nama} <span className="text-kecil font-normal text-lembut">(simulasi)</span>
          </h2>
          <p className="angka mt-1 text-judul font-medium tracking-[-0.04em]">
            {desimal(i.nilai)}
            <span className="text-badan tracking-normal text-lembut"> / 100</span>
          </p>

          <dl className="mt-5 grid gap-3">
            {KOMPONEN.map((k) => (
              <div key={k} className="grid grid-cols-[1.75rem_1fr_3rem] items-center gap-x-3">
                <dt className="text-badan font-semibold">
                  <Istilah
                    id={`istilah-${i.id}-${k}`}
                    judul={`${k} · ${INFO_KOMPONEN[k].nama} (bobot ${Math.round(INFO_KOMPONEN[k].bobot * 100)}%)`}
                    definisi={INFO_KOMPONEN[k].rumus}
                  >
                    {k}
                  </Istilah>
                  <span className="sr-only">, {INFO_KOMPONEN[k].nama}</span>
                </dt>
                <dd aria-hidden="true" className="relative h-3 bg-lapis-2">
                  <span className="absolute inset-y-0 left-0 bg-tinta" style={{ width: `${i[k] * 100}%` }} />
                </dd>
                <dd className="angka text-right text-badan">{desimal(i[k], 2)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 bg-lapis-2/50 p-5 text-kecil sm:grid-cols-4 sm:p-6">
        <div>
          <dt>
            <Istilah id={`istilah-${i.id}-tolak`} judul="Tingkat penolakan" definisi={DEFINISI_RAPOR.penolakan}>
              Ditolak
            </Istilah>
          </dt>
          <dd className={`angka mt-1 text-lead font-medium ${i.peringatan_penolakan ? 'text-tinta underline decoration-2' : ''}`}>
            {persen(i.tingkat_penolakan)}
          </dd>
        </div>
        <div>
          <dt>
            <Istilah id={`istilah-${i.id}-sampel`} judul="Ukuran sampel" definisi={DEFINISI_RAPOR.sampel}>
              Sampel
            </Istilah>
          </dt>
          <dd className="angka mt-1 text-lead font-medium">{i.sampel}</dd>
        </div>
        <div>
          <dt>
            <Istilah id={`istilah-${i.id}-median`} judul="Median waktu respons" definisi={DEFINISI_RAPOR.median}>
              Median respons
            </Istilah>
          </dt>
          <dd className="angka mt-1 text-lead font-medium">
            {i.median_respons_jam === null ? '–' : `${desimal(i.median_respons_jam)} jam`}
          </dd>
        </div>
        <div>
          <dt>
            <Istilah id={`istilah-${i.id}-terlambat`} judul="Laporan aktif terlambat" definisi={DEFINISI_RAPOR.terlambat}>
              Aktif terlambat
            </Istilah>
          </dt>
          <dd className="angka mt-1 text-lead font-medium">{i.terlambat_aktif}</dd>
        </div>
      </dl>

      <details className="group bg-lapis px-5 py-4 sm:px-6">
        <summary className="cursor-pointer list-none text-kecil font-medium marker:hidden">
          <span className="underline decoration-2 underline-offset-4 group-open:no-underline">Rincian per kategori</span>
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[26rem] text-left text-kecil">
            <thead className="text-lembut">
              <tr>
                <th scope="col" className="py-1.5 pr-3 font-normal">Kategori</th>
                <th scope="col" className="py-1.5 pr-3 text-right font-normal">Sampel</th>
                <th scope="col" className="py-1.5 pr-3 text-right font-normal">R</th>
                <th scope="col" className="py-1.5 pr-3 text-right font-normal">S</th>
                <th scope="col" className="py-1.5 text-right font-normal">P</th>
              </tr>
            </thead>
            <tbody>
              {i.per_kategori.map((k) => (
                <tr key={k.kategori} className="border-t border-lapis-2">
                  <th scope="row" className="py-1.5 pr-3 font-medium">{k.kategori}</th>
                  <td className="angka py-1.5 pr-3 text-right">{k.sampel}</td>
                  <td className="angka py-1.5 pr-3 text-right">{desimal(k.R, 2)}</td>
                  <td className="angka py-1.5 pr-3 text-right">{desimal(k.S, 2)}</td>
                  <td className="angka py-1.5 text-right">{desimal(k.P, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {i.keberatan_diterima > 0 && (
            <p className="mt-2 text-kecil">Keberatan warga yang diterima: {i.keberatan_diterima}</p>
          )}
        </div>
      </details>
    </article>
  );
}
