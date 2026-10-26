// components/prioritas/Simulator.tsx — Dashboard Prioritas + simulator bobot publik (FR-F2–F4, PRD 9), pemilik: A
// Semua skor dihitung di browser dengan lib/scoring dari hasil priority_factors, jadi slider
// langsung mengubah peringkat tanpa ke server dan tanpa menyimpan apa pun (SDD 2.1, 8.3).
// Perencana bisa menyimpan bobot sebagai bobot resmi, wajib dengan alasan (R10 save_weights).

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { pesanError } from '@/lib/errors';
import { DEFINISI_FAKTOR, KATEGORI, NAMA_FAKTOR } from '@/lib/konten';
import {
  FAKTOR,
  formatPoin,
  hitungSkor,
  kalimatKonsekuensi,
  LABEL_PRESET,
  normalisasiBobot,
  PRESET,
  selisihPeringkat,
  type NamaPreset,
} from '@/lib/scoring';
import { createClient } from '@/lib/supabase/client';
import type { Bobot, Faktor, FaktorIsu } from '@/lib/types';
import PetaKecamatan, { KeteranganKelas } from '../PetaKecamatan';
import Ikon from '../ui/Ikon';
import { Tombol } from '../ui/Tombol';
import BarKontribusi, { BarTumpuk, KeteranganFaktor, WARNA_FAKTOR } from './BarKontribusi';

type Slider = Record<Faktor, number>;

const keSlider = (b: Bobot): Slider => Object.fromEntries(FAKTOR.map((f) => [f, Math.round(b[f] * 100)])) as Slider;
const sama = (a: Bobot, b: Bobot) => FAKTOR.every((f) => Math.abs(a[f] - b[f]) < 0.0005);
const persenBobot = (x: number) => `${Math.round(x * 100)}%`;
const JUMLAH_AWAL = 15;

function TandaGeser({ n }: { n: number | undefined }) {
  if (n === undefined || n === 0) return <span className="text-kecil text-lembut">tetap</span>;
  return (
    <span className={`angka inline-flex items-center text-kecil font-semibold ${n > 0 ? 'text-st-selesai' : 'text-tinta'}`}>
      <Ikon nama={n > 0 ? 'naik' : 'turun'} className="size-3.5" />
      {Math.abs(n)}
      <span className="sr-only">{n > 0 ? ' posisi naik' : ' posisi turun'} dibanding peringkat resmi</span>
    </span>
  );
}

