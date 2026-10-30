// components/prioritas/Simulator.tsx — Dashboard Prioritas + simulator bobot publik (FR-F2 sampai F4, PRD 9), pemilik: A
// Semua skor dihitung di browser dengan lib/scoring dari hasil priority_factors, jadi slider
// langsung mengubah peringkat tanpa ke server dan tanpa menyimpan apa pun (SDD 2.1, 8.3).
// Bobot simulasi ikut tersimpan di URL (?bobot=30,20,5,20,15,10) supaya skenarionya bisa dibagikan.
// Perencana bisa menyimpan bobot sebagai bobot acuan, wajib dengan alasan (R10 save_weights).
// Tata letak seperti halaman hasil pencarian: panel saring (bobot) menempel di kiri, hasil di kanan.

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ubahParameter } from '@/lib/pilihan-url';
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

/** "30,20,5,20,15,10" → slider; null kalau bentuknya tidak sah; nol dipertahankan agar peringatan konsisten. */
function dariUrl(nilai: string | null): Slider | null {
  const angka = nilai?.split(',').map(Number);
  if (!angka || angka.length !== FAKTOR.length || angka.some((x) => !Number.isFinite(x) || x < 0 || x > 100)) return null;
  return Object.fromEntries(FAKTOR.map((f, i) => [f, Math.round(angka[i])])) as Slider;
}

