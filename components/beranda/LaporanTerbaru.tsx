// components/beranda/LaporanTerbaru.tsx — laporan terbaru per jenis masalah (pemilik: A)
// Seperti bagian rekomendasi di beranda situs travel: tab berbentuk pil, lalu deretan kartu yang bisa diklik.
// Datanya dipilih di server (enam laporan terbaru per tab), jadi peramban tidak menerima semua laporan.

'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { TitikLaporan } from '@/lib/data/laporan';
import { KATEGORI } from '@/lib/konten';
import KartuLaporan from '../KartuLaporan';
import Ikon from '../ui/Ikon';
import KelompokCair from '../ui/KelompokCair';
import { kelasTombol } from '../ui/Tombol';

const TAB = [{ id: 'semua', nama: 'Semua jenis' }, ...KATEGORI.map((k) => ({ id: String(k.id), nama: k.nama }))];

export default function LaporanTerbaru({ per, sekarang }: { per: Record<string, TitikLaporan[]>; sekarang: number }) {
  const [aktif, setAktif] = useState('semua');
  const daftar = per[aktif] ?? [];

  return (
    <div>
      <KelompokCair role="tablist" aria-label="Jenis masalah" className="flex flex-wrap gap-2">
        {TAB.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-terbaru-${t.id}`}
            aria-selected={t.id === aktif}
            aria-controls="panel-terbaru"
            onClick={() => setAktif(t.id)}
            className="chip"
          >
            {t.nama}
          </button>
        ))}
      </KelompokCair>

      <div id="panel-terbaru" role="tabpanel" aria-labelledby={`tab-terbaru-${aktif}`} className="mt-4">
        {daftar.length === 0 ? (
          <div className="kartu p-5">
            <p className="text-badan text-lembut">
              {aktif === 'semua' ? 'Belum ada laporan yang masuk.' : 'Belum ada laporan untuk jenis masalah ini.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/peta" className={kelasTombol('garis', 'min-h-11')}>
                Lihat semua laporan
              </Link>
              <Link href="/lapor" className={kelasTombol('utama', 'min-h-11')}>
                <Ikon nama="tambah" className="size-4" />
                Laporkan masalah
              </Link>
            </div>
          </div>
        ) : (
          <ul key={aktif} className="ganti grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {daftar.map((l) => (
              <li key={l.kode}>
                <KartuLaporan laporan={l} sekarang={sekarang} />
              </li>
            ))}
          </ul>
        )}
        {daftar.length > 0 && (
        <div className="mt-5 flex justify-center">
          <Link
            href={aktif === 'semua' ? '/peta' : `/peta?kategori=${aktif}`}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-kontrol border border-garis-isian bg-permukaan px-5 text-badan font-semibold transition-colors hover:border-biru hover:text-biru-tua"
          >
            Lihat semua laporan di peta
            <Ikon nama="kanan" className="panah size-4" />
          </Link>
        </div>
        )}
      </div>
    </div>
  );
}
