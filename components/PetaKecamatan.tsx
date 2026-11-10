// components/PetaKecamatan.tsx — choropleth 42 kecamatan sebagai SVG (PRD 9, SDD 9.1), pemilik: A
// Lima kelas tetap (bukan kuantil), jadi warna hanya berubah kalau skornya memang berubah.
// Kecamatan tanpa laporan aktif digambar dengan arsiran dan keterangan "Tidak ada laporan aktif".
// Kalau onPilih diberikan: setiap kecamatan bisa disorot kursor atau Tab (muncul keterangan) dan dipilih
// dengan klik, Enter, atau Spasi.

'use client';

import { useId, useRef, useState } from 'react';
import { formatPoin } from '@/lib/scoring';
import { KECAMATAN, VIEWBOX } from '@/lib/geo/kecamatan-svg';
import type { TitikPeta } from '@/lib/geo/proyeksi';
import KecamatanTimbul3D from './KecamatanTimbul3D';

export const KELAS = [
  { dari: 0, sampai: 20, warna: 'var(--color-k1)' },
  { dari: 20, sampai: 40, warna: 'var(--color-k2)' },
  { dari: 40, sampai: 60, warna: 'var(--color-k3)' },
  { dari: 60, sampai: 80, warna: 'var(--color-k4)' },
  { dari: 80, sampai: 100, warna: 'var(--color-k5)' },
];

const [, , LEBAR, TINGGI] = VIEWBOX.split(' ').map(Number);

/** Tinggi "gedung" kecamatan terpilih dalam unit viewBox (lebar 1000), ±10 px di layar; satu lapis dinding per unit. */
const TINGGI_GEDUNG = 20;

export function warnaSkor(skor: number | undefined): string {
  if (skor === undefined) return 'url(#arsir-kosong)';
  return KELAS[Math.min(4, Math.floor(skor / 20))].warna;
}

