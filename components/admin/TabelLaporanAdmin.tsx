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
import Ikon from '../ui/Ikon';

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

type Urut = { kolom: 'batas' | 'masuk'; naik: boolean };

function KepalaUrut({
  kolom,
  urut,
  onUrut,
  children,
}: {
  kolom: Urut['kolom'];
  urut: Urut;
  onUrut: (kolom: Urut['kolom']) => void;
  children: React.ReactNode;
}) {
  const aktif = urut.kolom === kolom;
  return (
    <th scope="col" aria-sort={aktif ? (urut.naik ? 'ascending' : 'descending') : 'none'} className="p-0 font-medium">
      <button
        type="button"
        onClick={() => onUrut(kolom)}
        className="flex min-h-11 w-full items-center gap-1.5 px-4 py-3 text-left transition-colors hover:bg-lapis"
      >
        {children}
        <Ikon nama={aktif && !urut.naik ? 'turun' : 'naik'} className={`size-3.5 ${aktif ? '' : 'opacity-35'}`} />
        <span className="sr-only">, urutkan</span>
      </button>
    </th>
  );
}

export default function TabelLaporanAdmin({ laporan, sekarang }: { laporan: LaporanAdmin[]; sekarang: number }) {
  const [filter, setFilter] = useState<(typeof FILTER)[number]['id']>('aktif');
  const [hanyaTerlambat, setHanyaTerlambat] = useState(false);
  // 'batas' = urutan bawaan FR-D1 (terlambat dulu, lalu paling dekat batas); 'masuk' = urut tanggal masuk.
  const [urut, setUrut] = useState<Urut>({ kolom: 'batas', naik: true });

  const tampil = useMemo(() => {
    const tersaring = laporan.filter(
      (l) =>
        (filter === 'semua' || (filter === 'aktif' ? AKTIF.includes(l.status) : l.status === filter)) &&
        (!hanyaTerlambat || l.terlambat),
    );
    if (urut.kolom === 'batas') return urut.naik ? tersaring : [...tersaring].reverse();
    return [...tersaring].sort((a, b) => (urut.naik ? 1 : -1) * a.created_at.localeCompare(b.created_at));
  }, [laporan, filter, hanyaTerlambat, urut]);

  const ubahUrut = (kolom: Urut['kolom']) => setUrut((u) => ({ kolom, naik: u.kolom === kolom ? !u.naik : true }));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {FILTER.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className="flex min-h-11 items-center gap-1.5 rounded-full bg-permukaan px-4 py-1.5 text-kecil font-medium ring-1 ring-batas ring-inset transition-colors hover:bg-terang aria-pressed:ring-tinta aria-pressed:bg-tinta aria-pressed:text-kertas"
          >
            {f.id !== 'aktif' && f.id !== 'semua' && <IkonStatus status={f.id} className="size-3.5" />}
            {f.label}
          </button>
        ))}
        <label className="ml-auto flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-permukaan px-4 text-kecil font-medium ring-1 ring-batas ring-inset has-checked:bg-tinta has-checked:text-kertas">
          <input type="checkbox" checked={hanyaTerlambat} onChange={(e) => setHanyaTerlambat(e.target.checked)} className="size-4 accent-current" />
          Hanya yang terlambat
        </label>
      </div>

      <div className="kartu mt-4 relative overflow-x-auto">
        <table className="w-full min-w-[52rem] text-left text-badan">
          <caption className="sr-only">Laporan instansi, terlambat paling atas</caption>
          <thead className="bg-terang text-kecil">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Kode</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Lokasi</th>
              <KepalaUrut kolom="masuk" urut={urut} onUrut={ubahUrut}>
                Masuk
              </KepalaUrut>
              <KepalaUrut kolom="batas" urut={urut} onUrut={ubahUrut}>
                Batas waktu
              </KepalaUrut>
            </tr>
          </thead>
          <tbody>
            {tampil.map((l) => (
              <tr key={l.kode} className={`border-t border-batas ${l.terlambat ? 'bg-tinta-muda/60' : ''} transition-colors hover:bg-terang`}>
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
          <p className="p-5 text-badan">Tidak ada laporan dengan saringan ini.</p>
        )}
      </div>
    </div>
  );
}
