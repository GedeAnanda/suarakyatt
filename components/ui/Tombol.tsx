// components/ui/Tombol.tsx — satu bentuk tombol untuk seluruh aplikasi (pemilik: A)
// Sudut 10px, satu warna isi. Disorot: sedikit lebih gelap dan terangkat 1px; ditekan: mengecil 2%
// (umpan balik < 100 ms). Gerak angkat hilang untuk pengguna yang meminta gerak dikurangi.

import Link from 'next/link';
import type { ComponentProps } from 'react';

export type VarianTombol = 'utama' | 'kedua' | 'medan' | 'medan-garis' | 'bahaya' | 'garis';

const DASAR =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-(--radius-kontrol) px-5 py-2.5 text-badan font-semibold leading-tight transition-[background-color,color,box-shadow,scale,translate] duration-150 motion-safe:hover:-translate-y-px active:scale-[0.98] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100';

const VARIAN: Record<VarianTombol, string> = {
  utama:
    'bg-tinta text-white shadow-[0_1px_2px_rgb(42_19_22/0.25)] hover:bg-tinta-tua hover:shadow-[0_8px_18px_-8px_rgb(125_12_20/0.65)]',
  kedua: 'bg-lapis text-teks hover:bg-lapis-2',
  garis: 'bg-permukaan text-teks ring-1 ring-batas ring-inset hover:bg-terang hover:ring-lapis-2',
  medan: 'bg-white text-tinta hover:bg-tinta-muda',
  'medan-garis': 'bg-transparent text-white ring-1 ring-white/60 ring-inset hover:bg-white/10',
  bahaya: 'bg-st-ditolak-bg text-st-ditolak hover:bg-black',
};

export function kelasTombol(varian: VarianTombol = 'utama', tambahan = '') {
  return `${DASAR} ${VARIAN[varian]} ${tambahan}`;
}

export function Tombol({
  varian = 'utama',
  className = '',
  type = 'button',
  ...props
}: ComponentProps<'button'> & { varian?: VarianTombol }) {
  return <button type={type} className={kelasTombol(varian, className)} {...props} />;
}

export function TautanTombol({
  varian = 'utama',
  className = '',
  ...props
}: ComponentProps<typeof Link> & { varian?: VarianTombol }) {
  return <Link className={kelasTombol(varian, className)} {...props} />;
}

/** Tautan teks biasa: garis bawah tebal yang menipis saat disorot. */
export const kelasTautan =
  'text-tinta [.di-medan_&]:text-medan-tinta underline decoration-2 underline-offset-4 decoration-current/40 hover:decoration-current transition-[text-decoration-color]';
