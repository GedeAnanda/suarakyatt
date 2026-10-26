// components/admin/TabelLaporanAdmin.tsx — daftar laporan instansi dengan filter (FR-D1), pemilik: A
// Urutan bawaan: terlambat di atas, lalu yang paling dekat batas selesai. Di ponsel tabel digulir ke samping.

'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { LaporanAdmin } from '@/lib/data/admin';
import { tanggalJam } from '@/lib/format';
import type { StatusLaporan } from '@/lib/types';
import BadgeStatus, { IkonStatus, LABEL_STATUS } from '../BadgeStatus';
import IndikatorSLA from '../IndikatorSLA';

const FILTER: { id: 'aktif' | StatusLaporan | 'semua'; label: string }[] = [
  { id: 'aktif', label: 'Perlu ditangani' },
  { id: 'menunggu', label: LABEL_STATUS.menunggu },
  { id: 'diverifikasi', label: LABEL_STATUS.diverifikasi },
  { id: 'diproses', label: LABEL_STATUS.diproses },
  { id: 'selesai', label: LABEL_STATUS.selesai },
  { id: 'ditolak', label: LABEL_STATUS.ditolak },
  { id: 'semua', label: 'Semua' },
];
const AKTIF: StatusLaporan[] = ['menunggu', 'diverifikasi', 'diproses'];

export default function TabelLaporanAdmin({ laporan, sekarang }: { laporan: LaporanAdmin[]; sekarang: number }) {
  const [filter, setFilter] = useState<(typeof FILTER)[number]['id']>('aktif');
  const [hanyaTerlambat, setHanyaTerlambat] = useState(false);

  const tampil = useMemo(
    () =>
      laporan.filter(
        (l) =>
          (filter === 'semua' || (filter === 'aktif' ? AKTIF.includes(l.status) : l.status === filter)) &&
          (!hanyaTerlambat || l.terlambat),
      ),
    [laporan, filter, hanyaTerlambat],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {FILTER.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className="flex min-h-10 items-center gap-1.5 bg-lapis px-3 py-1.5 text-kecil hover:bg-lapis-2 aria-pressed:bg-tinta aria-pressed:text-kertas"
          >
            {f.id !== 'aktif' && f.id !== 'semua' && <IkonStatus status={f.id} className="size-3.5" />}
            {f.label}
          </button>
        ))}
        <label className="ml-auto flex min-h-10 cursor-pointer items-center gap-2 bg-lapis px-3 text-kecil has-checked:bg-tinta has-checked:text-kertas">
          <input type="checkbox" checked={hanyaTerlambat} onChange={(e) => setHanyaTerlambat(e.target.checked)} className="size-4 accent-current" />
          Hanya yang terlambat
        </label>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[52rem] text-left text-badan">
          <caption className="sr-only">Laporan instansi, terlambat paling atas</caption>
          <thead className="bg-lapis-2 text-kecil">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Kode</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Lokasi</th>
              <th scope="col" className="px-4 py-3 font-medium">Masuk</th>
              <th scope="col" className="px-4 py-3 font-medium">Batas waktu</th>
            </tr>
          </thead>
          <tbody>
            {tampil.map((l) => (
              <tr key={l.kode} className={`border-t-2 border-kertas ${l.terlambat ? 'bg-st-menunggu-bg/45' : 'bg-lapis'} hover:bg-lapis-2`}>
                <th scope="row" className="px-4 py-3 font-semibold whitespace-nowrap">
                  <Link href={`/admin/laporan/${l.kode}`} className="angka underline decoration-2 underline-offset-4 hover:decoration-transparent">
                    {l.kode}
                  </Link>
                  <span className="block text-kecil font-normal text-lembut">{l.kategori}</span>
                </th>
                <td className="px-4 py-3">
                  <BadgeStatus status={l.status} />
                </td>
                <td className="px-4 py-3 text-kecil">
                  {l.kecamatan}
                  <span className="block text-lembut">{l.kota}</span>
                </td>
                <td className="px-4 py-3 text-kecil whitespace-nowrap">{tanggalJam(l.created_at)}</td>
                <td className="px-4 py-3">
                  <IndikatorSLA ringkas sekarang={sekarang} laporan={l} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tampil.length === 0 && (
          <p className="bg-lapis p-5 text-badan">Tidak ada laporan dengan saringan ini.</p>
        )}
      </div>
    </div>
  );
}
