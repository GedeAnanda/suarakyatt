// components/laporan/PanelKenapaBelum.tsx — tombol "Kenapa belum?" (FR-C1, PRD 9), pemilik: A
// Menerjemahkan skor prioritas ke bahasa satu laporan. Angkanya dihitung di server dengan
// lib/scoring yang sama dengan halaman Urutan prioritas; komponen ini hanya membuka-tutup panelnya.
// Bahasa warga (audit 10 Nov, W4/W5/W10–W14): "masalah", "urutan ke-N", poin selalu dengan batasnya.

'use client';

import Link from 'next/link';
import { useState, useSyncExternalStore } from 'react';
import { ARAH_URUTAN } from '@/lib/kamus';
import { NAMA_FAKTOR } from '@/lib/konten';
import { formatPoin, PENAHAN_FAKTOR } from '@/lib/scoring';
import type { KenapaBelum } from '@/lib/types';
import Ikon from '../ui/Ikon';
import { kelasTautan } from '../ui/Tombol';

export default function PanelKenapaBelum({
  data,
  isu,
  idIsu,
  kodeKecamatan,
  bukaAwal = false,
}: {
  data: KenapaBelum | null;
  isu: { kategori: string; kecamatan: string };
  idIsu: string | null;
  /** kode_wilayah untuk tautan ke halaman Kecamatan. */
  kodeKecamatan?: string;
  /** Terbuka sejak awal, misalnya untuk laporan yang sudah lewat batas waktu. */
  bukaAwal?: boolean;
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
  const buka = pilihan ?? (dariTautan || bukaAwal);

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
            {buka ? 'Tutup penjelasan' : 'Lihat seberapa didahulukan masalah ini dan apa yang menahannya'}
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
                Laporan {isu.kategori.toLowerCase()} di {isu.kecamatan} belum masuk daftar urutan prioritas. Daftar hanya
                memuat masalah yang punya laporan sudah diperiksa atau sedang menunggu; urutannya muncul setelah pembaruan
                berikutnya.
              </p>
            ) : (
              <div className="grid gap-5" data-susul>
                <p className="text-lead">
                  Semua laporan {isu.kategori.toLowerCase()} di Kecamatan {isu.kecamatan} dihitung sebagai satu masalah. Dari{' '}
                  {data.total} masalah di Jakarta, masalah ini ada di{' '}
                  <strong className="rounded-[0.375rem] bg-biru-muda px-1.5 font-bold text-biru-tua">urutan ke-{data.peringkat}</strong>.
                  <span className="mt-1 block text-kecil text-lembut">({ARAH_URUTAN}.) Urutan ini bukan janji tanggal perbaikan.</span>
                </p>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-kontrol bg-hijau-muda p-4">
                    <dt className="flex items-center gap-1.5 text-kecil font-semibold text-hijau">
                      <Ikon nama="naik" className="size-4" /> Paling menaikkan
                    </dt>
                    <dd className="mt-1 text-lead font-bold">{NAMA_FAKTOR[data.pendorong.faktor]}</dd>
                    <dd className="angka text-kecil">
                      menyumbang {formatPoin(data.pendorong.poin)} dari {formatPoin(data.pendorong.maksimal)} poin
                    </dd>
                  </div>
                  <div className="rounded-kontrol bg-merah-muda p-4">
                    <dt className="flex items-center gap-1.5 text-kecil font-semibold text-merah-tua">
                      <Ikon nama="turun" className="size-4" /> Paling menahan
                    </dt>
                    <dd className="mt-1 text-lead font-bold">{NAMA_FAKTOR[data.penahan.faktor]}</dd>
                    <dd className="angka text-kecil">
                      baru {formatPoin(data.penahan.poin)} dari {formatPoin(data.penahan.maksimal)} poin:{' '}
                      {PENAHAN_FAKTOR[data.penahan.faktor]}
                    </dd>
                  </div>
                </dl>
                <div>
                  <p className="text-kecil font-bold">Urutannya bisa berubah, tergantung apa yang diutamakan:</p>
                  <ul className="mt-2 overflow-hidden rounded-kontrol border border-garis">
                    {data.per_preset.map((p) => {
                      const geser = data.peringkat - p.peringkat;
                      return (
                        <li key={p.preset} className="flex items-baseline justify-between gap-4 border-b border-garis px-4 py-2.5 text-kecil last:border-b-0">
                          <span>{p.preset}</span>
                          <span className="angka font-bold whitespace-nowrap">
                            urutan ke-{p.peringkat}
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
                <p className="text-kecil text-lembut">
                  Bagian ini dihitung SUARAKYAT dari data. Alasan dari dinas sendiri ada di{' '}
                  <a href="#judul-riwayat" className={kelasTautan}>
                    riwayat penanganan
                  </a>
                  .
                </p>
                <p className="flex flex-wrap gap-x-5 gap-y-2 text-kecil">
                  <Link href={`/prioritas${idIsu ? `?isu=${encodeURIComponent(idIsu)}` : ''}#cara-hitung`} className={kelasTautan}>
                    Lihat cara urutan ini dihitung
                  </Link>
                  {kodeKecamatan && (
                    <Link href={`/kecamatan/${kodeKecamatan}`} className={kelasTautan}>
                      Bandingkan dengan masalah lain di {isu.kecamatan}
                    </Link>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
