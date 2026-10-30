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
        className={`cursor-help text-left underline decoration-samar decoration-dotted decoration-2 underline-offset-4 hover:decoration-biru hover:decoration-solid ${className}`}
      >
        {children}
      </button>
      <div
        id={id}
        popover="auto"
        className="m-auto max-w-[min(32rem,calc(100vw-2rem))] rounded-besar border border-garis bg-permukaan p-6 text-teks shadow-angkat backdrop:bg-navy/30"
      >
        <p className="text-lead font-bold">{judul}</p>
        <div className="mt-2 text-badan text-lembut">{definisi}</div>
        <button
          type="button"
          popoverTarget={id}
          popoverTargetAction="hide"
          className="mt-5 min-h-10 rounded-kontrol bg-biru-muda px-4 text-kecil font-semibold text-biru-tua hover:bg-[#d0ebe5]"
        >
          Tutup
        </button>
      </div>
    </>
  );
}
