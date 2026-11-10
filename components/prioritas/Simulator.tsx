// components/prioritas/Simulator.tsx — urutan prioritas + "Coba atur sendiri" (FR-F2 sampai F4, PRD 9), pemilik: A
// Semua skor dihitung di browser dengan lib/scoring dari hasil priority_factors, jadi slider
// langsung mengubah urutan tanpa ke server dan tanpa menyimpan apa pun (SDD 2.1, 8.3).
// Percobaan ikut tersimpan di URL (?bobot=30,20,5,20,15,10) supaya bisa dibagikan.
// Petugas perencana kota bisa menyimpan percobaan sebagai aturan resmi, wajib dengan alasan (R10 save_weights).
// Urutan isi (audit bahasa awam 10 Nov): hasil dulu (saring jenis, kalimat, peta + rincian, daftar urutan), lalu panel
// "Coba atur sendiri". Di layar lebar panel pindah ke kolom kiri lewat lg:col-start/row-start (bukan CSS order),
// jadi urutan baca pembaca layar dan urutan Tab sama dengan urutan tampilan di HP.
// Bahasa warga: masalah (bukan isu), urutan ke-N (bukan peringkat), tingkat kepentingan (bukan bobot),
// aturan resmi (bukan bobot acuan), pilihan cepat (bukan preset), percobaan (bukan simulasi).

'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ubahParameter } from '@/lib/pilihan-url';
import { pesanError } from '@/lib/errors';
import { DEFINISI_FAKTOR, KATEGORI, NAMA_FAKTOR } from '@/lib/konten';
import {
  bobotEfektif,
  FAKTOR,
  formatPoin,
  hitungSkor,
  kalimatKonsekuensi,
  LABEL_FAKTOR,
  LABEL_PRESET,
  normalisasiBobot,
  PENAHAN_FAKTOR,
  penahanUtama,
  PRESET,
  selisihPeringkat,
  type NamaPreset,
} from '@/lib/scoring';
import { createClient } from '@/lib/supabase/client';
import type { Bobot, Faktor, FaktorIsu, SkorIsu } from '@/lib/types';
import PetaKecamatan, { KeteranganKelas } from '../PetaKecamatan';
import { umumkan } from '../Pengumuman';
import Ikon from '../ui/Ikon';
import Istilah from '../ui/Istilah';
import KelompokCair from '../ui/KelompokCair';
import { kelasTautan, Tombol } from '../ui/Tombol';
import BarKontribusi, { WARNA_FAKTOR } from './BarKontribusi';

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

/** Hal yang memberi poin terbanyak, untuk "alasan utama: …" di baris daftar; null kalau skornya 0. */
function alasanUtama(s: SkorIsu): Faktor | null {
  const f = [...FAKTOR].sort((a, b) => s.kontribusi[b] - s.kontribusi[a])[0];
  return s.kontribusi[f] > 0 ? f : null;
}

