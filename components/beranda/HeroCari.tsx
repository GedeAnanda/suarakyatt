// components/beranda/HeroCari.tsx — layar pertama Beranda: foto, "Kenapa belum?", dan kotak cari bertab (pemilik: A)
// Seperti hero situs travel: foto lebar membulat, slogan di atasnya, lalu kotak putih bertab yang menumpang
// di tepi bawah foto. Tiap tab adalah pintu ke fitur yang sudah ada: lacak kode (GET /lacak), uji bobot
// (/prioritas?bobot=&kategori=), saring peta (/peta?kategori=&status=), rapor instansi, dan lapor masalah.
// Foto dan kalimat di bawah judul ikut berganti mengikuti tab. Tanpa JavaScript, tab pertama tetap berfungsi.

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { FOTO, KANAL_RESMI, KATEGORI, type FotoTerbuka } from '@/lib/konten';
import { FAKTOR, LABEL_PRESET, PRESET, type NamaPreset } from '@/lib/scoring';
import type { StatusLaporan } from '@/lib/types';
import { LABEL_STATUS } from '../BadgeStatus';
import Ikon, { type NamaIkon } from '../ui/Ikon';

type IdTab = 'lacak' | 'prioritas' | 'peta' | 'rapor' | 'lapor';

const TAB: { id: IdTab; label: string; ikon: NamaIkon; slogan: string; foto: FotoTerbuka; posisi?: string }[] = [
  {
    id: 'lacak',
    label: 'Lacak laporan',
    ikon: 'lacak',
    slogan: 'Lacak laporanmu, lalu lihat alasan di balik urutan penanganannya.',
    foto: FOTO.ciliwung,
  },
  {
    id: 'prioritas',
    label: 'Uji prioritas',
    ikon: 'geser',
    slogan: 'Bobot bukan kebenaran, melainkan pilihan. Ganti pilihannya dan lihat urutannya bergeser.',
    foto: FOTO.banjirTanjungDuren,
    posisi: '50% 62%',
  },
  {
    id: 'peta',
    label: 'Peta laporan',
    ikon: 'peta',
    slogan: 'Semua laporan warga di Jakarta beserta statusnya, termasuk yang ditolak.',
    foto: FOTO.trotoar,
  },
  {
    id: 'rapor',
    label: 'Rapor instansi',
    ikon: 'lencana',
    slogan: 'Nilai A sampai E tiap instansi, selalu bersama tingkat penolakannya.',
    foto: FOTO.lampuJalan,
    posisi: '50% 30%',
  },
  {
    id: 'lapor',
    label: 'Lapor masalah',
    ikon: 'tambah',
    slogan: 'Laporkan masalah kota dengan foto dan titik lokasi. Laporanmu ikut menentukan prioritas.',
    foto: FOTO.jalan1975,
  },
];

const KEUNGGULAN = ['42 kecamatan DKI Jakarta dinilai', 'Enam faktor skor, semuanya terbuka', 'Laporan yang ditolak tetap tampil'];

const PRESET_URUT: NamaPreset[] = ['keselamatan', 'kerentanan', 'suara_warga'];
const STATUS_PETA: StatusLaporan[] = ['menunggu', 'diverifikasi', 'diproses', 'selesai', 'ditolak'];

/** Bobot preset dalam bentuk parameter URL Simulator: "40,15,0,30,10,5" (urutan FAKTOR, persen bulat). */
const bobotUrl = (p: NamaPreset) => FAKTOR.map((f) => Math.round(PRESET[p][f] * 100)).join(',');

const kelasBidang =
  'flex h-14 min-w-0 items-center gap-3 rounded-kontrol border border-garis-isian bg-permukaan px-4 transition-[border-color,box-shadow] focus-within:border-biru focus-within:shadow-[0_0_0_3px_rgb(15_118_110/0.22)] hover:border-biru';
const kelasMasukan =
  'h-full w-0 min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 text-badan font-semibold shadow-none outline-none focus:shadow-none';
