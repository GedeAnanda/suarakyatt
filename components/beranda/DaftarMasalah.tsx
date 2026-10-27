// components/beranda/DaftarMasalah.tsx — empat kategori, instansi, dan batas waktunya (pemilik: A)
// Foto di samping berganti mengikuti baris yang dipilih. Foto menunjukkan dunia masalahnya,
// bukan laporan di aplikasi; kreditnya ada di bawah foto.

'use client';

import Image from 'next/image';
import { useState, type CSSProperties } from 'react';
import { FOTO, KATEGORI, type FotoTerbuka } from '@/lib/konten';

const FOTO_KATEGORI: FotoTerbuka[] = [FOTO.jalan1975, FOTO.kanalTimur, FOTO.ciliwung, FOTO.lampuJalan];

// Batas terlama (lampu jalan, 168 jam) menjadi lebar penuh bar batas waktu.
const JAM_MAKS = Math.max(...KATEGORI.map((k) => k.selesai));

const hari = (jam: number) => (jam % 24 === 0 && jam >= 48 ? `${jam / 24} hari` : `${jam} jam`);

export default function DaftarMasalah() {
  const [pilih, setPilih] = useState(0);
  const foto = FOTO_KATEGORI[pilih];

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
      <ul className="lg:col-span-7" aria-label="Kategori laporan">
        {KATEGORI.map((k, i) => (
          <li key={k.id}>
            <button
              type="button"
              aria-pressed={i === pilih}
              onClick={() => setPilih(i)}
              onMouseEnter={() => setPilih(i)}
              onFocus={() => setPilih(i)}
              className="grid w-full grid-cols-[1fr_auto] gap-x-6 py-4 text-left text-pernyataan tracking-[-0.02em] text-lembut transition-[color,translate] duration-300 ease-(--ease-keluar) hover:text-tinta aria-pressed:text-tinta motion-safe:aria-pressed:translate-x-2 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1.25fr)_auto] sm:py-3"
            >
              <span className="font-medium">{k.nama}</span>
              <span className="col-span-2 row-start-2 mt-1 text-kecil tracking-normal sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:mt-0 sm:text-[length:inherit] sm:tracking-[inherit]">
                {k.instansi.replace(' (simulasi)', '').replace('Dinas ', '')}
                <span className="sm:hidden"> · urgensi {k.urgensi.toLowerCase()}</span>
              </span>
              <span className="angka col-start-2 row-start-1 text-right sm:col-start-3">
                {hari(k.respons)} / {hari(k.selesai)}
              </span>
              {/* Bar batas waktu: tinta = respons, merah muda = sampai selesai. Lebar sebanding jam. */}
              <span aria-hidden="true" className="relative col-span-full mt-2 block h-1.5 overflow-hidden rounded-full bg-lapis-2">
                <span
                  className="bar-isi absolute inset-y-0 left-0 w-full rounded-full bg-k2"
                  style={{ '--isi': k.selesai / JAM_MAKS } as CSSProperties}
                />
                <span
                  className="bar-isi absolute inset-y-0 left-0 w-full rounded-full bg-tinta"
                  style={{ '--isi': k.respons / JAM_MAKS } as CSSProperties}
                />
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
        <div className="relative aspect-4/5 overflow-hidden rounded-(--radius-kartu) bg-lapis shadow-(--shadow-kartu)">
          {FOTO_KATEGORI.map((f, i) => (
            <Image
              key={f.src}
              src={f.src}
              alt={f.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              // Sapuan: foto baru membuka dari kiri di atas foto lama dan pelan-pelan mendekat.
              className={`sapu object-cover grayscale-[0.9] contrast-[1.05] ${
                i === pilih
                  ? 'z-10 scale-100 [clip-path:inset(0)]'
                  : // Foto lama baru menutup setelah foto baru selesai membuka, supaya tidak ada celah.
                    'z-0 scale-[1.06] [clip-path:inset(0_100%_0_0)] [transition-delay:750ms]'
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
