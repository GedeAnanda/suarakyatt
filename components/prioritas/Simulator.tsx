// components/prioritas/Simulator.tsx — Dashboard Prioritas + simulator bobot publik (FR-F2–F4, PRD 9), pemilik: A
// Semua skor dihitung di browser dengan lib/scoring dari hasil priority_factors, jadi slider
// langsung mengubah peringkat tanpa ke server dan tanpa menyimpan apa pun (SDD 2.1, 8.3).
// Bobot simulasi ikut tersimpan di URL (?bobot=30,20,5,20,15,10) supaya skenarionya bisa dibagikan.
// Perencana bisa menyimpan bobot sebagai bobot resmi, wajib dengan alasan (R10 save_weights).

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
import { umumkan } from '../Pengumuman';
import Ikon from '../ui/Ikon';
import { Tombol } from '../ui/Tombol';
import BarKontribusi, { BarTumpuk, KeteranganFaktor, WARNA_FAKTOR } from './BarKontribusi';

type Slider = Record<Faktor, number>;

const keSlider = (b: Bobot): Slider => Object.fromEntries(FAKTOR.map((f) => [f, Math.round(b[f] * 100)])) as Slider;
const sama = (a: Bobot, b: Bobot) => FAKTOR.every((f) => Math.abs(a[f] - b[f]) < 0.0005);
const persenBobot = (x: number) => `${Math.round(x * 100)}%`;
const JUMLAH_AWAL = 15;

