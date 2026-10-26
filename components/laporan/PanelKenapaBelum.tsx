// components/laporan/PanelKenapaBelum.tsx — tombol "Kenapa belum?" (FR-C1, PRD 9), pemilik: A
// Menerjemahkan skor prioritas ke bahasa satu laporan. Angkanya dihitung di server dengan
// lib/scoring yang sama dengan dashboard dan simulator; komponen ini hanya membuka-tutup panelnya.

'use client';

import Link from 'next/link';
import { useState, useSyncExternalStore } from 'react';
import { NAMA_FAKTOR } from '@/lib/konten';
import { formatPoin } from '@/lib/scoring';
import type { KenapaBelum } from '@/lib/types';
import Ikon from '../ui/Ikon';
import { kelasTautan } from '../ui/Tombol';

export default function PanelKenapaBelum({
  data,
  isu,
  idIsu,
}: {
  data: KenapaBelum | null;
  isu: { kategori: string; kecamatan: string };
  idIsu: string | null;
}) {
  // Tautan ke #kenapa-belum (misalnya dari Beranda) langsung membuka panel.
  const dariTautan = useSyncExternalStore(
    (ubah) => {
      window.addEventListener('hashchange', ubah);
      return () => window.removeEventListener('hashchange', ubah);
    },
    () => window.location.hash === '#kenapa-belum',
    () => false,
  );
  const [pilihan, setBuka] = useState<boolean | null>(null);
  const buka = pilihan ?? dariTautan;

  return (
    <section id="kenapa-belum" aria-labelledby="judul-kenapa-belum" className="scroll-mt-6">
      <h2 id="judul-kenapa-belum" className="sr-only">
        Kenapa belum ditangani
      </h2>
      <button
        type="button"
        aria-expanded={buka}
        aria-controls="isi-kenapa-belum"
        onClick={() => setBuka(!buka)}
        className="flex w-full items-center justify-between gap-4 bg-tinta px-5 py-4 text-left text-kertas hover:bg-tinta-tua active:translate-y-px sm:px-6"
      >
        <span>
          <span className="block text-[clamp(1.75rem,1.2rem+2.4vw,3rem)] leading-none font-semibold tracking-[-0.04em]">
            Kenapa belum?
          </span>
          <span className="mt-2 block text-kecil text-medan-lembut">
            {buka ? 'Tutup penjelasan' : 'Lihat posisi isu ini di daftar prioritas dan apa yang menahannya'}
          </span>
        </span>
        <Ikon nama="turun" className={`size-7 shrink-0 transition-transform duration-300 ${buka ? 'rotate-180' : ''}`} />
      </button>

      <div className="lipat" data-buka={buka}>
        <div id="isi-kenapa-belum" inert={!buka}>
          <div className="bg-lapis p-5 sm:p-6">
            {!data ? (
              <p className="text-badan">
                Isu {isu.kategori.toLowerCase()} di {isu.kecamatan} belum masuk daftar prioritas. Daftar hanya memuat isu wilayah
                yang punya laporan aktif; peringkatnya muncul setelah data prioritas diperbarui.
              </p>
            ) : (
              <div className="grid gap-6">
                <p className="text-pernyataan tracking-[-0.02em]">
                  Isu {isu.kategori.toLowerCase()} di Kecamatan {isu.kecamatan} berada di{' '}
                  <strong className="font-semibold">
                    peringkat {data.peringkat} dari {data.total}
                  </strong>{' '}
                  isu wilayah yang dinilai.
                </p>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-terang p-4">
                    <dt className="flex items-center gap-2 text-kecil">
                      <Ikon nama="naik" className="size-4" /> Pendorong terbesar
                    </dt>
                    <dd className="mt-1 text-lead font-medium tracking-tight">{NAMA_FAKTOR[data.pendorong.faktor]}</dd>
                    <dd className="angka text-badan">{formatPoin(data.pendorong.poin)} poin</dd>
                  </div>
                  <div className="bg-terang p-4">
                    <dt className="flex items-center gap-2 text-kecil">
                      <Ikon nama="turun" className="size-4" /> Penahan terbesar
                    </dt>
                    <dd className="mt-1 text-lead font-medium tracking-tight">{NAMA_FAKTOR[data.penahan.faktor]}</dd>
                    <dd className="angka text-badan">
                      {formatPoin(data.penahan.poin)} dari {formatPoin(data.penahan.maksimal)} poin
                    </dd>
                  </div>
                </dl>
                <div>
                  <p className="text-badan font-medium">Kalau bobotnya diganti</p>
                  <ul className="mt-2 grid gap-1">
                    {data.per_preset.map((p) => {
                      const geser = data.peringkat - p.peringkat;
                      return (
                        <li key={p.preset} className="flex items-baseline justify-between gap-4 bg-terang px-4 py-2.5 text-badan">
                          <span>{p.preset}</span>
                          <span className="angka font-semibold">
                            peringkat {p.peringkat}
                            <span className="ml-2 text-kecil font-normal text-lembut">
                              {geser > 0 ? `naik ${geser}` : geser < 0 ? `turun ${-geser}` : 'tetap'}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {data.catatan && <p className="bg-terang p-4 text-badan">{data.catatan}</p>}
                <p className="text-badan">
                  <Link href={`/prioritas${idIsu ? `?isu=${encodeURIComponent(idIsu)}` : ''}`} className={kelasTautan}>
                    Lihat rincian skornya dan uji bobot lain
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
