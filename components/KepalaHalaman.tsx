// components/KepalaHalaman.tsx — kepala halaman aplikasi: jejak, judul, pengantar, aksi (pemilik: A)
// Seperti halaman daftar di situs travel: tombol Kembali dan jejak "Beranda › …" di atas, judul tebal,
// satu paragraf pengantar, dan aksi di kanan (turun ke bawah di layar sempit).

import Link from 'next/link';
import type { ReactNode } from 'react';
import TombolKembali from './TombolKembali';
import Ikon from './ui/Ikon';

export interface Jejak {
  href?: string;
  label: string;
}

export default function KepalaHalaman({
  judul,
  jejak = [],
  aksi,
  children,
  className = '',
}: {
  judul: ReactNode;
  /** Halaman di antara Beranda dan halaman ini; halaman ini sendiri diambil dari judul. */
  jejak?: Jejak[];
  aksi?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-x-8 gap-y-4 ${className}`}>
      <div className="min-w-0 max-w-[72ch]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <TombolKembali cadangan={[...jejak].reverse().find((j) => j.href)?.href ?? '/'} />
        <nav aria-label="Jejak halaman">
          <ol className="flex flex-wrap items-center gap-1 text-kecil text-lembut">
            {[{ href: '/', label: 'Beranda' }, ...jejak].map((j) => (
              <li key={j.label} className="flex items-center gap-1">
                {j.href ? (
                  <Link href={j.href} className="hover:text-biru-tua hover:underline">
                    {j.label}
                  </Link>
                ) : (
                  <span>{j.label}</span>
                )}
                <Ikon nama="kanan" className="size-3.5" />
              </li>
            ))}
            <li aria-current="page" className="font-medium text-teks">
              {typeof judul === 'string' ? judul : 'Halaman ini'}
            </li>
          </ol>
        </nav>
        </div>
        <h1 className="mt-3 text-judul font-bold">{judul}</h1>
        {children && <div className="mt-2 text-badan text-lembut">{children}</div>}
      </div>
      {aksi && <div className="flex flex-wrap items-center gap-2">{aksi}</div>}
    </div>
  );
}
