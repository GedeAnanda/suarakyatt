'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatPoin } from '@/lib/scoring';
import PetaKecamatan from '../PetaKecamatan';

export interface IsuTeratas {
  kode_wilayah: string; kecamatan: string; kota: string; kategori: string; skor: number; peringkat: number;
}

export default function SorotKecamatan({ teratas, skorPerKecamatan }: { teratas: IsuTeratas[]; skorPerKecamatan: Record<string, number> }) {
  const [indeks, setIndeks] = useState(0);
  const nyala = teratas[indeks];
  return (
    <div className="grid items-center gap-8 lg:grid-cols-12">
      <div className="lg:col-span-5" data-ui>
        <p className="text-badan text-medan-lembut">Lima wilayah dengan skor tertinggi</p>
        <div className="mt-4 grid gap-2" role="group" aria-label="Pilih wilayah untuk disorot">
          {teratas.map((t, i) => (
            <button key={t.kode_wilayah} type="button" aria-pressed={i === indeks} onClick={() => setIndeks(i)} className="flex min-h-14 items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-tinta-tua aria-pressed:bg-medan-tinta aria-pressed:text-tinta">
              <span><span className="block text-badan font-semibold">{t.kecamatan}</span><span className="block text-kecil opacity-85">{t.kategori}</span></span>
              <span className="angka text-lead">{formatPoin(t.skor)}</span>
            </button>
          ))}
        </div>
        <Link href="/prioritas" className="mt-4 inline-flex min-h-11 items-center text-badan underline underline-offset-4">Jelajahi seluruh 42 kecamatan</Link>
      </div>
      <div className="lg:col-span-6 lg:col-start-7"><PetaKecamatan skor={skorPerKecamatan} sorot={nyala?.kode_wilayah} judul="Peta skor prioritas di 42 kecamatan DKI Jakarta daratan" /></div>
    </div>
  );
}
