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
    <section id="kenapa-belum" aria-labelledby="judul-kenapa-belum" className="kartu scroll-mt-24 overflow-hidden">
      <h2 id="judul-kenapa-belum" className="sr-only">
        Kenapa belum ditangani
      </h2>
      <button
        type="button"
        aria-expanded={buka}
        aria-controls="isi-kenapa-belum"
        onClick={() => setBuka(!buka)}
        className="flex w-full items-center justify-between gap-4 bg-biru px-5 py-4 text-left text-white transition-colors hover:bg-biru-tua focus-visible:outline-white focus-visible:-outline-offset-4"
      >
        <span>
          <span className="block text-[clamp(1.5rem,1.2rem+1.4vw,2.25rem)] leading-none font-bold tracking-[-0.02em]">
            Kenapa belum?
          </span>
          <span className="mt-1.5 block text-kecil text-white">
            {buka ? 'Tutup penjelasan' : 'Lihat posisi isu ini di daftar prioritas dan apa yang menahannya'}
          </span>
        </span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15">
          <Ikon nama="turun" className={`size-6 transition-transform duration-300 ${buka ? 'rotate-180' : ''}`} />
        </span>
      </button>

      <div className="lipat" data-buka={buka}>
        <div id="isi-kenapa-belum" inert={!buka}>
          <div className="p-5">
            {!data ? (
              <p className="text-badan">
                Isu {isu.kategori.toLowerCase()} di {isu.kecamatan} belum masuk daftar prioritas. Daftar hanya memuat isu wilayah
                yang punya laporan aktif; peringkatnya muncul setelah data prioritas diperbarui.
              </p>
            ) : (
              <div className="grid gap-5" data-susul>
                <p className="text-kecil text-lembut">
                  Ini penjelasan posisi menurut model prioritas suaRAkyat. Alasan dan kendala penanganan dari instansi dicatat
                  terpisah di{' '}
                  <a href="#judul-riwayat" className={kelasTautan}>
                    riwayat penanganan
                  </a>
                  . Peringkat tidak menjanjikan tanggal perbaikan.
                </p>
                <p className="text-lead">
                  Isu {isu.kategori.toLowerCase()} di Kecamatan {isu.kecamatan} berada di{' '}
                  <strong className="rounded-[0.375rem] bg-biru-muda px-1.5 font-bold text-biru-tua">
                    peringkat {data.peringkat} dari {data.total}
                  </strong>{' '}
                  isu wilayah yang dinilai.
                </p>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-kontrol bg-hijau-muda p-4">
                    <dt className="flex items-center gap-1.5 text-kecil font-semibold text-hijau">
                      <Ikon nama="naik" className="size-4" /> Pendorong terbesar
                    </dt>
                    <dd className="mt-1 text-lead font-bold">{NAMA_FAKTOR[data.pendorong.faktor]}</dd>
                    <dd className="angka text-kecil">{formatPoin(data.pendorong.poin)} poin</dd>
                  </div>
                  <div className="rounded-kontrol bg-merah-muda p-4">
                    <dt className="flex items-center gap-1.5 text-kecil font-semibold text-merah-tua">
                      <Ikon nama="turun" className="size-4" /> Penahan terbesar
                    </dt>
                    <dd className="mt-1 text-lead font-bold">{NAMA_FAKTOR[data.penahan.faktor]}</dd>
                    <dd className="angka text-kecil">
                      {formatPoin(data.penahan.poin)} dari {formatPoin(data.penahan.maksimal)} poin
                    </dd>
                  </div>
                </dl>
                <div>
                  <p className="text-kecil font-bold">Kalau bobotnya diganti</p>
                  <ul className="mt-2 overflow-hidden rounded-kontrol border border-garis">
                    {data.per_preset.map((p) => {
                      const geser = data.peringkat - p.peringkat;
                      return (
                        <li key={p.preset} className="flex items-baseline justify-between gap-4 border-b border-garis px-4 py-2.5 text-kecil last:border-b-0">
                          <span>{p.preset}</span>
                          <span className="angka font-bold">
                            peringkat {p.peringkat}
                            <span
                              className={`ml-2 font-semibold ${geser > 0 ? 'text-hijau' : geser < 0 ? 'text-merah-tua' : 'text-lembut'}`}
                            >
                              {geser > 0 ? `naik ${geser}` : geser < 0 ? `turun ${-geser}` : 'tetap'}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {data.catatan && <p className="rounded-kontrol bg-latar p-4 text-kecil">{data.catatan}</p>}
                <p className="text-kecil">
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