function TandaGeser({ n }: { n: number | undefined }) {
  if (n === undefined || n === 0) return <span className="text-mini text-lembut">tetap</span>;
  return (
    <span className={`angka inline-flex items-center text-mini font-bold ${n > 0 ? 'text-hijau' : 'text-merah-tua'}`}>
      <Ikon nama={n > 0 ? 'naik' : 'turun'} className="size-3.5" />
      {Math.abs(n)}
      <span className="sr-only">{n > 0 ? ' posisi naik' : ' posisi turun'} dibanding peringkat acuan</span>
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
  const bobotUrl = params.get('bobot');
  const slider = useMemo(() => dariUrl(bobotUrl) ?? keSlider(bobotResmi), [bobotUrl, bobotResmi]);
  const kategoriUrl = Number(params.get('kategori'));
  const kategori = KATEGORI.some((k) => k.id === kategoriUrl) ? kategoriUrl : null;
  const pilihId = params.get('isu');
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
  // Baris peringkat memakai lebar kolom (@container), bukan lebar layar: di 1024 px kolom ini hanya ±550 px.
  // Nama dan batang berbagi sisa ruang 3:2; kolom tanda geser hanya diberi ruang saat bobot disimulasikan.
  const kolomBaris = disimulasikan
    ? '@xl:grid-cols-[2.75rem_3rem_minmax(0,3fr)_minmax(0,2fr)_3.5rem]'
    : '@xl:grid-cols-[2.75rem_0_minmax(0,3fr)_minmax(0,2fr)_3.5rem]';
  const presetAktif = (Object.keys(PRESET) as NamaPreset[]).find((p) => sama(bobot, normalisasiBobot(PRESET[p])));

  function setSlider(nilai: Slider) {
    const total = FAKTOR.reduce((s, f) => s + nilai[f], 0);
    const acuan = total > 0 && sama(normalisasiBobot(nilai), bobotResmi);
    ubahParameter({ bobot: acuan ? null : FAKTOR.map((f) => nilai[f]).join(',') });
  }

  // FLIP: setiap baris meluncur dari posisi lamanya ke posisi barunya, jadi perubahan peringkat terlihat.
  useLayoutEffect(() => {
    const ol = daftar.current;
    if (!ol) return;
    const gerak = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const baru = new Map<string, number>();
    const baris = [...ol.querySelectorAll<HTMLElement>('[data-isu]')].map((el) => ({ el, top: el.offsetTop }));
    baris.forEach(({ el, top }) => {
      const id = el.dataset.isu!;
      baru.set(id, top);
      const lama = posisiLama.current.get(id);
      if (gerak && lama !== undefined && Math.abs(lama - top) > 2) {
        el.animate([{ transform: `translateY(${lama - top}px)` }, { transform: 'translateY(0)' }], {
          duration: 520,
          easing: 'cubic-bezier(0.34, 1.36, 0.64, 1)',
        });
      }
    });
    posisiLama.current = baru;
  });

  function pilihIsu(id: string) {
    ubahParameter({ isu: id });
    // Di layar sempit panel rincian ada jauh di atas daftar: bawa ke sana.
    const panel = panelIsu.current;
    if (panel) {
      const r = panel.getBoundingClientRect();
      if (r.top < 88 || r.top > window.innerHeight * 0.6) {
        panel.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      }
    }
  }

  function pilihKecamatan(kode: string) {
    const teratas = simulasi.find((s) => s.kode_wilayah === kode);
    if (teratas) pilihIsu(teratas.id);
  }

  async function salinTautan() {
    try {
      if (terpilih) ubahParameter({ isu: terpilih.id });
      await navigator.clipboard.writeText(window.location.href);
      umumkan('Tautan disalin, lengkap dengan bobot, kategori, dan isu yang dipilih.');
    } catch {
      umumkan('Salin tautan dari bilah alamat browser.');
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)] xl:grid-cols-[21rem_minmax(0,1fr)]">
      {/* Panel bobot: seperti panel saring di kiri halaman hasil pencarian. */}
      <section aria-labelledby="judul-bobot">
        <div className="kartu p-5 lg:sticky lg:top-20">
          <div className="flex items-center justify-between gap-4">
            <h2 id="judul-bobot" className="flex items-center gap-2 text-lead font-bold">
              <Ikon nama="geser" className="size-5 text-biru" />
              Bobot faktor
            </h2>
            <span
              aria-live="polite"
              className={`rounded-[0.375rem] px-2 py-0.5 text-mini font-bold transition-colors ${disimulasikan ? 'bg-biru text-white' : 'bg-lapis text-lembut'}`}
            >
              {disimulasikan ? 'Mode simulasi' : 'Bobot acuan'}
            </span>
          </div>
          <p className="mt-2 text-kecil text-lembut">
            Pilih preset atau geser sendiri. Bobot dinormalisasi supaya totalnya 100%. Bobot acuan tidak berubah.
          </p>

          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Preset bobot">
            {(Object.keys(PRESET) as NamaPreset[]).map((p) => (
              <button key={p} type="button" aria-pressed={presetAktif === p} onClick={() => setSlider(keSlider(PRESET[p]))} className="chip">
                {LABEL_PRESET[p]}
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-expanded={sliderTerbuka}
            aria-controls="daftar-slider"
            onClick={() => setSliderTerbuka((b) => !b)}
            className="mt-4 flex min-h-11 w-full items-center justify-between gap-2 border-t border-garis pt-3 text-badan font-bold lg:hidden"
          >
            Atur keenam bobot sendiri
            <Ikon nama={sliderTerbuka ? 'naik' : 'turun'} className="size-5" />
          </button>

          <ul id="daftar-slider" className={`mt-4 gap-2 border-garis lg:grid lg:border-t lg:pt-4 ${sliderTerbuka ? 'grid' : 'hidden'}`}>
            {FAKTOR.map((f) => {
              const berubah = Math.abs(bobot[f] - bobotResmi[f]) >= 0.005;
              return (
                <li key={f}>
                  <div className="flex items-baseline justify-between gap-3">
                    <label htmlFor={`bobot-${f}`} className="flex items-center gap-2 text-kecil font-semibold">
                      <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: WARNA_FAKTOR[f] }} />
                      {NAMA_FAKTOR[f]}
                    </label>
                    <span className="angka text-kecil">
                      <span className={`font-bold ${berubah ? 'text-biru-tua' : ''}`}>{persenBobot(bobot[f])}</span>
                      {berubah && <span className="text-mini text-lembut"> acuan {persenBobot(bobotResmi[f])}</span>}
                    </span>
                  </div>
                  <input
                    id={`bobot-${f}`}
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={slider[f]}
                    onChange={(e) => setSlider({ ...slider, [f]: Number(e.target.value) })}
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
            <p role="alert" className="mt-3 rounded-kontrol bg-merah-muda px-3 py-2 text-kecil font-semibold text-merah-tua">
              Semua bobot nol tidak bisa dipakai. Naikkan minimal satu faktor; urutan sementara memakai bobot acuan.
            </p>
          )}

          <div className="mt-5 grid gap-2">
            <Tombol varian="garis" onClick={() => setSlider(keSlider(bobotResmi))} disabled={!disimulasikan && totalSlider > 0}>
              Kembali ke bobot acuan
            </Tombol>
            <Tombol varian="kedua" onClick={salinTautan}>
              <Ikon nama="tautan" className="size-4" />
              Bagikan skenario
            </Tombol>
          </div>

          {perencana && <SimpanBobot bobot={bobot} aktif={disimulasikan} onTersimpan={() => router.refresh()} />}
        </div>
      </section>

      {/* @container: peta dan rincian isu berdampingan hanya kalau kolom ini cukup lebar (≥ 36rem), apa pun ukuran
          layarnya. Di iPad miring dengan menu samping, kolomnya sempit walau layarnya "lebar". */}
      <div className="@container grid min-w-0 content-start gap-5">
        {/* Saring kategori + kalimat konsekuensi */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Saring kategori">
          {[{ id: null, nama: 'Semua kategori' }, ...KATEGORI].map((k) => (
            <button
              key={k.nama}
              type="button"
              aria-pressed={kategori === k.id}
              onClick={() => {
                ubahParameter({ kategori: k.id === null ? null : String(k.id), isu: null });
                setSemua(false);
              }}
              className="chip"
            >
              {k.nama}
            </button>
          ))}
        </div>
        <p
          aria-live="polite"
          className={`flex min-h-[3.25rem] items-start gap-3 rounded-kartu border px-4 py-3 text-badan font-semibold transition-colors ${
            disimulasikan ? 'border-biru bg-biru-pudar text-biru-tua' : 'border-garis bg-permukaan'
          }`}
        >
          <Ikon nama={disimulasikan ? 'geser' : 'info'} className="mt-0.5 size-5 shrink-0" />
          {konsekuensi ??
            `${simulasi.length} isu wilayah dinilai${kategori ? ` untuk kategori ${KATEGORI[kategori - 1].nama.toLowerCase()}` : ''}. Geser bobot dan lihat urutannya bergeser.`}
        </p>

        {/* Peta + isu terpilih */}
        <div className="grid gap-5 @xl:grid-cols-2">
          <figure className="kartu p-4">
            <PetaKecamatan
              skor={skorKecamatan}
              keterangan={keteranganKecamatan}
              sorot={terpilih?.kode_wilayah}
              onPilih={pilihKecamatan}
              judul="Peta choropleth kecamatan DKI Jakarta menurut skor prioritas tertinggi. Pilih kecamatan untuk melihat isu teratasnya; daftar peringkat di bawah berisi data yang sama."
            />
            <figcaption className="mt-3 grid gap-2">
              <KeteranganKelas />
              <p className="text-mini text-lembut">Arahkan kursor atau Tab ke kecamatan untuk melihat skornya; klik untuk memilih.</p>
            </figcaption>
          </figure>

          {terpilih && (
            <section ref={panelIsu} aria-labelledby="judul-isu" aria-live="polite" className="kartu scroll-mt-24 p-5">
              <p className="flex flex-wrap items-center gap-2 text-kecil">
                <span className="angka rounded-[0.375rem] bg-biru px-2 py-0.5 text-mini font-bold text-white">
                  #{terpilih.peringkat}
                </span>
                <span className="text-lembut">dari {simulasi.length} isu</span>
                {disimulasikan && (
                  <span className="text-lembut">
                    · acuan {resmi.find((r) => r.id === terpilih.id)?.peringkat} <TandaGeser n={selisih[terpilih.id]} />
                  </span>
                )}
              </p>
              <h2 id="judul-isu" className="mt-2 text-sub font-bold">
                {terpilih.kategori} di {terpilih.kecamatan}
              </h2>
              <p className="text-kecil text-lembut">
                {terpilih.kota} · {terpilih.laporan_aktif} laporan aktif, {terpilih.laporan_terverifikasi} terverifikasi
              </p>
              <p className="mt-4 rounded-kontrol bg-latar p-3 text-kecil font-semibold">{terpilih.penjelasan}</p>
              <div className="mt-5">
                <BarKontribusi isu={terpilih} bobot={bobot} />
              </div>
            </section>
          )}
        </div>

        {/* Daftar peringkat: seperti daftar hasil, satu baris satu isu. */}
        <section aria-labelledby="judul-peringkat" className="kartu overflow-hidden">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-garis px-4 py-4 sm:px-5">
            <h2 id="judul-peringkat" className="text-lead font-bold">
              Peringkat isu wilayah
            </h2>
            <KeteranganFaktor />
          </div>
          <ol ref={daftar} className="relative grid">
            {tampil.map((s) => (
              <li key={s.id} data-isu={s.id} className="relative border-b border-garis will-change-transform last:border-b-0">
                <button
                  type="button"
                  aria-pressed={s.id === terpilih?.id}
                  onClick={() => pilihIsu(s.id)}
                  className={`grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-x-3 gap-y-2 bg-permukaan px-4 py-3 text-left transition-colors hover:bg-biru-pudar aria-pressed:bg-biru-muda/60 aria-pressed:shadow-[inset_3px_0_0_var(--color-biru)] @xl:px-5 ${kolomBaris}`}
                >
                  <span className="angka text-lead font-bold text-biru-tua">{s.peringkat}</span>
                  <span className="hidden @xl:block">{disimulasikan && <TandaGeser n={selisih[s.id]} />}</span>
                  <span className="min-w-0">
                    <span className="block text-badan font-bold @xl:truncate">
                      {s.kecamatan}
                      <span className="font-normal text-lembut"> · {s.kota.replace('Jakarta ', 'Jak')}</span>
                    </span>
                    <span className="block text-kecil text-lembut">
                      {s.kategori}
                      {disimulasikan && (
                        <span className="@xl:hidden">
                          {' '}
                          · <TandaGeser n={selisih[s.id]} />
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="col-span-3 row-start-2 @xl:col-span-1 @xl:col-start-4 @xl:row-start-1">
                    <BarTumpuk isu={s} />
                  </span>
                  <span className="angka col-start-3 row-start-1 text-right text-lead font-bold @xl:col-start-5">
                    {formatPoin(s.skor)}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {simulasi.length > JUMLAH_AWAL && (
            <div className="border-t border-garis p-4 sm:px-5">
              <Tombol varian="kedua" onClick={() => setSemua((x) => !x)}>
                {semua ? `Tampilkan ${JUMLAH_AWAL} teratas saja` : `Tampilkan semua ${simulasi.length} isu`}
              </Tombol>
            </div>
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
    umumkan('Bobot acuan tersimpan dan tercatat di riwayat keputusan.');
    onTersimpan();
  }

  return (
    <form onSubmit={simpan} className="mt-5 grid gap-3 rounded-kontrol border border-biru/30 bg-biru-pudar p-4">
      <p className="flex items-center gap-2 text-badan font-bold">
        <Ikon nama="kunci" className="size-4" /> Mode Perencana
      </p>
      <label htmlFor="alasan-bobot" className="text-kecil font-semibold">
        Alasan perubahan <span className="text-merah">*</span>
        <span className="block font-normal text-lembut">Wajib, minimal 10 karakter, tampil publik di riwayat keputusan.</span>
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
        {memuat ? 'Menyimpan…' : 'Simpan sebagai bobot acuan'}
      </Tombol>
      {!aktif && <p className="text-kecil text-lembut">Ubah bobot dulu; bobot sekarang sama dengan bobot acuan.</p>}
      {galat && (
        <p id="galat-bobot" role="alert" className="text-kecil font-semibold text-merah-tua">
          {galat}
        </p>
      )}
    </form>
  );
}
