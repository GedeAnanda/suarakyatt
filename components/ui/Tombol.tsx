// components/ui/Tombol.tsx — satu bentuk tombol untuk seluruh aplikasi (pemilik: A)
// Sudut 8px. Utama: biru penuh; kedua: biru muda; garis: putih bertepi. Ditekan: mengecil 2%
// (umpan balik < 100 ms). Di layar sentuh tinggi minimal 44px.

import Link from 'next/link';
import type { ComponentProps } from 'react';

export type VarianTombol = 'utama' | 'kedua' | 'garis' | 'terang' | 'terang-garis' | 'bahaya' | 'teks';

const DASAR =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-kontrol px-4 py-2 text-badan font-semibold leading-tight transition-[background-color,color,border-color,scale] duration-150 active:scale-[0.98] pointer-coarse:min-h-11 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';

const VARIAN: Record<VarianTombol, string> = {
  utama: 'bg-biru text-white hover:bg-biru-tua',
  kedua: 'bg-biru-muda text-biru-tua hover:bg-[#dce5ff]',
  garis: 'border border-garis-isian bg-permukaan text-teks hover:border-biru hover:text-biru-tua',
  terang: 'bg-white text-biru-tua hover:bg-biru-muda',
  'terang-garis': 'border border-white/70 bg-transparent text-white hover:bg-white/12',
  bahaya: 'bg-merah text-white hover:bg-merah-tua',
  teks: 'px-2 text-biru-tua hover:bg-biru-muda',
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

/** Tautan teks biasa: biru, bergaris bawah saat disorot. */
export const kelasTautan =
  'font-semibold text-biru-tua underline-offset-4 hover:underline [.di-gelap_&]:text-white [.di-gelap_&]:underline';
