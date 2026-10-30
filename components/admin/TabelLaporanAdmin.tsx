// components/admin/TabelLaporanAdmin.tsx — daftar laporan instansi dengan saringan dan pencarian (FR-D1), pemilik: A
// Urutan bawaan: terlambat di atas, lalu yang paling dekat batas selesai. Saringan berupa satu kontrol bersegmen
// ("Terlambat" menggantikan centang "Hanya yang terlambat"), ditambah cari kode atau kecamatan. Batas waktu tampil
// bersama bar sisa waktu. Di ponsel tabel digulir ke samping.

'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { LaporanAdmin } from '@/lib/data/admin';
import { tanggalJam } from '@/lib/format';
import type { StatusLaporan } from '@/lib/types';
import BadgeStatus, { LABEL_STATUS } from '../BadgeStatus';
import { hitungSLA } from '../IndikatorSLA';
import Ikon from '../ui/Ikon';

type IdSaring = 'aktif' | 'terlambat' | 'menunggu' | 'diverifikasi' | 'diproses' | 'tuntas' | 'semua';

const SARING: { id: IdSaring; label: string }[] = [
  { id: 'aktif', label: 'Perlu ditangani' },
  { id: 'terlambat', label: 'Terlambat' },
  { id: 'menunggu', label: LABEL_STATUS.menunggu },
  { id: 'diverifikasi', label: LABEL_STATUS.diverifikasi },
  { id: 'diproses', label: LABEL_STATUS.diproses },
  { id: 'tuntas', label: 'Selesai dan ditolak' },
  { id: 'semua', label: 'Semua' },
];
const AKTIF: StatusLaporan[] = ['menunggu', 'diverifikasi', 'diproses'];

function cocok(l: LaporanAdmin, saring: IdSaring) {
  if (saring === 'semua') return true;
  if (saring === 'aktif') return AKTIF.includes(l.status);
  if (saring === 'terlambat') return AKTIF.includes(l.status) && l.terlambat;
  if (saring === 'tuntas') return !AKTIF.includes(l.status);
  return l.status === saring;
}

/** Batas waktu sebagai teks biasa (merah kalau terlambat), keterangan kecil di bawahnya, lalu bar sisa waktu:
 *  seberapa jauh waktu sudah terpakai dari laporan masuk sampai batasnya. */
function BatasWaktu({ l, sekarang }: { l: LaporanAdmin; sekarang: number }) {
  const sla = hitungSLA(l, sekarang);
  if (!sla) return <span className="text-kecil text-lembut">Tidak dihitung</span>;
  const aktif = AKTIF.includes(l.status);
  const mulai = Date.parse(l.created_at);
  const batas = Date.parse(l.status === 'menunggu' ? l.batas_respons : l.batas_selesai);
  const terpakai = Math.min(1, Math.max(0.04, (sekarang - mulai) / Math.max(1, batas - mulai)));
  const warnaBar = sekarang > batas ? 'bg-merah' : terpakai > 0.75 ? 'bg-oranye' : 'bg-biru';
  return (
    <span className="block" title="Batas waktu layanan (SLA) per kategori. Angkanya ilustrasi dan tercantum di halaman Sumber Data.">
      <span className={`block text-kecil font-semibold whitespace-nowrap ${sla.terlambat ? 'text-merah-tua' : sla.selesai ? 'text-hijau' : ''}`}>
        {sla.teks}
      </span>
      {aktif && <span className="block text-mini text-lembut">{l.status === 'menunggu' ? 'batas respons' : 'batas selesai'}</span>}
      {aktif && (
        <span aria-hidden="true" className="mt-1.5 block h-1.5 w-32 overflow-hidden rounded-full bg-lapis">
          <span className={`block h-full rounded-full ${warnaBar}`} style={{ width: `${terpakai * 100}%` }} />
        </span>
      )}
    </span>
  );
}

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
    <th scope="col" aria-sort={aktif ? (urut.naik ? 'ascending' : 'descending') : 'none'} className="p-0 font-semibold">
      <button
        type="button"
        onClick={() => onUrut(kolom)}
        className="flex min-h-11 w-full items-center gap-1.5 px-4 py-3 text-left transition-colors hover:bg-lapis hover:text-teks"
      >
        {children}
        <Ikon nama={aktif && !urut.naik ? 'turun' : 'naik'} className={`size-3.5 ${aktif ? 'text-biru' : 'opacity-35'}`} />
        <span className="sr-only">, urutkan</span>
      </button>
    </th>
  );
}

