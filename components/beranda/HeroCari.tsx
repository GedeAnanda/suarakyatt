// components/beranda/HeroCari.tsx — layar pertama Beranda: foto, "Kenapa belum?", dan kotak cari bertab (pemilik: A)
// Seperti hero situs travel: foto lebar membulat, judul dan subjudul tetap di atasnya, lalu kotak putih bertab yang
// menumpang di tepi bawah foto. Tiap tab adalah pintu ke fitur yang sudah ada: lacak laporan (GET /lacak), lapor
// masalah, atur urutan (/prioritas?bobot=&kategori=), peta laporan (/peta?kategori=&status=), dan rapor dinas.
// Aksi utama membuka percobaan prioritas. Di HP, tombol Lacak membuka tab cari;
// Lapor tetap tersedia di header dan tab, bersama peringatan "bukan saluran resmi".
// Foto ikut berganti mengikuti tab. Tanpa JavaScript, tab pertama dan kedua tombol tetap berfungsi.

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { FOTO, KANAL_RESMI, KATEGORI, type FotoTerbuka } from '@/lib/konten';
import { FAKTOR, LABEL_PRESET, PRESET, type NamaPreset } from '@/lib/scoring';
import type { StatusLaporan } from '@/lib/types';
import { LABEL_STATUS } from '../BadgeStatus';
import Ikon, { type NamaIkon } from '../ui/Ikon';
import KelompokCair from '../ui/KelompokCair';
import { kelasTombol } from '../ui/Tombol';

type IdTab = 'lacak' | 'prioritas' | 'peta' | 'rapor' | 'lapor';

// "Lapor masalah" di urutan kedua, bukan di ujung: di HP tab di ujung tersembunyi di balik geseran.
const TAB: { id: IdTab; label: string; foto: FotoTerbuka; posisi?: string }[] = [
  {
    id: 'lacak',
    label: 'Lacak laporan',
    foto: FOTO.ciliwung,
  },
  {
    id: 'lapor',
    label: 'Lapor masalah',
    foto: FOTO.jalan1975,
  },
  {
    id: 'prioritas',
    label: 'Atur urutan',
    foto: FOTO.banjirTanjungDuren,
    posisi: '50% 62%',
  },
  {
    id: 'peta',
    label: 'Peta laporan',
    foto: FOTO.trotoar,
  },
  {
    id: 'rapor',
    label: 'Rapor dinas',
    foto: FOTO.lampuJalan,
    posisi: '50% 30%',
  },
];

const SUBJUDUL =
  'Lihat alasan suatu masalah didahulukan. Coba ubah prioritasnya.';

const PRESET_URUT: NamaPreset[] = ['keselamatan', 'kerentanan', 'suara_warga'];
const STATUS_PETA: StatusLaporan[] = ['menunggu', 'diverifikasi', 'diproses', 'selesai', 'ditolak'];

/** Bobot preset dalam bentuk parameter URL Simulator: "40,15,0,30,10,5" (urutan FAKTOR, persen bulat). */
const bobotUrl = (p: NamaPreset) => FAKTOR.map((f) => Math.round(PRESET[p][f] * 100)).join(',');

const kelasBidang =
  'flex h-14 min-w-0 items-center gap-3 rounded-kontrol border border-garis-isian bg-permukaan px-4 transition-[border-color,box-shadow] focus-within:border-biru focus-within:shadow-[0_0_0_3px_rgb(15_118_110/0.22)] hover:border-biru';
