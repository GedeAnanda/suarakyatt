// components/peta/PetaLaporan.tsx — peta publik + filter kategori dan status + daftar (FR-C3), pemilik: A
// Filter disimpan di URL (?kategori=1,2&status=ditolak) supaya tautannya bisa dibagikan,
// misalnya dari peringatan penolakan di Rapor Instansi.

'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import type { TitikLaporan } from '@/lib/data/laporan';
import { KATEGORI } from '@/lib/konten';
import type { StatusLaporan } from '@/lib/types';
import { IkonStatus, LABEL_STATUS, WARNA_TITIK } from '../BadgeStatus';
import KartuLaporan from '../KartuLaporan';
import { Tombol } from '../ui/Tombol';

const KlasterLaporan = dynamic(() => import('./KlasterLaporan'), {
  ssr: false,
  loading: () => <div className="kerangka h-[min(72svh,44rem)] min-h-96 w-full" />,
});

export const STATUS_PUBLIK: StatusLaporan[] = ['menunggu', 'diverifikasi', 'diproses', 'selesai', 'ditolak'];
const PER_HALAMAN = 12;

function simpanKeUrl(kategori: number[], status: StatusLaporan[]) {
  const url = new URL(window.location.href);
  if (kategori.length && kategori.length < KATEGORI.length) url.searchParams.set('kategori', kategori.join(','));
  else url.searchParams.delete('kategori');
  if (status.length && status.length < STATUS_PUBLIK.length) url.searchParams.set('status', status.join(','));
  else url.searchParams.delete('status');
  window.history.replaceState(null, '', url);
}

export default function PetaLaporan({
  laporan,
  sekarang,
  kategoriAwal,
  statusAwal,
}: {
  laporan: TitikLaporan[];
  sekarang: number;
  kategoriAwal: number[];
  statusAwal: StatusLaporan[];
}) {
  const [kategori, setKategori] = useState<number[]>(kategoriAwal.length ? kategoriAwal : KATEGORI.map((k) => k.id));
  const [status, setStatus] = useState<StatusLaporan[]>(statusAwal.length ? statusAwal : STATUS_PUBLIK);
  const [jumlah, setJumlah] = useState(PER_HALAMAN);

  const namaKategori = useMemo(() => new Set<string>(KATEGORI.filter((k) => kategori.includes(k.id)).map((k) => k.nama)), [kategori]);
  const tersaring = useMemo(
    () =>
      laporan
        .filter((l) => namaKategori.has(l.kategori) && status.includes(l.status))
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [laporan, namaKategori, status],
  );
  const hitungStatus = useMemo(() => {
    const h = Object.fromEntries(STATUS_PUBLIK.map((s) => [s, 0])) as Record<StatusLaporan, number>;
    for (const l of laporan) if (namaKategori.has(l.kategori) && l.status in h) h[l.status]++;
    return h;
  }, [laporan, namaKategori]);

  function ubahKategori(id: number) {
    const baru = kategori.includes(id) ? kategori.filter((k) => k !== id) : [...kategori, id].sort();
    setKategori(baru);
    setJumlah(PER_HALAMAN);
    simpanKeUrl(baru, status);
  }
  function ubahStatus(s: StatusLaporan) {
    const baru = status.includes(s) ? status.filter((x) => x !== s) : STATUS_PUBLIK.filter((x) => x === s || status.includes(x));
    setStatus(baru);
    setJumlah(PER_HALAMAN);
    simpanKeUrl(kategori, baru);
  }

  return (
    <div className="grid gap-8">
      <div className="grid gap-5 lg:grid-cols-2 lg:gap-8">
        <fieldset>
          <legend className="text-kecil text-lembut">Kategori</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {KATEGORI.map((k) => (
              <button
                key={k.id}
                type="button"
                aria-pressed={kategori.includes(k.id)}
                onClick={() => ubahKategori(k.id)}
                className="min-h-11 rounded-full bg-permukaan px-4 py-1.5 text-kecil font-medium ring-1 ring-batas ring-inset transition-colors hover:bg-terang aria-pressed:ring-tinta active:translate-y-px aria-pressed:bg-tinta aria-pressed:text-kertas"
              >
                {k.nama}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-kecil text-lembut">Status (jumlah dalam kategori terpilih)</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {STATUS_PUBLIK.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={status.includes(s)}
                onClick={() => ubahStatus(s)}
                className="flex min-h-11 items-center gap-1.5 rounded-full bg-permukaan px-4 py-1.5 text-kecil font-medium ring-1 ring-batas ring-inset transition-colors hover:bg-terang aria-pressed:ring-tinta active:translate-y-px aria-pressed:bg-tinta aria-pressed:text-kertas"
              >
                <IkonStatus status={s} className="size-3.5" />
                {LABEL_STATUS[s]}
                <span className="angka opacity-75">{hitungStatus[s]}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div>
        <div className="peta isolate overflow-hidden bg-lapis">
          <KlasterLaporan laporan={tersaring} className="h-[min(72svh,44rem)] min-h-96" />
        </div>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
          <ul aria-label="Arti warna titik" className="flex flex-wrap gap-x-4 gap-y-1.5 text-kecil">
            {STATUS_PUBLIK.map((s) => (
              <li key={s} className="flex items-center gap-1.5">
                <span aria-hidden="true" className="size-3 rounded-full ring-2 ring-white" style={{ background: WARNA_TITIK[s] }} />
                {LABEL_STATUS[s]}
              </li>
            ))}
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-3.5 rounded-full bg-tinta" />
              Kotak berangka: kumpulan laporan berdekatan
            </li>
          </ul>
          <p className="text-kecil text-lembut" aria-live="polite">
            {tersaring.length} laporan tampil. Klik kotak untuk memperbesar; klik titik untuk membuka ringkasannya.
          </p>
        </div>
      </div>

      <section aria-labelledby="judul-daftar">
        <h2 id="judul-daftar" className="text-lead font-medium tracking-tight">
          Laporan terbaru sesuai saringan
        </h2>
        {tersaring.length === 0 ? (
          <p className="kartu mt-4 p-5 text-badan">
            Tidak ada laporan dengan saringan ini. Pilih kategori atau status lain di atas.
          </p>
        ) : (
          <>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {tersaring.slice(0, jumlah).map((l) => (
                <li key={l.kode}>
                  <KartuLaporan laporan={l} sekarang={sekarang} />
                </li>
              ))}
            </ul>
            {jumlah < tersaring.length && (
              <Tombol varian="kedua" className="mt-4" onClick={() => setJumlah((j) => j + PER_HALAMAN * 2)}>
                Tampilkan lebih banyak ({tersaring.length - jumlah} lagi)
              </Tombol>
            )}
          </>
        )}
      </section>
    </div>
  );
}
