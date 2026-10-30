// components/beranda/DaftarMasalah.tsx — empat kategori, instansi, dan batas waktunya (pemilik: A)
// Seperti deret rekomendasi di situs travel: tab berbentuk pil, lalu satu kartu besar dengan foto dan rinciannya.
// Foto menunjukkan dunia masalahnya, bukan laporan di aplikasi; kreditnya ada di bawah foto.

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type CSSProperties } from 'react';
import { FOTO, KATEGORI, type FotoTerbuka } from '@/lib/konten';
import Ikon from '../ui/Ikon';

const FOTO_KATEGORI: FotoTerbuka[] = [FOTO.jalan1975, FOTO.kanalTimur, FOTO.ciliwung, FOTO.lampuJalan];

// Batas terlama (lampu jalan, 168 jam) menjadi lebar penuh bar batas waktu.
const JAM_MAKS = Math.max(...KATEGORI.map((k) => k.selesai));

const hari = (jam: number) => (jam % 24 === 0 && jam >= 48 ? `${jam / 24} hari` : `${jam} jam`);

export default function DaftarMasalah() {
  const [pilih, setPilih] = useState(0);
  const k = KATEGORI[pilih];
  const foto = FOTO_KATEGORI[pilih];

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih kategori laporan">
        {KATEGORI.map((x, i) => (
          <button key={x.id} type="button" aria-pressed={i === pilih} onClick={() => setPilih(i)} className="chip">
            {x.nama}
          </button>
        ))}
      </div>

      <article className="kartu mt-4 grid overflow-hidden md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <figure className="relative">
          <div className="relative aspect-4/3 overflow-hidden bg-lapis md:aspect-auto md:h-full md:min-h-80">
            {FOTO_KATEGORI.map((f, i) => (
              <Image
                key={f.src}
                src={f.src}
                alt={f.alt}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                // Sapuan: foto baru membuka dari kiri di atas foto lama.
                className={`sapu object-cover ${
                  i === pilih
                    ? 'z-10 scale-100 [clip-path:inset(0)]'
                    : // Foto lama baru menutup setelah foto baru selesai membuka, supaya tidak ada celah.
                      'z-0 scale-[1.05] [clip-path:inset(0_100%_0_0)] [transition-delay:650ms]'
                }`}
                aria-hidden={i !== pilih}
              />
            ))}
          </div>
          <figcaption className="absolute inset-x-0 bottom-0 z-20 bg-[linear-gradient(0deg,rgb(15_41_77/0.8),transparent)] px-4 pt-8 pb-3 text-mini text-white">
            Foto &ldquo;{foto.judul}&rdquo; oleh {foto.pembuat},{' '}
            <a href={foto.url} target="_blank" rel="noreferrer" className="underline">
              {foto.lisensi}
            </a>
          </figcaption>
        </figure>

        <div key={k.id} className="ganti flex flex-col p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-[0.375rem] px-2 py-0.5 text-mini font-bold ${
                k.urgensi === 'Tinggi' ? 'bg-merah-muda text-merah-tua' : 'bg-oranye-muda text-st-menunggu'
              }`}
            >
              Urgensi {k.urgensi.toLowerCase()}
            </span>
            <span className="text-kecil text-lembut">ditentukan dari kategori, bukan dipilih pelapor</span>
          </div>
          <h3 className="mt-4 text-seksi font-bold">{k.nama}</h3>
          <p className="mt-1 flex items-center gap-2 text-badan text-lembut">
            <Ikon nama="gedung" className="size-4.5" />
            {k.instansi}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-kontrol bg-latar p-3">
              <dt className="text-kecil text-lembut">Batas respons</dt>
              <dd className="angka text-sub font-bold">{hari(k.respons)}</dd>
            </div>
            <div className="rounded-kontrol bg-latar p-3">
              <dt className="text-kecil text-lembut">Batas selesai</dt>
              <dd className="angka text-sub font-bold">{hari(k.selesai)}</dd>
            </div>
          </dl>

          {/* Keempat kategori berdampingan: biru tua = respons, biru muda = sampai selesai. Lebar sebanding jam. */}
          <ul className="mt-6 grid gap-2.5" aria-label="Batas waktu keempat kategori">
            {KATEGORI.map((x, i) => (
              <li key={x.id} className={`grid grid-cols-[9rem_1fr] items-center gap-3 text-kecil ${i === pilih ? 'font-bold' : 'text-lembut'}`}>
                <span className="truncate">{x.nama}</span>
                <span className="relative block h-2 overflow-hidden rounded-full bg-lapis" aria-hidden="true">
                  <span
                    className="bar-isi absolute inset-y-0 left-0 w-full rounded-full bg-biru/35"
                    style={{ '--isi': x.selesai / JAM_MAKS } as CSSProperties}
                  />
                  <span
                    className="bar-isi absolute inset-y-0 left-0 w-full rounded-full bg-biru"
                    style={{ '--isi': x.respons / JAM_MAKS } as CSSProperties}
                  />
                </span>
                <span className="sr-only">
                  respons {hari(x.respons)}, selesai {hari(x.selesai)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-mini text-lembut">
            Dihitung dalam jam kalender. Semua angka batas waktu adalah ilustrasi dan dinyatakan terbuka.
          </p>

          <div className="mt-auto flex flex-wrap gap-2 pt-6">
            <Link href={`/peta?kategori=${k.id}`} className="chip">
              <Ikon nama="peta" className="size-4" />
              Lihat di peta
            </Link>
            <Link href={`/prioritas?kategori=${k.id}`} className="chip">
              <Ikon nama="geser" className="size-4" />
              Urutan prioritasnya
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
