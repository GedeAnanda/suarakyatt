// components/ui/Tombol.tsx — satu bentuk tombol untuk seluruh aplikasi (pemilik: A)
// Persegi, satu warna isi, tanpa bayangan. Ditekan: turun 1px.

import Link from 'next/link';
import type { ComponentProps } from 'react';

export type VarianTombol = 'utama' | 'kedua' | 'medan' | 'bahaya';

const DASAR =
  'inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-badan font-medium leading-tight transition-[background-color,color,translate] duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55';

const VARIAN: Record<VarianTombol, string> = {
  utama: 'bg-tinta text-kertas hover:bg-tinta-tua',
  kedua: 'bg-lapis text-tinta hover:bg-lapis-2',
  medan: 'bg-medan-tinta text-tinta hover:bg-terang',
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
  'underline decoration-2 underline-offset-4 decoration-current/40 hover:decoration-current transition-[text-decoration-color]';
