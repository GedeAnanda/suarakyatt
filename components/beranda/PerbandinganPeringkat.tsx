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
import { kelasTautan } from '../ui/Tombol';

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
    <section aria-labelledby="judul-dua-urutan" className="overflow-hidden bg-permukaan">
      <div className="bingkai pt-24 sm:pt-32" data-muncul>
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 id="judul-dua-urutan" className="text-judul lg:col-span-5">
            Satu isu, dua urutan
          </h2>
          <p className="max-w-[60ch] text-badan lg:col-span-6 lg:col-start-7">
            Isu {target.kategori.toLowerCase()} di Kecamatan {target.kecamatan} ada di peringkat {jelas.peringkat} dari{' '}
            {jelas.total} isu wilayah dengan bobot resmi. Pendorong terbesarnya {NAMA_FAKTOR[jelas.pendorong.faktor].toLowerCase()}{' '}
            ({formatPoin(jelas.pendorong.poin)} poin), penahan terbesarnya {NAMA_FAKTOR[jelas.penahan.faktor].toLowerCase()}{' '}
            ({formatPoin(jelas.penahan.poin)} dari {formatPoin(jelas.penahan.maksimal)} poin). Bobot bukan kebenaran; bobot
            adalah pilihan. Coba pilihan lain.
          </p>
        </div>

        <fieldset className="mt-12 lg:mt-16">
          <legend className="text-kecil">Bobot yang dibandingkan dengan bobot resmi</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {URUTAN_PRESET.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={preset === p}
                onClick={() => setPreset(p)}
                className="min-h-11 rounded-full bg-lapis px-5 py-2 text-badan font-medium transition-[background-color,color,scale] duration-200 hover:bg-lapis-2 active:scale-95 aria-pressed:bg-tinta aria-pressed:text-kertas"
              >
                {LABEL_PRESET[p]}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="bingkai mt-14 grid gap-0 sm:mt-20 sm:grid-cols-2 sm:gap-8">
        <figure className="relative">
          <figcaption className="text-lead leading-tight font-semibold tracking-tight">Bobot resmi</figcaption>
          <p aria-hidden="true" className="text-tinta angka mt-3 text-[24.8vw] leading-[0.8] font-medium tracking-[-0.06em] sm:text-[clamp(4.4rem,13.6vw,12.8rem)]">
            <AngkaGulir nilai={String(jelas.peringkat)} minDigit={digitTotal} />
          </p>
          {/* Keterangan di bawah angka, bukan di atasnya: angka besar dibaca dulu, lalu artinya. */}
          <p className="mt-3 text-kecil text-lembut">
            Peringkat {jelas.peringkat} dari {jelas.total}
          </p>
        </figure>
        <figure className="di-medan relative -mx-[var(--tepi)] bg-medan px-[var(--tepi)] pt-4 pb-6 text-medan-tinta sm:mx-0 sm:bg-transparent sm:px-0 sm:pt-0 sm:pb-0 sm:text-tinta">
          <figcaption className="text-lead leading-tight font-semibold tracking-tight">{LABEL_PRESET[preset]}</figcaption>
          {/* Digit bergulir dari peringkat lama ke yang baru setiap preset diganti. */}
          <p
            aria-hidden="true"
            className="angka mt-3 text-[24.8vw] leading-[0.8] font-medium tracking-[-0.06em] sm:text-[clamp(4.4rem,13.6vw,12.8rem)]"
          >
            <AngkaGulir nilai={String(simulasi.peringkat)} minDigit={digitTotal} />
          </p>
          <p className="mt-3 flex items-center gap-1 text-kecil opacity-80" aria-live="polite">
            {geser !== 0 && <Ikon nama={geser > 0 ? 'naik' : 'turun'} className="size-3.5" />}
            Peringkat {simulasi.peringkat} dari {jelas.total}
            {geser > 0 ? `, naik ${geser}` : geser < 0 ? `, turun ${-geser}` : ', tidak bergeser'}
          </p>
        </figure>
      </div>

      {/* Jalur peringkat 1 sampai N: dua penanda bergeser, ruas di antaranya menunjukkan jarak pergeseran. */}
      <div className="bingkai mt-10 sm:mt-14" aria-hidden="true">
        <div className="relative h-2 rounded-full bg-lapis-2">
          <div
            className="geser-halus absolute inset-y-0 rounded-full bg-tinta"
            style={{
              left: `${Math.min(posisi(jelas.peringkat), posisi(simulasi.peringkat))}%`,
              width: `${Math.abs(posisi(jelas.peringkat) - posisi(simulasi.peringkat))}%`,
            }}
          />
          <span
            className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-3 border-tinta bg-permukaan"
            style={{ left: `${posisi(jelas.peringkat)}%` }}
          />
          <span
            className="geser-halus absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tinta"
            style={{ left: `${posisi(simulasi.peringkat)}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap justify-between gap-x-6 gap-y-1 text-kecil text-lembut">
          <span>Peringkat 1, paling didahulukan</span>
          <span className="flex flex-wrap gap-x-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-3 rounded-full border-2 border-tinta" /> bobot resmi
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-3 rounded-full bg-tinta" /> {LABEL_PRESET[preset].toLowerCase()}
            </span>
          </span>
          <span className="angka">{jelas.total}</span>
        </div>
      </div>

      <div className="bingkai flex flex-wrap gap-x-8 gap-y-3 pt-6 pb-20 text-badan sm:pb-28">
        <Link href={`/prioritas?isu=${encodeURIComponent(idIsu)}`} className={kelasTautan}>
          Geser sendiri keenam bobotnya
        </Link>
        {kodeLaporan && (
          <Link href={`/laporan/${kodeLaporan}#kenapa-belum`} className={kelasTautan}>
            Buka laporan {kodeLaporan} dan tekan &ldquo;Kenapa belum?&rdquo;
          </Link>
        )}
      </div>
    </section>
  );
}
