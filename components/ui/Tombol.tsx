// components/ui/Tombol.tsx — satu bentuk tombol untuk seluruh aplikasi (pemilik: A)
// Bentuk pil, satu warna isi. Disorot: sedikit lebih gelap; ditekan: mengecil 2% (umpan balik < 100 ms).

import Link from 'next/link';
import type { ComponentProps } from 'react';

export type VarianTombol = 'utama' | 'kedua' | 'medan' | 'medan-garis' | 'bahaya' | 'garis';

const DASAR =
  'tombol-gerak inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-badan font-semibold leading-tight transition-[background-color,color,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';

const VARIAN: Record<VarianTombol, string> = {
  utama:
    'bg-tinta text-white hover:bg-tinta-tua',
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
