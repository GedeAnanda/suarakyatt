// components/Pengumuman.tsx — pemberitahuan singkat setelah aksi berhasil (toast), pemilik: A
// Panggil umumkan('Kode disalin') dari Client Component mana pun. Tidak mencuri fokus, dibacakan
// pembaca layar lewat aria-live="polite", hilang sendiri setelah 4 detik atau saat ditutup.

'use client';

import { useEffect, useState } from 'react';
import Ikon from './ui/Ikon';

const NAMA_EVENT = 'suarakyat:umumkan';

export function umumkan(teks: string) {
  window.dispatchEvent(new CustomEvent(NAMA_EVENT, { detail: teks }));
}

interface Item {
  id: number;
  teks: string;
}

export default function Pengumuman() {
  const [daftar, setDaftar] = useState<Item[]>([]);

  useEffect(() => {
    let id = 0;
    const timer = new Set<number>();
    const terima = (e: Event) => {
      const item = { id: ++id, teks: String((e as CustomEvent).detail) };
      setDaftar((d) => [...d.slice(-2), item]);
      timer.add(window.setTimeout(() => setDaftar((d) => d.filter((x) => x.id !== item.id)), 4000));
    };
    window.addEventListener(NAMA_EVENT, terima);
    return () => {
      window.removeEventListener(NAMA_EVENT, terima);
      timer.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-[max(4.5rem,calc(env(safe-area-inset-bottom)+3.5rem))] z-2000 flex flex-col items-center gap-2 px-4 sm:bottom-8"
    >
      {daftar.map((d) => (
        <div
          key={d.id}
          role="status"
          className="toast pointer-events-auto flex max-w-md items-center gap-3 rounded-kartu bg-navy/95 py-2.5 pr-1.5 pl-4 text-kecil font-medium text-white shadow-angkat sm:text-badan"
        >
          <Ikon nama="centang" className="size-5 text-[#7fe0a6]" />
          <span className="flex-1">{d.teks}</span>
          <button
            type="button"
            onClick={() => setDaftar((x) => x.filter((y) => y.id !== d.id))}
            className="flex size-10 items-center justify-center rounded-kontrol hover:bg-white/10"
            aria-label="Tutup pemberitahuan"
          >
            <Ikon nama="tutup" className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
