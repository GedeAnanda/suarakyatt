// components/ui/BarisGeser.tsx — deret kartu yang digeser menyamping, dengan panah bulat di kiri-kanan (pemilik: A)
// Seperti deret kupon di situs travel. Deretnya tetap bisa digulir dengan sentuh, trackpad, atau Tab;
// panah hanya muncul kalau masih ada kartu di arah itu. Anak-anaknya berupa <li>.

'use client';

import { useCallback, useRef, useSyncExternalStore, type ReactNode } from 'react';
import Ikon from './Ikon';

export default function BarisGeser({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const jalur = useRef<HTMLUListElement>(null);

  const pantau = useCallback((ubah: () => void) => {
    const el = jalur.current;
    if (!el) return () => {};
    el.addEventListener('scroll', ubah, { passive: true });
    const ukuran = new ResizeObserver(ubah);
    ukuran.observe(el);
    return () => {
      el.removeEventListener('scroll', ubah);
      ukuran.disconnect();
    };
  }, []);
  // "k": masih ada kartu di kiri, "n": masih ada kartu di kanan.
  const posisi = useSyncExternalStore(
    pantau,
    () => {
      const el = jalur.current;
      if (!el) return '';
      return `${el.scrollLeft > 4 ? 'k' : ''}${el.scrollLeft + el.clientWidth < el.scrollWidth - 4 ? 'n' : ''}`;
    },
    () => '',
  );

  function geser(arah: 1 | -1) {
    const el = jalur.current;
    if (!el) return;
    const halus = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: arah * el.clientWidth * 0.8, behavior: halus ? 'smooth' : 'auto' });
  }

  const kelasPanah =
    'absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-garis bg-permukaan text-teks shadow-angkat transition-colors hover:text-biru-tua sm:flex';

  return (
    <div className={`relative ${className}`}>
      <ul
        ref={jalur}
        aria-label={label}
        className="tanpa-batang -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-1 px-1 py-1"
      >
        {children}
      </ul>
      {posisi.includes('k') && (
        <button type="button" onClick={() => geser(-1)} aria-label="Geser ke kiri" className={`${kelasPanah} -left-4`}>
          <Ikon nama="kiri" className="size-5" />
        </button>
      )}
      {posisi.includes('n') && (
        <button type="button" onClick={() => geser(1)} aria-label="Geser ke kanan" className={`${kelasPanah} -right-4`}>
          <Ikon nama="kanan" className="size-5" />
        </button>
      )}
    </div>
  );
}
