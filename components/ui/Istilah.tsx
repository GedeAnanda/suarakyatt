// components/ui/Istilah.tsx — istilah dengan definisi yang bisa dibuka (FR-E2), pemilik: A
// Memakai atribut popover bawaan browser: bisa dibuka dengan klik, sentuh, atau keyboard,
// tertutup dengan Esc atau klik di luar, dan tidak butuh JavaScript.

import type { ReactNode } from 'react';

export default function Istilah({
  id,
  children,
  judul,
  definisi,
  className = '',
}: {
  id: string;
  children: ReactNode;
  judul: string;
  definisi: ReactNode;
  className?: string;
}) {
  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        className={`cursor-help underline decoration-dotted decoration-2 underline-offset-4 hover:decoration-solid ${className}`}
      >
        {children}
      </button>
      <div
        id={id}
        popover="auto"
        className="m-auto max-w-[min(32rem,calc(100vw-2rem))] bg-terang p-6 text-tinta shadow-[0_18px_48px_rgb(60_10_14/0.22)] backdrop:bg-tinta/20"
      >
        <p className="text-lead font-medium tracking-tight">{judul}</p>
        <div className="mt-2 text-badan">{definisi}</div>
        <button
          type="button"
          popoverTarget={id}
          popoverTargetAction="hide"
          className="mt-5 bg-lapis px-4 py-2 text-kecil font-medium hover:bg-lapis-2"
        >
          Tutup
        </button>
      </div>
    </>
  );
}
