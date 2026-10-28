// components/ui/AngkaGulir.tsx — angka yang tiap digitnya bergulir ke nilainya (pemilik: A)
// Server merender digit di posisi akhirnya, jadi angka terbaca tanpa JavaScript. Di browser, angka yang masih
// di bawah layar ditahan di 0 lalu bergulir sekali saat terlihat. Kalau nilainya berubah (misalnya peringkat
// setelah ganti preset), kolom digit bergulir dari nilai lama ke nilai baru lewat transition di globals.css.
// Nilai asli tetap tersedia untuk pembaca layar lewat teks sr-only.

'use client';

import { useEffect, useRef, type CSSProperties } from 'react';

const ANGKA = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export default function AngkaGulir({
  nilai,
  minDigit = 0,
  className = '',
}: {
  /** Teks angka apa adanya, misalnya "18.221" atau "24". Karakter bukan digit ditampilkan biasa. */
  nilai: string;
  /** Jumlah digit minimum; kolom nol di depan disembunyikan supaya jumlah kolom stabil saat nilai berubah. */
  minDigit?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    el.setAttribute('data-gulir-tahan', '');
    const pengamat = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        pengamat.disconnect();
        el.removeAttribute('data-gulir-tahan');
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    pengamat.observe(el);
    return () => {
      pengamat.disconnect();
      el.removeAttribute('data-gulir-tahan');
    };
  }, []);

  const jumlahDigit = nilai.replace(/\D/g, '').length;
  const isi = jumlahDigit < minDigit ? '0'.repeat(minDigit - jumlahDigit) + nilai : nilai;
  const nolDepan = Math.max(0, minDigit - jumlahDigit);
  let urutan = 0;

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{nilai}</span>
      <span aria-hidden="true" className="inline-flex">
        {[...isi].map((ch, i) => {
          if (!/\d/.test(ch)) return <span key={`t${i}`}>{ch}</span>;
          const indeks = urutan++;
          const sembunyi = i < nolDepan;
          return (
            <span
              key={`d${isi.length - i}`}
              className={`gulir-kolom ${sembunyi ? 'w-0' : ''}`}
            >
              <span className="gulir-strip" style={{ '--d': ch, '--i': indeks } as CSSProperties}>
                {ANGKA.map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
