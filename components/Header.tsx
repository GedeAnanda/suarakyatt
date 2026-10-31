// components/Header.tsx — bar atas (pemilik: A)
// Seperti header situs travel: tombol menu, nama, kolom cari (lacak kode laporan), tautan utilitas
// berikon, lalu Masuk/Daftar atau menu akun. Tautan yang tidak muat pindah ke menu samping.

import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';
import { ambilSesi } from '@/lib/data/sesi';
import { keluar } from '@/lib/supabase/aksi-auth';
import CariKode from './CariKode';
import TombolMenu from './TombolMenu';
import Turun from './Turun';
import Ikon, { type NamaIkon } from './ui/Ikon';
import KelompokCair from './ui/KelompokCair';
import { kelasTombol } from './ui/Tombol';
import Wordmark from './Wordmark';

type Sesi = NonNullable<Awaited<ReturnType<typeof ambilSesi>>>;

const peranTeks = (s: Sesi) =>
  `${s.perencana ? 'Perencana' : s.peran === 'admin' ? 'Admin instansi' : 'Warga'}${s.demo ? ' · akun demo' : ''}`;

/** Dua huruf awal nama untuk lingkaran akun, misalnya "Ani Suryani" → "AS". */
const inisial = (nama: string) =>
  nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k[0]!.toUpperCase())
    .join('') || '?';

function TautanUtilitas({
  href,
  ikon,
  children,
  className = '',
  ringkas = false,
}: {
  href: string;
  ikon: NamaIkon;
  children: ReactNode;
  className?: string;
  /** Hanya ikon; teksnya tetap dibaca pembaca layar. */
  ringkas?: boolean;
}) {
  return (
    <Link
      href={href}
      title={ringkas ? String(children) : undefined}
      className={`h-10 shrink-0 items-center gap-1.5 rounded-kontrol px-2.5 text-kecil max-[389px]:px-2 font-semibold whitespace-nowrap text-teks transition-colors hover:bg-lapis hover:text-biru-tua ${className}`}
    >
      <Ikon nama={ikon} className={ringkas ? 'size-5' : 'size-4.5'} />
      <span className={ringkas ? 'sr-only' : ''}>{children}</span>
    </Link>
  );
}

async function Akun() {
  const sesi = await ambilSesi();
  if (!sesi) {
    return (
      <Link href="/masuk" className={kelasTombol('utama', 'ml-1 min-h-9 shrink-0 px-3.5 text-kecil max-[389px]:px-3 sm:px-4')}>
        <span className="sm:hidden">Masuk</span>
        <span className="hidden sm:inline">Masuk / Daftar</span>
      </Link>
    );
  }
  return (
    <Turun
      className="ml-1"
      label={
        <>
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-full bg-biru text-mini font-bold text-white"
          >
            {inisial(sesi.nama)}
          </span>
          <span className="hidden max-w-36 truncate md:inline">{sesi.nama}</span>
          <span className="sr-only md:hidden">Akun {sesi.nama}</span>
        </>
      }
    >
      <p className="text-badan font-bold">{sesi.nama}</p>
      <p className="text-kecil text-lembut">{peranTeks(sesi)}</p>
      <ul className="mt-3 grid gap-1 border-t border-garis pt-3">
        {sesi.peran === 'admin' && (
          <li>
            <Link href="/admin/laporan" className="flex h-10 items-center gap-2.5 rounded-kontrol px-2 text-badan font-medium hover:bg-lapis">
              <Ikon nama="koper" className="size-4.5" />
              Laporan instansi
            </Link>
          </li>
        )}
        <li>
          <Link href="/lapor" className="flex h-10 items-center gap-2.5 rounded-kontrol px-2 text-badan font-medium hover:bg-lapis">
            <Ikon nama="tambah" className="size-4.5" />
            Lapor masalah
          </Link>
        </li>
        <li>
          <Link href="/lacak#laporan-saya" className="flex h-10 items-center gap-2.5 rounded-kontrol px-2 text-badan font-medium hover:bg-lapis">
            <Ikon nama="lacak" className="size-4.5" />
            Laporan saya
          </Link>
        </li>
        <li>
          <form action={keluar}>
            <button type="submit" className="flex h-10 w-full items-center gap-2.5 rounded-kontrol px-2 text-left text-badan font-medium hover:bg-lapis">
              <Ikon nama="keluar" className="size-4.5" />
              Keluar
            </button>
          </form>
        </li>
      </ul>
    </Turun>
  );
}

export default function Header() {
  return (
    <header className="kepala sticky top-0 z-1000 h-(--tinggi-kepala) border-b border-garis bg-permukaan">
      {/* Tepi kiri-kanan memakai env(safe-area-inset-*) supaya tombol tidak masuk ke area poni iPhone yang dimiringkan. */}
      {/* Di bawah 390 px (ponsel 320 sampai 375 px) wordmark, jarak, tautan ikon, dan tombol Masuk dirapatkan supaya isi
          header tidak melewati tepi layar. */}
      <div className="flex h-full items-center gap-1.5 pr-[max(0.75rem,env(safe-area-inset-right))] pl-[max(0.5rem,env(safe-area-inset-left))] max-[389px]:gap-1 sm:gap-2 sm:pr-[max(1rem,env(safe-area-inset-right))] lg:pr-6 lg:pl-3">
        <TombolMenu />
        <Link
          href="/"
          aria-label="suaRAkyat, ke Beranda"
          className="shrink-0 rounded-kontrol px-1 text-[1.3125rem] text-teks max-[389px]:text-[1.125rem] sm:text-[1.4375rem]"
        >
          <Wordmark />
        </Link>
        {/* Di Beranda kolom ini muncul setelah kotak cari hero tergulir lewat (globals.css, .cari-kepala). */}
        <CariKode id="cari-kode-header" varian="kepala" className="cari-kepala ml-3 hidden max-w-[27rem] flex-1 md:flex lg:ml-8" />
        {/* Urutan seperti tautan utilitas situs travel: Daftarkan Properti → Bantuan → Login. "Lacak laporan" hanya
            berupa ikon di ponsel, karena di layar lebar kolom cari sudah melayani hal yang sama. */}
        {/* KelompokCair: tetesan air menandai tautan halaman yang sedang dibuka, dicocokkan dari alamatnya. */}
        <KelompokCair as="nav" aktifDariAlamat aria-label="Tautan cepat" className="ml-auto flex items-center gap-0.5">
          <TautanUtilitas href="/sumber-data" ikon="data" className="hidden 2xl:flex">
            Sumber data
          </TautanUtilitas>
          <TautanUtilitas href="/lapor" ikon="tambah" className="hidden sm:flex">
            Lapor masalah
          </TautanUtilitas>
          <TautanUtilitas href="/rapor/cara-menilai" ikon="bantuan" className="hidden xl:flex">
            Cara menilai
          </TautanUtilitas>
          <TautanUtilitas href="/lacak" ikon="lacak" ringkas className="cari-kepala flex md:hidden">
            Lacak laporan
          </TautanUtilitas>
          {/* HP: aksi utama tetap terlihat di header. Di bawah 360 px hanya ikonnya; namanya tetap dibaca pembaca layar. */}
          <TautanUtilitas href="/lapor" ikon="tambah" className="flex sm:hidden">
            <span className="max-[359px]:sr-only">
              Lapor<span className="sr-only"> masalah</span>
            </span>
          </TautanUtilitas>
          <Suspense fallback={<span aria-hidden="true" className="ml-1 h-9 w-20 sm:w-32" />}>
            <Akun />
          </Suspense>
        </KelompokCair>
      </div>
    </header>
  );
}
