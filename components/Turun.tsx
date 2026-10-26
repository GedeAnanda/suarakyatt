// components/Turun.tsx — panel tarik-turun di header (pemilik: A)
// Dasarnya <details>, jadi tetap bisa dibuka tanpa JavaScript. Dengan JavaScript, panel juga
// tertutup saat klik di luar, saat Esc ditekan (fokus kembali ke tombolnya), dan saat tautan di dalamnya dipilih.

'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Ikon from './ui/Ikon';

export default function Turun({ label, children }: { label: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const klik = (e: PointerEvent) => {
      if (!el.open) return;
      const target = e.target as Element;
      if (!el.contains(target)) el.removeAttribute('open');
      else if (target.closest('a')) window.setTimeout(() => el.removeAttribute('open'), 0);
    };
    const tombol = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && el.open) {
        el.removeAttribute('open');
        el.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', klik);
    document.addEventListener('keydown', tombol);
    return () => {
      document.removeEventListener('pointerdown', klik);
      document.removeEventListener('keydown', tombol);
    };
  }, []);

  return (
    <details ref={ref} className="group relative">
      <summary className="flex h-11 list-none items-center gap-2 px-3 text-badan transition-colors hover:bg-lapis group-open:bg-lapis [&::-webkit-details-marker]:hidden">
        {label}
        <Ikon nama="turun" className="size-4 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="absolute top-full right-0 z-10 mt-1 w-80 bg-terang p-4 shadow-[0_18px_40px_rgb(42_19_22/0.18)]">
        {children}
      </div>
    </details>
  );
}
