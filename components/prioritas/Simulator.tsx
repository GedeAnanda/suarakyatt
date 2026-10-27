// components/prioritas/Simulator.tsx — Dashboard Prioritas + simulator bobot publik (FR-F2–F4, PRD 9), pemilik: A
// Semua skor dihitung di browser dengan lib/scoring dari hasil priority_factors, jadi slider
// langsung mengubah peringkat tanpa ke server dan tanpa menyimpan apa pun (SDD 2.1, 8.3).
// Bobot simulasi ikut tersimpan di URL (?bobot=30,20,5,20,15,10) supaya skenarionya bisa dibagikan.
// Perencana bisa menyimpan bobot sebagai bobot acuan, wajib dengan alasan (R10 save_weights).

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
const JUMLAH_AWAL = 8;

/** "30,20,5,20,15,10" → slider; null kalau bentuknya tidak sah; nol dipertahankan agar peringatan konsisten. */
function dariUrl(nilai: string | null): Slider | null {
  const angka = nilai?.split(',').map(Number);
  if (!angka || angka.length !== FAKTOR.length || angka.some((x) => !Number.isFinite(x) || x < 0 || x > 100)) return null;
  return Object.fromEntries(FAKTOR.map((f, i) => [f, Math.round(angka[i])])) as Slider;
}