function TandaGeser({ n }: { n: number | undefined }) {
  if (n === undefined || n === 0) return <span className="text-kecil text-lembut">sama</span>;
  return (
    <span className={`angka inline-flex items-center text-kecil font-bold ${n > 0 ? 'text-hijau' : 'text-merah-tua'}`}>
      <Ikon nama={n > 0 ? 'naik' : 'turun'} className="size-3.5" />
      {Math.abs(n)}
      <span className="sr-only">{n > 0 ? ' naik' : ' turun'} dibanding urutan dengan aturan resmi</span>
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
  // Tingkat kepentingan yang benar-benar dipakai hitungSkor (tanpa data lama menunggu, hal itu dihitung 0), supaya
  // "12,3 dari 20 poin" di rincian cocok dengan skornya.
  const bobotPakai = useMemo(() => (isuAktif.length > 0 ? bobotEfektif(isuAktif, bobot) : bobot), [isuAktif, bobot]);
  const selisih = useMemo(() => selisihPeringkat(resmi, simulasi), [resmi, simulasi]);
  const konsekuensi = disimulasikan ? kalimatKonsekuensi(resmi, simulasi) : null;

  const { skorKecamatan, keteranganKecamatan } = useMemo(() => {
    const skor: Record<string, number> = {};
    const ket: Record<string, string> = {};
    for (const s of simulasi) {
      if (skor[s.kode_wilayah] === undefined) {
        skor[s.kode_wilayah] = s.skor;
        ket[s.kode_wilayah] = `Masalah teratas: ${s.kategori.toLowerCase()}, urutan ke-${s.peringkat}`;
      }
    }
    return { skorKecamatan: skor, keteranganKecamatan: ket };
  }, [simulasi]);

  const terpilih = simulasi.find((s) => s.id === pilihId) ?? simulasi[0];
  const penahan = terpilih ? penahanUtama(terpilih, bobotPakai) : null;
  const adaPenahan = Boolean(terpilih && penahan && 100 * bobotPakai[penahan] - terpilih.kontribusi[penahan] > 0.05);
  const tampil = semua ? simulasi : simulasi.slice(0, JUMLAH_AWAL);
  const namaKategori = kategori ? KATEGORI[kategori - 1].nama.toLowerCase() : null;
  // Baris daftar memakai lebar kolom (@container), bukan lebar layar: di 1024 px kolom ini hanya ±550 px.
  // Nama dan batang berbagi sisa ruang 3:2; kolom tanda naik/turun hanya diberi ruang saat ada percobaan.
  const kolomBaris = disimulasikan
    ? '@xl:grid-cols-[2.75rem_3rem_minmax(0,3fr)_minmax(0,2fr)_5.5rem]'
    : '@xl:grid-cols-[2.75rem_0_minmax(0,3fr)_minmax(0,2fr)_5.5rem]';
  const presetAktif = (Object.keys(PRESET) as NamaPreset[]).find((p) => sama(bobot, normalisasiBobot(PRESET[p])));

  function setSlider(nilai: Slider) {
    const total = FAKTOR.reduce((s, f) => s + nilai[f], 0);
    const acuan = total > 0 && sama(normalisasiBobot(nilai), bobotResmi);
    ubahParameter({ bobot: acuan ? null : FAKTOR.map((f) => nilai[f]).join(',') });
  }

  // FLIP: setiap baris meluncur dari posisi lamanya ke posisi barunya, jadi perubahan urutan terlihat.
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
    // Panel rincian ada di atas daftar: kalau sedang jauh dari layar, bawa ke sana.
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
      umumkan('Tautan disalin, lengkap dengan percobaanmu, jenis masalah, dan masalah yang dipilih.');
    } catch {
      umumkan('Salin tautan dari bilah alamat browser.');
    }
  }

  /** "dengan aturan resmi urutan ke-6 (naik 2)" untuk masalah terpilih saat ada percobaan. */
  function urutanResmi(s: SkorIsu): string {
    const ke = resmi.find((r) => r.id === s.id)?.peringkat;
    const n = selisih[s.id] ?? 0;
    if (n === 0) return `dengan aturan resmi juga urutan ke-${ke}`;
    return `dengan aturan resmi urutan ke-${ke} (${n > 0 ? 'naik' : 'turun'} ${Math.abs(n)})`;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)] xl:grid-cols-[21rem_minmax(0,1fr)]">
      {/* HASIL — di DOM lebih dulu (HP: warga melihat jawabannya dulu); di layar lebar kolom kanan.
          @container: peta dan rincian masalah berdampingan hanya kalau kolom ini cukup lebar (≥ 36rem), apa pun ukuran
          layarnya. Di iPad miring dengan menu samping, kolomnya sempit walau layarnya "lebar". */}
      <div className="@container grid min-w-0 content-start gap-5 lg:col-start-2 lg:row-start-1">
        {/* Saring jenis masalah + kalimat ringkas */}
        <KelompokCair className="flex flex-wrap gap-2" role="group" aria-label="Pilih jenis masalah">
          {[{ id: null, nama: 'Semua jenis masalah' }, ...KATEGORI].map((k) => (
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
        </KelompokCair>
        <p
          aria-live="polite"
          className={`flex min-h-[3.25rem] items-start gap-3 rounded-kartu border px-4 py-3 text-badan font-semibold transition-colors ${
            disimulasikan ? 'border-biru bg-biru-pudar text-biru-tua' : 'border-garis bg-permukaan'
          }`}
        >
          <Ikon nama={disimulasikan ? 'geser' : 'info'} className="mt-0.5 size-5 shrink-0" />
          {konsekuensi ?? (
            <span>
              Ada {simulasi.length} masalah{namaKategori ? ` ${namaKategori}` : ''} yang dinilai. Coba{' '}
              <a href="#coba-atur" className={kelasTautan}>
                pilihan cepat
              </a>{' '}
              <span className="lg:hidden">di bawah</span>
              <span className="hidden lg:inline">di kiri</span> dan lihat urutannya berubah.
            </span>
          )}
        </p>

        {/* Peta + masalah terpilih */}
        <div className="grid gap-5 @xl:grid-cols-2">
          <figure className="kartu p-4">
            <PetaKecamatan
              skor={skorKecamatan}
              keterangan={keteranganKecamatan}
              sorot={terpilih?.kode_wilayah}
              onPilih={pilihKecamatan}
              judul="Peta kecamatan Jakarta, diwarnai menurut skor masalah terberat di tiap kecamatan. Pilih kecamatan untuk melihat masalah teratasnya. Daftar urutan di bawah berisi data yang sama."
            />
            <figcaption className="mt-3 grid gap-2">
              <KeteranganKelas />
              <p className="text-kecil text-lembut">
                Ketuk kecamatan untuk melihat masalah teratasnya. Daftar di bawah berisi data yang sama.
              </p>
            </figcaption>
          </figure>

          {terpilih && (
            <section ref={panelIsu} aria-labelledby="judul-masalah" aria-live="polite" className="kartu scroll-mt-24 p-5">
              {/* Judul dan penjelasan berganti dengan gerak saat masalah lain dipilih; bar di bawahnya tidak di-key
                  supaya lebarnya tetap bergeser dari nilai masalah lama ke masalah baru. */}
              <div key={terpilih.id} className="ganti">
                <p className="text-kecil">
                  <span className="font-bold text-biru-tua">Urutan ke-{terpilih.peringkat}</span>
                  <span className="text-lembut"> dari {simulasi.length} masalah</span>
                  {disimulasikan && <span className="text-lembut"> · {urutanResmi(terpilih)}</span>}
                </p>
                <h2 id="judul-masalah" className="mt-2 text-sub font-bold">
                  {terpilih.kategori} di {terpilih.kecamatan}
                </h2>
                <p className="text-kecil text-lembut">
                  {terpilih.kota} · {terpilih.laporan_aktif} laporan belum selesai, {terpilih.laporan_terverifikasi} sudah
                  diperiksa dinas
                </p>
                <div className="mt-4 grid gap-1 rounded-kontrol bg-latar p-3 text-kecil">
                  <p className="font-semibold">{terpilih.penjelasan}</p>
                  {adaPenahan && penahan && <p>Yang paling menahan: {PENAHAN_FAKTOR[penahan]}.</p>}
                </div>
              </div>
              <div className="mt-5">
                <BarKontribusi isu={terpilih} bobot={bobotPakai} />
              </div>
              <Link
                href={`/kecamatan/${terpilih.kode_wilayah}`}
                className="mt-3 inline-flex min-h-11 items-center gap-1 text-kecil font-semibold text-biru-tua underline-offset-4 hover:underline"
              >
                Lihat Kecamatan {terpilih.kecamatan}
                <Ikon nama="kanan" className="size-4" />
              </Link>
            </section>
          )}
        </div>

        {/* Daftar urutan: seperti daftar hasil, satu baris satu masalah. */}
        <section id="daftar-urutan" aria-labelledby="judul-urutan" className="kartu scroll-mt-24 overflow-hidden">
          <div className="border-b border-garis px-4 py-4 sm:px-5">
            <h2 id="judul-urutan" className="text-lead font-bold">
              Urutan masalah, dari yang paling perlu didahulukan
            </h2>
            <p className="mt-1 text-kecil text-lembut">
              Urutan 1 = paling didahulukan. Skor 0–100 adalah perbandingan dengan masalah lain di Jakarta, bukan nilai
              baik-buruk.
              {disimulasikan && ' Panah = naik atau turun dibanding urutan dengan aturan resmi.'}{' '}
              <a href="#cara-hitung" className={kelasTautan}>
                Cara menghitungnya
              </a>
            </p>
          </div>
          <ol ref={daftar} className="relative grid">
            {tampil.map((s) => {
              const alasan = alasanUtama(s);
              return (
                <li key={s.id} data-isu={s.id} className="relative border-b border-garis will-change-transform last:border-b-0">
                  <button
                    type="button"
                    aria-pressed={s.id === terpilih?.id}
                    onClick={() => pilihIsu(s.id)}
                    className={`grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-x-3 gap-y-2 bg-permukaan px-4 py-3 text-left transition-colors hover:bg-biru-pudar aria-pressed:bg-biru-muda/60 aria-pressed:shadow-[inset_3px_0_0_var(--color-biru)] @xl:px-5 ${kolomBaris}`}
                  >
                    <span className="angka text-lead font-bold text-biru-tua">
                      <span className="sr-only">Urutan ke-</span>
                      {s.peringkat}
                    </span>
                    <span className="hidden @xl:block">{disimulasikan && <TandaGeser n={selisih[s.id]} />}</span>
                    <span className="min-w-0">
                      <span className="block text-badan font-bold @xl:truncate">
                        {s.kecamatan}
                        <span className="font-normal text-lembut"> · {s.kota}</span>
                      </span>
                      <span className="block text-kecil text-lembut">
                        {s.kategori}
                        {alasan && ` · alasan utama: ${LABEL_FAKTOR[alasan]}`}
                        {disimulasikan && (
                          <span className="@xl:hidden">
                            {' '}
                            · <TandaGeser n={selisih[s.id]} />
                          </span>
                        )}
                      </span>
                    </span>
                    {/* Satu warna: panjang = skor dari 100. Asal poinnya (enam warna) ada di panel rincian. */}
                    <span
                      aria-hidden="true"
                      className="col-span-2 col-start-2 row-start-2 block h-2 overflow-hidden rounded-full bg-lapis @xl:col-span-1 @xl:col-start-4 @xl:row-start-1"
                    >
                      <span
                        className="block h-full rounded-full bg-biru transition-[width] duration-500 ease-keluar motion-reduce:transition-none"
                        style={{ width: `${Math.min(100, Math.max(0, s.skor))}%` }}
                      />
                    </span>
                    <span className="col-start-3 row-start-1 text-right @xl:col-start-5">
                      <span className="block text-kecil leading-none text-lembut">skor</span>
                      <span className="angka text-lead font-bold">{formatPoin(s.skor)}</span>
                      <span className="angka text-kecil text-lembut">
                        <span aria-hidden="true">/100</span>
                        <span className="sr-only"> dari 100</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          {simulasi.length > JUMLAH_AWAL && (
            <div className="border-t border-garis p-4 sm:px-5">
              <Tombol varian="kedua" onClick={() => setSemua((x) => !x)}>
                {semua ? `Tampilkan ${JUMLAH_AWAL} teratas saja` : `Tampilkan semua ${simulasi.length} masalah`}
              </Tombol>
            </div>
          )}
        </section>
      </div>

      {/* COBA ATUR SENDIRI — di DOM sesudah hasil; di layar lebar kolom kiri dan menempel saat digulir. */}
      <section id="coba-atur" aria-labelledby="judul-atur" className="scroll-mt-24 lg:col-start-1 lg:row-start-1">
        <div className="kartu p-5 lg:sticky lg:top-20">
          <div className="flex items-center justify-between gap-4">
            <h2 id="judul-atur" className="flex items-center gap-2 text-lead font-bold">
              <Ikon nama="geser" className="size-5 text-biru" />
              Coba atur sendiri
            </h2>
            <span
              aria-live="polite"
              className={`rounded-[0.375rem] px-2 py-0.5 text-kecil font-bold transition-colors ${disimulasikan ? 'bg-biru text-white' : 'bg-lapis text-lembut'}`}
            >
              {disimulasikan ? 'Percobaanmu' : 'Aturan resmi'}
            </span>
          </div>
          <p className="mt-2 text-kecil text-lembut">
            Tingkat kepentingan = seberapa penting tiap hal. Pilih salah satu pilihan cepat, atau geser sendiri. Persennya
            disesuaikan otomatis agar totalnya 100%. Ini hanya percobaan: urutan resmi tidak berubah.
          </p>

          <p id="label-pilihan-cepat" className="mt-4 text-kecil font-semibold">
            Pilihan cepat
          </p>
          <KelompokCair className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="label-pilihan-cepat">
            {(Object.keys(PRESET) as NamaPreset[]).map((p) => (
              <button key={p} type="button" aria-pressed={presetAktif === p} onClick={() => setSlider(keSlider(PRESET[p]))} className="chip">
                {LABEL_PRESET[p]}
              </button>
            ))}
          </KelompokCair>

          {/* Di HP hasilnya ada di atas panel ini: tampilkan akibat percobaan di sini juga, dengan jalan pintas ke daftar.
              Tidak aria-live: kalimat yang sama di atas sudah diumumkan. */}
          {konsekuensi && (
            <div className="mt-4 rounded-kontrol border border-biru bg-biru-pudar px-3 pt-3 pb-1 text-kecil font-semibold text-biru-tua lg:hidden">
              <p>{konsekuensi}</p>
              <a href="#daftar-urutan" className="inline-flex min-h-11 items-center gap-1.5 underline underline-offset-4">
                <Ikon nama="atas" className="size-4" />
                Lihat urutannya
              </a>
            </div>
          )}

          <button
            type="button"
            aria-expanded={sliderTerbuka}
            aria-controls="daftar-slider"
            onClick={() => setSliderTerbuka((b) => !b)}
            className="mt-4 flex min-h-11 w-full items-center justify-between gap-2 border-t border-garis pt-3 text-badan font-bold lg:hidden"
          >
            Geser sendiri keenam hal
            <Ikon nama={sliderTerbuka ? 'naik' : 'turun'} className="size-5" />
          </button>

          <div id="daftar-slider" className={`ganti mt-4 border-garis lg:block lg:border-t lg:pt-4 ${sliderTerbuka ? 'block' : 'hidden'}`}>
            <p className="text-kecil font-semibold">Tingkat kepentingan</p>
            <p className="text-kecil text-lembut">Menaikkan satu hal otomatis mengecilkan yang lain.</p>
            <ul className="mt-3 grid gap-2">
              {FAKTOR.map((f) => {
                const berubah = Math.abs(bobot[f] - bobotResmi[f]) >= 0.005;
                return (
                  <li key={f}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="flex items-center gap-2 text-kecil font-semibold">
                        <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ background: WARNA_FAKTOR[f] }} />
                        <Istilah id={`istilah-bobot-${f}`} judul={NAMA_FAKTOR[f]} definisi={DEFINISI_FAKTOR[f]}>
                          {NAMA_FAKTOR[f]}
                        </Istilah>
                      </span>
                      <span className="angka shrink-0 text-kecil">
                        <span className={`font-bold ${berubah ? 'text-biru-tua' : ''}`}>{persenBobot(bobot[f])}</span>
                        {berubah && <span className="text-lembut"> (resmi {persenBobot(bobotResmi[f])})</span>}
                      </span>
                    </div>
                    <label htmlFor={`bobot-${f}`} className="sr-only">
                      Tingkat kepentingan {NAMA_FAKTOR[f].toLowerCase()}
                    </label>
                    <input
                      id={`bobot-${f}`}
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={slider[f]}
                      onChange={(e) => setSlider({ ...slider, [f]: Number(e.target.value) })}
                      aria-describedby={`definisi-${f}`}
                      aria-valuetext={`${persenBobot(bobot[f])}${berubah ? `, aturan resmi ${persenBobot(bobotResmi[f])}` : ''}`}
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

          {totalSlider === 0 && (
            <p role="alert" className="goyang mt-3 rounded-kontrol bg-merah-muda px-3 py-2 text-kecil font-semibold text-merah-tua">
              Kalau semuanya 0, tidak ada yang bisa dihitung. Naikkan minimal satu hal. Sementara ini urutan memakai aturan
              resmi.
            </p>
          )}

          <div className="mt-5 grid gap-2">
            <Tombol varian="garis" onClick={() => setSlider(keSlider(bobotResmi))} disabled={!disimulasikan && totalSlider > 0}>
              Kembali ke aturan resmi
            </Tombol>
            <Tombol varian="kedua" onClick={salinTautan}>
              <Ikon nama="tautan" className="size-4" />
              Bagikan percobaan ini
            </Tombol>
          </div>

          {perencana && <SimpanBobot bobot={bobot} aktif={disimulasikan} onTersimpan={() => router.refresh()} />}
        </div>
      </section>
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
    umumkan('Aturan resmi tersimpan dan tercatat di riwayat perubahan aturan.');
    onTersimpan();
  }

  return (
    <form onSubmit={simpan} className="mt-5 grid gap-3 rounded-kontrol border border-biru/30 bg-biru-pudar p-4">
      <p className="flex items-center gap-2 text-badan font-bold">
        <Ikon nama="kunci" className="size-4" /> Khusus petugas perencana kota
      </p>
      <label htmlFor="alasan-bobot" className="text-kecil font-semibold">
        Alasan perubahan <span className="text-merah">*</span>
        <span className="block font-normal text-lembut">
          Wajib, minimal 10 huruf. Alasan ini tampil untuk umum di riwayat perubahan aturan.
        </span>
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
        {memuat && <Ikon nama="muat" className="putar size-4" />}
        {memuat ? 'Menyimpan…' : 'Simpan sebagai aturan resmi'}
      </Tombol>
      {!aktif && <p className="text-kecil text-lembut">Ubah dulu tingkat kepentingannya. Saat ini masih sama dengan aturan resmi.</p>}
      {galat && (
        <p id="galat-bobot" role="alert" className="text-kecil font-semibold text-merah-tua">
          {galat}
        </p>
      )}
    </form>
  );
}
