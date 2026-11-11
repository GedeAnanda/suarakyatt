// components/beranda/PerbandinganPeringkat.tsx — urutan bisa berubah, tergantung apa yang diutamakan (pemilik: A)
// Hal yang bisa dicoba di Beranda: pilih aturan lain, urutan masalah yang sama berubah di depan mata.
// Dihitung di browser dengan lib/scoring, sama seperti di halaman Urutan prioritas.

'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatPoin, hitungSkor, kenapaBelum, LABEL_FAKTOR, LABEL_PRESET, PENAHAN_FAKTOR, PRESET, type NamaPreset } from '@/lib/scoring';
import type { Bobot, FaktorIsu } from '@/lib/types';
import AngkaGulir from '../ui/AngkaGulir';
import Ikon from '../ui/Ikon';
import KelompokCair from '../ui/KelompokCair';

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
  // Letak urutan di jalur 1..N, dalam persen.
  const posisi = (p: number) => (jelas.total > 1 ? ((p - 1) / (jelas.total - 1)) * 100 : 0);

  return (
    <section aria-labelledby="judul-dua-urutan" className="bingkai mt-12 sm:mt-14">
      <div className="kartu muncul p-5 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-12">
          <div>
            <h2 id="judul-dua-urutan" className="judul-seksi">
              Urutan bisa berubah, tergantung apa yang diutamakan
            </h2>
            <div className="mt-3 grid gap-2 text-badan text-lembut">
              <p>
                <strong className="font-bold text-teks">
                  {target.kategori} di Kecamatan {target.kecamatan}
                </strong>{' '}
                sekarang di urutan ke-{jelas.peringkat} dari {jelas.total} masalah.
              </p>
              <p>
                Paling menaikkan: {LABEL_FAKTOR[jelas.pendorong.faktor]} ({formatPoin(jelas.pendorong.poin)} poin). Paling
                menahan: {PENAHAN_FAKTOR[jelas.penahan.faktor]} (baru {formatPoin(jelas.penahan.poin)} dari{' '}
                {formatPoin(jelas.penahan.maksimal)} poin yang mungkin).
              </p>
              <p>Urutan ini tergantung apa yang diutamakan. Coba ganti di bawah.</p>
            </div>
            <fieldset className="mt-6">
              <legend className="text-badan font-semibold">Bandingkan dengan aturan lain:</legend>
              <KelompokCair className="mt-2 flex flex-wrap gap-2">
                {URUTAN_PRESET.map((p) => (
                  <button key={p} type="button" aria-pressed={preset === p} onClick={() => setPreset(p)} className="chip">
                    {LABEL_PRESET[p]}
                  </button>
                ))}
              </KelompokCair>
            </fieldset>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-3">
              <figure className="rounded-kartu bg-latar p-4 sm:p-6">
                <figcaption className="text-kecil font-semibold text-lembut">Urutan dengan aturan resmi</figcaption>
                <p aria-hidden="true" className="angka mt-2 text-[clamp(3.5rem,2rem+6vw,6.5rem)] leading-none font-bold tracking-[-0.04em]">
                  <AngkaGulir nilai={String(jelas.peringkat)} minDigit={digitTotal} />
                </p>
                <p className="mt-3 text-kecil">
                  Urutan ke-{jelas.peringkat} dari {jelas.total} masalah
                </p>
              </figure>
              <figure className="di-gelap rounded-kartu bg-biru p-4 text-white sm:p-6">
                <figcaption className="text-kecil font-semibold text-white/90">{LABEL_PRESET[preset]}</figcaption>
                {/* Digit bergulir dari urutan lama ke yang baru setiap pilihan diganti. */}
                <p aria-hidden="true" className="angka mt-2 text-[clamp(3.5rem,2rem+6vw,6.5rem)] leading-none font-bold tracking-[-0.04em]">
                  <AngkaGulir nilai={String(simulasi.peringkat)} minDigit={digitTotal} />
                </p>
                <p className="mt-3 flex items-center gap-1 text-kecil" aria-live="polite">
                  {geser !== 0 && <Ikon nama={geser > 0 ? 'naik' : 'turun'} className="size-4" />}
                  Urutan ke-{simulasi.peringkat} dari {jelas.total}
                  {geser > 0 ? `, naik ${geser}` : geser < 0 ? `, turun ${-geser}` : ', tidak berubah'}
                </p>
              </figure>
            </div>

            {/* Jalur urutan 1 sampai N: dua penanda bergeser, ruas di antaranya menunjukkan jarak pergeseran. */}
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
              <div className="mt-3 flex flex-wrap justify-between gap-x-6 gap-y-1 text-kecil text-lembut">
                <span>1, paling didahulukan</span>
                <span className="flex flex-wrap gap-x-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block size-3 rounded-full border-2 border-navy" /> aturan resmi
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block size-3 rounded-full bg-biru" /> {LABEL_PRESET[preset].toLowerCase()}
                  </span>
                </span>
                <span>
                  <span className="angka">{jelas.total}</span>, paling akhir
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-8 border-t border-garis pt-3 text-kecil">
          <Link
            href={`/prioritas?isu=${encodeURIComponent(idIsu)}`}
            className="inline-flex min-h-11 items-center gap-1 font-bold text-biru-tua hover:underline"
          >
            Atur sendiri apa yang diutamakan
            <Ikon nama="kanan" className="panah size-4" />
          </Link>
          <Link href="/prioritas#cara-hitung" className="inline-flex min-h-11 items-center gap-1 font-bold text-biru-tua hover:underline">
            Bagaimana urutan ini dihitung?
            <Ikon nama="kanan" className="panah size-4" />
          </Link>
          {kodeLaporan && (
            <Link
              href={`/laporan/${kodeLaporan}#kenapa-belum`}
              className="inline-flex min-h-11 items-center gap-1 font-bold text-biru-tua hover:underline"
            >
              Buka laporan {kodeLaporan} dan tekan &ldquo;Kenapa belum?&rdquo;
              <Ikon nama="kanan" className="panah size-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
