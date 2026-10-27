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
  const [cari, setCari] = useState('');
  const [batas, setBatas] = useState(20);
  // 'batas' = urutan bawaan FR-D1 (terlambat dulu, lalu paling dekat batas); 'masuk' = urut tanggal masuk.
  const [urut, setUrut] = useState<Urut>({ kolom: 'batas', naik: true });

  const tampil = useMemo(() => {
    const tersaring = laporan.filter(
      (l) =>
        (filter === 'semua' || (filter === 'aktif' ? AKTIF.includes(l.status) : l.status === filter)) &&
        (!hanyaTerlambat || l.terlambat) &&
        `${l.kode} ${l.kecamatan} ${l.kota} ${l.kategori}`.toLocaleLowerCase('id-ID').includes(cari.trim().toLocaleLowerCase('id-ID')),
    );
    if (urut.kolom === 'batas') return urut.naik ? tersaring : [...tersaring].reverse();
    return [...tersaring].sort((a, b) => (urut.naik ? 1 : -1) * a.created_at.localeCompare(b.created_at));
  }, [laporan, filter, hanyaTerlambat, urut, cari]);

  const ubahUrut = (kolom: Urut['kolom']) => setUrut((u) => ({ kolom, naik: u.kolom === kolom ? !u.naik : true }));

  return (
    <div>
      <div className="mb-5 max-w-xl">
        <label htmlFor="cari-antrean" className="mb-2 block text-badan font-medium">Cari laporan</label>
        <input id="cari-antrean" type="search" value={cari} onChange={(e) => { setCari(e.target.value); setBatas(20); }} placeholder="Kode, kecamatan, atau kategori" className="min-h-12 w-full px-4 text-badan" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {FILTER.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => { setFilter(f.id); setBatas(20); }}
            className="flex min-h-11 items-center gap-1.5 rounded-full bg-permukaan px-4 py-1.5 text-kecil font-medium ring-1 ring-batas ring-inset transition-colors hover:bg-terang aria-pressed:ring-tinta aria-pressed:bg-tinta aria-pressed:text-kertas"
          >
            {f.id !== 'aktif' && f.id !== 'semua' && <IkonStatus status={f.id} className="size-3.5" />}
            {f.label}
          </button>
        ))}
        <label className="ml-auto flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-permukaan px-4 text-kecil font-medium ring-1 ring-batas ring-inset has-checked:bg-tinta has-checked:text-kertas">
          <input type="checkbox" checked={hanyaTerlambat} onChange={(e) => { setHanyaTerlambat(e.target.checked); setBatas(20); }} className="size-4 accent-current" />
          Hanya yang terlambat
        </label>
      </div>

      <p className="mt-5 text-kecil text-lembut" role="status">{tampil.length} laporan sesuai saringan · menampilkan {Math.min(batas, tampil.length)}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 md:hidden">
        <label htmlFor="urut-antrean" className="text-kecil">Urutkan</label>
        <select id="urut-antrean" className="min-h-11 px-3 text-kecil" value={`${urut.kolom}-${urut.naik}`} onChange={(e) => { const [kolom, naik] = e.target.value.split('-'); setUrut({ kolom: kolom as Urut['kolom'], naik: naik === 'true' }); }}>
          <option value="batas-true">Terlambat lebih dulu</option>
          <option value="masuk-false">Laporan terbaru</option>
          <option value="masuk-true">Laporan terlama</option>
        </select>
      </div>
      <ul className="mt-4 grid gap-3 md:hidden">
        {tampil.slice(0, batas).map((l) => (
          <li key={l.kode} className="kartu p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link href={`/admin/laporan/${l.kode}`} className="angka inline-flex min-h-11 items-center font-semibold text-tinta underline underline-offset-4">{l.kode}</Link>
              <BadgeStatus status={l.status} />
            </div>
            <p className="mt-1 text-badan font-medium">{l.kategori} · {l.kecamatan}</p>
            <p className="mt-1 text-kecil text-lembut">Masuk {tanggalJam(l.created_at)}</p>
            <div className="mt-3"><IndikatorSLA ringkas sekarang={sekarang} laporan={l} /></div>
          </li>
        ))}
      </ul>
      <div className="kartu relative mt-4 hidden overflow-x-auto md:block">
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
            {tampil.slice(0, batas).map((l) => (
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
      </div>
      {tampil.length === 0 && <p className="kartu mt-4 p-5 text-badan">Tidak ada laporan dengan saringan ini.</p>}
      {tampil.length > batas && <button type="button" onClick={() => setBatas((n) => n + 20)} className="mt-5 min-h-11 rounded-full bg-lapis px-5 text-badan font-medium hover:bg-lapis-2">Muat 20 laporan berikutnya</button>}
    </div>
  );
}
