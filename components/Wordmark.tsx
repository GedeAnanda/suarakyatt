// components/Wordmark.tsx — nama suaRAkyat: "RA" yang dipakai bersama suara dan rakyat (pemilik: A)
// "RA" berupa label biru seperti logo situs travel; di atas latar gelap (.di-gelap) warnanya dibalik.

import type { CSSProperties } from 'react';


// gelombang: tiap huruf (dan kotak RA sebagai satu kesatuan) dipecah supaya bisa melompat bergantian dari kiri ke kanan
// saat kursor masuk. Pemicunya dipasang EfekCair (atribut data-gelombang), gerakannya di globals.css.
const KOTAK_RA =
  'mx-[0.06em] rounded-[0.22em] bg-biru px-[0.14em] pt-[0.08em] pb-[0.05em] text-white [.di-gelap_&]:bg-white [.di-gelap_&]:text-biru-tua';

export default function Wordmark({ className = '', gelombang = false }: { className?: string; gelombang?: boolean }) {
  const dasar = `font-wordmark inline-flex items-baseline leading-none font-bold tracking-[-0.035em] ${className}`;
  if (!gelombang) {
    return (
      <span className={dasar}>
        sua
        <span className={KOTAK_RA}>RA</span>
        kyat
      </span>
    );
  }
  const unit = ['s', 'u', 'a', 'RA', 'k', 'y', 'a', 't'];
  return (
    <span className={`wordmark-gelombang ${dasar}`}>
      {unit.map((u, i) => (
        <span key={i} className={`huruf ${u === 'RA' ? KOTAK_RA : ''}`} style={{ '--i': i } as CSSProperties}>
          {u}
        </span>
      ))}
    </span>
  );
}