/** "30,20,5,20,15,10" → slider; null kalau bentuknya tidak sah atau semuanya nol. */
function dariUrl(nilai: string | null): Slider | null {
  const angka = nilai?.split(',').map(Number);
  if (!angka || angka.length !== FAKTOR.length || angka.some((x) => !Number.isFinite(x) || x < 0 || x > 100)) return null;
  if (angka.every((x) => x === 0)) return null;
  return Object.fromEntries(FAKTOR.map((f, i) => [f, Math.round(angka[i])])) as Slider;
}

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
  const [slider, setSlider] = useState<Slider>(() => dariUrl(params.get('bobot')) ?? keSlider(bobotResmi));
  const [kategori, setKategori] = useState<number | null>(null);
  const [pilihId, setPilihId] = useState<string | null>(() => params.get('isu'));
  const [semua, setSemua] = useState(false);
  const [sliderTerbuka, setSliderTerbuka] = useState(() => dariUrl(params.get('bobot')) !== null);
  const panelIsu = useRef<HTMLElement>(null);
  const daftar = useRef<HTMLOListElement>(null);
  const posisiLama = useRef(new Map<string, number>());

  const totalSlider = FAKTOR.reduce((s, f) => s + slider[f], 0);
  const bobot = useMemo(() => (totalSlider > 0 ? normalisasiBobot(slider) : bobotResmi), [slider, totalSlider, bobotResmi]);
  const disimulasikan = !sama(bobot, bobotResmi);

  const isuAktif = useMemo(() => (kategori ? isu.filter((i) => i.category_id === kategori) : isu), [isu, kategori]);
  const resmi = useMemo(() => hitungSkor(isuAktif, bobotResmi), [isuAktif, bobotResmi]);
  const simulasi = useMemo(() => hitungSkor(isuAktif, bobot), [isuAktif, bobot]);
  const selisih = useMemo(() => selisihPeringkat(resmi, simulasi), [resmi, simulasi]);
  const konsekuensi = disimulasikan ? kalimatKonsekuensi(resmi, simulasi) : null;

  const { skorKecamatan, keteranganKecamatan } = useMemo(() => {
    const skor: Record<string, number> = {};
    const ket: Record<string, string> = {};
    for (const s of simulasi) {
      if (skor[s.kode_wilayah] === undefined) {
        skor[s.kode_wilayah] = s.skor;
        ket[s.kode_wilayah] = `Teratas: ${s.kategori.toLowerCase()}, peringkat ${s.peringkat}`;
      }
    }
    return { skorKecamatan: skor, keteranganKecamatan: ket };
  }, [simulasi]);

  const terpilih = simulasi.find((s) => s.id === pilihId) ?? simulasi[0];
  const tampil = semua ? simulasi : simulasi.slice(0, JUMLAH_AWAL);
  const presetAktif = (Object.keys(PRESET) as NamaPreset[]).find((p) => sama(bobot, normalisasiBobot(PRESET[p])));

  // Simpan bobot di URL tanpa menambah riwayat browser, supaya tautannya bisa dibagikan.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (disimulasikan) url.searchParams.set('bobot', FAKTOR.map((f) => slider[f]).join(','));
    else url.searchParams.delete('bobot');
    if (url.href !== window.location.href) window.history.replaceState(null, '', url);
  }, [slider, disimulasikan]);

  // FLIP: setiap baris meluncur dari posisi lamanya ke posisi barunya, jadi perubahan peringkat terlihat.
  useLayoutEffect(() => {
    const ol = daftar.current;
    if (!ol) return;
    const gerak = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const baru = new Map<string, number>();
    ol.querySelectorAll<HTMLElement>('[data-isu]').forEach((el) => {
      const id = el.dataset.isu!;
      baru.set(id, el.offsetTop);
      const lama = posisiLama.current.get(id);
      if (gerak && lama !== undefined && Math.abs(lama - el.offsetTop) > 2) {
        el.animate([{ transform: `translateY(${lama - el.offsetTop}px)` }, { transform: 'translateY(0)' }], {
          duration: 520,
          easing: 'cubic-bezier(0.34, 1.36, 0.64, 1)',
        });
      }
    });
    posisiLama.current = baru;
  });

  function pilihIsu(id: string) {
    setPilihId(id);
    // Di layar sempit panel rincian ada jauh di atas daftar: bawa ke sana.
    const panel = panelIsu.current;
    if (panel) {
      const r = panel.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight * 0.6) {
        panel.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      }
    }
  }

  function pilihKecamatan(kode: string) {
    const teratas = simulasi.find((s) => s.kode_wilayah === kode);
    if (teratas) setPilihId(teratas.id);
  }

  async function salinTautan() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      umumkan('Tautan simulasi disalin. Siapa pun yang membukanya melihat bobot yang sama.');
    } catch {
      umumkan('Salin tautan dari bilah alamat browser.');
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      {/* Panel bobot */}
      <section aria-labelledby="judul-bobot" className="lg:col-span-4">
        <div className="kartu p-5 sm:p-6 lg:sticky lg:top-24">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="judul-bobot" className="text-lead font-medium tracking-tight">
              Bobot faktor
            </h2>
            <span
              aria-live="polite"
              className={`text-kecil font-medium transition-colors ${disimulasikan ? 'rounded-full bg-tinta px-2.5 py-0.5 text-kertas' : 'text-lembut'}`}
            >
              <span key={String(disimulasikan)} className="pop inline-block">
                {disimulasikan ? 'Mode simulasi' : 'Bobot resmi'}
              </span>
            </span>
          </div>
          <p className="mt-2 text-kecil text-lembut">
            Pilih preset atau geser sendiri. Bobot dinormalisasi supaya totalnya 100%. Bobot resmi tidak berubah.
          </p>

          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Preset bobot">
            {(Object.keys(PRESET) as NamaPreset[]).map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={presetAktif === p}
                onClick={() => setSlider(keSlider(PRESET[p]))}
                className="min-h-11 rounded-full bg-lapis px-4 py-1.5 text-kecil font-medium transition-[background-color,color,scale] duration-200 hover:bg-lapis-2 active:scale-95 aria-pressed:bg-tinta aria-pressed:text-kertas"
              >
                {LABEL_PRESET[p]}
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-expanded={sliderTerbuka}
            aria-controls="daftar-slider"
            onClick={() => setSliderTerbuka((b) => !b)}
            className="mt-4 flex min-h-11 w-full items-center justify-between gap-2 border-b border-batas text-badan font-semibold lg:hidden"
          >
            Atur keenam bobot sendiri
            <Ikon nama={sliderTerbuka ? 'naik' : 'turun'} className="size-5" />
          </button>

          <ul id="daftar-slider" className={`mt-5 gap-3 lg:grid ${sliderTerbuka ? 'grid' : 'hidden'}`}>
            {FAKTOR.map((f) => {
              const berubah = Math.abs(bobot[f] - bobotResmi[f]) >= 0.005;
              return (
                <li key={f}>
                  <div className="flex items-baseline justify-between gap-3">
                    <label htmlFor={`bobot-${f}`} className="flex items-center gap-2 text-badan font-medium">
                      <span aria-hidden="true" className="size-3" style={{ background: WARNA_FAKTOR[f] }} />
                      {NAMA_FAKTOR[f]}
                    </label>
                    <span className="angka text-badan">
                      <span className={`font-semibold ${berubah ? 'text-tinta' : ''}`}>{persenBobot(bobot[f])}</span>
                      {berubah && <span className="text-kecil text-lembut"> resmi {persenBobot(bobotResmi[f])}</span>}
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
              );
            })}
          </ul>

          {totalSlider === 0 && (
            <p role="alert" className="goyang mt-3 rounded-(--radius-kontrol) bg-tinta px-3 py-2 text-kecil text-kertas">
              Semua bobot nol tidak bisa dipakai. Naikkan minimal satu faktor; urutan sementara memakai bobot resmi.
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Tombol varian="garis" onClick={() => setSlider(keSlider(bobotResmi))} disabled={!disimulasikan && totalSlider > 0}>
              Kembali ke bobot resmi
            </Tombol>
            {disimulasikan && (
              <Tombol varian="garis" onClick={salinTautan}>
                <Ikon nama="tautan" className="size-4" />
                Salin tautan simulasi
              </Tombol>
            )}
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
                className="min-h-11 rounded-full bg-permukaan px-4 py-1.5 text-kecil font-medium ring-1 ring-batas ring-inset transition-[background-color,color,scale] duration-200 hover:bg-terang active:scale-95 aria-pressed:bg-tinta aria-pressed:text-kertas aria-pressed:ring-tinta"
              >
                {k.nama}
              </button>
            ))}
          </div>
          <p className={`min-h-[1.55em] text-pernyataan tracking-[-0.02em] transition-colors ${disimulasikan ? 'text-tinta' : ''}`} aria-live="polite">
            {konsekuensi ??
              `${simulasi.length} isu wilayah dinilai${kategori ? ` untuk kategori ${KATEGORI[kategori - 1].nama.toLowerCase()}` : ''}. Geser bobot dan lihat urutannya bergeser.`}
          </p>
        </div>

        {/* Peta + isu terpilih */}
        <div className="grid gap-8 md:grid-cols-2">
          <figure>
            <PetaKecamatan
              skor={skorKecamatan}
              keterangan={keteranganKecamatan}
              sorot={terpilih?.kode_wilayah}
              onPilih={pilihKecamatan}
              judul="Peta choropleth kecamatan DKI Jakarta menurut skor prioritas tertinggi. Pilih kecamatan untuk melihat isu teratasnya; daftar peringkat di bawah berisi data yang sama."
            />
            <figcaption className="mt-3 grid gap-3">
              <KeteranganKelas />
              <p className="text-kecil text-lembut">Arahkan kursor atau Tab ke kecamatan untuk melihat skornya; klik untuk memilih.</p>
            </figcaption>
          </figure>

          {terpilih && (
            <section ref={panelIsu} aria-labelledby="judul-isu" aria-live="polite" className="kartu scroll-mt-4 p-5 sm:p-6">
              {/* Isinya berganti dengan gerak singkat setiap isu lain dipilih; wadah live region tetap sama. */}
              <div key={terpilih.id} className="ganti">
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
          <ol ref={daftar} className="relative mt-4 grid gap-1">
            {tampil.map((s) => (
              <li key={s.id} data-isu={s.id} className="relative will-change-transform">
                <button
                  type="button"
                  aria-pressed={s.id === terpilih?.id}
                  onClick={() => pilihIsu(s.id)}
                  className="grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-x-3 gap-y-2 rounded-(--radius-kontrol) border border-batas bg-permukaan px-3 py-3 text-left transition-colors hover:border-lapis-2 hover:bg-terang aria-pressed:border-tinta aria-pressed:bg-tinta-muda/50 aria-pressed:shadow-[inset_4px_0_0_var(--color-tinta)] sm:grid-cols-[2.75rem_3rem_1fr_minmax(8rem,14rem)_3.5rem] sm:px-4"
                >
                  <span className="angka text-lead font-semibold tracking-tight text-tinta">{s.peringkat}</span>
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
  const [galat, setGalat] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(false);
  const pendek = alasan.trim().length < 10;

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setMemuat(true);
    setGalat(null);
    const bulat = Object.fromEntries(FAKTOR.map((f) => [f, Math.round(bobot[f] * 1000) / 1000]));
    const { error } = await createClient().rpc('save_weights', { p_bobot: bulat, p_alasan: alasan });
    setMemuat(false);
    if (error) {
      setGalat(pesanError(error));
      return;
    }
    setAlasan('');
    umumkan('Bobot resmi tersimpan dan tercatat di riwayat keputusan.');
    onTersimpan();
  }

  return (
    <form onSubmit={simpan} className="panel mt-6 grid gap-3 p-4">
      <p className="flex items-center gap-2 text-badan font-medium">
        <Ikon nama="kunci" className="size-4" /> Mode Perencana
      </p>
      <label htmlFor="alasan-bobot" className="text-kecil">
        Alasan perubahan <span className="text-tinta">*</span>
        <span className="block text-lembut">Wajib, minimal 10 karakter, tampil publik di riwayat keputusan.</span>
      </label>
      <textarea
        id="alasan-bobot"
        value={alasan}
        onChange={(e) => setAlasan(e.target.value)}
        minLength={10}
        required
        rows={3}
        aria-invalid={galat ? true : undefined}
        aria-describedby={galat ? 'galat-bobot' : undefined}
        className="w-full p-3 text-badan"
      />
      <Tombol type="submit" disabled={!aktif || pendek || memuat}>
        {memuat ? 'Menyimpan…' : 'Simpan sebagai bobot resmi'}
      </Tombol>
      {!aktif && <p className="text-kecil text-lembut">Ubah bobot dulu; bobot sekarang sama dengan bobot resmi.</p>}
      {galat && (
        <p id="galat-bobot" role="alert" className="text-kecil font-medium text-tinta">
          {galat}
        </p>
      )}
    </form>
  );
}
