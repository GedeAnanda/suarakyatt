// components/beranda/PerbandinganPeringkat.tsx — satu isu, dua urutan (pemilik: A)
// Hal yang bisa dicoba di Beranda: pilih bobot lain, peringkat isu yang sama berubah di depan mata.
// Dihitung di browser dengan lib/scoring, sama seperti simulator di Dashboard Prioritas.

'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { NAMA_FAKTOR } from '@/lib/konten';
import { formatPoin, hitungSkor, kenapaBelum, LABEL_PRESET, PRESET, type NamaPreset } from '@/lib/scoring';
import type { Bobot, FaktorIsu } from '@/lib/types';
import AngkaGulir from '../ui/AngkaGulir';
import Ikon from '../ui/Ikon';

const URUTAN_PRESET: NamaPreset[] = ['keselamatan', 'kerentanan', 'suara_warga'];

export default function PerbandinganPeringkat({
  isu,
  bobotResmi,
  idIsu,
  kodeLaporan,
}: {
  isu: FaktorIsu[];
  bobotResmi: Bobot;
  idIsu: string;
  kodeLaporan: string | null;
}) {
  const [preset, setPreset] = useState<NamaPreset>('keselamatan');
  const jelas = useMemo(() => kenapaBelum(idIsu, isu, bobotResmi, 'diverifikasi'), [idIsu, isu, bobotResmi]);
  const target = isu.find((i) => i.id === idIsu)!;
  const simulasi = useMemo(() => hitungSkor(isu, PRESET[preset]).find((s) => s.id === idIsu)!, [isu, preset, idIsu]);
  const geser = jelas.peringkat - simulasi.peringkat;
  const digitTotal = String(jelas.total).length;
  // Posisi peringkat di jalur 1..N, dalam persen.
  const posisi = (p: number) => (jelas.total > 1 ? ((p - 1) / (jelas.total - 1)) * 100 : 0);

  return (
    <section aria-labelledby="judul-dua-urutan" className="bingkai mt-12 sm:mt-14">
      <div className="kartu p-5 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-12">
          <div>
            <h2 id="judul-dua-urutan" className="judul-seksi">
              Satu isu, dua urutan
            </h2>
            <p className="mt-3 text-badan text-lembut">
              Isu {target.kategori.toLowerCase()} di Kecamatan {target.kecamatan} ada di peringkat {jelas.peringkat} dari{' '}
              {jelas.total} isu wilayah dengan bobot resmi. Pendorong terbesarnya{' '}
              {NAMA_FAKTOR[jelas.pendorong.faktor].toLowerCase()} ({formatPoin(jelas.pendorong.poin)} poin), penahan
              terbesarnya {NAMA_FAKTOR[jelas.penahan.faktor].toLowerCase()} ({formatPoin(jelas.penahan.poin)} dari{' '}
              {formatPoin(jelas.penahan.maksimal)} poin). Bobot bukan kebenaran; bobot adalah pilihan. Coba pilihan lain.
            </p>
            <fieldset className="mt-6">
              <legend className="text-kecil font-semibold">Bandingkan bobot resmi dengan</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {URUTAN_PRESET.map((p) => (
                  <button key={p} type="button" aria-pressed={preset === p} onClick={() => setPreset(p)} className="chip">
                    {LABEL_PRESET[p]}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-3">
              <figure className="rounded-kartu bg-latar p-4 sm:p-6">
                <figcaption className="text-kecil font-semibold text-lembut">Bobot resmi</figcaption>
                <p aria-hidden="true" className="angka mt-2 text-[clamp(3.5rem,2rem+6vw,6.5rem)] leading-none font-bold tracking-[-0.04em]">
                  <AngkaGulir nilai={String(jelas.peringkat)} minDigit={digitTotal} />
                </p>
                <p className="mt-3 text-kecil">
                  Peringkat {jelas.peringkat} dari {jelas.total}
                </p>
              </figure>
              <figure className="di-gelap rounded-kartu bg-biru p-4 text-white sm:p-6">
                <figcaption className="text-kecil font-semibold text-white/90">{LABEL_PRESET[preset]}</figcaption>
                {/* Digit bergulir dari peringkat lama ke yang baru setiap preset diganti. */}
                <p aria-hidden="true" className="angka mt-2 text-[clamp(3.5rem,2rem+6vw,6.5rem)] leading-none font-bold tracking-[-0.04em]">
                  <AngkaGulir nilai={String(simulasi.peringkat)} minDigit={digitTotal} />
                </p>
                <p className="mt-3 flex items-center gap-1 text-kecil" aria-live="polite">
                  {geser !== 0 && <Ikon nama={geser > 0 ? 'naik' : 'turun'} className="size-4" />}
                  Peringkat {simulasi.peringkat} dari {jelas.total}
                  {geser > 0 ? `, naik ${geser}` : geser < 0 ? `, turun ${-geser}` : ', tidak bergeser'}
                </p>
              </figure>
            </div>

            {/* Jalur peringkat 1 sampai N: dua penanda bergeser, ruas di antaranya menunjukkan jarak pergeseran. */}
            <div className="mt-6" aria-hidden="true">
              <div className="relative h-2 rounded-full bg-lapis-2">
                <div
                  className="geser-halus absolute inset-y-0 rounded-full bg-biru"
                  style={{
                    left: `${Math.min(posisi(jelas.peringkat), posisi(simulasi.peringkat))}%`,
                    width: `${Math.abs(posisi(jelas.peringkat) - posisi(simulasi.peringkat))}%`,
                  }}
                />
                <span
                  className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-3 border-navy bg-permukaan"
                  style={{ left: `${posisi(jelas.peringkat)}%` }}
                />
                <span
                  className="geser-halus absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-3 border-permukaan bg-biru shadow-kartu"
                  style={{ left: `${posisi(simulasi.peringkat)}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap justify-between gap-x-6 gap-y-1 text-mini text-lembut sm:text-kecil">
                <span>Peringkat 1, paling didahulukan</span>
                <span className="flex flex-wrap gap-x-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block size-3 rounded-full border-2 border-navy" /> bobot resmi
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block size-3 rounded-full bg-biru" /> {LABEL_PRESET[preset].toLowerCase()}
                  </span>
                </span>
                <span className="angka">{jelas.total}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 border-t border-garis pt-5 text-kecil">
          <Link
            href={`/prioritas?isu=${encodeURIComponent(idIsu)}`}
            className="inline-flex items-center gap-1 font-bold text-biru-tua hover:underline"
          >
            Geser sendiri keenam bobotnya
            <Ikon nama="kanan" className="size-4" />
          </Link>
          {kodeLaporan && (
            <Link
              href={`/laporan/${kodeLaporan}#kenapa-belum`}
              className="inline-flex items-center gap-1 font-bold text-biru-tua hover:underline"
            >
              Buka laporan {kodeLaporan} dan tekan &ldquo;Kenapa belum?&rdquo;
              <Ikon nama="kanan" className="size-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