const kelasCari =
  'flex h-14 shrink-0 items-center justify-center gap-2 rounded-kontrol bg-biru px-7 text-lead font-bold text-white transition-[background-color,scale] hover:bg-biru-tua active:scale-[0.98]';

function Pilihan({
  name,
  label,
  ikon,
  children,
}: {
  name: string;
  label: string;
  ikon: NamaIkon;
  children: ReactNode;
}) {
  return (
    <label className={`${kelasBidang} relative`}>
      <Ikon nama={ikon} className="size-5 text-lembut" />
      <span className="sr-only">{label}</span>
      <select name={name} className={`${kelasMasukan} appearance-none pr-6`}>
        {children}
      </select>
      <Ikon nama="turun" className="pointer-events-none absolute right-4 size-4 text-lembut" />
    </label>
  );
}

export default function HeroCari({ panelRapor }: { panelRapor: ReactNode }) {
  const router = useRouter();
  const [aktif, setAktif] = useState<IdTab>('lacak');
  const daftarTab = useRef<HTMLDivElement>(null);
  const kotak = useRef<HTMLDivElement>(null);
  const tab = TAB.find((t) => t.id === aktif)!;

  // Selama kotak cari ini terlihat, kolom cari di header disembunyikan (globals.css, .cari-kepala) supaya lacak
  // kode tidak tampil dua kali. Begitu kotak tergulir ke balik header, <html data-kotak-lewat> memunculkannya.
  useEffect(() => {
    const el = kotak.current;
    if (!el) return;
    const html = document.documentElement;
    // Tinggi header berbeda di ponsel miring (3,5rem), jadi diukur, bukan ditulis tetap.
    const kepala = document.querySelector('header')?.offsetHeight ?? 64;
    const pengamat = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting && e.boundingClientRect.top < kepala) html.setAttribute('data-kotak-lewat', '');
        else html.removeAttribute('data-kotak-lewat');
      },
      { rootMargin: `-${kepala}px 0px 0px 0px` },
    );
    pengamat.observe(el);
    return () => {
      pengamat.disconnect();
      html.removeAttribute('data-kotak-lewat');
    };
  }, []);

  function pindah(arah: number, ke?: number) {
    const i = ke ?? (TAB.findIndex((t) => t.id === aktif) + arah + TAB.length) % TAB.length;
    setAktif(TAB[i].id);
    daftarTab.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[i]?.focus();
  }

  /** Form GET tetap jalan tanpa JavaScript; dengan JavaScript, parameter kosong tidak ikut ke URL. */
  function kirimBersih(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const isi = new URLSearchParams();
    for (const [k, v] of new FormData(form)) if (typeof v === 'string' && v) isi.set(k, v);
    const q = isi.toString();
    router.push(`${form.getAttribute('action')}${q ? `?${q}` : ''}`);
  }

  return (
    <section aria-labelledby="judul-beranda" className="bingkai pt-4 sm:pt-6">
      {/* Foto memenuhi seluruh hero, termasuk di belakang kotak cari, jadi kotak putih menumpang penuh di atasnya. */}
      <div className="relative isolate overflow-hidden rounded-besar bg-navy">
        {TAB.map((t, i) => (
          <Image
            key={t.id}
            src={t.foto.src}
            alt=""
            fill
            sizes="(min-width: 1280px) 75rem, 100vw"
            {...(i === 0 ? { loading: 'eager' as const, fetchPriority: 'high' as const } : {})}
            className={`silang -z-20 object-cover brightness-75 ${t.id === aktif ? 'opacity-100' : 'opacity-0'}`}
            style={{ objectPosition: t.posisi ?? '50% 50%' }}
          />
        ))}
        {/* Lapisan navy gelap di atas foto, senada dengan spanduk Batavia: 85% di atas, turun ke 30% di bawah. Area
            teks tetap pekat; foto diredupkan (brightness-75) supaya teks putih tetap terbaca. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(15_42_51/0.85)_0%,rgb(15_42_51/0.6)_50%,rgb(15_42_51/0.3)_100%)]"
        />
        <div className="di-gelap px-5 pt-9 pb-7 text-white sm:px-10 sm:pt-12 sm:pb-9 lg:px-12 lg:pt-14 lg:pb-10">
          <h1 id="judul-beranda" className="text-hero font-bold tracking-[-0.03em]">
            Kenapa belum?
            <span className="sr-only"> suaRAkyat membuka alasan di balik urutan penanganan masalah kota.</span>
          </h1>
          {/* Tinggi dua baris supaya kotak cari tidak naik-turun saat kalimat tab berganti panjang. */}
          <p key={aktif} className="ganti mt-3 max-w-[46ch] text-lead font-medium text-white/95 sm:min-h-[2.7em] sm:text-sub">
            {tab.slogan}
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-kecil font-medium sm:text-badan">
            {KEUNGGULAN.map((k) => (
              <li key={k} className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-white/20">
                  <Ikon nama="centang" className="size-3.5" />
                </span>
                {k}
              </li>
            ))}
          </ul>
        </div>
        <p className="di-gelap absolute top-3 right-4 hidden max-w-[40ch] text-right text-mini text-white/75 sm:block">
          Foto: {tab.foto.pembuat},{' '}
          <a href={tab.foto.url} target="_blank" rel="noreferrer" className="underline">
            {tab.foto.lisensi}
          </a>
        </p>

      {/* Kotak cari: menumpang di atas foto, seperti kotak pencarian hotel dan tiket. */}
      <div className="px-2 pb-2 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 xl:px-10 xl:pb-10">
      <div id="kotak-cari" ref={kotak} className="relative rounded-besar bg-permukaan text-teks shadow-kotak">
        <div
          ref={daftarTab}
          role="tablist"
          aria-label="Mau apa hari ini?"
          className="tanpa-batang flex overflow-x-auto border-b border-garis px-2 sm:px-4"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') pindah(1);
            else if (e.key === 'ArrowLeft') pindah(-1);
            else if (e.key === 'Home') pindah(0, 0);
            else if (e.key === 'End') pindah(0, TAB.length - 1);
            else return;
            e.preventDefault();
          }}
        >
          {TAB.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={t.id === aktif}
              aria-controls={`panel-${t.id}`}
              tabIndex={t.id === aktif ? 0 : -1}
              onClick={() => setAktif(t.id)}
              className="tab h-14 text-kecil sm:text-badan"
            >
              <Ikon nama={t.ikon} className="size-5" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          <div role="tabpanel" id="panel-lacak" aria-labelledby="tab-lacak" hidden={aktif !== 'lacak'}>
            <form action="/lacak" method="get" role="search" className="flex flex-col gap-3 sm:flex-row">
              {/* sm:flex-1, bukan flex-1: di kolom (ponsel) flex-basis 0 membuat tinggi h-14 diabaikan. */}
              <label className={`${kelasBidang} sm:flex-1`}>
                <Ikon nama="cari" className="size-5 text-lembut" />
                <span className="sr-only">Kode laporan</span>
                <input
                  name="kode"
                  placeholder="Masukkan kode laporan, misalnya SR-K7W3PA"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className={`${kelasMasukan} font-kode text-lead tracking-wide uppercase placeholder:font-normal placeholder:tracking-normal placeholder:normal-case`}
                />
              </label>
              <button type="submit" className={kelasCari}>
                <Ikon nama="cari" className="size-5" />
                Lacak
              </button>
            </form>
            <p className="mt-3 text-kecil text-lembut">
              Kode dikirim saat laporan terkirim. Halaman lacak menampilkan status, riwayat, batas waktu, dan posisi isunya
              di daftar prioritas.{' '}
              <Link href="/contoh" className="font-semibold text-biru-tua hover:underline">
                Belum punya kode? Buka laporan contoh
              </Link>
            </p>
          </div>

          <div role="tabpanel" id="panel-prioritas" aria-labelledby="tab-prioritas" hidden={aktif !== 'prioritas'}>
            <form action="/prioritas" method="get" onSubmit={kirimBersih}>
              <fieldset>
                <legend className="text-kecil font-semibold">Urutkan isu wilayah dengan bobot</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  <label className="chip">
                    <input type="radio" name="bobot" value="" defaultChecked className="sr-only" />
                    Bobot resmi
                  </label>
                  {PRESET_URUT.map((p) => (
                    <label key={p} className="chip">
                      <input type="radio" name="bobot" value={bobotUrl(p)} className="sr-only" />
                      {LABEL_PRESET[p]}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <Pilihan name="kategori" label="Kategori masalah" ikon="geser">
                    <option value="">Semua kategori masalah</option>
                    {KATEGORI.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))}
                  </Pilihan>
                </div>
                <button type="submit" className={kelasCari}>
                  Lihat urutan
                </button>
              </div>
            </form>
          </div>

          <div role="tabpanel" id="panel-peta" aria-labelledby="tab-peta" hidden={aktif !== 'peta'}>
            <form action="/peta" method="get" onSubmit={kirimBersih} className="flex flex-col gap-3 lg:flex-row">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Pilihan name="kategori" label="Kategori" ikon="geser">
                  <option value="">Semua kategori</option>
                  {KATEGORI.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama}
                    </option>
                  ))}
                </Pilihan>
                <Pilihan name="status" label="Status" ikon="info">
                  <option value="">Semua status</option>
                  {STATUS_PETA.map((s) => (
                    <option key={s} value={s}>
                      {LABEL_STATUS[s]}
                    </option>
                  ))}
                </Pilihan>
              </div>
              <button type="submit" className={kelasCari}>
                <Ikon nama="peta" className="size-5" />
                Tampilkan di peta
              </button>
            </form>
            <p className="mt-3 text-kecil text-lembut">
              Penolakan tidak disembunyikan: laporan yang ditolak tampil di peta lengkap dengan alasannya.
            </p>
          </div>

          <div role="tabpanel" id="panel-rapor" aria-labelledby="tab-rapor" hidden={aktif !== 'rapor'}>
            {panelRapor}
          </div>

          <div role="tabpanel" id="panel-lapor" aria-labelledby="tab-lapor" hidden={aktif !== 'lapor'}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <ol className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                {['Pilih kategori', 'Titik di peta', '1–3 foto', 'Cerita singkat'].map((l, i) => (
                  <li key={l} className="flex items-center gap-2.5 rounded-kontrol bg-latar px-3 py-3 text-kecil font-semibold">
                    <span className="angka flex size-6 shrink-0 items-center justify-center rounded-full bg-biru text-mini text-white">
                      {i + 1}
                    </span>
                    {l}
                  </li>
                ))}
              </ol>
              <Link href="/lapor" className={kelasCari}>
                <Ikon nama="tambah" className="size-5" />
                Mulai lapor
              </Link>
            </div>
            <p className="mt-3 text-kecil text-lembut">
              Perlu akun warga. suaRAkyat bukan kanal pengaduan resmi; untuk pengaduan resmi gunakan{' '}
              {KANAL_RESMI.map((k, i) => (
                <span key={k.nama}>
                  {i > 0 && ' atau '}
                  <a href={k.url} target="_blank" rel="noreferrer" className="font-semibold text-biru-tua hover:underline">
                    {k.nama}
                  </a>
                </span>
              ))}
              .
            </p>
          </div>
        </div>

        <p className="border-t border-garis px-4 py-3 text-kecil text-lembut sm:px-6">
          Melihat peta, rapor, dan dashboard tidak perlu akun.{' '}
          <Link href="/masuk" className="font-semibold text-biru-tua hover:underline">
            Masuk atau daftar
          </Link>{' '}
          untuk melapor, mendukung laporan warga, dan memberi rating.
        </p>
      </div>
      </div>
      </div>
    </section>
  );
}