function TandaGeser({ n }: { n: number | undefined }) {
  if (n === undefined || n === 0) return <span className="text-kecil text-lembut">tetap</span>;
  return (
    <span className={`angka inline-flex items-center text-kecil font-semibold ${n > 0 ? 'text-st-selesai' : 'text-tinta'}`}>
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
  const [petaTerbuka, setPetaTerbuka] = useState(false);
  const gerakan = useRef(new Map<HTMLElement, Animation>());
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

  const terpilih = simulasi.find((s) => s.id === (pilihId ?? resmi[0]?.id)) ?? simulasi[0];
  const tampil = semua ? simulasi : simulasi.slice(0, JUMLAH_AWAL);
  const presetAktif = (Object.keys(PRESET) as NamaPreset[]).find((p) => sama(bobot, normalisasiBobot(PRESET[p])));

  function setSlider(nilai: Slider) {
    const total = FAKTOR.reduce((s, f) => s + nilai[f], 0);
    const acuan = total > 0 && sama(normalisasiBobot(nilai), bobotResmi);
    ubahParameter({ bobot: acuan ? null : FAKTOR.map((f) => nilai[f]).join(',') });
  }

  // Baca posisi visual sebelum membatalkan gerak lama: input cepat tetap menyambung.
  useLayoutEffect(() => {
    const ol = daftar.current;
    if (!ol) return;
    const bolehGerak = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const baris = [...ol.querySelectorAll<HTMLElement>('[data-isu]')].map((el) => {
      const transform = getComputedStyle(el).transform;
      return { el, top: el.offsetTop, geser: transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42 };
    });
    for (const animasi of gerakan.current.values()) animasi.cancel();
    gerakan.current.clear();
    const baru = new Map<string, number>();
    for (const { el, top, geser } of baris) {
      const id = el.dataset.isu!;
      const lama = posisiLama.current.get(id);
      baru.set(id, top);
      const delta = lama === undefined ? 0 : lama - top + geser;
      if (bolehGerak && Math.abs(delta) > 2) {
        const animasi = el.animate([{ transform: `translateY(${delta}px)` }, { transform: 'translateY(0)' }], {
          duration: 300, easing: 'cubic-bezier(.22, 1, .36, 1)',
        });
        gerakan.current.set(el, animasi);
        animasi.finished.then(() => {
          if (gerakan.current.get(el) === animasi) gerakan.current.delete(el);
        }, () => {});
      }
    }
    posisiLama.current = baru;
  });

  useEffect(() => {
    const aktif = gerakan.current;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hentikan = () => { for (const a of aktif.values()) a.cancel(); aktif.clear(); };
    const ubah = () => { if (media.matches) hentikan(); };
    media.addEventListener('change', ubah);
    return () => { media.removeEventListener('change', ubah); hentikan(); };
  }, []);

  function pilihIsu(id: string) {
    ubahParameter({ isu: id });
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
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8" data-ui>
      {/* Panel bobot */}
      <section aria-labelledby="judul-bobot" className="lg:col-span-4">
        <div className="kartu p-5 sm:p-6 lg:sticky lg:top-24">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="judul-bobot" className="text-lead font-medium tracking-tight">
              Bobot faktor
            </h2>
            <span
              aria-live="polite"
              className={`text-kecil font-medium transition-colors ${disimulasikan ? 'bg-tinta px-2 py-0.5 text-kertas' : 'text-lembut'}`}
            >
              {disimulasikan ? 'Mode simulasi' : 'Bobot acuan'}
            </span>
          </div>
          <p className="mt-2 text-kecil text-lembut">
            Pilih preset atau geser sendiri. Bobot dinormalisasi supaya totalnya 100%. Bobot acuan tidak berubah.
          </p>

          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Preset bobot">
            {(Object.keys(PRESET) as NamaPreset[]).map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={presetAktif === p}
                onClick={() => setSlider(keSlider(PRESET[p]))}
                className="min-h-11 rounded-full bg-lapis px-4 py-1.5 text-kecil font-medium transition-colors hover:bg-lapis-2 active:translate-y-px aria-pressed:bg-tinta aria-pressed:text-kertas"
              >
                <span className="hidden sm:inline">Utamakan </span>{LABEL_PRESET[p].replace('Utamakan ', '')}
              </button>
            ))}
          </div>

          {terpilih && (
            <div className="sticky top-16 z-10 mt-5 border-t border-batas bg-permukaan py-4 lg:static" role="status" aria-atomic="true" data-hasil-ringkas>
              <p className="text-kecil text-lembut">Dampak pada isu terpilih</p>
              <p className="mt-1 text-badan font-semibold">{terpilih.kategori} · {terpilih.kecamatan}</p>
              <p className="angka mt-2 text-lead text-tinta">
                #{resmi.find((r) => r.id === terpilih.id)?.peringkat} → #{terpilih.peringkat}
                <span className="ml-3"><TandaGeser n={selisih[terpilih.id]} /></span>
              </p>
              <p className="mt-1 text-kecil text-lembut">Acuan → pilihanmu · skor {formatPoin(terpilih.skor)} / 100</p>
            </div>
          )}

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

          <div className="slider-panel" data-terbuka={sliderTerbuka}>
          <div className="min-h-0 overflow-hidden">
          <ul id="daftar-slider" className="mt-5 grid gap-3">
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
                      {berubah && <span className="text-kecil text-lembut"> acuan {persenBobot(bobotResmi[f])}</span>}
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
          </div>
          </div>

          {totalSlider === 0 && (
            <p role="alert" className="mt-3 bg-tinta px-3 py-2 text-kecil text-kertas">
              Semua bobot nol tidak bisa dipakai. Naikkan minimal satu faktor; urutan sementara memakai bobot acuan.
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Tombol varian="garis" onClick={() => setSlider(keSlider(bobotResmi))} disabled={!disimulasikan && totalSlider > 0}>
              Kembali ke bobot acuan
            </Tombol>
            <Tombol varian="garis" onClick={salinTautan}>
              <Ikon nama="tautan" className="size-4" />
              Bagikan skenario
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
                  ubahParameter({ kategori: k.id === null ? null : String(k.id), isu: null });
                  setSemua(false);
                }}
                className="min-h-11 rounded-full bg-permukaan px-4 py-1.5 text-kecil font-medium ring-1 ring-batas ring-inset transition-colors hover:bg-terang aria-pressed:ring-tinta active:translate-y-px aria-pressed:bg-tinta aria-pressed:text-kertas"
              >
                {k.nama}
              </button>
            ))}
          </div>
          <p className={`min-h-[1.55em] text-pernyataan tracking-[-0.02em] ${disimulasikan ? 'text-tinta' : ''}`} aria-live="polite">
            {konsekuensi ??
              `${simulasi.length} isu wilayah dinilai${kategori ? ` untuk kategori ${KATEGORI[kategori - 1].nama.toLowerCase()}` : ''}. Geser bobot dan lihat urutannya bergeser.`}
          </p>
        </div>

        {/* Peta + isu terpilih */}
        <div className="grid gap-6 lg:grid-cols-2">
          <button type="button" className="flex min-h-11 items-center justify-between text-badan font-medium text-tinta lg:hidden" aria-expanded={petaTerbuka} aria-controls="peta-prioritas" onClick={() => setPetaTerbuka((x) => !x)}>
            {petaTerbuka ? 'Tutup peta wilayah' : 'Lihat sebaran di peta'}
            <Ikon nama={petaTerbuka ? 'naik' : 'turun'} className="size-4" />
          </button>
          <figure id="peta-prioritas" className={petaTerbuka ? 'block' : 'hidden lg:block'}>
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
            <section aria-labelledby="judul-isu" className="kartu hidden content-start p-5 lg:grid">
              <p className="text-kecil text-lembut">
                Peringkat {terpilih.peringkat} dari {simulasi.length}
                {disimulasikan && (
                  <>
                    {' '}
                    · acuan {resmi.find((r) => r.id === terpilih.id)?.peringkat} <TandaGeser n={selisih[terpilih.id]} />
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
              <details className="mt-4">
                <summary className="min-h-11 cursor-pointer py-2 text-badan font-medium text-tinta">Rincian enam faktor</summary>
                <BarKontribusi isu={terpilih} bobot={bobot} />
              </details>
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
              <li key={s.id} data-isu={s.id} className="relative">
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
                {s.id === pilihId && (
                  <div className="border-x border-b border-batas bg-permukaan p-4 lg:hidden">
                    <p className="text-badan">{s.penjelasan}</p>
                    <details className="mt-2">
                      <summary className="min-h-11 cursor-pointer py-2 text-kecil font-semibold text-tinta">Rincian enam faktor</summary>
                      <BarKontribusi isu={s} bobot={bobot} />
                    </details>
                  </div>
                )}
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
    umumkan('Bobot acuan tersimpan dan tercatat di riwayat keputusan.');
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
        {memuat ? 'Menyimpan…' : 'Simpan sebagai bobot acuan'}
      </Tombol>
      {!aktif && <p className="text-kecil text-lembut">Ubah bobot dulu; bobot sekarang sama dengan bobot acuan.</p>}
      {galat && (
        <p id="galat-bobot" role="alert" className="text-kecil font-medium text-tinta">
          {galat}
        </p>
      )}
    </form>
  );
}
