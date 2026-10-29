// components/beranda/LaporanTerbaru.tsx — laporan terbaru per kategori (pemilik: A)
// Seperti bagian rekomendasi di beranda situs travel: tab berbentuk pil, lalu deretan kartu yang bisa diklik.
// Datanya dipilih di server (enam laporan terbaru per tab), jadi peramban tidak menerima semua laporan.

'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { TitikLaporan } from '@/lib/data/laporan';
import { KATEGORI } from '@/lib/konten';
import KartuLaporan from '../KartuLaporan';
import Ikon from '../ui/Ikon';
import IkonKategori from '../ui/IkonKategori';

const TAB = [{ id: 'semua', nama: 'Semua kategori' }, ...KATEGORI.map((k) => ({ id: String(k.id), nama: k.nama }))];

export default function LaporanTerbaru({ per, sekarang }: { per: Record<string, TitikLaporan[]>; sekarang: number }) {
  const [aktif, setAktif] = useState('semua');
  const daftar = per[aktif] ?? [];

  return (
    <div>
      <div role="tablist" aria-label="Kategori laporan" className="flex flex-wrap gap-2">
        {TAB.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-terbaru-${t.id}`}
            aria-selected={t.id === aktif}
            aria-controls="panel-terbaru"
            onClick={() => setAktif(t.id)}
            className={`chip ${t.id === 'semua' ? '' : 'pl-1.5'}`}
          >
            {t.id !== 'semua' && <IkonKategori nama={t.nama} ukuran="kecil" />}
            {t.nama}
          </button>
        ))}
      </div>

      <div id="panel-terbaru" role="tabpanel" aria-labelledby={`tab-terbaru-${aktif}`} className="mt-4">
        {daftar.length === 0 ? (
          <p className="kartu p-5 text-badan text-lembut">Belum ada laporan untuk kategori ini.</p>
        ) : (
          <ul key={aktif} className="ganti grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {daftar.map((l) => (
              <li key={l.kode}>
                <KartuLaporan laporan={l} sekarang={sekarang} />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex justify-center">
          <Link
            href={aktif === 'semua' ? '/peta' : `/peta?kategori=${aktif}`}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-kontrol border border-garis-isian bg-permukaan px-5 text-badan font-semibold transition-colors hover:border-biru hover:text-biru-tua"
          >
            Lihat semua di peta laporan
            <Ikon nama="kanan" className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
