// components/Header.tsx — bar navigasi utama (pemilik: A)
// Nama di kiri, empat tautan, cari kode, akun, dan satu aksi: Lapor masalah.
// Di bawah 1280 px semuanya pindah ke menu supaya bar tidak pernah terlipat.

import Link from 'next/link';
import { Suspense } from 'react';
import { ambilSesi } from '@/lib/data/sesi';
import { keluar } from '@/lib/supabase/aksi-auth';
import CariKode from './CariKode';
import { MenuPonsel, MenuPonselStatis, TautanNav, TautanNavStatis } from './NavUtama';
import Turun from './Turun';
import Ikon from './ui/Ikon';
import { kelasTombol } from './ui/Tombol';
import Wordmark from './Wordmark';

const peranTeks = (s: NonNullable<Awaited<ReturnType<typeof ambilSesi>>>) =>
  `${s.perencana ? 'Perencana' : s.peran === 'admin' ? 'Admin instansi' : 'Warga'}${s.demo ? ' · akun demo' : ''}`;

async function Akun() {
  const sesi = await ambilSesi();
  if (!sesi) {
    return (
      <Link href="/masuk" className="flex h-11 items-center rounded-(--radius-kontrol) px-3 text-badan font-medium hover:bg-lapis">
        Masuk
      </Link>
    );
  }
  return (
    <Turun label={<span className="max-w-40 truncate">{sesi.nama}</span>}>
      <p className="text-badan font-medium">{sesi.nama}</p>
      <p className="text-kecil text-lembut">{peranTeks(sesi)}</p>
      <div className="mt-4 grid gap-2">
        {sesi.peran === 'admin' && (
          <Link href="/admin/laporan" className={kelasTombol('kedua', 'w-full')}>
            Laporan instansi
          </Link>
        )}
        <form action={keluar}>
          <button type="submit" className={kelasTombol('kedua', 'w-full')}>
            Keluar
          </button>
        </form>
      </div>
    </Turun>
  );
}

async function AkunPonsel() {
  const sesi = await ambilSesi();
  if (!sesi) {
    return (
      <Link href="/masuk" className={kelasTombol('kedua', 'w-full')}>
        Masuk
      </Link>
    );
  }
  return (
    <div className="panel grid gap-3 p-4">
      <p className="text-badan font-medium">
        {sesi.nama}
        <span className="block text-kecil font-normal text-lembut">{peranTeks(sesi)}</span>
      </p>
      {sesi.peran === 'admin' && (
        <Link href="/admin/laporan" className={kelasTombol('utama', 'w-full')}>
          Laporan instansi
        </Link>
      )}
      <form action={keluar}>
        <button type="submit" className={kelasTombol('kedua', 'w-full bg-kertas')}>
          Keluar
        </button>
      </form>
    </div>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-1000 bg-kertas">
      <nav aria-label="Navigasi utama" className="bingkai flex h-16 items-center gap-3 sm:h-18">
        <Link
          href="/"
          className="mr-auto text-[1.375rem] transition-[scale] duration-200 hover:scale-[1.03] active:scale-[0.97] xl:mr-4"
          aria-label="suaRAkyat, ke Beranda"
        >
          <Wordmark />
        </Link>
        <Suspense fallback={<TautanNavStatis />}>
          <TautanNav />
        </Suspense>
        <div className="ml-auto hidden items-center gap-1 xl:flex">
          <Turun
            label={
              <>
                <Ikon nama="cari" className="size-4" />
                Lacak kode
              </>
            }
          >
            <p className="mb-3 text-kecil">Masukkan kode SR yang Anda terima, atau buka laporan contoh di halaman lacak.</p>
            <CariKode id="cari-kode-header" className="[&_input]:w-full" />
          </Turun>
          <Suspense fallback={<span className="w-16" />}>
            <Akun />
          </Suspense>
        </div>
        <Link href="/lapor" className={kelasTombol('utama', 'min-h-11 px-4 text-kecil sm:text-badan')}>
          <span className="sm:hidden">Lapor</span><span className="hidden sm:inline">Lapor masalah</span>
        </Link>
        <Suspense fallback={<MenuPonselStatis />}>
          <MenuPonsel>
            <CariKode id="cari-kode-menu" besar />
            <Suspense fallback={null}>
              <AkunPonsel />
            </Suspense>
          </MenuPonsel>
        </Suspense>
      </nav>
    </header>
  );
}
