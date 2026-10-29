// components/Turun.tsx — panel tarik-turun di header (pemilik: A)
// Dasarnya <details>, jadi tetap bisa dibuka tanpa JavaScript. Dengan JavaScript, panel juga
// tertutup saat klik di luar, saat Esc ditekan (fokus kembali ke tombolnya), dan saat tautan di dalamnya dipilih.

'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Ikon from './ui/Ikon';

export default function Turun({
  label,
  children,
  className = '',
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) {
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
    <details ref={ref} className={`group relative ${className}`}>
      <summary className="flex h-10 list-none items-center gap-2 rounded-full py-1 pr-2.5 pl-1 text-kecil font-semibold transition-colors hover:bg-lapis group-open:bg-lapis [&::-webkit-details-marker]:hidden">
        {label}
        <Ikon nama="turun" className="size-4 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="turun-panel absolute top-full right-0 z-10 mt-2 w-72 origin-top-right rounded-kartu border border-garis bg-permukaan p-4 shadow-angkat">
        {children}
      </div>
    </details>
  );
}
