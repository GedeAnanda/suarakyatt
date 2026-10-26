// components/beranda/DaftarMasalah.tsx — empat kategori, instansi, dan batas waktunya (pemilik: A)
// Foto di samping berganti mengikuti baris yang dipilih. Foto menunjukkan dunia masalahnya,
// bukan laporan di aplikasi; kreditnya ada di bawah foto.

'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FOTO, KATEGORI, type FotoTerbuka } from '@/lib/konten';

const FOTO_KATEGORI: FotoTerbuka[] = [FOTO.jalan1975, FOTO.kanalTimur, FOTO.ciliwung, FOTO.lampuJalan];

const hari = (jam: number) => (jam % 24 === 0 && jam >= 48 ? `${jam / 24} hari` : `${jam} jam`);

export default function DaftarMasalah() {
  const [pilih, setPilih] = useState(0);
  const foto = FOTO_KATEGORI[pilih];

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
      <ul className="lg:col-span-7" aria-label="Kategori laporan">
        {KATEGORI.map((k, i) => (
          <li key={k.id}>
            <button
              type="button"
              aria-pressed={i === pilih}
              onClick={() => setPilih(i)}
              onMouseEnter={() => setPilih(i)}
              onFocus={() => setPilih(i)}
              className="grid w-full grid-cols-[1fr_auto] gap-x-6 py-4 text-left text-pernyataan tracking-[-0.02em] text-lembut transition-colors hover:text-tinta aria-pressed:text-tinta sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1.25fr)_auto] sm:py-3"
            >
              <span className="font-medium">{k.nama}</span>
              <span className="col-span-2 row-start-2 mt-1 text-kecil tracking-normal sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:mt-0 sm:text-[length:inherit] sm:tracking-[inherit]">
                {k.instansi.replace(' (simulasi)', '').replace('Dinas ', '')}
                <span className="sm:hidden"> · urgensi {k.urgensi.toLowerCase()}</span>
              </span>
              <span className="angka col-start-2 row-start-1 text-right sm:col-start-3">
                {hari(k.respons)} / {hari(k.selesai)}
              </span>
            </button>
          </li>
        ))}
        <li className="mt-6 max-w-[60ch] text-kecil text-lembut">
          Kolom kedua adalah dinas penanggung jawab (simulasi). Angka pertama batas waktu respons, angka kedua batas waktu
          selesai, dihitung dalam jam kalender. Urgensi ditentukan dari kategori, bukan dipilih pelapor. Semua angka ini
          ilustrasi.
        </li>
      </ul>

      <figure className="lg:col-span-5">
        <div className="relative aspect-4/5 overflow-hidden bg-lapis">
          {FOTO_KATEGORI.map((f, i) => (
            <Image
              key={f.src}
              src={f.src}
              alt={f.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className={`object-cover grayscale-[0.9] contrast-[1.05] transition-opacity duration-500 ${
                i === pilih ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden={i !== pilih}
            />
          ))}
        </div>
        <figcaption className="mt-3 text-kecil text-lembut">
          {KATEGORI[pilih].nama}: foto &ldquo;{foto.judul}&rdquo; oleh {foto.pembuat},{' '}
          <a href={foto.url} target="_blank" rel="noreferrer" className="underline">
            {foto.lisensi}
          </a>
          .
        </figcaption>
      </figure>
    </div>
  );
}