export default function PetaKecamatan({
  skor,
  sorot,
  onPilih,
  keterangan,
  judul,
  efek = 'timbul',
  titik,
  className = '',
}: {
  /** Skor tertinggi per kode_wilayah; kecamatan yang tidak ada di sini = tidak ada laporan aktif. */
  skor: Record<string, number>;
  sorot?: string | null;
  /** Cara menonjolkan kecamatan terpilih: "timbul" (naik sedikit di tempatnya) atau "fokus" (bergerak ke tengah peta,
      timbul 3D dengan titik laporannya, peta lain diburamkan; dashboard Beranda saat nomor dipilih). */
  efek?: 'timbul' | 'fokus';
  /** Titik laporan di kecamatan terpilih, hanya untuk efek "fokus". */
  titik?: TitikPeta[];
  onPilih?: (kodeWilayah: string) => void;
  /** Baris tambahan di keterangan melayang, misalnya kategori isu teratasnya. */
  keterangan?: Record<string, string>;
  judul: string;
  className?: string;
}) {
  const bingkai = useRef<HTMLDivElement>(null);
  // id filter unik per peta: id SVG berlaku di seluruh dokumen.
  const idBayangDalam = `bayang-dalam-${useId().replace(/:/g, '')}`;
  const [aktif, setAktif] = useState<{ kode: string; x: number; y: number } | null>(null);
  const interaktif = Boolean(onPilih);
  const kecamatanAktif = aktif && KECAMATAN.find((k) => k.kode_wilayah === aktif.kode);
  const fokus = efek === 'fokus' && Boolean(sorot);

  function dariPointer(kode: string, e: React.PointerEvent) {
    const r = bingkai.current?.getBoundingClientRect();
    if (!r || e.pointerType === 'touch') return;
    setAktif({ kode, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  }

  return (
    <div ref={bingkai} className={`relative ${className}`}>
      <svg
        viewBox={VIEWBOX}
        role={interaktif ? 'group' : 'img'}
        aria-label={judul}
        className={`block h-auto w-full transition-[filter,opacity] duration-[1000ms] ease-out ${fokus ? 'peta-fokus-latar' : ''}`}
      >
        <defs>
          {/* Bayangan ke dalam untuk atap "gedung": tepi bagian dalam sedikit lebih gelap dari warna wilayahnya (hitam
              tipis di atas warna asli), memudar ke tengah, supaya atapnya tidak tampak datar dan kaku. */}
          <filter id={idBayangDalam} x="-5%" y="-5%" width="110%" height="110%">
            <feComponentTransfer in="SourceAlpha" result="luar">
              <feFuncA type="table" tableValues="1 0" />
            </feComponentTransfer>
            <feGaussianBlur in="luar" stdDeviation="5" result="kabur" />
            <feComposite in="kabur" in2="SourceAlpha" operator="in" result="tepi" />
            <feFlood floodColor="rgb(15 42 51)" floodOpacity="0.38" />
            <feComposite in2="tepi" operator="in" result="bayang" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="bayang" />
            </feMerge>
          </filter>
          <pattern id="arsir-kosong" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="10" height="10" fill="var(--color-latar)" />
            <path d="M0 0v10" stroke="var(--color-lapis-2)" strokeWidth="3" />
          </pattern>
        </defs>
        {KECAMATAN.map((k) => {
          const nilai = skor[k.kode_wilayah];
          const label = `${k.kecamatan}, ${k.kota}: ${
            nilai === undefined ? 'tidak ada laporan aktif' : `skor tertinggi ${formatPoin(nilai)}`
          }${keterangan?.[k.kode_wilayah] ? `, ${keterangan[k.kode_wilayah]}` : ''}`;
          return (
            <path
              key={k.kode_wilayah}
              d={k.d}
              fill={warnaSkor(nilai)}
              stroke="var(--color-permukaan)"
              strokeWidth={aktif?.kode === k.kode_wilayah ? 5 : 2}
              strokeLinejoin="round"
              className={`transition-[fill,stroke-width] duration-500 ${interaktif ? 'cursor-pointer outline-none hover:brightness-110' : ''}`}
              {...(interaktif ? {
                role: 'button',
                tabIndex: 0,
                'aria-label': `${label}. Pilih untuk melihat rinciannya.`,
                'aria-pressed': sorot === k.kode_wilayah,
                onClick: () => onPilih!(k.kode_wilayah),
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onPilih!(k.kode_wilayah);
                  }
                },
                onPointerMove: (e: React.PointerEvent) => dariPointer(k.kode_wilayah, e),
                onPointerLeave: () => setAktif(null),
                onFocus: () => setAktif({ kode: k.kode_wilayah, x: (k.pusat[0] / LEBAR) * 100, y: (k.pusat[1] / TINGGI) * 100 }),
                onBlur: () => setAktif(null),
              } : {})}
            >
              {!interaktif && <title>{label}</title>}
            </path>
          );
        })}
        {/* Efek "timbul" sebagai gedung: kecamatan terpilih diangkat lurus ke atas, dan jejak bentuknya ditumpuk
            selapis per unit sebagai dinding yang lebih gelap, jadi terlihat seperti bangun ruang (prisma), bukan
            sekadar melayang. Bayangan jatuh di tanah. Key = kode wilayah, jadi gedung "dibangun" ulang setiap pilihan
            berganti. Lapisan ini tidak menangkap klik, jadi kecamatan di bawahnya tetap bisa dipilih. */}
        {sorot &&
          !fokus &&
          KECAMATAN.filter((k) => k.kode_wilayah === sorot).map((k) => {
            const warna = warnaSkor(skor[k.kode_wilayah]);
            return (
              <g key={`gedung-${k.kode_wilayah}`} className="kecamatan-gedung" pointerEvents="none" aria-hidden="true">
                <path d={k.d} className="gedung-bayang" />
                <g className="gedung-dinding">
                  {Array.from({ length: TINGGI_GEDUNG }, (_, i) => (
                    <path key={i} d={k.d} fill={warna} style={{ '--i': i } as React.CSSProperties} />
                  ))}
                </g>
                <path
                  d={k.d}
                  fill={warna}
                  stroke="var(--color-permukaan)"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  className="gedung-atap"
                  style={{ '--i': TINGGI_GEDUNG, filter: `url(#${idBayangDalam}) drop-shadow(0 0 1.5px rgb(15 42 51 / 0.35))` } as React.CSSProperties}
                />
              </g>
            );
          })}
      </svg>

      {/* Efek "fokus": key = kode wilayah, jadi animasinya diulang dari awal setiap kali pilihan berganti. */}
      {fokus &&
        KECAMATAN.filter((k) => k.kode_wilayah === sorot).map((k) => (
          <KecamatanTimbul3D
            key={k.kode_wilayah}
            d={k.d}
            warna={skor[k.kode_wilayah] === undefined ? 'var(--color-lapis-2)' : warnaSkor(skor[k.kode_wilayah])}
            titik={titik}
          />
        ))}

      {kecamatanAktif && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-10 w-max max-w-56 rounded-kontrol bg-navy px-3 py-2 text-kecil text-white shadow-angkat"
          style={{
            left: `${Math.min(82, Math.max(18, aktif.x))}%`,
            top: `${aktif.y}%`,
            transform: 'translate(-50%, calc(-100% - 14px))',
          }}
        >
          <p className="font-bold">{kecamatanAktif.kecamatan}</p>
          <p className="opacity-90">
            {skor[aktif.kode] === undefined ? 'Tidak ada laporan aktif' : `Skor tertinggi ${formatPoin(skor[aktif.kode])}`}
          </p>
          {keterangan?.[aktif.kode] && <p className="opacity-90">{keterangan[aktif.kode]}</p>}
        </div>
      )}
    </div>
  );
}

export function KeteranganKelas({ className = '' }: { className?: string }) {
  return (
    <div className={`text-kecil ${className}`}>
      <p className="mb-2 font-semibold">Skor prioritas tertinggi di kecamatan</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-lembut">
        {KELAS.map((k) => (
          <li key={k.dari} className="angka flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3.5 rounded-[0.2rem]" style={{ background: k.warna }} />
            {k.dari} sampai {k.sampai}
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <svg aria-hidden="true" className="size-3.5 rounded-[0.2rem]" viewBox="0 0 14 14">
            <rect width="14" height="14" fill="var(--color-latar)" />
            <path d="M-2 6 6 -2M0 14 14 0M8 16 16 8" stroke="var(--color-lapis-2)" strokeWidth="2.5" />
          </svg>
          Tidak ada laporan aktif
        </li>
      </ul>
    </div>
  );
}