const kelasMasukan =
  'h-full w-0 min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 text-badan font-normal shadow-none outline-none focus:shadow-none';
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
  // Foto tab baru diunduh setelah tab itu pernah dibuka (Lighthouse 10 Nov: 5 foto sekaligus ±500 KB di HP 4G lambat
  // membuat foto utama terlambat). Foto yang sudah dimuat tetap dipasang supaya pergantian silang tetap halus.
  const [dimuat, setDimuat] = useState<Set<IdTab>>(() => new Set(['lacak']));
  if (!dimuat.has(aktif)) setDimuat(new Set([...dimuat, aktif]));
  const daftarTab = useRef<HTMLDivElement>(null);
  const kotak = useRef<HTMLDivElement>(null);
  const masukanKode = useRef<HTMLInputElement>(null);
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

  /** Tombol aksi di HP: buka tab yang sesuai di kotak cari, bukan langsung pindah halaman. Tanpa JavaScript, href-nya jalan. */
  function bukaTab(id: IdTab, e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    setAktif(id);
    const halus = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    kotak.current?.scrollIntoView({ behavior: halus ? 'smooth' : 'auto', block: 'start' });
    if (id === 'lacak') masukanKode.current?.focus({ preventScroll: true });
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
    <section aria-labelledby="judul-beranda" className="bingkai pt-3 sm:pt-4">
      {/* Foto memenuhi seluruh hero, termasuk di belakang kotak cari, jadi kotak putih menumpang penuh di atasnya. */}
      <div className="relative isolate overflow-hidden rounded-besar bg-navy">
        {TAB.filter((t) => dimuat.has(t.id)).map((t, i) => (
          <Image
            key={t.id}
            src={t.foto.src}
            alt=""
            fill
            sizes="(min-width: 1280px) 75rem, 100vw"
            {...(i === 0 ? { loading: 'eager' as const, fetchPriority: 'high' as const } : {})}
            className={`silang masuk-foto -z-20 object-cover brightness-75 ${t.id === aktif ? 'opacity-100' : 'opacity-0'}`}
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
          </h1>
          <p className="mt-3 max-w-[48ch] text-lead font-normal sm:text-sub">{SUBJUDUL}</p>
          <div className="mt-5 flex flex-col gap-2 min-[480px]:flex-row">
            <Link href="/prioritas#coba-atur" className={kelasTombol('terang', 'min-h-11')}>
              Coba ubah prioritas
            </Link>
            <Link href="/lacak" onClick={(e) => bukaTab('lacak', e)} className={kelasTombol('terang-garis', 'min-h-11 sm:hidden')}>
              <Ikon nama="lacak" className="size-5" />
              Lacak laporan
            </Link>
          </div>
          <Link
            href="/kecamatan"
            className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-badan font-semibold underline underline-offset-4 hover:text-white/85"
          >
            Cek kecamatanmu
            <Ikon nama="kanan" className="panah size-4" />
          </Link>

        </div>
        <p className="di-gelap absolute top-3 right-4 hidden max-w-[40ch] text-right text-mini text-white/75 sm:block">
          Foto: {tab.foto.pembuat},{' '}
          <a href={tab.foto.url} target="_blank" rel="noreferrer" className="underline">
            {tab.foto.lisensi}
          </a>
        </p>

      {/* Kotak cari: menumpang di atas foto, seperti kotak pencarian hotel dan tiket. */}
      <div className="px-2 pb-2 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 xl:px-10 xl:pb-10">
      <div
        id="kotak-cari"
        ref={kotak}
        className="masuk relative rounded-besar bg-permukaan text-teks shadow-kotak"
        style={{ '--jeda': '240ms' } as CSSProperties}
      >
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
              {t.label}
            </button>
          ))}
        </div>

        {/* Kelas `ganti` di tiap panel: animasi CSS mulai ulang setiap kali atribut hidden dilepas, jadi panel yang baru
            dipilih selalu muncul dengan gerak singkat. */}
        <div className="p-4 sm:p-6">
          <div role="tabpanel" id="panel-lacak" aria-labelledby="tab-lacak" hidden={aktif !== 'lacak'} className="ganti">
            <form action="/lacak" method="get" role="search" className="flex flex-col gap-3 sm:flex-row">
              {/* sm:flex-1, bukan flex-1: di kolom (ponsel) flex-basis 0 membuat tinggi h-14 diabaikan. */}
              <label className={`${kelasBidang} sm:flex-1`}>
                <Ikon nama="cari" className="size-5 text-lembut" />
                <span className="sr-only">Kode laporan</span>
                <input
                  ref={masukanKode}
                  name="kode"
                  placeholder="Kode: SR-ABC234"
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
              Belum punya kode?{' '}
              <Link href="/contoh?jenis=terlambat" className="font-medium text-biru-tua underline underline-offset-4">
                Coba lacak contoh laporan
              </Link>
              .
            </p>
          </div>

          <div role="tabpanel" id="panel-prioritas" aria-labelledby="tab-prioritas" hidden={aktif !== 'prioritas'} className="ganti">
            <form action="/prioritas" method="get" onSubmit={kirimBersih}>
              <fieldset>
                <legend className="text-badan font-semibold">Mau dahulukan apa?</legend>
                <KelompokCair className="mt-2 flex flex-wrap gap-2">
                  <label className="chip">
                    <input type="radio" name="bobot" value="" defaultChecked className="sr-only" />
                    Aturan resmi
                  </label>
                  {PRESET_URUT.map((p) => (
                    <label key={p} className="chip">
                      <input type="radio" name="bobot" value={bobotUrl(p)} className="sr-only" />
                      {LABEL_PRESET[p]}
                    </label>
                  ))}
                </KelompokCair>
              </fieldset>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <Pilihan name="kategori" label="Jenis masalah" ikon="geser">
                    <option value="">Semua jenis masalah</option>
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

          <div role="tabpanel" id="panel-peta" aria-labelledby="tab-peta" hidden={aktif !== 'peta'} className="ganti">
            <form action="/peta" method="get" onSubmit={kirimBersih} className="flex flex-col gap-3 lg:flex-row">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Pilihan name="kategori" label="Jenis masalah" ikon="geser">
                  <option value="">Semua jenis masalah</option>
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
              Laporan yang ditolak tidak disembunyikan. Laporan itu tetap tampil di peta, lengkap dengan alasannya.
            </p>
          </div>

          <div role="tabpanel" id="panel-rapor" aria-labelledby="tab-rapor" hidden={aktif !== 'rapor'} className="ganti">
            {panelRapor}
          </div>

          <div role="tabpanel" id="panel-lapor" aria-labelledby="tab-lapor" hidden={aktif !== 'lapor'} className="ganti">
            <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {['Pilih jenis masalah', 'Titik di peta', '1 sampai 3 foto', 'Cerita singkat'].map((l, i) => (
                <li key={l} className="flex items-center gap-2.5 rounded-kontrol bg-latar px-3 py-3 text-kecil font-semibold">
                  <span className="angka flex size-6 shrink-0 items-center justify-center rounded-full bg-biru text-mini text-white">
                    {i + 1}
                  </span>
                  {l}
                </li>
              ))}
            </ol>
            {/* Peringatan di ATAS tombol, jadi terbaca sebelum mulai lapor. */}
            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center">
              <p role="note" className="flex flex-1 gap-3 rounded-kontrol border border-[#ffd9a3] bg-oranye-muda px-4 py-3 text-kecil">
                <Ikon nama="peringatan" className="mt-0.5 size-5 shrink-0 text-oranye" />
                <span>
                  <strong className="font-bold">Penting:</strong> laporan di sini tidak dikirim ke Pemprov DKI. Agar
                  ditangani pemerintah, lapor lewat{' '}
                  {KANAL_RESMI.map((k, i) => (
                    <span key={k.nama}>
                      {i > 0 && ' atau '}
                      <a href={k.url} target="_blank" rel="noreferrer" className="font-semibold text-biru-tua underline-offset-4 hover:underline">
                        {k.nama}
                        <span className="sr-only"> (tab baru)</span>
                      </a>
                    </span>
                  ))}
                  . Untuk mencoba di sini, kamu perlu akun.
                </span>
              </p>
              <Link href="/lapor" className={kelasCari}>
                <Ikon nama="tambah" className="size-5" />
                Mulai lapor
              </Link>
            </div>
          </div>
        </div>

        <p className="border-t border-garis px-4 py-3 text-kecil text-lembut sm:px-6">
          Bebas jelajahi tanpa akun.{' '}
          <Link href="/masuk" className="font-semibold text-biru-tua hover:underline">
            Masuk atau daftar
          </Link>{' '}
          untuk ikut melapor.
        </p>
      </div>
      </div>
      </div>
    </section>
  );
}