export default function Simulator({
  isu,
  bobotResmi,
  perencana,
}: {
  isu: FaktorIsu[];
  bobotResmi: Bobot;
  perencana: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [slider, setSlider] = useState<Slider>(() => keSlider(bobotResmi));
  const [kategori, setKategori] = useState<number | null>(null);
  const [pilihId, setPilihId] = useState<string | null>(() => params.get('isu'));
  const [semua, setSemua] = useState(false);

  const totalSlider = FAKTOR.reduce((s, f) => s + slider[f], 0);
  const bobot = useMemo(() => (totalSlider > 0 ? normalisasiBobot(slider) : bobotResmi), [slider, totalSlider, bobotResmi]);
  const disimulasikan = !sama(bobot, bobotResmi);

  const isuAktif = useMemo(() => (kategori ? isu.filter((i) => i.category_id === kategori) : isu), [isu, kategori]);
  const resmi = useMemo(() => hitungSkor(isuAktif, bobotResmi), [isuAktif, bobotResmi]);
  const simulasi = useMemo(() => hitungSkor(isuAktif, bobot), [isuAktif, bobot]);
  const selisih = useMemo(() => selisihPeringkat(resmi, simulasi), [resmi, simulasi]);
  const konsekuensi = disimulasikan ? kalimatKonsekuensi(resmi, simulasi) : null;

  const skorKecamatan = useMemo(() => {
    const hasil: Record<string, number> = {};
    for (const s of simulasi) hasil[s.kode_wilayah] = Math.max(hasil[s.kode_wilayah] ?? 0, s.skor);
    return hasil;
  }, [simulasi]);

  const terpilih = simulasi.find((s) => s.id === pilihId) ?? simulasi[0];
  const tampil = semua ? simulasi : simulasi.slice(0, JUMLAH_AWAL);
  const presetAktif = (Object.keys(PRESET) as NamaPreset[]).find((p) => sama(bobot, normalisasiBobot(PRESET[p])));

  function pilihKecamatan(kode: string) {
    const teratas = simulasi.find((s) => s.kode_wilayah === kode);
    if (teratas) setPilihId(teratas.id);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      {/* Panel bobot */}
      <section aria-labelledby="judul-bobot" className="lg:col-span-4">
        <div className="bg-lapis p-5 sm:p-6 lg:sticky lg:top-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="judul-bobot" className="text-lead font-medium tracking-tight">
              Bobot faktor
            </h2>
            <span className={`text-kecil font-medium ${disimulasikan ? 'bg-tinta px-2 py-0.5 text-kertas' : 'text-lembut'}`}>
              {disimulasikan ? 'Mode simulasi' : 'Bobot resmi'}
            </span>
          </div>
          <p className="mt-2 text-kecil text-lembut">
            Geser untuk menguji urutan lain. Bobot dinormalisasi otomatis supaya totalnya 100%. Tidak ada yang tersimpan.
          </p>

          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Preset bobot">
            {(Object.keys(PRESET) as NamaPreset[]).map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={presetAktif === p}
                onClick={() => setSlider(keSlider(PRESET[p]))}
                className="min-h-10 bg-terang px-3 py-1.5 text-kecil hover:bg-kertas active:translate-y-px aria-pressed:bg-tinta aria-pressed:text-kertas"
              >
                {LABEL_PRESET[p]}
              </button>
            ))}
          </div>

          <ul className="mt-5 grid gap-3">
            {FAKTOR.map((f) => (
              <li key={f}>
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor={`bobot-${f}`} className="flex items-center gap-2 text-badan font-medium">
                    <span aria-hidden="true" className="size-3" style={{ background: WARNA_FAKTOR[f] }} />
                    {NAMA_FAKTOR[f]}
                  </label>
                  <span className="angka text-badan">
                    <span className="font-semibold">{persenBobot(bobot[f])}</span>
                    {Math.abs(bobot[f] - bobotResmi[f]) >= 0.005 && (
                      <span className="text-kecil text-lembut"> resmi {persenBobot(bobotResmi[f])}</span>
                    )}
                  </span>
                </div>
                <input
                  id={`bobot-${f}`}
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={slider[f]}
                  onChange={(e) => setSlider((s) => ({ ...s, [f]: Number(e.target.value) }))}
                  aria-describedby={`definisi-${f}`}
                  aria-valuetext={`${persenBobot(bobot[f])} setelah dinormalisasi`}
                  className="slider w-full"
                />
                <p id={`definisi-${f}`} className="sr-only">
                  {DEFINISI_FAKTOR[f]}
                </p>
              </li>
            ))}
          </ul>

          {totalSlider === 0 && (
            <p role="alert" className="mt-3 bg-tinta px-3 py-2 text-kecil text-kertas">
              Semua bobot nol tidak bisa dipakai. Naikkan minimal satu faktor; urutan sementara memakai bobot resmi.
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Tombol varian="kedua" onClick={() => setSlider(keSlider(bobotResmi))} disabled={!disimulasikan && totalSlider > 0}>
              Kembali ke bobot resmi
            </Tombol>
          </div>

          {perencana && <SimpanBobot bobot={bobot} aktif={disimulasikan} onTersimpan={() => router.refresh()} />}
        </div>
      </section>

      <div className="grid content-start gap-10 lg:col-span-8">
        {/* Filter kategori + kalimat konsekuensi */}
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Saring kategori">
            {[{ id: null, nama: 'Semua kategori' }, ...KATEGORI].map((k) => (
              <button
                key={k.nama}
                type="button"
                aria-pressed={kategori === k.id}
                onClick={() => {
                  setKategori(k.id);
                  setPilihId(null);
                }}
                className="min-h-10 bg-lapis px-3 py-1.5 text-kecil hover:bg-lapis-2 active:translate-y-px aria-pressed:bg-tinta aria-pressed:text-kertas"
              >
                {k.nama}
              </button>
            ))}
          </div>
          <p className="min-h-[1.55em] text-pernyataan tracking-[-0.02em]" aria-live="polite">
            {konsekuensi ??
              `${simulasi.length} isu wilayah dinilai${kategori ? ` untuk kategori ${KATEGORI[kategori - 1].nama.toLowerCase()}` : ''}. Geser bobot untuk melihat apa yang berubah.`}
          </p>
        </div>

        {/* Peta + isu terpilih */}
        <div className="grid gap-8 md:grid-cols-2">
          <figure>
            <PetaKecamatan
              skor={skorKecamatan}
              sorot={terpilih?.kode_wilayah}
              onPilih={pilihKecamatan}
              judul="Peta choropleth kecamatan DKI Jakarta menurut skor prioritas tertinggi; klik kecamatan untuk memilih isunya"
            />
            <figcaption className="mt-3">
              <KeteranganKelas />
            </figcaption>
          </figure>

          {terpilih && (
            <section aria-labelledby="judul-isu" className="bg-terang p-5 sm:p-6">
              <p className="text-kecil text-lembut">
                Peringkat {terpilih.peringkat} dari {simulasi.length}
                {disimulasikan && (
                  <>
                    {' '}
                    · resmi {resmi.find((r) => r.id === terpilih.id)?.peringkat} <TandaGeser n={selisih[terpilih.id]} />
                  </>
                )}
              </p>
              <h2 id="judul-isu" className="mt-1 text-lead font-medium tracking-tight">
                {terpilih.kategori} di {terpilih.kecamatan}
              </h2>
              <p className="text-kecil text-lembut">
                {terpilih.kota} · {terpilih.laporan_aktif} laporan aktif, {terpilih.laporan_terverifikasi} terverifikasi
              </p>
              <p className="mt-4 text-badan font-medium">{terpilih.penjelasan}</p>
              <div className="mt-5">
                <BarKontribusi isu={terpilih} bobot={bobot} />
              </div>
            </section>
          )}
        </div>

        {/* Daftar peringkat */}
        <section aria-labelledby="judul-peringkat">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="judul-peringkat" className="text-lead font-medium tracking-tight">
              Peringkat isu wilayah
            </h2>
            <KeteranganFaktor />
          </div>
          <ol className="mt-4 grid gap-1">
            {tampil.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  aria-pressed={s.id === terpilih?.id}
                  onClick={() => setPilihId(s.id)}
                  className="grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-x-3 gap-y-2 bg-lapis px-3 py-3 text-left transition-colors hover:bg-lapis-2 aria-pressed:bg-terang sm:grid-cols-[2.75rem_3rem_1fr_minmax(8rem,14rem)_3.5rem] sm:px-4"
                >
                  <span className="angka text-lead font-semibold tracking-tight">{s.peringkat}</span>
                  <span className="hidden sm:block">{disimulasikan && <TandaGeser n={selisih[s.id]} />}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-badan font-medium">
                      {s.kecamatan}
                      <span className="font-normal text-lembut"> · {s.kota.replace('Jakarta ', 'Jak')}</span>
                    </span>
                    <span className="block text-kecil text-lembut">
                      {s.kategori}
                      {disimulasikan && (
                        <span className="sm:hidden">
                          {' '}
                          · <TandaGeser n={selisih[s.id]} />
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="col-span-3 row-start-2 sm:col-span-1 sm:col-start-4 sm:row-start-1">
                    <BarTumpuk isu={s} />
                  </span>
                  <span className="angka col-start-3 row-start-1 text-right text-lead font-medium sm:col-start-5">
                    {formatPoin(s.skor)}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {simulasi.length > JUMLAH_AWAL && (
            <Tombol varian="kedua" className="mt-4" onClick={() => setSemua((x) => !x)}>
              {semua ? `Tampilkan ${JUMLAH_AWAL} teratas saja` : `Tampilkan semua ${simulasi.length} isu`}
            </Tombol>
          )}
        </section>
      </div>
    </div>
  );
}

function SimpanBobot({ bobot, aktif, onTersimpan }: { bobot: Bobot; aktif: boolean; onTersimpan: () => void }) {
  const [alasan, setAlasan] = useState('');
  const [status, setStatus] = useState<{ jenis: 'galat' | 'ok'; teks: string } | null>(null);
  const [memuat, setMemuat] = useState(false);

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setMemuat(true);
    setStatus(null);
    const bulat = Object.fromEntries(FAKTOR.map((f) => [f, Math.round(bobot[f] * 1000) / 1000]));
    const { error } = await createClient().rpc('save_weights', { p_bobot: bulat, p_alasan: alasan });
    setMemuat(false);
    if (error) {
      setStatus({ jenis: 'galat', teks: pesanError(error) });
      return;
    }
    setAlasan('');
    setStatus({ jenis: 'ok', teks: 'Bobot resmi tersimpan dan tercatat di riwayat keputusan.' });
    onTersimpan();
  }

  return (
    <form onSubmit={simpan} className="mt-6 grid gap-3 bg-kertas p-4">
      <p className="flex items-center gap-2 text-badan font-medium">
        <Ikon nama="kunci" className="size-4" /> Mode Perencana
      </p>
      <label htmlFor="alasan-bobot" className="text-kecil">
        Alasan perubahan (wajib, tampil publik di riwayat keputusan)
      </label>
      <textarea
        id="alasan-bobot"
        value={alasan}
        onChange={(e) => setAlasan(e.target.value)}
        minLength={10}
        required
        rows={3}
        className="w-full bg-terang p-3 text-badan focus:outline-3 focus:outline-tinta"
      />
      <Tombol type="submit" disabled={!aktif || alasan.trim().length < 10 || memuat}>
        {memuat ? 'Menyimpan…' : 'Simpan sebagai bobot resmi'}
      </Tombol>
      {!aktif && <p className="text-kecil text-lembut">Ubah slider dulu; bobot sekarang sama dengan bobot resmi.</p>}
      {status && (
        <p role={status.jenis === 'galat' ? 'alert' : 'status'} className="text-kecil font-medium">
          {status.teks}
        </p>
      )}
    </form>
  );
}