export default function TabelLaporanAdmin({ laporan, sekarang }: { laporan: LaporanAdmin[]; sekarang: number }) {
  const [saring, setSaring] = useState<IdSaring>('aktif');
  const [cari, setCari] = useState('');
  // 'batas' = urutan bawaan FR-D1 (terlambat dulu, lalu paling dekat batas); 'masuk' = urut tanggal masuk.
  const [urut, setUrut] = useState<Urut>({ kolom: 'batas', naik: true });

  const tampil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    const tersaring = laporan.filter(
      (l) => cocok(l, saring) && (!q || `${l.kode} ${l.kecamatan} ${l.kota}`.toLowerCase().includes(q)),
    );
    if (urut.kolom === 'batas') return urut.naik ? tersaring : [...tersaring].reverse();
    return [...tersaring].sort((a, b) => (urut.naik ? 1 : -1) * a.created_at.localeCompare(b.created_at));
  }, [laporan, saring, cari, urut]);

  const ubahUrut = (kolom: Urut['kolom']) => setUrut((u) => ({ kolom, naik: u.kolom === kolom ? !u.naik : true }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Saring laporan" className="inline-flex flex-wrap gap-0.5 rounded-kontrol border border-garis bg-permukaan p-1">
          {SARING.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={saring === s.id}
              onClick={() => setSaring(s.id)}
              className="min-h-9 rounded-[0.4rem] px-3 text-kecil font-semibold whitespace-nowrap text-lembut transition-colors hover:text-teks aria-pressed:bg-biru aria-pressed:text-white"
            >
              {s.label}
            </button>
          ))}
        </div>
        <label className="w-full sm:w-72">
          <span className="sr-only">Cari kode laporan atau kecamatan</span>
          <input
            type="search"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari kode atau kecamatan"
            className="h-10 w-full px-3 text-kecil"
          />
        </label>
      </div>

      <div className="kartu relative mt-4 overflow-x-auto">
        <table className="w-full min-w-[56rem] text-left text-badan">
          <caption className="sr-only">Laporan instansi, terlambat paling atas</caption>
          <thead className="bg-latar text-kecil text-lembut">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Laporan</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 font-semibold">Lokasi</th>
              <KepalaUrut kolom="masuk" urut={urut} onUrut={ubahUrut}>
                Masuk
              </KepalaUrut>
              <KepalaUrut kolom="batas" urut={urut} onUrut={ubahUrut}>
                Batas waktu
              </KepalaUrut>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tampil.map((l) => (
              <tr key={l.kode} className="border-t border-garis transition-colors hover:bg-biru-pudar">
                <th scope="row" className="px-4 py-3 font-semibold whitespace-nowrap">
                  <span className="font-kode angka font-bold text-biru-tua">{l.kode}</span>
                  <span className="block text-kecil font-normal text-lembut">{l.kategori}</span>
                </th>
                <td className="px-4 py-3">
                  <BadgeStatus status={l.status} />
                </td>
                <td className="px-4 py-3 text-kecil">
                  {l.kecamatan}
                  <span className="block text-lembut">{l.kota}</span>
                </td>
                <td className="px-4 py-3 text-kecil whitespace-nowrap text-lembut">{tanggalJam(l.created_at)}</td>
                <td className="px-4 py-3">
                  <BatasWaktu l={l} sekarang={sekarang} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/laporan/${l.kode}`}
                    aria-label={`Buka laporan ${l.kode}`}
                    className="inline-flex min-h-9 items-center gap-1 rounded-kontrol bg-biru px-3 text-kecil font-bold whitespace-nowrap text-white transition-colors hover:bg-biru-tua"
                  >
                    Buka
                    <Ikon nama="kanan" className="size-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tampil.length === 0 && <p className="p-5 text-badan text-lembut">Tidak ada laporan yang cocok dengan saringan atau pencarian ini.</p>}
      </div>
    </div>
  );
}
