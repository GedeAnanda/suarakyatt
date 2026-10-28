// components/ui/TeksRakit.tsx — teks yang dirakit huruf demi huruf saat tampil (pemilik: A)
// Tiap huruf menjadi <span class="rakit"> dengan posisi awal acak yang tetap (--x, --y, --r); geraknya ada di
// globals.css. Dirender di server, jadi teks langsung ada tanpa JavaScript, dan pengguna yang meminta gerak
// dikurangi melihat teks diam. Posisi awal sama untuk teks dan urutan yang sama, jadi dua salinan teks
// (seperti hero Beranda yang terbelah dua warna) bergerak serempak.

import type { CSSProperties } from 'react';

/** Bilangan semu-acak 0–1 yang selalu sama untuk n yang sama. */
const acak = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export default function TeksRakit({
  teks,
  sebar = 1,
  urutAwal = 0,
  jeda = 0,
}: {
  teks: string;
  /** Jarak awal huruf dari tempatnya, dalam em. */
  sebar?: number;
  /** Urutan huruf pertama; baris kedua melanjutkan urutan baris pertama. */
  urutAwal?: number;
  /** Tunda sebelum huruf pertama bergerak, dalam milidetik. */
  jeda?: number;
}) {
  return (
    <>
      {[...teks].map((huruf, i) => {
        if (huruf === ' ') return ' ';
        const n = urutAwal + i;
        // Huruf berselang datang dari atas dan dari bawah, jadi di hero mereka melintasi garis merah.
        const gaya = {
          '--x': `${((acak(n) - 0.5) * 2.2 * sebar).toFixed(2)}em`,
          '--y': `${((n % 2 ? 1 : -1) * (0.6 + acak(n + 50) * 0.8) * sebar).toFixed(2)}em`,
          '--r': `${Math.round((acak(n + 99) - 0.5) * 80)}deg`,
          '--urut': n,
          '--jeda': `${jeda}ms`,
        } as CSSProperties;
        return (
          <span key={i} className={huruf === '?' ? 'rakit rakit-tanya' : 'rakit'} style={gaya}>
            {huruf}
          </span>
        );
      })}
    </>
  );
}
